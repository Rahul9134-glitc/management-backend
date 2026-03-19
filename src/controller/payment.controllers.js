import { Payment } from "../model/worker/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Worker } from "../model/worker/worker.models.js";

export const addWorkerPayment = asyncHandler(async (req, res) => {
    const { workerId, amount, description, date } = req.body;

    if (!workerId || !amount) {
        throw new ApiError(400, "Worker Id and amount is required!");
    }

    const worker = await Worker.findOne({ _id: workerId, user: req.user._id });
    if (!worker) {
        throw new ApiError(404, "Worker not found!");
    }

    const payment = await Payment.create({
        worker: workerId,
        user: req.user._id,
        amount,
        description: description || "Advanced Cashed!",
        date: date || Date.now()
    });

    return res.status(201).json(
        new ApiResponse(201, payment, `₹${amount} get an payment record!.`)
    );
});


export const getWorkerPayments = asyncHandler(async (req, res) => {
    const { workerId } = req.params;
    
    const payments = await Payment.find({ worker: workerId }).sort({ date: -1 });
    
    return res.status(200).json(
        new ApiResponse(200, payments, "History that all payment of worker! .")
    );
});