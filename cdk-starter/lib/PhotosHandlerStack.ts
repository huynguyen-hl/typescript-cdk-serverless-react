import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function as LambdaFunction, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

interface PhotosHandlerStackProps extends cdk.StackProps {
  targetBucket: string;
}

export class PhotosHandlerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PhotosHandlerStackProps) {
    super(scope, id, props);



    new LambdaFunction(this, 'PhotosHandler', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromInline(`
        exports.handler = async (event) => {

          console.log('hello!:', process.env.TARGET_BUCKET);
        };
      `),
      environment: {
        TARGET_BUCKET: props.targetBucket,
      },
      timeout: cdk.Duration.seconds(30),
    });

  }

}