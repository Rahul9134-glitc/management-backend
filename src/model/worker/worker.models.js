import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    phone: { 
        type: String 
    },
    dailyWage: { 
        type: Number, 
        required: true 
    },
    role: { 
        type: String, 
        default: "Labor" 
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Worker = mongoose.model("Worker", workerSchema);