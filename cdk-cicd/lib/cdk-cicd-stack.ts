import * as cdk from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { PipelineStage } from './PipelineStage';

export class CdkCicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'AwesomePipeline', {
      pipelineName: 'AwesomePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('huynguyen-hl/typescript-cdk-serverless-react', 'main', {
          authentication: cdk.SecretValue.secretsManager('/codepipeline/githubtoken'),
        }),
        commands: ['cd cdk-cicd', 'npm ci', 'npx cdk synth'],
        primaryOutputDirectory: 'cdk-cicd/cdk.out',
      }),
    });

    const testStage = pipeline.addStage(
      new PipelineStage(this, 'PipelineTestStage', {
        stageName: 'test',
      })
    );

    testStage.addPre(
      new CodeBuildStep('unit-tests', {
        commands: ['cd cdk-cicd', 'npm ci', 'npm test'],
      })
    );
  }
}
