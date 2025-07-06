import * as cdk from 'aws-cdk-lib';
import { BuildSpec, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { ParameterValueType } from 'aws-cdk-lib/aws-ssm';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { PipelineStage } from './PipelineStage';

export class CdkCicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // new CodePipeline(this, 'AwsomePipeline', {
    //   pipelineName: 'AwsomePipeline',
    //   synth: new ShellStep('Synth', {
    //     input: CodePipelineSource.gitHub('huynguyen-hl/typescript-cdk-serverless-react', 'main'),
    //     commands: [
    //       'cd cdk-cicd',
    //       'npm ci',
    //       'npx cdk synth'
    //     ],
    //     primaryOutputDirectory: 'cdk-cide/cdk.out'
    //   })
    // });

    // /codepipeline/githubtoken
    const pipeline = new Pipeline(this, 'MyPipeline');
    const sourceOutput = new Artifact();

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'GitHub_Source',
          owner: 'huynguyen-hl',
          repo: 'typescript-cdk-serverless-react',
          oauthToken: cdk.SecretValue.secretsManager('/codepipeline/githubtoken'),
          output: sourceOutput,
          branch: 'main',
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'CodeBuild-SynthCDK',
      actions: [
        new CodeBuildAction({
          input: sourceOutput,
          actionName: 'SynthCDK',
          project: new PipelineProject(this, 'SynthCDK', {
            buildSpec: BuildSpec.fromObject({
              version: '0.2',
              phases: {
                build: {
                  commands: [
                    'cd cdk-cicd',
                    'npm ci',
                    'npx cdk synth',
                    // 'npx cdk deploy --all --require-approval never',
                  ],
                },
              },
            }),
          }),
        }),
      ],
    });

    // unit test stage
    pipeline.addStage({
      stageName: 'CodeBuild-TestLambda',
      actions: [
        new CodeBuildAction({
          input: sourceOutput,
          actionName: 'TestLambda',
          project: new PipelineProject(this, 'TestLambda', {
            buildSpec: BuildSpec.fromObject({
              version: '0.2',
              phases: {
                build: {
                  commands: ['cd cdk-cicd', 'npm ci', 'npm test'],
                },
              },
            }),
          }),
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CodeBuildAction({
          input: sourceOutput,
          actionName: 'DeployCDK',
          project: new PipelineProject(this, 'DeployCDK', {
            buildSpec: BuildSpec.fromObject({
              version: '0.2',
              phases: {
                build: {
                  commands: [
                    'cd cdk-cicd',
                    'npm ci',
                    'npx cdk deploy --all --require-approval never',
                  ],
                },
              },
            }),
          }),
        }),
      ],
    });
  }
}
