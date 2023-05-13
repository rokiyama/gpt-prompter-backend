package entities

type Error struct {
	Code    ErrCode `json:"code"`
	Message string  `json:"message"`
}

type ErrCode string

const (
	InternalError      ErrCode = "internal_error"
	BadRequest         ErrCode = "bad_request"
	TokenLimitExceeded ErrCode = "token_limit_exceeded"
	ExternalError      ErrCode = "external_error"
)