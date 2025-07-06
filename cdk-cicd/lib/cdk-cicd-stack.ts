import * as cdk from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject, Project } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  CodeBuildActionType,
  GitHubSourceAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';

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
    const sourceAction = new GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'huynguyen-hl',
      repo: 'typescript-cdk-serverless-react',
      oauthToken: cdk.SecretValue.secretsManager('/codepipeline/githubtoken'),
      output: sourceOutput,
      branch: 'main',
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    // test stage
    pipeline.addStage({
      stageName: 'CodeBuild-TestLambda',
      actions: [
        new CodeBuildAction({
          type: CodeBuildActionType.TEST,
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

    // build stage
    const buildProject = new Project(this, 'BuildProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd cdk-cicd', 'npm ci'],
          },
          build: {
            commands: ['cd cdk-cicd', 'npx cdk synth'],
          },
        },
        artifacts: {
          files: 'cdk-cicd/cdk.out/**/*',
        },
      }),
    });
    const buildOutput = new Artifact();
    const buildAction = new CodeBuildAction({
      actionName: 'CDK_Build',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    });

    // finally, deploy your Lambda Stack
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: 'Lambda_CFN_Deploy',
          templatePath: buildOutput.atPath('cdk-cicd/cdk.out/LambdaStack.template.json'),
          stackName: 'LambdaStack',
          adminPermissions: true,
        }),
      ],
    });
  }
}
