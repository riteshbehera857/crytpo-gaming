import { TransactionEnum } from '../../common/types/transaction';
import getLogger from '../../common/logger';
import { ResponseCodes } from '../../common/config/responseCodes';
import {
	ITransaction,
	ITransactionDetailsForGames,
} from '../../common/interfaces/transaction.interface';
import { Response } from '../../common/config/response';
import { TransactionDao } from '../daos/transaction.dao';
import { PlayerDao } from '../daos/player.dao';
import { CommonPlayerDao } from '../../common/daos/commonPlayer.dao';
import {
	createBetTransactionSchema,
	createTransactionSchema,
	refundTransactionSchema,
} from '../../common/schemas/transaction.schema';
import { generateResponseCode } from '../../common/lib/generateValidationErrorResponse';
import { IPlayer } from '../../common/interfaces/player.interface';
import { Transaction } from '../../common/classes/transaction.class';
import { EventTypes, SubTypes } from '../../common/interfaces/event.interface';
import { Event } from '../../common/classes/event.class';
import { IMessage } from '../../notifications/interfaces/message';
import { PublisherService } from '../../notifications/services/publisher.service';
import { BonusTransactionService } from '../../bonus/services/bonusTransaction.service';
import Container from 'typedi';
import {
	IBonusTransaction,
	IBonusTransactionDetailsForGames,
} from '../../common/interfaces/bonusTransaction.interface';
import { CurrencyEnum } from '../../common/types/currency';
import { BonusTransactionDao } from '../../bonus/daos/bonusTransaction.dao';
import { Schema } from 'mongoose';

import { BetAmountBucketOrderConfigDao } from '../../core/daos/betAmountBucketOrderConfig.dao';
import { IBetAmountBucketOrder } from '../../common/interfaces/betAmountBucketOrder.interface';

export default class TransactionService {
	private logger = getLogger(module);
	private transactionDao: TransactionDao;
	private playerDao: PlayerDao;
	private commonPlayerDao: CommonPlayerDao;
	private publisherService: PublisherService;
	private bonusTransactionService: BonusTransactionService;
	private bonusTransactionDao: BonusTransactionDao;
	// private betAmountBucketOrder: IBetAmountBucketOrder;

	constructor() {
		this.transactionDao = new TransactionDao();
		this.playerDao = new PlayerDao();
		this.commonPlayerDao = new CommonPlayerDao();
		this.publisherService = new PublisherService();
		this.bonusTransactionService = Container.get(BonusTransactionService);
		this.bonusTransactionDao = new BonusTransactionDao();
	}

