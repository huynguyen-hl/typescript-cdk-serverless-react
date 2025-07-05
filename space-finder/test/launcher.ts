import { handler } from '../src/services/spaces/handler';

// Create
// handler(
//   {
//     httpMethod: 'POST',
//     body: JSON.stringify({
//       location: 'California',
//       name: 'California Space',
//     }),
//   } as any,
//   {} as any
// );

// Get
// handler(
//   {
//     httpMethod: 'GET',
//     // queryStringParameters: {
//     //   id: 'b485c26f-8f14-4211-86a4-64956d4b2b6d',
//     // },
//   } as any,
//   {} as any
// );

// Update
handler(
  {
    httpMethod: 'PUT',
    queryStringParameters: {
      id: 'ec484f52-441f-4ebf-aa89-c2a305e5a49d',
    },
    body: JSON.stringify({
      name: 'What a beautiful space2',
      location: 'Paris4',
    }),
  } as any,
  {} as any
);

// Delete
// handler(
//   {
//     httpMethod: 'DELETE',
//     queryStringParameters: {
//       id: 'a0242ced-e870-47ae-b620-b457869eb340',
//     },
//   } as any,
//   {} as any
// );