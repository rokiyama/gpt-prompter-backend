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
	ctx    context
	repo   *repository.UserRepo
	ws     sender
	oai    openAIClient
	jp     jwtParser
}

type context struct {
	requestID string
	errRes    *entities.Response
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
		ctx:    context{},
		repo:   repo,
		ws:     ws,
		oai:    oai,
		jp:     jp,
	}
}

func (u *Usecase) CallOpenAI(reqID string, idToken string, req entities.ChatRequest) error {
	u.ctx.requestID = reqID
	id := u.verify(idToken)
	sub := u.getSub(id)
	u.checkIsUserDeleted(sub)
	usage := u.checkTokenUsage(sub, req.ApproximateTokens())
	usedTokens := u.callOpenAI(req)
	u.saveTokenUsage(usage, usedTokens)
	return u.sendResponseIfErr()
}

func (u *Usecase) verify(idToken string) *entities.ID {
	if u.ctx.errRes != nil {
		return nil
	}
	id, err := u.jp.Verify(idToken, time.Now())
	if err != nil {
		u.logInfo("Invalid token", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.Unauthorized,
				Message: "token",
			}}
		return nil
	}
	return id
}

func (u *Usecase) getSub(id *entities.ID) string {
	if u.ctx.errRes != nil {
		return ""
	}
	sub := id.Subject
	if sub == "" {
		u.logInfo("Sub is empty", zap.Any("id", id))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.BadRequest,
				Message: "sub",
			}}
		return ""
	}
	return sub
}

func (u *Usecase) checkIsUserDeleted(sub string) {
	if u.ctx.errRes != nil {
		return
	}
	deleted, err := u.repo.IsUserAlreadyReservedForDeletion(sub)
	if err != nil {
		u.logError("Failed to IsUserAlreadyReservedForDeletion", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "internalError",
			}}
		return
	}
	if deleted {
		u.logInfo("Already reserved for deletion", zap.String("sub", sub))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.UserWillBeDeleted,
				Message: "userWillBeDeleted",
			}}
		return
	}
}

func (u *Usecase) checkTokenUsage(sub string, reqTokens int) *entities.DailyUsage {
	if u.ctx.errRes != nil {
		return nil
	}
	today := time.Now().In(constant.JST).Format("2006-01-02")
	usage, err := u.repo.Get(sub, today)
	if err != nil {
		u.logError("User get error", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "getUser",
			}}
		return nil
	}
	u.logInfo("Got", zap.Any("usage", usage))

	if sum := usage.Tokens + reqTokens; sum > constant.MaxTokensPerDay {
		u.logInfo("ApproximateTokens over limit", zap.Int("sum", sum))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.TokenLimitExceeded,
				Message: strconv.Itoa(sum),
			}}
		return nil
	}

	usage.Tokens += reqTokens
	u.logInfo("Put before request", zap.Any("usage", usage), zap.Int("reqTokens", reqTokens))
	if err := u.repo.Put(usage); err != nil {
		u.logError("User put error", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "putUser",
			}}
		return nil
	}
	return &usage
}

func (u *Usecase) callOpenAI(req entities.ChatRequest) int {
	if u.ctx.errRes != nil {
		return 0
	}
	usedTokens, err := u.oai.CallAPI(req)
	if err != nil {
		u.logError("CallOpenAI error", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.ExternalError,
				Message: "openAiError=" + err.Error(),
			}}
		return 0
	}
	return usedTokens
}

func (u *Usecase) saveTokenUsage(usage *entities.DailyUsage, usedTokens int) {
	if u.ctx.errRes != nil {
		return
	}
	if usage == nil {
		return
	}
	usage.Tokens += usedTokens
	u.logInfo("Put after request", zap.Any("usage", usage), zap.Int("usedTokens", usedTokens))
	if err := u.repo.Put(*usage); err != nil {
		u.logError("User put error", zap.Error(err))
		u.ctx.errRes = &entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "putUser",
			}}
		return
	}
}

func (u *Usecase) sendResponseIfErr() error {
	if u.ctx.errRes == nil {
		// succeeded
		return nil
	}
	// failed
	if err := u.ws.Send(u.ctx.errRes); err != nil {
		// failed to send error response
		return err
	}
	// succeeded to send error response
	return nil
}
