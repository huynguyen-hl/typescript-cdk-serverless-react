import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { JSONError } from './Validator';

export function parseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new JSONError(`Invalid JSON: ${error.message}`);
  }
}

export function createRandomId(): string {
  return crypto.randomUUID();
}

export function hasAdminRights(event: APIGatewayProxyEvent): boolean {
  const groups = event.requestContext?.authorizer?.claims?.['cognito:groups'];
  if (!groups || !groups.includes('admins')) {
    return false;
  }

  return true;
}

export function getOrginHeaders() {
  return {
    ['Access-Control-Allow-Origin']: '*',
    ['Access-Control-Allow-Methods']: '*',
  }
}
