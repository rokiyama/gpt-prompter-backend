package openai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"
)

var (
	headerData = []byte("data: ")
)

type OpenAIClient struct {
	url    string
	apiKey string
	sender sender
}

type sender interface {
	Send(*entities.Response) error
}

func New(url string, apiKey string, sender sender) *OpenAIClient {
	return &OpenAIClient{
		url:    url,
		apiKey: apiKey,
		sender: sender,
	}
}

func (o *OpenAIClient) CallAPI(chat entities.ChatRequest) (int, error) {
	reqBody := struct {
		entities.ChatRequest
		Stream bool `json:"stream"`
	}{
		ChatRequest: chat,
		Stream:      true,
	}
	j, err := json.Marshal(reqBody)
	if err != nil {
		return 0, err
	}
	req, err := http.NewRequest(http.MethodPost, o.url, bytes.NewBuffer(j))
	if err != nil {
		return 0, err
	}
	req.Header.Add("Authorization", "Bearer "+o.apiKey)
	req.Header.Add("Content-Type", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("unexpected status code: %v", res.StatusCode)
	}
	var tokens int
	reader := bufio.NewReader(res.Body)
	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			return 0, err
		}
		line = bytes.TrimSpace(line)
		if len(line) < 1 {
			continue
		}
		if !bytes.HasPrefix(line, headerData) {
			return 0, fmt.Errorf("the line has no prefix: %q", line)
		}
		line = bytes.TrimPrefix(line, headerData)
		if string(line) == "[DONE]" {
			if err := o.sender.Send(&entities.Response{
				Done: true,
			}); err != nil {
				return 0, err
			}
			break
		}
		var chunk entities.Chunk
		if err := json.Unmarshal(line, &chunk); err != nil {
			return 0, err
		}
		if len(chunk.Choices) < 1 {
			return 0, err
		}
		if err := o.sender.Send(&entities.Response{
			Content: chunk.Choices[0].Delta.Content,
		}); err != nil {
			return 0, err
		}
		tokens++
	}
	return tokens, nil
}
