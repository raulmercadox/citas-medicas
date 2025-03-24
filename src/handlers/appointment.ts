import { APIGatewayProxyHandler, SQSEvent, SQSHandler } from "aws-lambda";
import { AppointmentService } from "../services/AppointmentService";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export const register: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Body is required" }),
      };
    }

    // Analizar el body JSON para convertirlo en un objeto
    const body = JSON.parse(event.body);

    const { insuredId, scheduleId, countryISO } = body;

    // Verificar si todos los campos requeridos están presentes
    if (!insuredId || !scheduleId || !countryISO) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Missing required fields: insuredId, scheduleId, and countryISO are all required",
        }),
      };
    }

    console.log("Received appointment registration request:", {
      insuredId,
      scheduleId,
      countryISO,
    });

    // Procesar los datos y realizar la lógica de negocio
    const appointmentService = new AppointmentService(
      new AppointmentRepository()
    );
    const appointment = await appointmentService.register(
      insuredId,
      scheduleId,
      countryISO
    );

    return {
      statusCode: 200,
      body: JSON.stringify(appointment),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    // Verificar si el error es de análisis JSON
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON in request body" }),
      };
    }

    // Para otros errores, devolver un error 500
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

export const confirm: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      console.log(record.body);
      const body = JSON.parse(record.body);
      const detail = body.detail;
      const insuredId = detail.insuredId;
      const createdAt = detail.createdAt;

      // Actualizar el appointment con el estado confirmado
      const appointmentService = new AppointmentService(
        new AppointmentRepository()
      );
      await appointmentService.confirm(insuredId, createdAt);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }
};

export const listByInsuredId: APIGatewayProxyHandler = async (event) => {
  try {
    const insuredId = event.pathParameters
      ? event.pathParameters.insuredId
      : null;

    if (!insuredId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "insuredId is required" }),
      };
    }

    const appointmentService = new AppointmentService(
      new AppointmentRepository()
    );
    const appointments = await appointmentService.listByInsuredId(insuredId);

    return {
      statusCode: 200,
      body: JSON.stringify(appointments),
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
