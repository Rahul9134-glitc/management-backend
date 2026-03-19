import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    holderName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    purpose: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

export const Account = mongoose.model("Account", accountSchema);

