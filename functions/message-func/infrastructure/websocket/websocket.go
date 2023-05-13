package websocket

import (
	"encoding/json"

	"github.com/rokiyama/gpt-prompter-backend/functions/entities"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	apiGw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
)

const AppVersion = "v0.0.1-9"

type WebSocketClient struct {
	apiGwClient  *apiGw.ApiGatewayManagementApi
	ConnectionID string
}

func New(sess *session.Session, endpoint string, connectionID string) *WebSocketClient {
	apiGwClient := apiGw.New(sess, &aws.Config{
		Endpoint: aws.String(endpoint),
	})
	return &WebSocketClient{
		apiGwClient:  apiGwClient,
		ConnectionID: connectionID,
	}
}

func (w *WebSocketClient) Send(res *entities.Response) error {
	data, err := json.Marshal(res)
	if err != nil {
		return err
	}
	_, err = w.apiGwClient.PostToConnection(&apiGw.PostToConnectionInput{
		ConnectionId: aws.String(w.ConnectionID),
		Data:         data,
	})
	return err
}
