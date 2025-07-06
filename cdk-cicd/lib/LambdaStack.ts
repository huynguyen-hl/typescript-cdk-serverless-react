import { Stage } from 'aws-cdk-lib'
import { Construct } from 'constructs';

interface LambdaStackProps {
  stageName: string;
}

export class LambdaStack extends Stage {

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
  }
}