package repository

import (
	"time"

	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/guregu/dynamo"
	"go.uber.org/zap"
)

type userTable struct {
	ID       string `dynamo:"id"`
	Tokens   int    `dynamo:"tokens"`
	ExpireAt int64  `dynamo:"expireAt"`
	Deleted  bool   `dynamo:"deleted"`
}

type UserRepo struct {
	logger          *zap.Logger
	usersTable      dynamo.Table
	deleteUserTable dynamo.Table
}

func NewUserRepo(
	logger *zap.Logger,
	awsSession *session.Session,
	tableName string,
) *UserRepo {
	db := dynamo.New(awsSession, &aws.Config{})
	usersTable := db.Table(tableName)
	return &UserRepo{
		logger:     logger,
		usersTable: usersTable,
	}
}

func (r *UserRepo) Get(userID string) (*entities.User, error) {
	var got userTable
	if err := r.usersTable.Get("id", userID).One(&got); err != nil {
		if err == dynamo.ErrNotFound {
			return &entities.User{
				ID:       userID,
				Tokens:   0,
				ExpireAt: time.Now().Add(24 * time.Hour).Unix(),
				Deleted:  false,
			}, nil
		}
		return nil, err
	}
	return &entities.User{
		ID:       got.ID,
		Tokens:   got.Tokens,
		ExpireAt: got.ExpireAt,
		Deleted:  got.Deleted,
	}, nil
}

func (r *UserRepo) Put(usage entities.User) error {
	return r.usersTable.Put(userTable{
		ID:       usage.ID,
		Tokens:   usage.Tokens,
		ExpireAt: usage.ExpireAt,
		Deleted:  usage.Deleted,
	}).Run()
}
