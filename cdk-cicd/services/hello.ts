function handler(event: any, context: any) {
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!!'),
  };
}

export { handler };
