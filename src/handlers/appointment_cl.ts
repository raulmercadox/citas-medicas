import { SQSEvent, SQSHandler } from "aws-lambda";
import { EventBridge } from "aws-sdk";
// import { Appointment } from "../models/appointment";

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export const register: SQSHandler = async (event: SQSEvent) => {
  console.log("Procesando mensajes de la cola de Perú (PE)");

  // Inicializar el cliente de EventBridge
  const eventBridge = new EventBridge();

  for (const record of event.Records) {
    try {
      console.log(`Procesando mensaje: ${record.messageId}`);

      // Parsear el mensaje
      const appointmentData = JSON.parse(record.body);
      const { insuredId, createdAt, scheduledId, countryISO } = appointmentData;

      // Aquí implementarías la lógica específica para Chile
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
                // Incluir los valores HASH y RANGE
                insuredId: insuredId,
                createdAt: createdAt,
                // Información adicional que podría ser útil
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

      // Ejemplos de lo que podrías hacer:
      // - Enviar notificaciones específicas para Chile
      // - Actualizar sistemas externos de Chile
      // - Generar documentación según normativas de Chile
    } catch (error) {
      console.error(`Error procesando mensaje ${record.messageId}:`, error);
      // En caso de error, puedes decidir si quieres que el mensaje vuelva a la cola
      // Si lanzas una excepción aquí, fallará todo el batch
      // Si sólo registras el error, el mensaje se considerará procesado
    }
  }

  console.log("Procesamiento de mensajes de Chile (CL) completado");
};
