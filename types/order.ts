type Order = {
    id: string;
    ticketNumber: number;
    displayCode: string;
    createdAt?: string;
    customer?: string;
    table?: string;
}
type Status = `PENDING` | `CONFIRMED` | `COMPLETED` | `PICKED_UP`;