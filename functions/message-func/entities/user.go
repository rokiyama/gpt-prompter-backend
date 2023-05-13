package entities

import (
	"regexp"
)

var uuidRegex = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

type DailyUsage struct {
	ID     string
	Date   string
	Tokens int
}

func ValidateUUID(uuid string) bool {
	return uuidRegex.MatchString(uuid)
}
