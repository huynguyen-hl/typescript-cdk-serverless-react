import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { hasAdminRights } from '../shared/Utils';

export async function deleteSpace(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient
): Promise<APIGatewayProxyStructuredResultV2> {
  if (!hasAdminRights(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify('Not Authorized!'),
    };
  }
  if (!event.queryStringParameters?.id) {
    return {
      statusCode: 400,
      body: JSON.stringify('Please provide right query parameters!'),
    };
  }

  const result = await ddbDocClient.send(
    new DeleteCommand({
      TableName: process.env.SPACES_TABLE,
      Key: {
        id: event.queryStringParameters.id,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}
