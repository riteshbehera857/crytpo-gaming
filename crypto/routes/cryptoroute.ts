import { Router } from "express";
import { Joi, Segments, celebrate } from "celebrate";
import { catchAsync } from "../../common/lib"; // Assuming you have a catchAsync utility
import {
    deposit,
    game,
    getBalance,
    updateBalance,
    withdraw,
} from "../controllers/depositcontroller";

const router = Router();

export default (app: Router) => {
    app.use('/crypto', router);

    /**
     * @openapi
     * /wallet/deposit:
     *   post:
     *     tags:
     *       - Wallet
     *     summary: Deposit funds into a wallet
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               walletAddress:
     *                 type: string
     *                 description: The wallet address to deposit funds to.
     *               amount:
     *                 type: number
     *                 description: The amount to deposit.
     *             required:
     *               - walletAddress
     *               - amount
     *     responses:
     *       200:
     *         description: Funds deposited successfully.
     */
    router.post(
        "/deposit",
        celebrate({
            [Segments.BODY]: Joi.object({
                walletAddress: Joi.string().required(),
                depositAmount: Joi.number().positive().required(),
            }),
        }),
        catchAsync(deposit)
    );

    /**
     * @openapi
     * /wallet/balance/{walletAddress}:
     *   get:
     *     tags:
     *       - Wallet
     *     summary: Get the balance of a wallet
     *     parameters:
     *       - name: walletAddress
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *         description: The wallet address to get the balance for.
     *     responses:
     *       200:
     *         description: Wallet balance retrieved successfully.
     */
    router.get(
        "/balance/:walletAddress",
        celebrate({
            [Segments.PARAMS]: Joi.object({
                walletAddress: Joi.string().required(),
            }),
        }),
        catchAsync(getBalance)
    );

    /**
     * @openapi
     * /wallet/update-balance:
     *   post:
     *     tags:
     *       - Wallet
     *     summary: Update the balance of a wallet
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               walletAddress:
     *                 type: string
     *                 description: The wallet address to update the balance for.
     *               newBalance:
     *                 type: number
     *                 description: The new balance to set.
     *             required:
     *               - walletAddress
     *               - newBalance
     *     responses:
     *       200:
     *         description: Wallet balance updated successfully.
     */
    router.post(
        "/update-balance",
        celebrate({
            [Segments.BODY]: Joi.object({
                walletAddress: Joi.string().required(),
                updatedBetAmount: Joi.number().positive().required(),
                bonusUsed: Joi.number(),
                betAmount: Joi.number()
            }),
        }),
        catchAsync(updateBalance)
    );

    /**
     * @openapi
     * /wallet/withdraw:
     *   post:
     *     tags:
     *       - Wallet
     *     summary: Withdraw funds from a wallet
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               walletAddress:
     *                 type: string
     *                 description: The wallet address to withdraw funds from.
     *               amount:
     *                 type: number
     *                 description: The amount to withdraw.
     *             required:
     *               - walletAddress
     *               - amount
     *     responses:
     *       200:
     *         description: Funds withdrawn successfully.
     */
    router.post(
        "/withdraw",
        celebrate({
            [Segments.BODY]: Joi.object({
                walletAddress: Joi.string().required(),
                withdrawAmount: Joi.number().positive().required(),
            }),
        }),
        catchAsync(withdraw)
    );

    router.post(
        "/game",
        catchAsync(game)
    );
};
