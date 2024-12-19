import { EventTypes, IEvent, SubTypes } from '../interfaces/event.interface';

class Event implements IEvent {
	eventType: EventTypes;
	eventSubType: SubTypes;
	payload: any;

	constructor(EventData: Partial<IEvent>) {
		this.eventType = EventData.eventType;
		this.eventSubType = EventData.eventSubType;
		this.payload = EventData.payload;
	}
}

export { Event };
