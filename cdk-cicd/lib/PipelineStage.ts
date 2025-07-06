import { Stage } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { LambdaStack } from './LambdaStack';
import { StageOptions } from 'aws-cdk-lib/aws-codepipeline';

export class PipelineStage extends Stage {

  constructor(scope: Construct, id: string, props: StageOptions) {
    super(scope, id, props);

    new LambdaStack(this, 'LambdaStack', {
      stageName: props.stageName!,
    });
  }
}