	// function to create a transaction
	public async createTransaction(
		transaction: Partial<ITransaction<ITransactionDetailsForGames>>,
		id: any,
	): Promise<Response> {
		const { error, value } = createTransactionSchema.validate(transaction);

		// if (error) {
		// 	const responseCode = generateResponseCode(error);
		// 	// console.log({ responseCode: responseCode });
		// 	if (responseCode) {
		// 		if ('message' in responseCode && 'code' in responseCode) {
		// 			// Return a response with the generated response code
		// 			return new Response(responseCode.code, responseCode.message);
		// 		}
		// 	}
		// }

		const player = await this.commonPlayerDao.getPlayerById(id);

		if (
			transaction.transactionType === TransactionEnum.WITHDRAW &&
			player?.balance.withdrawalBalance < transaction.amount
		) {
			return new Response(
				ResponseCodes.INSUFFICIENT_BALANCE_TRANSACTION_FAILED.code,
				ResponseCodes.INSUFFICIENT_BALANCE_TRANSACTION_FAILED.message,
			);
		}

		// update player current balance while deposit

		if (transaction.transactionType === TransactionEnum.DEPOSIT) {
			await this.playerDao.updatePlayerBalance(
				player,
				transaction,
				'depositBalance',
			);
		} else if (transaction.transactionType === TransactionEnum.WITHDRAW) {
			// update player current balance while withdraw
			if (player?.balance.withdrawalBalance >= transaction.amount) {
				await this.playerDao.updatePlayerWithdrawalBalance(
					player,
					transaction,
				);
			} else {
				// Handle insufficient balance error

				return new Response(
					ResponseCodes.INSUFFICIENT_BALANCE_TRANSACTION_FAILED.code,
					ResponseCodes.INSUFFICIENT_BALANCE_TRANSACTION_FAILED.message,
				);
				// You can throw an error or handle it in any other appropriate way
			}
		} else {
			// Handle other transaction types here
			return new Response(
				ResponseCodes.TRANSACTION_TYPE_FAILED.code,
				ResponseCodes.TRANSACTION_TYPE_FAILED.message,
			);
		}

		const transactionExits =
			this.transactionDao.getTransactionByTransactionUuid(
				transaction.details.transactionUuid,
			);

		if (transactionExits) {
			return new Response(
				ResponseCodes.WALLET_UPDATED_SUCCESSFULLY.code,
				ResponseCodes.WALLET_UPDATED_SUCCESSFULLY.message,
			);
		}

		value.player = id;

		const newTransaction = await this.transactionDao.createTransaction(value);
		const newPlayer = await this.commonPlayerDao.getPlayerById(id);

		// const depositEvent: IMessage = {
		// 	type: EventTypes.WALLET,
		// 	subType: SubTypes.DEPOSIT,
		// <<<<<<< Feature/CNC-315
		// 	userId: player._id,
		// =======
		// 	ts: Date.now(),
		// 	userId: player._id as unknown as string,
		// >>>>>>> Release/2.2
		// 	payload: {
		// 		playerId: player._id,
		// 		amount: value.amount,
		// 		currency: value.currency,
		// 		transactionUuid: value.transactionUuid,
		// 		date: new Date(),
		// 	},
		// };

		// await this.publisherService.publishMessage(depositEvent, 'notification');

		// return response for transaction
		return new Response(
			ResponseCodes.RS_OK.code,
			ResponseCodes.RS_OK.message,
			{ newTransaction, newPlayer },
		);
	}

