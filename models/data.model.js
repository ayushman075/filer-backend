import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobilePhone: { type: String, required: true },
    pan: { type: String, required: true },
    creditScore: { type: Number, required: true },
    reportSummary: {
      totalAccounts: { type: Number},
      activeAccounts: { type: Number},
      closedAccounts: { type: Number},
      currentBalanceAmount: { type: Number},
      securedAccountsAmount: { type: Number},
      unsecuredAccountsAmount: { type: Number},
      last7DaysCreditEnquiries: { type: Number}
    },
    creditAccounts: [{
      creditCard: { type: String, required: true },
      bank: { type: String, required: true },
      address: { type: String, required: true },
      accountNumber: { type: String, required: true },
      amountOverdue: { type: Number, required: true },
      currentBalance: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
    createdBy: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
  });
  

  export const Data = mongoose.model("Data",dataSchema)