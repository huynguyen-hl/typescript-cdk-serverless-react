function handler(event: any, context: any, callback: Function) {
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!!')
  })
}

export { handler };