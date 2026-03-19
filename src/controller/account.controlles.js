import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../model/account.models.js";

export const createAccount = asyncHandler(async (req, res) => {
  const { holderName, purpose, initialAmount } = req.body;

  if (!holderName || !purpose) {
    throw new ApiError(400, "Holdername and Purpose field are required!");
  }

  const account = await Account.create({
    user: req.user._id,
    holderName,
    purpose,
    balance: initialAmount || 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, account, "New Bucket is Created Successfully!"));
});




export const addMoney = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Bhai, sahi amount toh daalo!");
  }

  const account = await Account.findOne({ _id: accountId, user: req.user._id });

  if (!account) {
    throw new ApiError(404, "Account are not found");
  }

  account.balance += Number(amount);
  await account.save();

  return res
    .status(200)
    .json(new ApiResponse(200, account, "Money Add sucessfully!"));
});



export const updateAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const { holderName, purpose, balance } = req.body;

  if (!accountId) {
    throw new ApiError(400, "Account ID is required!");
  }

  const account = await Account.findOne({ _id: accountId, user: req.user._id });

  if (!account) {
    throw new ApiError(404, "Account nahi mila ya aapke paas access nahi hai!");
  }

  if (holderName) account.holderName = holderName;
  if (purpose) account.purpose = purpose;

  if (balance !== undefined) {
    account.balance = balance;
  }

  const updatedAccount = await account.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedAccount, "Account is successfully updated!"),
    );
});

export const getMyAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, accounts, "Fechted all account!"));
});


export const deleteAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  const account = await Account.findOne({ _id: accountId, user: req.user._id });

  if (!account) {
    throw new ApiError(
      404,
      "Account is not found or you don't have access delete this account!",
    );
  }

  if (account.balance > 0) {
    throw new ApiError(
      400,
      `you have ₹${account.balance} . first of all update your balance in your account then delete your account!`,
    );
  }

  await Account.findByIdAndDelete(accountId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account is deleted successfulLy!"));
});
