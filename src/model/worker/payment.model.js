import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, default: "Cash Diya" } 
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);