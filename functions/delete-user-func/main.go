package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/jwt"
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/infrastructure/repository"

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

func handle(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	logger.Info("Received", zap.String("reqId", event.RequestContext.RequestID))

	var req struct {
		IDToken string `json:"idToken"`
	}
	if err := json.Unmarshal([]byte(event.Body), &req); err != nil {
		logger.Error("parse error", zap.Error(err))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
		}, err
	}

	id, err := jp.Verify(req.IDToken, time.Now())
	if err != nil {
		logger.Error("Invalid token", zap.Error(err), zap.String("reqId", event.RequestContext.RequestID))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, err
	}
	logger.Info("Verified", zap.String("sub", id.Subject))

	if err := userRepo.ReserveUserForDeletion(id.Subject); err != nil {
		logger.Error("Failed to ReserveUserForDeletion", zap.Error(err), zap.String("reqId", event.RequestContext.RequestID))
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
