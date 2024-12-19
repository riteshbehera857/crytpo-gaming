import mongoose, { Document, Schema } from 'mongoose';
interface IUserWallet extends Document {
  walletAddress: string;
  depositedBalance: number;
  bonus: number;
  withdrawableBalance: number,
  updatedAt: Date;
}


const userWalletSchema = new Schema<IUserWallet>({
  walletAddress: { type: String, required: true },
  depositedBalance: { type: Number, required: true },
  bonus: { type: Number, default: 100 },
  withdrawableBalance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});


userWalletSchema.pre<IUserWallet>('save', function (next) {  
  this.updatedAt = new Date(); 
  next(); 
});

// Create the model
const UserWallet = mongoose.model<IUserWallet>('UserWallet', userWalletSchema);

export default UserWallet;
