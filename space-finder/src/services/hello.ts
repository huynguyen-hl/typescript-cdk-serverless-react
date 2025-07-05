import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { v4 } from 'uuid';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const command = new ListBucketsCommand({});

  const listBucketsResult = (await s3Client.send(command)).Buckets;

  const response: APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify(`Hello from Lambda! These are your buckets: ${JSON.stringify(listBucketsResult)}`),
  };

  return response;
}

export { handler };