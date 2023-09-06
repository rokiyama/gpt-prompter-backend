import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type Props = {
  env: string;
  role: Role;
  usersTable: Table;
  deleteUsersTable: Table;
};

export class DeleteUserFunc extends Construct {
  public readonly handler: GoFunction;

  constructor(
    scope: Construct,
    id: string,
    { env, role, usersTable, deleteUsersTable }: Props
  ) {
    super(scope, id);

    this.handler = new GoFunction(this, 'deleteUserFuncHandler', {
      entry: 'functions/delete-user-func',
      logRetention: RetentionDays.ONE_YEAR,
      role,
      environment: {
        CHAT_USERS_TABLE_NAME: usersTable.tableName,
        USERS_TO_BE_DELETED_TABLE_NAME: deleteUsersTable.tableName,
        APPLE_JWKS_URL: 'https://appleid.apple.com/auth/keys',
        ISSUER_APPLE: 'https://appleid.apple.com',
      },
    });

    deleteUsersTable.grantReadWriteData(this.handler);
  }
}
