import { Worker } from "../model/worker/worker.models.js";
import { Attendance } from "../model/worker/attendence.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../model/worker/payment.model.js";
import mongoose from "mongoose";

export const markBulkAttendance = asyncHandler(async (req, res) => {
    // 1. Data ko body se nikaalo
    const { attendanceRecords, date } = req.body;

    console.log(req.body)

    // 2. CHECK: Kya attendanceRecords sahi mein array hai?
    // Kabhi-kabhi undefined hone par error deta hai, isliye ye check zaroori hai
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
        throw new ApiError(400, "Attendance data is missing or empty!");
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    // 3. Loop chalao (for...of use karna async/await ke liye best hai)
    for (const item of attendanceRecords) {
        const { workerId, status, remark } = item;

        if (!workerId) continue;

        const worker = await Worker.findById(workerId);
        if (!worker) continue;

        await Attendance.findOneAndDelete({
            worker: workerId,
            date: attendanceDate
        });

        let moneyForToday = 0;
        if (status === "Present") moneyForToday = worker.dailyWage;
        else if (status === "Half-Day") moneyForToday = worker.dailyWage / 2;

        const attendanceEntry = await Attendance.create({
            worker: workerId,
            user: req.user._id, 
            date: attendanceDate,
            status,
            earnedAmount: moneyForToday,
            remark: remark || ""
        });

        results.push(attendanceEntry);
    }

    return res.status(201).json(
        new ApiResponse(201, results, `${results.length} Workers ki attendance mark ho gayi!`)
    );
});


export const getWorkerSummary = asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  const worker = await Worker.findOne({ _id: workerId, user: req.user._id });
  if (!worker) throw new ApiError(404, "Worker not found!");

  const attendanceStats = await Attendance.aggregate([
    {
      $match: {
        worker: new mongoose.Types.ObjectId(workerId),
      },
    },
    {
      $group: {
        _id: "$worker",
        totalEarned: { $sum: "$earnedAmount" }, 
        totalDays: { $sum: 1 }, 
        presentDays: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        halfDays: {
          $sum: { $cond: [{ $eq: ["$status", "Half-Day"] }, 1, 0] },
        },
      },
    },
  ]);

  const paymentStats = await Payment.aggregate([
    {
      $match: {
        worker: new mongoose.Types.ObjectId(workerId),
      },
    },
    {
      $group: {
        _id: "$worker",
        totalPaid: { $sum: "$amount" },
      },
    },
  ]);

  const attendance = attendanceStats[0] || {
    totalEarned: 0,
    totalDays: 0,
    presentDays: 0,
    halfDays: 0,
  };
  const payments = paymentStats[0] || { totalPaid: 0 };

  const remainingBalance = attendance.totalEarned - payments.totalPaid;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        workerDetails: {
          name: worker.name,
          dailyWage: worker.dailyWage,
        },
        summary: {
          totalEarned: attendance.totalEarned,
          totalPaid: payments.totalPaid,
          remainingBalance: remainingBalance,
          stats: {
            totalRecords: attendance.totalDays,
            presentCount: attendance.presentDays,
            halfDayCount: attendance.halfDays,
          },
        },
      },
      "Advanced Summary Fetched!",
    ),
  );
});
