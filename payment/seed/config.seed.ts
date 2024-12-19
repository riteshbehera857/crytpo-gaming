import getLogger from '../../common/logger';
import { Config } from '../models/config.model';

const log = getLogger(module);

async function seedDatabase() {
	try {
		// Check if any records exist
		const existingConfig = await Config.findOne({});
		if (!existingConfig) {
			// Create initial data
			Config.create({
				paymentType: 'round',
				withdrawalType: 'manual',
				priority: [
					{
						name: 'gifton',
						limits: '500',
						maxLimits: '500',
						active: true,
						depositSupported: true,
						withdrawalSupported: false,
						paymentType: ['apiHosted'],
						createdAt: new Date().toISOString().slice(0, -5) + 'Z',
						updatedAt: new Date().toISOString().slice(0, -5) + 'Z',
					},
				],
				depositCommission: 0.1,
				withdrawalCommission: 0.3,
			});
			log.info('Database seeded successfully.');
		} else {
			log.info('Database already seeded, no action needed.');
		}
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

seedDatabase();
