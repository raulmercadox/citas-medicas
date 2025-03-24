import { register } from "../handlers/appointment";
import { AppointmentService } from "../services/AppointmentService";

import {
  APIGatewayProxyResult,
  APIGatewayEvent,
  Context,
  Callback,
} from "aws-lambda";

jest.mock("../services/AppointmentService");
jest.mock("../repositories/AppointmentRepository");

describe("Register an Empty Appointment", () => {
  it("should return a 400 response with a message", async () => {
    const mockEvent = {} as APIGatewayEvent;
    const mockContext = {} as Context;
    const mockCallback = {} as Callback;

    const response = (await register(
      mockEvent,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toBe("Body is required");
  });
});

describe("Register a valid appointment", () => {
  const mockAppointmentResponse = {
    appointmentId: "123456",
    insuredId: "543",
    scheduleId: 546,
    countryISO: "PE",
    status: "REGISTERED",
    createdAt: new Date().toISOString(),
  };

  const mockRegisterFn = jest.fn().mockResolvedValue(mockAppointmentResponse);

  beforeEach(() => {
    jest.clearAllMocks();

    AppointmentService.prototype.register = mockRegisterFn;
  });

  it("should return a 200 message", async () => {
    const mockEvent = {
      body: JSON.stringify({
        insuredId: "543",
        scheduleId: 546,
        countryISO: "PE",
      }),
      headers: { "Content-Type": "application/json" },
      multiValueHeaders: {},
      httpMethod: "POST",
      isBase64Encoded: false,
      path: "",
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: "",
    } as APIGatewayEvent;

    const mockContext = {} as Context;
    const mockCallback = {} as Callback;

    const response = (await register(
      mockEvent,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(200);

    expect(mockRegisterFn).toHaveBeenCalledWith("543", 546, "PE");

    const responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual(mockAppointmentResponse);
  });
});
