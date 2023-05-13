package entities

import "unicode/utf8"

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

func (c *ChatRequest) ApproximateTokens() int {
	var tokens int
	for _, m := range c.Messages {
		tokens += utf8.RuneCountInString(m.Content)
	}
	return tokens
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
