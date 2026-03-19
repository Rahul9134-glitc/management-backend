import Expense from "../model/expence.models.js";
import Group from "../model/group.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket/socket.js";


export const addExpense = asyncHandler(async (req, res) => {
    const { itemName, amount, groupId } = req.body;

    if (!itemName || !amount || !groupId) {
        throw new ApiError(400, "Bhai, item name aur amount dono chahiye!");
    }

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group nahi mila!");

    const activeMembers = group.members
        .filter((m) => m.status === "active")
        .map((m) => m.user);

    const expense = await Expense.create({
        groupId,
        addedBy: req.user._id,
        itemName,
        amount,
        splitAmong: activeMembers,
        approvals: [req.user._id], 
        status: activeMembers.length === 1 ? "approved" : "pending" 
    });

    const io = getIO();
    io.to(groupId.toString()).emit("newExpense", {
        message: `${req.user.name} ne ${itemName} add kiya hai!`,
        expense
    });

    return res.status(201).json(new ApiResponse(201, expense, "Kharcha add ho gaya, ab doston ke approval ka intezar hai!"));
});

export const approveExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId);
    const group = await Group.findById(expense.groupId);

    if (!expense.approvals.includes(req.user._id)) {
        expense.approvals.push(req.user._id);
    }

    const requiredApprovals = group.members.length - 1;

    if (expense.approvals.length >= requiredApprovals) {
        expense.status = 'approved';
    }

    await expense.save();

    const io = getIO();
    io.to(expense.groupId.toString()).emit("expenseApproved", {
        message: `Expense '${expense.itemName}' ka approval update hua!`,
        expenseId: expense._id,
        status: expense.status
    });
    
    res.status(200).json(new ApiResponse(200, expense, "Approved!"));
});

export const getGroupExpenses = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        throw new ApiError(400, "Group ID zaroori hai bhai!");
    }

    const expenses = await Expense.find({ groupId })
        .populate("addedBy", "name avatar") 
        .populate("approvals", "name")     
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, expenses, "Group ke saare kharche mil gaye!"));
});

