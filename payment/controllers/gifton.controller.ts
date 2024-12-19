import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { GiftonPaymentService } from '../services/gifton.service';

@Service()
class GiftonPaymentController {
	public capturePayment = async (req: Request, next: NextFunction) => {
		const captureData: Record<string, string> = { ...req.body };

		try {
			const giftonPaymentService = Container.get(GiftonPaymentService);
			const gifton = await giftonPaymentService.capturePayment(captureData);
			console.log('capture payment', gifton);
			return gifton;
		} catch (error) {
			next(error);
		}
	};
}

export default GiftonPaymentController;
