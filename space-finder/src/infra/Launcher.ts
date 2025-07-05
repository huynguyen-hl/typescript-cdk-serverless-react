import { App } from 'aws-cdk-lib';
import { DataStack } from './stacks/DataStack';
import { ApiStack } from './stacks/ApiStack';
import { LambdaStack } from './stacks/LambdaStack';
import { AuthStack } from './stacks/AuthStack';
import { UiDeploymentStack } from './stacks/UiDeploymentStack';
import { ApiStackV2 } from './stacks/ApiStackV2';
import { MonitorStack } from './stacks/MonitorStack';

const app = new App();

const dataStack = new DataStack(app, 'DataStack');

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  spacesTable: dataStack.spacesTable,
});

const authStack = new AuthStack(app, 'AuthStack', {
  photosBucket: dataStack.photosBucket
});

new ApiStack(app, 'ApiStack', {
  lambdaIntegration: lambdaStack.lambdaIntegration,
  userPool: authStack.userPool,
});
// new ApiStackV2(app, 'ApiStackV2', {
//   lambdaIntegration: lambdaStack.lambdaIntegration,
//   userPool: authStack.userPool,
// });

new UiDeploymentStack(app, 'UiDeploymentStack');

new MonitorStack(app, 'MonitorStack');
