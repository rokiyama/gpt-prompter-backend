package constant

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

var (
	JST                     = time.FixedZone("Asia/Tokyo", 9*60*60)
	MaxTokensPerDay         int
	MaxTokensPerDayForGuest int
)

func init() {
	n, err := strconv.Atoi(os.Getenv("MAX_TOKENS_PER_DAY"))
	if err != nil {
		panic(fmt.Sprintf("invalid maxTokensPerDay: %v", os.Getenv("MAX_TOKENS_PER_DAY")))
	}
	MaxTokensPerDay = n
	n, err = strconv.Atoi(os.Getenv("MAX_TOKENS_PER_DAY_FOR_GUEST"))
	if err != nil {
		panic(fmt.Sprintf("invalid maxTokensPerDayForGuest: %v", os.Getenv("MAX_TOKENS_PER_DAY_FOR_GUEST")))
	}
	MaxTokensPerDayForGuest = n
}
