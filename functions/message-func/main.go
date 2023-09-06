package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/jwt"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/openai"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/parameterstore"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/repository"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/websocket"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/usecase"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws/session"
	"go.uber.org/zap"
)

var (
	sess     *session.Session
	userRepo *repository.UserRepo
	jp       *jwt.Parser
	logger   *zap.Logger
)

func handle(ctx context.Context, event events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {
	logger.Info("Received", zap.String("reqId", event.RequestContext.RequestID))
	ws := websocket.New(
		sess,
		event.RequestContext.DomainName+"/"+event.RequestContext.Stage,
		event.RequestContext.ConnectionID,
	)
	apiKey, err := parameterstore.GetSSMParameterStore()
	if err != nil {
		logger.Error("GetSSMParameterStore error", zap.Error(err))
		ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.InternalError,
				Message: "GetSSMParameterStore",
			}})
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}
	oai := openai.New("https://api.openai.com/v1/chat/completions", apiKey, ws)
	uc := usecase.NewUsecase(logger, userRepo, ws, oai, jp)

	var req struct {
		IDToken string               `json:"idToken"`
		Body    entities.ChatRequest `json:"body"`
	}
	if err := json.Unmarshal([]byte(event.Body), &req); err != nil {
		logger.Error("GetSSMParameterStore error", zap.Error(err))
		ws.Send(&entities.Response{
			Error: &entities.Error{
				Code:    entities.BadRequest,
				Message: fmt.Sprintf("parseError:%q", event.Body),
			}})
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
		}, err
	}
	if err := uc.CallOpenAI(event.RequestContext.RequestID, req.IDToken, req.Body); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

func main() {
	l, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	logger = l
	defer l.Sync()
	l.Info("Initialized.")

	tableName := os.Getenv("CHAT_USERS_TABLE_NAME")
	deleteTableName := os.Getenv("USERS_TO_BE_DELETED_TABLE_NAME")
	sess = session.Must(session.NewSession())
	userRepo = repository.NewUserRepo(logger, sess, tableName, deleteTableName)
	jp = jwt.NewParser(os.Getenv("APPLE_JWKS_URL"), os.Getenv("ISSUER_APPLE"))

	lambda.Start(handle)
}