	/**
	 * Creates a new transaction in the database after a bet is placed.
	 * @param transaction The transaction data to create a new transaction with.
	 * @param currentPlayer The currently logged in player.
	 * @returns A response object with the newly created transaction and the updated player.
	 */
	public async createBetTransaction(
		transaction: Partial<ITransaction>,
		currentPlayer: IPlayer,
	): Promise<Response> {
		const { error, value } = createBetTransactionSchema.validate(transaction);

		if (error) {
			const responseCode = generateResponseCode(error);
			if (
				responseCode &&
				'message' in responseCode &&
				'code' in responseCode
			) {
				return new Response(responseCode.code, responseCode.message);
			}
		}

		// Fetch player once
		const player = await this.commonPlayerDao.getPlayerById(
			currentPlayer._id,
		);
		if (!player) {
			return new Response(
				ResponseCodes.PLAYER_NOT_FOUND.code,
				ResponseCodes.PLAYER_NOT_FOUND.message,
			);
		}

		const betTimestamp = Date.now();

		// Calculate balance variables
		const playerCurrentBalance = player.currentBalance;

		const playerDepositBalance = player.balance.depositBalance;

		const playerWithdrawalBalance = player.balance.withdrawalBalance;

		const playerUnlockedBonusBalance = player.balance.bonusBalance.unlocked;

		const openingBalance = playerCurrentBalance;
		const closingBalance = openingBalance - value.amount;

		this.logger.silly(
			'------------------------------------------------------',
		);
		this.logger.info(
			`Balance: ${playerCurrentBalance}, ${playerWithdrawalBalance}, ${playerUnlockedBonusBalance}, ${playerDepositBalance}`,
		);
		this.logger.silly(
			'------------------------------------------------------',
		);

		if (playerCurrentBalance < value.amount) {
			return new Response(
				ResponseCodes.RS_ERROR_NOT_ENOUGH_MONEY.code,
				ResponseCodes.RS_ERROR_NOT_ENOUGH_MONEY.message,
			);
		}

		this.logger.info(
			`Opening Balance: ${openingBalance} and Closing Balance: ${closingBalance}`,
		);

		// Check for existing transaction
		const existingBetTransaction = await this.getExistingTransaction(
			player._id as unknown as string,
			value,
			openingBalance,
			closingBalance,
		);

		if (existingBetTransaction) {
			return new Response(
				ResponseCodes.RS_OK.code,
				ResponseCodes.RS_OK.message,
				{ player, existingBetTransaction },
			);
		}

		// if (playerDepositBalance == 0 && playerUnlockedBonusBalance == 0) {
		// 	const betTransaction = await this.createTransactionAfterBet(
		// 		player._id as unknown as string,
		// 		value,
		// 		openingBalance,
		// 		closingBalance,
		// 	);

		// 	await this.playerDao.updatePlayerDepositORWithdrawalBalanceAfterBet(
		// 		player,
		// 		value.amount,
		// 		'withdrawalBalance',
		// 	);
		// 	return this.finalizeBetTransaction(player, betTransaction, value);
		// }

		// Handle bet logic based on balance types
		// if (value.amount <= playerDepositBalance) {
		// 	// Create normal bet transaction
		// 	const betTransaction = await this.createTransactionAfterBet(
		// 		player._id as unknown as string,
		// 		value,
		// 		openingBalance,
		// 		closingBalance,
		// 	);

		// 	await this.playerDao.updatePlayerDepositORWithdrawalBalanceAfterBet(
		// 		player,
		// 		value.amount,
		// 		'depositBalance',
		// 	);
		// 	return this.finalizeBetTransaction(player, betTransaction, value);
		// } else if (value.amount <= playerCurrentBalance) {
		// Handle mix of deposit and bonus balance
		const betTransaction = await this.handleMixedBalanceBet(
			player,
			value,
			playerDepositBalance,
			playerWithdrawalBalance,
			playerUnlockedBonusBalance,
			openingBalance,
			closingBalance,
		);

		return this.finalizeBetTransaction(
			player,
			betTransaction,
			value,
			Date.now(),
		);
		// }
		// else if (
		// 	playerDepositBalance == 0 &&
		// 	value.amount <= playerUnlockedBonusBalance
		// ) {
		// 	// Handle fully bonus balance bet
		// 	const betTransaction = await this.handleBonusBalanceBet(
		// 		player,
		// 		value,
		// 		playerUnlockedBonusBalance,
		// 		openingBalance,
		// 		closingBalance,
		// 	);

		// 	return this.finalizeBetTransaction(player, betTransaction, value);
		// }
	}

