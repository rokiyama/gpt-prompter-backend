package parameterstore

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

var (
	ssmOpenAiApiKeyParameterName = os.Getenv("SSM_OPENAI_API_KEY_PARAMETER_NAME")
	awsSessionToken              = os.Getenv("AWS_SESSION_TOKEN")
)

func GetSSMParameterStore() (string, error) {
	path := fmt.Sprintf(
		"http://localhost:2773/systemsmanager/parameters/get?name=%s&withDecryption=true",
		url.QueryEscape(ssmOpenAiApiKeyParameterName),
	)
	client := &http.Client{}
	req, err := http.NewRequest("GET", path, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("X-Aws-Parameters-Secrets-Token", awsSessionToken)
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get SSM parameter store, status=%d body=%s", resp.StatusCode, body)
	}
	var res struct {
		Parameter struct {
			Value string `json:"Value"`
		} `json:"Parameter"`
	}
	if err = json.Unmarshal(body, &res); err != nil {
		return "", err
	}
	return res.Parameter.Value, nil
}
