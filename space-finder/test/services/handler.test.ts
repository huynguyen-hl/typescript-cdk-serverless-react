import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../src/services/spaces/handler';

const someItems = [
  {
    id: '123',
    location: 'Paris',
  },
];

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation(() => ({ Items: someItems }))
    })),
  },
  ScanCommand: jest.fn(),
}));

describe('Spaces handler test suite', () => {
  test('Returns spaces from dynamoDb', async () => {
    const result = await handler(
      {
        httpMethod: 'GET',
      } as any,
      {} as any
    ) as any;

    expect(result.statusCode).toBe(200);
    const expectedResult = [
      {
        id: '123',
        location: 'Paris',
      },
    ];
    const parsedResultBody = JSON.parse(result.body);
    expect(parsedResultBody).toEqual(expectedResult);

    expect(ScanCommand).toHaveBeenCalledTimes(1);
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
  });
});
