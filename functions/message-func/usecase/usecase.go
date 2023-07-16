package usecase

import (
	"strconv"
	"time"

	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/constant"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/repository"

	"go.uber.org/zap"
)

type Usecase struct {
	logger *zap.Logger
	repo   *repository.UserRepo
	ws     sender
	oai    openAIClient
	jp     jwtParser
}

type openAIClient interface {
	CallAPI(chat entities.ChatRequest) (int, error)
}

type sender interface {
	Send(*entities.Response) error
}

type jwtParser interface {
	Verify(tokenString string, now time.Time) (*entities.ID, error)
}

func NewUsecase(
	logger *zap.Logger,
	repo *repository.UserRepo,
	ws sender,
	oai openAIClient,
	jp jwtParser,
) *Usecase {
	return &Usecase{
		logger: logger,
		repo:   repo,
		ws:     ws,
		oai:    oai,
		jp:     jp,
	}
}

func (u *Usecase) CallOpenAI(reqID string, idToken string, req entities.ChatRequest) error {
	id, err := u.jp.Verify(idToken, time.Now())
	if err != nil {
		u.logger.Error("Invalid token", zap.Error(err), zap.String("reqId", reqID))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.Unauthorized,
				Message: "token",
			}})
	}
	sub := id.Subject
	if sub == "" {
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.BadRequest,
				Message: "sub",
			}})
	}

	today := time.Now().In(constant.JST).Format("2006-01-02")

	usage, err := u.repo.Get(sub, today)
	if err != nil {
		u.logger.Error("User get error", zap.Error(err), zap.String("reqId", reqID))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "getUser",
			}})
	}
	u.logger.Info("Got", zap.Any("usage", usage), zap.String("reqId", reqID))

	reqTokens := req.ApproximateTokens()
	if sum := usage.Tokens + reqTokens; sum > constant.MaxTokensPerDay {
		u.logger.Info("ApproximateTokens over limit", zap.Int("sum", sum))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.TokenLimitExceeded,
				Message: strconv.Itoa(sum),
			}})
	}

	usage.Tokens += reqTokens
	u.logger.Info("Put before request", zap.Any("usage", usage), zap.Int("reqTokens", reqTokens), zap.String("reqId", reqID))
	if err := u.repo.Put(usage); err != nil {
		u.logger.Error("User put error", zap.Error(err), zap.String("reqId", reqID))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "putUser",
			}})
	}

	usedTokens, err := u.oai.CallAPI(req)
	if err != nil {
		u.logger.Error("CallOpenAI error", zap.Error(err), zap.String("reqId", reqID))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.ExternalError,
				Message: "openAiError=" + err.Error(),
			}})
	}

	usage.Tokens += usedTokens
	u.logger.Info("Put after request", zap.Any("usage", usage), zap.Int("usedTokens", usedTokens), zap.String("reqId", reqID))
	if err := u.repo.Put(usage); err != nil {
		u.logger.Error("User put error", zap.Error(err))
		return u.ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "putUser",
			}})
	}

	return nil
}
