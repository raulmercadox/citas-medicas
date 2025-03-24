import { SNS } from "aws-sdk";
import { Appointment } from "../models/Appointment";
import { AppointmentRepository } from "../repositories/AppointmentRepository";

export class AppointmentService {
  private sns: SNS;
  constructor(private readonly repository: AppointmentRepository) {
    this.sns = new SNS();
  }

  async register(
    insuredId: string,
    scheduleId: number,
    countryISO: string
  ): Promise<Appointment> {
    const createdAt = new Date().toISOString();

    const appointment = new Appointment(
      insuredId,
      createdAt,
      scheduleId,
      countryISO
    );
    await this.repository.save(appointment);

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
      await this.sns
        .publish({
          TopicArn: topicArn,
          Message: JSON.stringify(appointment),
          MessageAttributes: {
            countryISO: {
              DataType: "String",
              StringValue: countryISO,
            },
          },
        })
        .promise();

      console.log(`Mensaje publicado exitosamente en SNS para ${countryISO}`);
    } catch (error) {
      console.error(`Error al publicar en SNS para ${countryISO}:`, error);
    }

    return appointment;
  }

  async confirm(insuredId: string, createdAt: string): Promise<void> {
    await this.repository.confirm(insuredId, createdAt);
    console.log(
      `Confirmación de cita para asegurado ${insuredId} en ${createdAt}`
    );
  }

  async listByInsuredId(insuredId: string): Promise<Appointment[]> {
    return this.repository.listByInsuredId(insuredId);
  }
}
