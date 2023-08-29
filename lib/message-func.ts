import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import { Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type Props = {
  env: string;
  role: Role;
  usersTable: Table;
  deleteUsersTable: Table;
};

export class MessageFunc extends Construct {
  public readonly handler: GoFunction;

  constructor(
    scope: Construct,
    id: string,
    { env, role, usersTable, deleteUsersTable }: Props
  ) {
    super(scope, id);

    this.handler = new GoFunction(this, 'messageFuncHandler', {
      entry: 'functions/message-func',
      logRetention: RetentionDays.ONE_YEAR,
      role,
      timeout: Duration.minutes(15),
      layers: [
        LayerVersion.fromLayerVersionArn(
          this,
          `AWS-Parameters-and-Secrets-Lambda-Extension-layer`,
          env === 'prod'
            ? 'arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4'
            : 'arn:aws:lambda:ap-northeast-2:738900069198:layer:AWS-Parameters-and-Secrets-Lambda-Extension:4'
        ),
      ],
      environment: {
        CHAT_USERS_TABLE_NAME: usersTable.tableName,
        USERS_TO_BE_DELETED_TABLE_NAME: deleteUsersTable.tableName,
        MAX_TOKENS_PER_DAY: env === 'prod' ? '100000' : '300000',
        SSM_OPENAI_API_KEY_PARAMETER_NAME: `/openai/apiKey/${env}`,
        APPLE_JWKS_URL: 'https://appleid.apple.com/auth/keys',
        ISSUER_APPLE: 'https://appleid.apple.com',
      },
    });

    usersTable.grantReadWriteData(this.handler);
    deleteUsersTable.grantReadWriteData(this.handler);
  }
}
