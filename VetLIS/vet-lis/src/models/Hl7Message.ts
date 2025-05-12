export interface Hl7Message {
    id: number;
    receivedOn: Date;
    messageDate: Date;
    message: string;
    applicationType: number;
    category: number;
    overrides: string | null;
}

export interface MessageDetails {
    message: Hl7Message;
    previous: number;
    next: number;
    totalRecords: number;
    currentRecord: number;
}
