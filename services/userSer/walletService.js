
const Wallet=require("../../models/wallet");

const getWallet=async(userId)=>{
    try {
        let wallet=await Wallet.findOne({user_id:userId});
        if(!wallet){
            wallet=new Wallet({user_id:userId});
            await wallet.save();
        }
        return wallet;

    } catch (error) {
        throw new Error("Error fetching wallet");

    }
};


const creditWallet = async (userId, amount, description) => {
    try {
        let wallet = await getWallet(userId);
        
        wallet.balance += amount;
        wallet.history.push({
            transaction_id: new mongoose.Types.ObjectId(),
            amount: amount,
            type: "credit",
            description: description,
            date: new Date()
        });
        await wallet.save();
        return wallet;
    } catch (error) {
        throw new Error("Error crediting wallet");
    }
};
// Deduct Money (Payments) - Prepared for future
const debitWallet = async (userId, amount, description) => {
    try {
        let wallet = await getWallet(userId);
        if (wallet.balance < amount) {
            throw new Error("Insufficient balance");
        }
        wallet.balance -= amount;
        wallet.history.push({
            transaction_id: new mongoose.Types.ObjectId(),
            amount: amount,
            type: "debit",
            description: description,
            date: new Date()
        });
        await wallet.save();
        return wallet;
    } catch (error) {
        throw error;
    }
};
module.exports = {
    getWallet,
    creditWallet,
    debitWallet
};