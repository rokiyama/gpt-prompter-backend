import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DB extends Construct {
  public readonly usersTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.usersTable = new Table(this, 'Default', {
      tableName: 'users',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: 'expireAt',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
