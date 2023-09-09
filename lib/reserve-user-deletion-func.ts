import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type Props = {
  env: string;
  role: Role;
  usersTable: Table;
};

export class ReserveUserDeletionFunc extends Construct {
  public readonly handler: GoFunction;

  constructor(scope: Construct, id: string, { env, role, usersTable }: Props) {
    super(scope, id);

    this.handler = new GoFunction(this, 'Default', {
      entry: 'functions/reserve-user-deletion-func',
      logRetention: RetentionDays.ONE_YEAR,
      role,
      environment: {
        CHAT_USERS_TABLE_NAME: usersTable.tableName,
        APPLE_JWKS_URL: 'https://appleid.apple.com/auth/keys',
        ISSUER_APPLE: 'https://appleid.apple.com',
      },
    });

    usersTable.grantReadWriteData(this.handler);
  }
}
