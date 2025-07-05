import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
}

export class LambdaStack extends Stack {
  public readonly lambdaIntegration: LambdaIntegration;
  // public readonly lambdaIntegration: HttpLambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id);

    const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: join(__dirname, '..', '..', 'services', 'spaces', 'handler.ts'),
      environment: {
        SPACES_TABLE: props.spacesTable.tableName,
      },
      tracing: Tracing.ACTIVE,
      timeout: Duration.minutes(1)
    });

    spacesLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:DeleteItem',
        'dynamodb:UpdateItem',
        'dynamodb:Scan',
      ],
      resources: [props.spacesTable.tableArn],
    }));

    this.lambdaIntegration = new LambdaIntegration(spacesLambda);
    // this.lambdaIntegration = new HttpLambdaIntegration('SpacesLambdaIntegration', spacesLambda);
  }
}