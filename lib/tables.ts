import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export const newTables = (parent: Construct) => {
  const usersTable = new Table(parent, 'prompterDb', {
    tableName: 'prompterUsers',
    partitionKey: {
      name: 'id',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'date',
      type: AttributeType.STRING,
    },
    removalPolicy: RemovalPolicy.DESTROY,
  });

  const deleteUsersTable = new Table(parent, 'usersToBeDeleted', {
    tableName: 'usersToBeDeleted',
    partitionKey: {
      name: 'id',
      type: AttributeType.STRING,
    },
    timeToLiveAttribute: 'expireAt',
    removalPolicy: RemovalPolicy.DESTROY,
  });

  return {
    usersTable,
    deleteUsersTable,
  };
};
