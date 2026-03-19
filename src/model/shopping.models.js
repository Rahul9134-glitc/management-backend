import mongoose from "mongoose";

const shoppingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", 
        required: true
    },
    itemName: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    unit: { 
        type: String, 
        default: "pcs" 
    },
    pricePerUnit: { 
        type: Number, 
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

export const Shopping = mongoose.model("Shopping", shoppingSchema);