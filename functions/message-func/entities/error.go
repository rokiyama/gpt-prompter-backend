package entities

type Error struct {
	Code    ErrCode `json:"code"`
	Message string  `json:"message"`
}

type ErrCode string

const (
	InternalError      ErrCode = "internal_error"
	BadRequest         ErrCode = "bad_request"
	Unauthorized       ErrCode = "unauthorized"
	TokenLimitExceeded ErrCode = "token_limit_exceeded"
	UserWillBeDeleted  ErrCode = "user_will_be_deleted"
	ExternalError      ErrCode = "external_error"
)
