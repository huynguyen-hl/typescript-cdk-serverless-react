import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession, type SignInOutput } from '@aws-amplify/auth';
import { AuthStack } from '../../../outputs.json';
import type { AwsCredentialIdentity } from '@smithy/types';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'ap-southeast-1';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: AuthStack.SpaceUserPoolId,
      userPoolClientId: AuthStack.SpaceUserPoolClientId,
      identityPoolId: AuthStack.SpaceUserIdentityPoolId,
    },
  },
});

export class AuthService {
  public user?: SignInOutput;
  public username?: string;
  public jwtToken?: string;
  public temporaryCredentials?: AwsCredentialIdentity;

  public async login(username: string, password: string): Promise<object | undefined> {
    try {
      const signInOutput = await signIn({
        username,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });

      this.user = signInOutput;
      this.username = username;

      await this.generateIdToken();

      return this.user;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  private async generateIdToken() {
    try {
      this.jwtToken = (await fetchAuthSession()).tokens?.idToken?.toString();
      return this.jwtToken;
    } catch (error) {
      console.error('Failed to fetch auth session:', error);
      throw error;
    }
  }

  public getIdToken() {
    return this.jwtToken;
  }

  public getUserName() {
    return this.username;
  }

  public async getTemporaryCredentials() {
    if (!this.temporaryCredentials) {
      this.temporaryCredentials = await this.generateTemporaryCredentials();
    }

    return this.temporaryCredentials;
  }

  private async generateTemporaryCredentials(): Promise<AwsCredentialIdentity> {
    const idToken = this.getIdToken();
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsRegion
        },
        identityPoolId: AuthStack.SpaceUserIdentityPoolId,
        logins: {
          [cognitoIdentityPool]: idToken!,
        },
      }),
    });

    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }

  public isAuthorized() {
    if (!this.user) {
      return false;
    }

    return true;
  }
}