	/**
	 * This function creates a new win transaction for a given player.
	 * It first validates the transaction object. If the transaction is invalid, it returns a response with the appropriate error code.
	 * If the transaction is valid, it fetches the player object from the database and checks if the player exists.
	 * If the player does not exist, it returns a response with the appropriate error code.
	 * If the player exists, it checks if a bet with the given round id exists. If the bet does not exist, it returns a response with the appropriate error code.
	 * If the bet exists, it creates a new win transaction and updates the player's current balance.
	 * Finally, it returns a response with the newly created transaction and the updated player object.
	 * @param transaction the transaction object to be validated and created
	 * @param currentPlayer the player object to be updated
	 * @returns a response object with the newly created transaction and the updated player object
	 */
	public async createWinTransaction(
		transaction: ITransaction,
		currentPlayer: IPlayer,
	): Promise<Response> {
		const { error, value } = createBetTransactionSchema.validate(transaction);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		const player = await this.commonPlayerDao.getPlayerById(
			currentPlayer._id,
		);

		if (!player) {
			return new Response(
				ResponseCodes.PLAYER_NOT_FOUND.code,
				ResponseCodes.PLAYER_NOT_FOUND.message,
			);
		}

		// const betCorrespondingToRoundId =
		// 	await this.transactionDao.getTransactionByRoundId(value.round);

		// if (!betCorrespondingToRoundId) {
		// 	this.logger.error(`Could not find bet with round ${value.round}`);
		// 	return new Response(
		// 		ResponseCodes.RS_ERROR_BET_DOES_NOT_EXIST.code,
		// 		ResponseCodes.RS_ERROR_BET_DOES_NOT_EXIST.message,
		// 	);
		// }

		const openingBalance = player.currentBalance;
		const closingBalance = openingBalance + value.amount;

		this.logger.info(
			`Opening Balance: ${openingBalance} and Closing Balance: ${closingBalance}`,
		);

		const transactionDetails: Partial<
			ITransaction<ITransactionDetailsForGames>
		> = {
			player: player._id,
			transactionType: TransactionEnum.WIN,
			openingBalance: openingBalance,
			closingBalance: closingBalance,
			details: {
				transactionUuid: value.transactionUuid,
				round: value.round,
				requestUuid: value.requestUuid,
				gameCode: value.gameCode,
				betId: value.betId,
			},
			isTransactionSuccess: true,
			amount: value.amount,
			currency: value.currency,
		};

		console.log('bet id', value.betId);

		const checkPreviousBet = await this.transactionDao.getTransactionByBetId(
			value.betId,
		);

		const ifBonusTransactionExists =
			await this.bonusTransactionDao.getBonusTransactionByBetId(value.betId);

		if (
			(!checkPreviousBet ||
				checkPreviousBet?.transactionType != TransactionEnum.BET) &&
			!ifBonusTransactionExists
		) {
			return new Response(
				ResponseCodes.RS_ERROR_BET_DOES_NOT_EXIST.code,
				ResponseCodes.RS_ERROR_BET_DOES_NOT_EXIST.message,
			);
		}

		const previousTransaction =
			await this.transactionDao.getTransaction(transactionDetails);

		if (previousTransaction) {
			return new Response(
				ResponseCodes.RS_OK.code,
				ResponseCodes.RS_OK.message,
				{ player, previousTransaction },
			);
		}

		value.player = player._id;

		const newTransaction =
			await this.transactionDao.createWalletTransaction(transactionDetails);

		await this.playerDao.updatePlayerWithdrawalBalanceAfterWin(player, value);

		const playerResponse = await this.commonPlayerDao.getPlayerById(
			currentPlayer._id,
		);

		const winEvent: IMessage = {
			type: EventTypes.WALLET,
			subType: SubTypes.WIN,
			ts: Date.now(),
			userId: playerResponse._id as unknown as string,
			payload: {
				name: playerResponse.name,
				phoneNumber: playerResponse.phoneNumber,
				playerId: playerResponse._id,
				amount: value.amount,
				currency: value.currency,
				currentBalance: playerResponse?.currentBalance.toString(),
				transactionUuid: value.transactionUuid,
				date: new Date(),
			},
		};

		if (value.amount > 0) {
			console.log('event is loss');
			await this.publisherService.publishMessage(winEvent, 'notification');
		}

		return new Response(
			ResponseCodes.RS_OK.code,
			ResponseCodes.RS_OK.message,
			{ playerResponse, newTransaction },
		);
	}

	public async createRefundTransaction(
		transaction: ITransaction,
		currentPlayer: IPlayer,
	): Promise<Response> {
		const { error, value } = refundTransactionSchema.validate(transaction);
		if (error) {
			const responseCode = generateResponseCode(error);
			if (responseCode) {
				if ('message' in responseCode && 'code' in responseCode) {
					// Return a response with the generated response code
					return new Response(responseCode.code, responseCode.message);
				}
			}
		}

		const player = await this.commonPlayerDao.getPlayerById(
			currentPlayer._id,
		);

		const openingBalance = player.currentBalance;
		const closingBalance = openingBalance + value.amount;

		const transactionDetails: Partial<
			ITransaction<ITransactionDetailsForGames>
		> = {
			player: player._id,
			transactionType: TransactionEnum.REFUND,
			openingBalance: openingBalance,
			closingBalance: closingBalance,
			details: {
				transactionUuid: value.transactionUuid,
				round: value.round,
				requestUuid: value.requestUuid,
				gameCode: value.gameCode,
			},
			isTransactionSuccess: true,
			amount: value.amount,
			currency: value.currency,
		};

		const previousTransaction =
			await this.transactionDao.getTransaction(transactionDetails);

		if (previousTransaction) {
			return new Response(
				ResponseCodes.RS_OK.code,
				ResponseCodes.RS_OK.message,
				{ player, previousTransaction },
			);
		}
		if (!player) {
			return new Response(
				ResponseCodes.PLAYER_NOT_FOUND.code,
				ResponseCodes.PLAYER_NOT_FOUND.message,
			);
		}
		await this.playerDao.updatePlayerBalance(
			player,
			value,
			'withdrawalBalance',
		);
		value.player = player._id;

		const newTransaction =
			await this.transactionDao.createWalletTransaction(transactionDetails);
		const playerResponse = await this.commonPlayerDao.getPlayerById(
			currentPlayer._id,
		);

		return new Response(
			ResponseCodes.RS_OK.code,
			ResponseCodes.RS_OK.message,
			{ playerResponse, newTransaction },
		);
	}

