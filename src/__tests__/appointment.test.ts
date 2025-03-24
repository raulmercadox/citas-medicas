// src/__tests__/appointment.test.ts

import { register } from "../handlers/appointment";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

import {
  APIGatewayProxyResult,
  APIGatewayEvent,
  Context,
  Callback,
} from "aws-lambda";

// Mock directo de módulos
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
  // Definir el objeto de respuesta mock
  const mockAppointmentResponse = {
    appointmentId: "123456",
    insuredId: "543",
    scheduleId: 546,
    countryISO: "PE",
    status: "REGISTERED",
    createdAt: new Date().toISOString(),
  };

  // Función mock para el método register
  const mockRegisterFn = jest.fn().mockResolvedValue(mockAppointmentResponse);

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();

    // IMPORTANTE: Reemplazar el prototipo del constructor con nuestra implementación mock
    // Esto asegura que cualquier nueva instancia de AppointmentService usará nuestro mock
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

    // Verificar la respuesta correcta
    expect(response.statusCode).toBe(200);

    // Verificar que el método register fue llamado con los parámetros correctos
    expect(mockRegisterFn).toHaveBeenCalledWith("543", 546, "PE");

    // Verificar el body de la respuesta
    const responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual(mockAppointmentResponse);
  });
});
