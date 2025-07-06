import { handler } from '../services/hello';

describe('hello function', () => {
  it('should return status code 200', () => {
    handler({}, {}, (error: any, response: any) => {
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify('Hello from Lambda!!'));
    });
  });
});
