package entities

type Chunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		Index        int     `json:"index"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
}

type Response struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
	Error   *Error `json:"error,omitempty"`
}
