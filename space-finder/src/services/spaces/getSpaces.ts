import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export async function getSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient
): Promise<APIGatewayProxyStructuredResultV2> {
  const spacesTableQuery = {
    TableName: process.env.SPACES_TABLE,
  };

  if (event.queryStringParameters) {
    if (!event.queryStringParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify(`id query parameter is required!`),
      };
    }

    const getItemResult = await ddbDocClient.send(
      new GetCommand({
        ...spacesTableQuery,
        Key: {
          id: event.queryStringParameters.id,
        },
      })
    );

    if (!getItemResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify(`Space with id ${event.queryStringParameters.id} not found!`),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(getItemResult.Item),
    };
  }

  const scanResult = await ddbDocClient.send(new ScanCommand(spacesTableQuery));

  return {
    statusCode: 200,
    body: JSON.stringify(scanResult.Items || []),
  };
}
