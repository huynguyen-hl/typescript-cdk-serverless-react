import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackV2Props extends StackProps {
  lambdaIntegration: HttpLambdaIntegration,
  userPool: IUserPool
};

export class ApiStackV2 extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackV2Props) {
    super(scope, id);

    const api = new HttpApi(this, 'SpacesApi', {
      apiName: 'SpacesApi',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.ANY]
      },
    });

    const authorizer = new HttpUserPoolAuthorizer('BooksAuthorizer', props.userPool);

    api.addRoutes({
      path: '/spaces',
      methods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE],
      integration: props.lambdaIntegration,
      authorizer
    });

    new CfnOutput(this, 'SpaceApiUrl', {
      value: api.url
    })
  }
}