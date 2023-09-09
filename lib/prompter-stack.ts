import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha/lib/http';
import {
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2-alpha/lib/websocket';
import {
  HttpLambdaIntegration,
  WebSocketLambdaIntegration,
} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { ReserveUserDeletionFunc } from './reserve-user-deletion-func';
import { LambdaExecRole } from './lambda-exec-role';
import { MessageFunc } from './message-func';
import { newMessageFuncRole } from './message-func-role';
import { DB } from './tables';

export class PrompterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = process.env.ENV || 'dev';

    const lambdaOpsKey = new Key(this, `lambda-kms-key-${env}`, {
      description:
        'Lambda KMS key for lambda function to get SSM key parameter store',
      alias: `lambda-kms-key-${env}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const messageFuncRole = newMessageFuncRole({
      parent: this,
      env,
      lambdaOpsKey,
    });

    const db = new DB(this, 'Db');

    const messageFunc = new MessageFunc(this, 'MessageFunc', {
      env,
      role: messageFuncRole,
      usersTable: db.usersTable,
    });

    const wsApi = new WebSocketApi(this, 'WebSocketApi', {
      routeSelectionExpression: '$request.body.action',
    });

    wsApi.addRoute('message', {
      integration: new WebSocketLambdaIntegration(
        'MessageApiSendIntegration',
        messageFunc.handler
      ),
    });
    wsApi.grantManageConnections(messageFunc.handler);

    new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi: wsApi,
      stageName: env,
      autoDeploy: true,
    });

    const lambdaExecutionRole = new LambdaExecRole(this, 'roles', { env });

    const reserveUserDeletionFunc = new ReserveUserDeletionFunc(
      this,
      'ReserveUserDeletionFunc',
      {
        env,
        role: lambdaExecutionRole.role,
        usersTable: db.usersTable,
      }
    );

    const httpApi = new HttpApi(this, 'HttpApi');
    httpApi.addRoutes({
      path: '/reserve-user-deletion',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'ReserveUserDeletionIntegration',
        reserveUserDeletionFunc.handler
      ),
    });
  }
}
