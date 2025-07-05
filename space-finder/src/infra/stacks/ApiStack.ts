import { Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  lambdaIntegration: LambdaIntegration,
  userPool: IUserPool
};

export class ApiStack extends Stack {

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    const api = new RestApi(this, 'SpacesApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      }
    });

    const authorizer = new CognitoUserPoolsAuthorizer(this, 'SpacesApiAuthorizer', {
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization',
    });
    authorizer._attachToApi(api);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    };

    const spacesReousrce = api.root.addResource('spaces');
    spacesReousrce.addMethod('GET', props.lambdaIntegration, optionsWithAuth);
    spacesReousrce.addMethod('POST', props.lambdaIntegration, optionsWithAuth);
    spacesReousrce.addMethod('PUT', props.lambdaIntegration, optionsWithAuth);
    spacesReousrce.addMethod('DELETE', props.lambdaIntegration, optionsWithAuth);

  }
}