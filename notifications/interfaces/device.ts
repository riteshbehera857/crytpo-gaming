interface IDevice {
	id: string;
	userId: string;
	name: string;
	token: string;
}
interface ITopic {
	allUser: 'allUser';
}

export { IDevice, ITopic };
