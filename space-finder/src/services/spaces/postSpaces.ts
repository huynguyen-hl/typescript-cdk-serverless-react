import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { v4 } from 'uuid';
import { validateAsSpaceEntry } from '../shared/Validator';
import { createRandomId, parseJSON } from '../shared/Utils';

export async function postSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient
): Promise<APIGatewayProxyStructuredResultV2> {
  const randomId = createRandomId();
  const item = parseJSON(event.body);
  item.id = randomId;
  validateAsSpaceEntry(item);

  await ddbDocClient.send(
    new PutCommand({
      TableName: process.env.SPACES_TABLE,
      Item: item,
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ id: randomId }),
  };
}
