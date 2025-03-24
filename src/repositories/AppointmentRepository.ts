import { DynamoDB } from "aws-sdk";
import { Appointment } from "../models/Appointment";
import mysql2 from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

export class AppointmentRepository {
  private readonly client: DynamoDB.DocumentClient;
  private readonly tableName: string = process.env.APPOINTMENTS_TABLE || "";

  constructor() {
    this.client = new DynamoDB.DocumentClient();
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: appointment,
    };

    await this.client.put(params).promise();

    const connection = await mysql2.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO Appointments (insuredId, createdAt, scheduledId, countryISO) VALUES (?, ?, ?, ?)",
      [
        appointment.insuredId,
        appointment.createdAt,
        appointment.scheduledId,
        appointment.countryISO,
      ]
    );
    await connection.end();

    return appointment;
  }

  async confirm(insuredId: string, createdAt: string): Promise<Appointment> {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: {
        insuredId: insuredId,
        createdAt: createdAt,
      },
      UpdateExpression: "set #state = :state",
      ExpressionAttributeNames: {
        "#state": "state",
      },
      ExpressionAttributeValues: {
        ":state": "completed",
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await this.client.update(params).promise();

    if (!result.Attributes) {
      throw new Error("No se pudo recuperar el elemento actualizado");
    }

    const appointment = new Appointment(
      result.Attributes.insuredId,
      result.Attributes.createdAt,
      result.Attributes.scheduledId,
      result.Attributes.countryISO
    );

    return appointment;
  }

  async listByInsuredId(insuredId: string): Promise<Appointment[]> {
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: {
        ":insuredId": insuredId,
      },
    };

    const result = await this.client.query(params).promise();

    if (!result.Items) {
      throw new Error("No se encontraron citas para el asegurado");
    }

    return result.Items.map((item) => {
      const appointment = new Appointment(
        item.insuredId,
        item.createdAt,
        item.scheduledId,
        item.countryISO
      );
      appointment.state = item.state;
      return appointment;
    });
  }
}
