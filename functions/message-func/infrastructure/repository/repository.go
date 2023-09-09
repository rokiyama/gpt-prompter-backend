package repository

import (
	"github.com/rokiyama/gpt-prompter-backend/functions/message-func/entities"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/guregu/dynamo"
	"go.uber.org/zap"
)

type userTable struct {
	ID     string `dynamo:"id"`
	Date   string `dynamo:"date"`
	Tokens int    `dynamo:"tokens"`
}

type deleteUserTable struct {
	ID       string `dynamo:"id"`
	ExpireAt int64  `dynamo:"expireAt"`
}

type UserRepo struct {
	logger          *zap.Logger
	table           dynamo.Table
	deleteUserTable dynamo.Table
}

func NewUserRepo(
	logger *zap.Logger,
	awsSession *session.Session,
	tableName string,
	deleteUserTableName string,
) *UserRepo {
	db := dynamo.New(awsSession, &aws.Config{})
	table := db.Table(tableName)
	deleteUserTable := db.Table(deleteUserTableName)
	return &UserRepo{
		logger:          logger,
		table:           table,
		deleteUserTable: deleteUserTable,
	}
}

func (r *UserRepo) Get(userID string, date string) (entities.DailyUsage, error) {
	var got userTable
	err := r.table.Get("id", userID).
		Range("date", dynamo.Equal, date).
		One(&got)
	if err != nil {
		if err == dynamo.ErrNotFound {
			return entities.DailyUsage{
				ID:     userID,
				Date:   date,
				Tokens: 0,
			}, nil
		}
		return entities.DailyUsage{}, err
	}
	return entities.DailyUsage{
		ID:     got.ID,
		Date:   got.Date,
		Tokens: got.Tokens,
	}, nil
}

func (r *UserRepo) Put(usage entities.DailyUsage) error {
	return r.table.Put(userTable{
		ID:     usage.ID,
		Date:   usage.Date,
		Tokens: usage.Tokens,
	}).Run()
}

func (r *UserRepo) IsUserAlreadyReservedForDeletion(userID string) (bool, error) {
	var got deleteUserTable
	err := r.deleteUserTable.Get("id", userID).One(&got)
	if err != nil {
		if err == dynamo.ErrNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *UserRepo) ReserveUserForDeletion(userID string, expireAt int64) error {
	return r.deleteUserTable.Put(deleteUserTable{
		ID:       userID,
		ExpireAt: expireAt,
	}).Run()
}
