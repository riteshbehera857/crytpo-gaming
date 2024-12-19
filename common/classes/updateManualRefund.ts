import { UpdateDetailsBody } from "../interfaces/payment.service.interface";


class UpdateDetailsBodyClass implements UpdateDetailsBody {
    id: string;
    status: string;
    note: string;

    constructor(data: UpdateDetailsBody) {
        this.id = data.id;
        this.status = data.status;
        this.note = data.note;
    }
}

export { UpdateDetailsBodyClass };
