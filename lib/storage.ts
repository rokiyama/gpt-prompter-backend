import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as firehose from 'aws-cdk-lib/aws-kinesisfirehose';
import { Construct } from 'constructs';

export class FirehoseToS3 extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const firehoseRole = new iam.Role(this, 'FirehoseRole', {
      assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
    });

    bucket.grantReadWrite(firehoseRole);

    new firehose.CfnDeliveryStream(this, 'Firehose', {
      deliveryStreamType: 'DirectPut',
      s3DestinationConfiguration: {
        bucketArn: bucket.bucketArn,
        roleArn: firehoseRole.roleArn,
        prefix:
          'firehosetos3/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/',
        errorOutputPrefix:
          'firehosetos3erroroutputbase/!{firehose:random-string}/!{firehose:error-output-type}/!{timestamp:yyyy/MM/dd}/',
        bufferingHints: {
          intervalInSeconds: 60,
        },
      },
    });
  }
}
