import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

type Props = {
  env: string;
};

export class LambdaExecRole extends Construct {
  public readonly role: Role;

  constructor(scope: Construct, id: string, { env }: Props) {
    super(scope, id);

    this.role = new Role(this, `lambda-extension-role-${env}`, {
      roleName: `lambda-extension-role-${env}`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn:
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        },
      ],
    });
  }
}
