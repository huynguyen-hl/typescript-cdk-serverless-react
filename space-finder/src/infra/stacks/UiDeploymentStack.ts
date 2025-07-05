import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class UiDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stackSuffix = getSuffixFromStack(this);

    const uiDeploymentBucket = new Bucket(this, 'SpaceFinderFrontendDeploymentBucket', {
      bucketName: `space-finder-frontend-${stackSuffix}`,
    });

    const spaceFinderFrontendDir = join(
      __dirname,
      '..',
      '..',
      '..',
      'space-finder-frontend',
      'dist'
    );
    if (!existsSync(spaceFinderFrontendDir)) {
      console.warn(`Ui dir not found: ${spaceFinderFrontendDir}`);
      return;
    }

    new BucketDeployment(this, 'SpaceFinderDeploymentbucketDeployment', {
      destinationBucket: uiDeploymentBucket,
      sources: [Source.asset(spaceFinderFrontendDir)],
    });

    const originIdentity = new OriginAccessIdentity(this, 'SpaceFinderOAI');

    const spaceFinderUiDistribution = new Distribution(this, 'SpaceFinderDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(uiDeploymentBucket, {
          originAccessIdentity: originIdentity,
        }),
      },
    });

    new CfnOutput(this, 'SpaceFinderCdnUrl', {
      value: spaceFinderUiDistribution.distributionDomainName,
    });
  }
}
