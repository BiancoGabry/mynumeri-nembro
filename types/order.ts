type Order = {
    id: string;
    ticketNumber: number;
    displayCode: string;
}
type Status = `PENDING` | `CONFIRMED` | `COMPLETED` | `PICKED_UP`;