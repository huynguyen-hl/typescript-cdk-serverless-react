import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { parseJSON } from '../shared/Utils';

export async function putSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient
): Promise<APIGatewayProxyStructuredResultV2> {
  if (!event.body || !event.queryStringParameters?.id) {
    return {
      statusCode: 400,
      body: JSON.stringify('Please provide right query parameters and body!'),
    };
  }

  const parsedBody = parseJSON(event.body);

  const updateQuery: UpdateCommandInput = {
    TableName: process.env.SPACES_TABLE,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: 'set ',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: 'UPDATED_NEW',
  };

  if (parsedBody.name) {
    updateQuery.UpdateExpression === 'set ' ? updateQuery.UpdateExpression += '#name = :name' : updateQuery.UpdateExpression += ', #name = :name';
    updateQuery.ExpressionAttributeNames = {
      ...updateQuery.ExpressionAttributeNames,
      '#name': 'name',
    };
    updateQuery.ExpressionAttributeValues = {
      ...updateQuery.ExpressionAttributeValues,
      ':name': parsedBody.name,
    };
  }
  if (parsedBody.location) {
    updateQuery.UpdateExpression === 'set ' ? updateQuery.UpdateExpression += '#location = :location' : updateQuery.UpdateExpression += ', #location = :location';
    updateQuery.ExpressionAttributeNames = {
      ...updateQuery.ExpressionAttributeNames,
      '#location': 'location',
    };
    updateQuery.ExpressionAttributeValues = {
      ...updateQuery.ExpressionAttributeValues,
      ':location': parsedBody.location,
    };
  }

  const result = await ddbDocClient.send(
    new UpdateCommand(updateQuery)
  );

  return {
    statusCode: 204,
    body: JSON.stringify(result.Attributes),
  };
}
