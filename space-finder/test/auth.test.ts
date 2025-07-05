import { AwsCredentialIdentity } from '@smithy/types';
import { AuthService } from './AuthService';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';


async function testAuthService() {
  const authService = new AuthService();
  try {
    const signInResult = await authService.login('huynguyen', 'abcdefgj1U)');
    console.log('Sign-in successful:', signInResult);
    
    // const idToken = await authService.getIdToken();
    // console.log('ID Token:', idToken);

    const temporaryCredentials = await authService.generateTemporaryCredential();
    console.log('temporaryCredential', temporaryCredentials);

    const buckets = await listBuckets(temporaryCredentials);
    console.log('buckets', buckets);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

async function listBuckets(credentials: AwsCredentialIdentity) {
  const s3Client = new S3Client({ credentials }); 
  const listBucketCommand = new ListBucketsCommand({});
  const buckets = await s3Client.send(listBucketCommand);
  return buckets;
}

testAuthService();