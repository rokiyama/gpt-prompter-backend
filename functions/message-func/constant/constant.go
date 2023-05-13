package constant

import (
	"log"
	"os"
	"strconv"
	"time"
)

var (
	JST             = time.FixedZone("Asia/Tokyo", 9*60*60)
	MaxTokensPerDay int
)

func init() {
	n, err := strconv.Atoi(os.Getenv("MAX_TOKENS_PER_DAY"))
	if err != nil {
		log.Printf("invalid maxTokensPerDay: %v", os.Getenv("MAX_TOKENS_PER_DAY"))
		n = 0
	}
	MaxTokensPerDay = n
}
