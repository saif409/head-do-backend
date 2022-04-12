const mongoose  = require("mongoose");


const transactionSchema = new mongoose.Schema({
    

        TransactionType: String,
      
        PymtMethod: String,
      
        ServiceID: String,
      
        PaymentID: String,
      
        OrderNumber: String,
      
        Amount: Number,
      
        CurrencyCode: String,
      
        HashValue: String,
      
        HashValue2: String,
      
        TxnID: String,
      
        IssuingBank: String,
      
        TxnStatus: Number,
      
        TxnMessage: String,
      
        AuthCode: String,
      
        BankRefNo: String,
      
        TokenType: String,
      
        Token: String,
      
        RespTime: String,
      
        CardNoMask: String,
      
        CardHolder: String,
      
        CardType: String,
      
        CardExp: String,
        
        headdoServiceCharge: Number,
        headdoServiceChargePercentage: Number,
        totalPrice: Number,
        fullPaid: Boolean,
        refunded: {
                type: Boolean,
                default: false
        }
},
{
        timestamps: true 
}
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {Transaction};