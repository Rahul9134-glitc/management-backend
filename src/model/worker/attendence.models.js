import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }, 
    date: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Present", "Absent", "Half-Day"], 
        default: "Present" 
    },
    earnedAmount: { 
        type: Number, 
        required: true 
    },
    remark: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);