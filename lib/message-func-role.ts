import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

type Props = {
  parent: Construct;
  env: string;
  lambdaOpsKey: Key;
};

export const newMessageFuncRole = ({ parent, env, lambdaOpsKey }: Props) => {
  const role = new Role(
    parent,
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

  role.addToPolicy(
    new PolicyStatement({
      sid: 'GetParameterStore',
      actions: ['ssm:GetParameter'],
      resources: ['*'],
    })
  );

  role.addToPolicy(
    new PolicyStatement({
      sid: 'KMSLambdaOps',
      actions: ['kms:Decrypt'],
      resources: [lambdaOpsKey.keyArn],
    })
  );
  return role;
};
