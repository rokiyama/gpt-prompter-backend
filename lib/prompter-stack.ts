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
import { DeleteUserFunc } from './delete-user-func';
import { LambdaExecRole } from './lambda-exec-role';
import { MessageFunc } from './message-func';
import { newMessageFuncRole } from './message-func-role';
import { newTables } from './tables';

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

    const { usersTable, deleteUsersTable } = newTables(this);

    const messageFunc = new MessageFunc(this, 'messageFunc', {
      env,
      role: messageFuncRole,
      usersTable,
      deleteUsersTable,
    });

    const wsApi = new WebSocketApi(this, 'web-socket-api', {
      routeSelectionExpression: '$request.body.action',
    });

    wsApi.addRoute('message', {
      integration: new WebSocketLambdaIntegration(
        'MessageApiSendIntegration',
        messageFunc.handler
      ),
    });
    wsApi.grantManageConnections(messageFunc.handler);

    new WebSocketStage(this, 'MessageApiProd', {
      webSocketApi: wsApi,
      stageName: env,
      autoDeploy: true,
    });

    const lambdaExecutionRole = new LambdaExecRole(this, 'roles', { env });

    const deleteUsersFunc = new DeleteUserFunc(this, 'deleteUserFunc', {
      env,
      role: lambdaExecutionRole.role,
      usersTable,
      deleteUsersTable,
    });

    const httpApi = new HttpApi(this, 'HttpApi');
    httpApi.addRoutes({
      path: '/delete-user',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'DeleteUserIntegration',
        deleteUsersFunc.handler
      ),
    });
  }
}
