import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Shopping } from "../model/shopping.models.js";
import { Account } from "../model/account.models.js";

export const createShoppingEntry = asyncHandler(async (req, res) => {
    const { accountId, itemName, quantity, pricePerUnit, unit } = req.body;

    if (!accountId || !itemName || !quantity || !pricePerUnit) {
        throw new ApiError(400, "Account Id and Item Name is Required!");
    }

    const totalAmount = quantity * pricePerUnit;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });

    if (!account) {
        throw new ApiError(404, "Account is not found!");
    }

    if (account.balance < totalAmount) {
        throw new ApiError(400, `Balance is low: ₹${totalAmount}, Available: ₹${account.balance}`);
    }
    
    account.balance -= totalAmount;
    await account.save();

    const shopping = await Shopping.create({
        user: req.user._id,
        accountId,
        itemName,
        quantity,
        unit,
        pricePerUnit,
        totalAmount
    });

    return res.status(201).json(
        new ApiResponse(201, { shopping, remainingBalance: account.balance }, "Your shopping is SucessFully done!")
    );
});


export const getAccountShoppingHistory = asyncHandler(async (req, res) => {
    const { accountId } = req.params;

    const history = await Shopping.find({ accountId, user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, history, "All history fetch this account!")
    );
});

export const deleteShoppingEntry = asyncHandler(async (req, res) => {
    const { shoppingId } = req.params;

    const shopping = await Shopping.findOne({ _id: shoppingId, user: req.user._id });

    if (!shopping) {
        throw new ApiError(404, "Shopping entry is not found!");
    }

    const account = await Account.findById(shopping.accountId);

    if (account) {
        account.balance += shopping.totalAmount;
        await account.save();
    }

    await Shopping.findByIdAndDelete(shoppingId);

    return res.status(200).json(
        new ApiResponse(200, { refundAmount: shopping.totalAmount }, "Shopping entry deleted sucessfully! Your amount is refunded sucessfully")
    );
});



export const updateShoppingEntry = asyncHandler(async (req, res) => {
    const { shoppingId } = req.params;
    const { itemName, quantity, pricePerUnit, unit } = req.body;

    const shopping = await Shopping.findOne({ _id: shoppingId, user: req.user._id });
    if (!shopping) throw new ApiError(404, "Shopping entry not found!");

    const account = await Account.findById(shopping.accountId);
    if (!account) throw new ApiError(404, "This account is not found!");

    const oldTotal = shopping.totalAmount;
    const newTotal = (quantity || shopping.quantity) * (pricePerUnit || shopping.pricePerUnit);

    const difference = newTotal - oldTotal;

    if (difference > 0 && account.balance < difference) {
        throw new ApiError(400, "Your account balance is too low Please shopping another account!");
    }

    account.balance -= difference;
    await account.save();

    shopping.itemName = itemName || shopping.itemName;
    shopping.quantity = quantity || shopping.quantity;
    shopping.pricePerUnit = pricePerUnit || shopping.pricePerUnit;
    shopping.unit = unit || shopping.unit;
    shopping.totalAmount = newTotal;

    const updatedShopping = await shopping.save();

    return res.status(200).json(
        new ApiResponse(200, updatedShopping, "Shopping and your money adjust successfully!")
    );
});