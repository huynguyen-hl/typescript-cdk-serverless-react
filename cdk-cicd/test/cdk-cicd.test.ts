import { handler } from '../services/hello';

describe('hello function', () => {
  it('should return status code 200', () => {
    const result = handler({}, {}, (error: any, response: any) => {
      expect(response.statusCode).toEqual(200);
    });
  });
});
