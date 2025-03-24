import { SQSEvent, SQSHandler } from "aws-lambda";
import { EventBridge } from "aws-sdk";

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export const register: SQSHandler = async (event: SQSEvent) => {
  console.log("Procesando mensajes de la cola de Perú (PE)");

  const eventBridge = new EventBridge();

  for (const record of event.Records) {
    try {
      console.log(`Procesando mensaje: ${record.messageId}`);

      const appointmentData = JSON.parse(record.body);
      const { insuredId, createdAt, scheduledId, countryISO } = appointmentData;

      console.log(
        `Procesando cita para el asegurado ${appointmentData.insuredId} en Chile`
      );

      const eventResult = await eventBridge
        .putEvents({
          Entries: [
            {
              EventBusName: process.env.APPOINTMENT_EVENT_BUS,
              Source: "appointment.service",
              DetailType: "appointment.registered",
              Detail: JSON.stringify({
                status: "SUCCESS",
                country: countryISO,
                insuredId: insuredId,
                createdAt: createdAt,
                scheduledId: scheduledId,
                processedAt: new Date().toISOString(),
                messageId: record.messageId,
              }),
            },
          ],
        })
        .promise();

      console.log(
        `Evento enviado a EventBridge: ${JSON.stringify(eventResult)}`
      );
    } catch (error) {
      console.error(`Error procesando mensaje ${record.messageId}:`, error);
    }
  }

  console.log("Procesamiento de mensajes de Chile (CL) completado");
};
