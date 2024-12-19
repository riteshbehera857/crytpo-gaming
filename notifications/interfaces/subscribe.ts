
interface ISubscribe {
	subscribe(channel: string, process_event: Function): void;
}

export {ISubscribe};