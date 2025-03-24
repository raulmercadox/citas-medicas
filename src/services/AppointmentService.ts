// src/services/AppointmentService.ts

import { SNS } from "aws-sdk";
import { Appointment } from "../models/Appointment";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class AppointmentService {
  private sns: SNS;
  constructor(private readonly repository: AppointmentRepository) {
    // Inicializamos el cliente de SNS
    this.sns = new SNS();
  }

  async register(
    insuredId: string,
    scheduleId: number,
    countryISO: string
  ): Promise<Appointment> {
    // Creamos la fecha actual en formato ISO
    const createdAt = new Date().toISOString();

    // Creamos la instancia de Appointment
    const appointment = new Appointment(
      insuredId,
      createdAt,
      scheduleId,
      countryISO
    );
    // Guardamos la cita en la base de datos
    await this.repository.save(appointment);

    // Seleccionamos el tópico SNS adecuado según el país
    let topicArn: string | undefined;

    if (countryISO === "PE") {
      topicArn = process.env.APPOINTMENT_TOPIC_PE;
    } else if (countryISO === "CL") {
      topicArn = process.env.APPOINTMENT_TOPIC_CL;
    } else {
      console.warn(
        `País no soportado: ${countryISO}. No se enviará mensaje a SNS.`
      );
      return appointment;
    }

    try {
      // Publicamos el mensaje en el tópico SNS
      await this.sns
        .publish({
          TopicArn: topicArn,
          Message: JSON.stringify(appointment),
          MessageAttributes: {
            // Podemos añadir atributos para filtrado si es necesario
            countryISO: {
              DataType: "String",
              StringValue: countryISO,
            },
          },
        })
        .promise();

      console.log(`Mensaje publicado exitosamente en SNS para ${countryISO}`);
    } catch (error) {
      // Capturamos errores pero no interrumpimos el flujo principal
      console.error(`Error al publicar en SNS para ${countryISO}:`, error);
      // No relanzamos el error ya que la cita ya fue guardada en la base de datos
    }

    return appointment;
  }

  async confirm(insuredId: string, createdAt: string): Promise<void> {
    // Implementar lógica de confirmación
    await this.repository.confirm(insuredId, createdAt);
    console.log(
      `Confirmación de cita para asegurado ${insuredId} en ${createdAt}`
    );
  }

  async listByInsuredId(insuredId: string): Promise<Appointment[]> {
    // Implementar lógica de listado
    return this.repository.listByInsuredId(insuredId);
  }
}
