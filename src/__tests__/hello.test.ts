// src/handlers/hello.test.ts

import { handler } from "../handlers/hello";
// src/handlers/hello.test.ts

import {
  APIGatewayProxyResult,
  APIGatewayEvent,
  Context,
  Callback,
} from "aws-lambda";

describe("Hello Lambda Function", () => {
  it("should return a 200 response with a hello message", async () => {
    // Mock the event object
    const mockEvent = {} as APIGatewayEvent;

    // Mock context and callback (not used in this function but included for completeness)
    const mockContext = {} as Context;
    const mockCallback = {} as Callback;

    // Call the handler function and explicitly type the response
    const response = (await handler(
      mockEvent,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult;

    // Assert the expected results
    expect(response.statusCode).toBe(200);

    // Parse the JSON body to verify the message
    const body = JSON.parse(response.body);
    expect(body.message).toBe("Hello from TypeScript & Serverless!");
  });
});
