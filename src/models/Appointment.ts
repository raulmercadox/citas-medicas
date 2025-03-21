export class Appointment {
  // Propiedades inmutables (usando readonly)
  readonly insuredId: string;
  readonly createdAt: string;

  // Propiedades del modelo
  private scheduledId: number;
  private countryISO: string;
  public state: string = "pending";

  constructor(
    insuredId: string,
    createdAt: string,
    scheduledId: number,
    countryISO: string
  ) {
    this.insuredId = insuredId;
    this.createdAt = createdAt;
    this.scheduledId = scheduledId;
    this.countryISO = countryISO;
  }
}
