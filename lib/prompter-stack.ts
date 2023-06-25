import {
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2-alpha/lib/websocket';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class PrompterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = process.env.ENV || 'dev';

    const table = new Table(this, 'prompterDb', {
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

    const lambdaOpsKey = new Key(this, `lambda-kms-key-${env}`, {
      description:
        'Lambda KMS key for lambda function to get SSM key parameter store',
      alias: `lambda-kms-key-${env}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambdaRole = new Role(
      this,
      `parameters-secret-lambda-extension-role-${env}`,
      {
        roleName: `parameters-secret-lambda-extension-role-${env}`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          {
            managedPolicyArn:
              'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          },
        ],
      }
    );

    lambdaRole.addToPolicy(
      new PolicyStatement({
        sid: 'GetParameterStore',
        actions: ['ssm:GetParameter'],
        resources: ['*'],
      })
    );

    lambdaRole.addToPolicy(
      new PolicyStatement({
        sid: 'KMSLambdaOps',
        actions: ['kms:Decrypt'],
        resources: [lambdaOpsKey.keyArn],
      })
    );

    const messageFunc = new GoFunction(this, 'messageFunc', {
      entry: 'functions/message-func',
      logRetention: RetentionDays.ONE_YEAR,
      role: lambdaRole,
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
        CHAT_USERS_TABLE_NAME: table.tableName,
        MAX_TOKENS_PER_DAY: env === 'prod' ? '10000' : '30000',
        SSM_OPENAI_API_KEY_PARAMETER_NAME: `/openai/apiKey/${env}`,
        APPLE_JWKS_URL: 'https://appleid.apple.com/auth/keys',
        ISSUER_APPLE: 'https://appleid.apple.com',
      },
    });
    table.grantReadWriteData(messageFunc);

    const wsApi = new WebSocketApi(this, 'web-socket-api', {
      routeSelectionExpression: '$request.body.action',
    });

    wsApi.addRoute('message', {
      integration: new WebSocketLambdaIntegration(
        'MessageApiSendIntegration',
        messageFunc
      ),
    });
    wsApi.grantManageConnections(messageFunc);

    new WebSocketStage(this, 'MessageApiProd', {
      webSocketApi: wsApi,
      stageName: env,
      autoDeploy: true,
    });
  }
}
