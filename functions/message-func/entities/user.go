package entities

type User struct {
	ID       string
	Tokens   int
	ExpireAt int64
	Deleted  bool
}
