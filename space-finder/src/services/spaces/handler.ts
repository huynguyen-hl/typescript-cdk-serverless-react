import {
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getSpaces } from './getSpaces';
import { postSpaces } from './postSpaces';
import { putSpaces } from './putSpaces';
import { deleteSpace } from './deleteSpace';
import { JSONError, MissingField } from '../shared/Validator';
import { getOrginHeaders } from '../shared/Utils';
import { captureAWSv3Client, getSegment } from 'aws-xray-sdk-core';

const ddbClient =  captureAWSv3Client(new DynamoDBClient({}));
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResultV2> {

  // Test X-Ray add subsegments
  // const subSeg1 = getSegment().addNewSubsegment('MyLongCall');
  // await new Promise(resolve => setTimeout(resolve, 3000));
  // subSeg1.close();
  // const subSeg2 = getSegment().addNewSubsegment('MyShortCall');
  // await new Promise(resolve => setTimeout(resolve, 500));
  // subSeg2.close();

  try {
    let response: APIGatewayProxyStructuredResultV2 = { headers: getOrginHeaders() };

    switch (event.httpMethod) {
      case 'GET':
        const getSpacesResult = await getSpaces(event, ddbDocClient);
        response.body = getSpacesResult.body;
        response.statusCode = getSpacesResult.statusCode;
        break;
      case 'POST':
        const postSpacesResult = await postSpaces(event, ddbDocClient);
        response.body = postSpacesResult.body;
        response.statusCode = postSpacesResult.statusCode;
        break;
      case 'PUT':
        const putSpacesResult = await putSpaces(event, ddbDocClient);
        response.body = putSpacesResult.body;
        response.statusCode = putSpacesResult.statusCode;
        break;
      case 'DELETE':
        const deleteSpaceResult = await deleteSpace(event, ddbDocClient);
        response.body = deleteSpaceResult.body;
        response.statusCode = deleteSpaceResult.statusCode;
        break;
      default:
        break;
    }

    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof MissingField || error instanceof JSONError) {
      return {
        statusCode: 400,
        body: JSON.stringify(error.message),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}

export { handler };