	private async getExistingTransaction(
		playerId: string,
		value: Record<string, any>,
		openingBalance?: number,
		closingBalance?: number,
	) {
		const transactionDetails = this.createBetTransactionDetails(
			playerId,
			value,
			openingBalance,
			closingBalance,
		);
		return await this.transactionDao.getTransaction(transactionDetails);
	}

	private createBetTransactionDetails(
		playerId: string,
		value: Record<string, any>,
		openingBalance?: number,
		closingBalance?: number,
	): Partial<ITransaction<ITransactionDetailsForGames>> {
		return {
			player: playerId as unknown as Schema.Types.ObjectId,
			transactionType: TransactionEnum.BET,
			openingBalance: openingBalance,
			closingBalance: closingBalance,
			details: {
				transactionUuid: value.transactionUuid,
				round: value.round,
				requestUuid: value.requestUuid,
				gameCode: value.gameCode,
				betId: value.betId,
			},
			isTransactionSuccess: true,
			amount: value.amount,
			currency: value.currency,
		};
	}

	private async createTransactionAfterBet(
		playerId: string,
		value: Record<string, any>,
		openingBalance: number,
		closingBalance: number,
	) {
		const transactionDetails = this.createBetTransactionDetails(
			playerId,
			value,
			openingBalance,
			closingBalance,
		);
		return await this.transactionDao.createWalletTransaction(
			transactionDetails,
		);
	}

