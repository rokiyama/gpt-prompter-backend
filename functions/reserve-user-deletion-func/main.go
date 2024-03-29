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
		}, nil
	}

	id, err := jp.Verify(req.IDToken, time.Now())
	if err != nil {
		logger.Error("Invalid token", zap.Error(err), zap.String("reqId", event.RequestContext.RequestID))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
		}, nil
	}
	logger.Info("Verified", zap.String("sub", id.Subject))

	user, err := userRepo.Get(id.Subject)
	if err != nil {
		logger.Error("Failed to IsUserAlreadyReservedForDeletion", zap.Error(err), zap.String("reqId", event.RequestContext.RequestID))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
	}
	if user.Deleted {
		logger.Info("Already reserved", zap.String("reqId", event.RequestContext.RequestID))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusConflict,
		}, nil
	}

	user.Deleted = true
	if err := userRepo.Put(*user); err != nil {
		logger.Error("Failed to ReserveUserForDeletion", zap.Error(err), zap.String("reqId", event.RequestContext.RequestID))
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, nil
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

	userTableName := os.Getenv("CHAT_USERS_TABLE_NAME")
	sess = session.Must(session.NewSession())
	userRepo = repository.NewUserRepo(logger, sess, userTableName)
	jp = jwt.NewParser(os.Getenv("APPLE_JWKS_URL"), os.Getenv("ISSUER_APPLE"))

	lambda.Start(handle)
}
