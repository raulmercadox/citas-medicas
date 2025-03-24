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

    const body = JSON.parse(event.body);

    const { insuredId, scheduleId, countryISO } = body;

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

    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON in request body" }),
      };
    }

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
