import { handler } from '../services/hello';

describe('hello function', () => {
  it('should return status code 200', () => {
    const result = handler({}, {});

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify('Hello from Lambda!'));
  });
});
