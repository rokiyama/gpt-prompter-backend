package usecase

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func (u *Usecase) logInfo(msg string, fields ...zapcore.Field) {
	u.logger.Info(
		msg,
		append(
			[]zap.Field{zap.String("reqId", u.ctx.requestID)},
			fields...,
		)...,
	)
}

func (u *Usecase) logError(msg string, fields ...zapcore.Field) {
	u.logger.Error(
		msg,
		append(
			[]zap.Field{zap.String("reqId", u.ctx.requestID)},
			fields...,
		)...,
	)
}
