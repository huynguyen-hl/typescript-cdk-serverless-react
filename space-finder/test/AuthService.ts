import { Amplify } from 'aws-amplify';
import { signIn, SignInOutput, fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@smithy/types';

const awsRegion = 'ap-southeast-1';
const userPoolId = 'ap-southeast-1_TyiHLqmlT';
const userPoolClientId = '2rplne0libd7hrtn64j6ngoa7j';
const identityPoolId = 'ap-southeast-1:45a1c783-60a7-458c-9524-959be74c5fb0';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      identityPoolId,
    },
  },
});

export class AuthService {
  public async login(username: string, password: string): Promise<SignInOutput> {
    try {
      const signInResult = await signIn({
        username,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });
      return signInResult;
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Call after login to fetch the current auth session.
   * @returns The ID token from the current auth session.
   */
  public async getIdToken() {
    try {
      const session = await fetchAuthSession();
      console.log('session.tokens?.idToken?.toString()', session.tokens?.idToken?.toString());
      return session.tokens?.idToken?.toString();
    } catch (error) {
      console.error('Failed to fetch auth session:', error);
      throw error;
    }
  }

  public async generateTemporaryCredential(): Promise<AwsCredentialIdentity> {
    const idToken = await this.getIdToken();
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId,
        logins: {
          [cognitoIdentityPool]: idToken
        }
      })
    });

    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }
}
