import { Worker } from "../model/worker/worker.models.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose";

export const addWorker = asyncHandler(async (req, res) => {
    const { name, phone, dailyWage, role } = req.body;

    if (!name || !dailyWage) {
        throw new ApiError(400, "Name and Salary is required!");
    }

    const worker = await Worker.create({
        user: req.user._id, 
        name,
        phone,
        dailyWage,
        role
    });

    return res.status(201).json(
        new ApiResponse(201, worker, "Worker Regsitered Sucessfully!")
    );
});


export const getWorkersByRole = asyncHandler(async (req, res) => {
    const { role, search } = req.query;
    let userId;
    try {
        userId = new mongoose.Types.ObjectId(req.user._id);
    } catch (err) {
        throw new ApiError(400, "Invalid User ID format");
    }

    // Default query
    let matchQuery = { user: userId };

    // --- SMART FILTER LOGIC START ---
    if (role === "Inactive") {
        // Agar role "Inactive" hai, toh sirf inactive workers dikhao
        matchQuery.isActive = false;
    } else {
        // Baaki saare cases (All, Labour, Rajmistri) mein sirf ACTIVE workers dikhao
        matchQuery.isActive = true;

        // Agar specific role hai (lekin "All" nahi), toh wo bhi add karo
        if (role && role !== "All" && role.trim() !== "") {
            matchQuery.role = role;
        }
    }
    // --- SMART FILTER LOGIC END ---

    // 2. Search Filter (Name or Phone)
    if (search && search.trim() !== "") {
        matchQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    const workers = await Worker.aggregate([
        { $match: matchQuery },
        {
            $lookup: {
                from: "attendances",
                localField: "_id",
                foreignField: "worker",
                as: "attendanceData"
            }
        },
        {
            $lookup: {
                from: "payments",
                localField: "_id",
                foreignField: "worker",
                as: "paymentData"
            }
        },
        {
            $addFields: {
                totalEarned: { $sum: "$attendanceData.earnedAmount" },
                advance: { $sum: "$paymentData.amount" }
            }
        },
        { $project: { attendanceData: 0, paymentData: 0 } },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, workers, "Workers fetched successfully.")
    );
});

export const updateWorker = asyncHandler(async (req, res) => {
    const { workerId } = req.params;
    const { name, phone, dailyWage, role, status } = req.body;

    const worker = await Worker.findOne({ _id: workerId, user: req.user._id });

    if (!worker) {
        throw new ApiError(404, "Worker is not found or You have not access of this worker!");
    }

    if (name) worker.name = name;
    if (phone) worker.phone = phone;
    if (dailyWage) worker.dailyWage = dailyWage;
    if (role) worker.role = role;
    
    if (status) {
        worker.isActive = (status === 'Active');
    }

    await worker.save();

    return res.status(200).json(
        new ApiResponse(200, worker, "Worker updated Successfully!")
    );
});

export const deleteWorker = asyncHandler(async (req, res) => {
    const { workerId } = req.params;

    const worker = await Worker.findOne({ _id: workerId, user: req.user._id });

    if (!worker) {
        throw new ApiError(404, "Worker not found!");
    }

    worker.isActive = false;
    await worker.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Worker is inactive Successfully.")
    );
});

export const getWorkerFullDetails = asyncHandler(async (req, res) => {
    const { workerId } = req.params;
    const id = new mongoose.Types.ObjectId(workerId);

    const workerDetails = await Worker.aggregate([
        { $match: { _id: id } },
        {
            $lookup: {
                from: "attendances",
                localField: "_id",
                foreignField: "worker",
                as: "attendanceHistory"
            }
        },
        {
            $lookup: {
                from: "payments",
                localField: "_id",
                foreignField: "worker",
                as: "paymentHistory"
            }
        },
        {
            $addFields: {
                totalEarned: { $sum: "$attendanceHistory.earnedAmount" },
                totalAdvance: { $sum: "$paymentHistory.amount" }
            }
        }
    ]);

    if (!workerDetails.length) {
        throw new ApiError(404, "Worker nahi mila!");
    }

    return res.status(200).json(
        new ApiResponse(200, workerDetails[0], "Worker full history fetched.")
    );
});