	private async handleMixedBalanceBet(
		player: IPlayer,
		value: Record<string, any>,
		playerDepositBalance: number,
		playerWithdrawalBalance: number,
		playerUnlockedBonusBalance: number,
		openingBalance: number,
		closingBalance: number,
	) {
		let remainingAmount = value.amount;
		let newBetTransaction: ITransaction<ITransactionDetailsForGames> | null =
			null;

		const betAmountBucketOrderConfigDao = new BetAmountBucketOrderConfigDao();

		await betAmountBucketOrderConfigDao.getBetAmountBucketOrder();

		const { priority1, priority2, priority3 } =
			betAmountBucketOrderConfigDao.betAmountBucketOrder;

		this.logger.silly('---------------------------------------------');
		// this.logger.silly(`Priorities ${JSON.stringify(betAmountBucketOrder)}`);
		this.logger.silly('---------------------------------------------');

		this.logger.silly('---------------------------------------------');
		this.logger.silly(
			`Priorities ${JSON.stringify(
				Object.values({
					priority1,
					priority2,
					priority3,
				}),
			)}`,
		);

		this.logger.silly('---------------------------------------------');

		for (const priority of Object.values({
			priority1,
			priority2,
			priority3,
		})) {
			if (remainingAmount <= 0) break;

			this.logger.silly(
				'---------------------------------------------------------',
			);
			this.logger.silly(`Priority ${priority}`);
			this.logger.silly(
				'---------------------------------------------------------',
			);

			if (priority === 'depositBalance' && playerDepositBalance > 0) {
				const depositDebitAmount = Math.min(
					playerDepositBalance,
					remainingAmount,
				);

				this.logger.info(`Deposit debit amount ${depositDebitAmount}`);

				remainingAmount -= depositDebitAmount;

				this.logger.info(`Remaining amount ${remainingAmount}`);

				this.logger.info(`Player deposit balance ${playerDepositBalance}`);

				newBetTransaction = await this.createTransactionAfterBet(
					player._id as unknown as string,
					value,
					openingBalance,
					closingBalance,
				);

				await this.playerDao.updatePlayerDepositORWithdrawalBalanceAfterBet(
					player,
					depositDebitAmount,
					'depositBalance',
				);
			} else if (
				priority === 'withdrawalBalance' &&
				playerWithdrawalBalance > 0
			) {
				this.logger.silly(
					'Inside withdrawal balance priority ***************************',
				);

				const withdrawalDebitAmount = Math.min(
					playerWithdrawalBalance,
					remainingAmount,
				);

				remainingAmount -= withdrawalDebitAmount;

				const remainingWithdrawalBalance = (playerWithdrawalBalance -=
					withdrawalDebitAmount);

				await this.playerDao.updatePlayerDepositORWithdrawalBalanceAfterBet(
					player,
					withdrawalDebitAmount,
					'withdrawalBalance',
				);

				newBetTransaction = await this.createTransactionAfterBet(
					player._id as unknown as string,
					value,
					openingBalance,
					closingBalance,
				);
			} else if (
				priority === 'bonusBalance.unlocked' &&
				playerUnlockedBonusBalance > 0
			) {
				this.logger.info(
					`Bonus debit amount ${playerUnlockedBonusBalance}`,
				);

				const bonusDebitAmount = Math.min(
					playerUnlockedBonusBalance,
					remainingAmount,
				);

				remainingAmount -= bonusDebitAmount;

				this.logger.info(
					`Remaining bonus debit amount ${
						playerUnlockedBonusBalance - bonusDebitAmount
					}`,
				);

				newBetTransaction = await this.createTransactionAfterBet(
					player._id as unknown as string,
					value,
					openingBalance,
					closingBalance,
				);

				await this.bonusTransactionService.createBonusTransaction({
					player: player._id,
					amount: bonusDebitAmount,
					openingBalance: playerUnlockedBonusBalance,
					closingBalance: playerUnlockedBonusBalance - bonusDebitAmount,
					currency: CurrencyEnum.INR,
					transactionType: TransactionEnum.BET,
					isTransactionSuccess: true,
					details: {
						transactionUuid: value.transactionUuid,
						round: value.round,
						requestUuid: value.requestUuid,
						gameCode: value.gameCode,
						betId: value.betId,
					},
				});

				await this.commonPlayerDao.updateUserBalanceAfterBetTransaction(
					player._id,
					bonusDebitAmount,
					'unlocked',
				);
			}
		}

		return newBetTransaction;
	}

	private async handleBonusBalanceBet(
		player: IPlayer,
		value: Record<string, any>,
		playerUnlockedBonusBalance: number,
		openingBalance: number,
		closingBalance: number,
	) {
		const betTransaction = await this.createTransactionAfterBet(
			player._id as unknown as string,
			value,
			openingBalance,
			closingBalance,
		);

		await this.bonusTransactionService.createBonusTransaction({
			player: player._id,
			amount: value.amount,
			openingBalance: playerUnlockedBonusBalance,
			closingBalance: playerUnlockedBonusBalance - value.amount,
			currency: CurrencyEnum.INR,
			transactionType: TransactionEnum.BET,
			isTransactionSuccess: true,
			details: {
				transactionUuid: value.transactionUuid,
				round: value.round,
				requestUuid: value.requestUuid,
				gameCode: value.gameCode,
				betId: value.betId,
			},
		});
		await this.commonPlayerDao.updateUserBalanceAfterBetTransaction(
			player._id,
			playerUnlockedBonusBalance,
			'unlocked',
		);

		return betTransaction;
	}

	private async finalizeBetTransaction(
		player: IPlayer,
		betTransaction: ITransaction,
		value: Record<string, any>,
		timestamp: number,
	) {
		const playerResponse = await this.commonPlayerDao.getPlayerById(
			player._id,
		);

		const betMessage: IMessage = {
			type: EventTypes.WAGER,
			subType: SubTypes.BET,
			ts: timestamp,
			userId: playerResponse._id as unknown as string,
			payload: {
				playerId: playerResponse._id,
				amount: value.amount,
				date: new Date(),
			},
		};
		await this.publisherService.publishMessage(betMessage, 'notification');

		return new Response(
			ResponseCodes.RS_OK.code,
			ResponseCodes.RS_OK.message,
			{ playerResponse, betTransaction },
		);
	}
}
