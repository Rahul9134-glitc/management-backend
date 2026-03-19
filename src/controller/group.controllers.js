import Group from "../model/group.models.js";
import User from "../model/auth.models.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket/socket.js";

export const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupUniqueId, groupPassword } = req.body;


    if ([groupName, groupUniqueId, groupPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All feild are required!");
    }

    const existedGroup = await Group.findOne({ groupUniqueId });
    if (existedGroup) {
        throw new ApiError(409, "This Id already exist please think new Id for your group!");
    }

    const group = await Group.create({
        groupName,
        groupUniqueId,
        groupPassword, 
        admin: req.user._id,
        members: [{ user: req.user._id, status: "active" }]
    });

    await User.findByIdAndUpdate(req.user._id, {
        currentGroup: group._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, group, "Your Group created Sucessfully!"));
});

export const joinGroup = asyncHandler(async (req, res) => {
    const { groupUniqueId, groupPassword } = req.body;

    if (!groupUniqueId || !groupPassword) {
        throw new ApiError(400, "ID and Password are required for join group!");
    }

    const group = await Group.findOne({ groupUniqueId });

    if (!group) {
        throw new ApiError(404, "Group is not found!");
    }

    if (group.groupPassword !== groupPassword) {
        throw new ApiError(401, "Password is Wrong Please Try Again!");
    }

    const isAlreadyMember = group.members.some(
        (member) => member.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
        throw new ApiError(400, "You are already member of this group!");
    }

    group.members.push({ user: req.user._id, status: "active" });
    await group.save();

    await User.findByIdAndUpdate(req.user._id, {
        currentGroup: group._id
    });

    const io = getIO();
    io.to(group._id.toString()).emit("memberJoined", {
        message: `${req.user.name} ne group join kar liya hai!`,
        member: { user: req.user._id, status: "active" }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, group, "Congrats You are join group Sucessfully!"));
});


export const getGroupDetails = asyncHandler(async (req, res) => {
    const groupId = req.user.currentGroup;

    if (!groupId) {
        throw new ApiError(400, "Bhai, tum kisi group mein join nahi ho!");
    }

    const group = await Group.findById(groupId).populate({
        path: "members.user", 
        select: "name email avatar",
        model: "User"
    });

    if (!group) {
        throw new ApiError(404, "Group nahi mila!");
    }

    return res.status(200).json(
        new ApiResponse(200, group, "Group details mil gayi!")
    );
});

export const toggleMemberStatus = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.user.currentGroup);
    
    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    
    member.status = member.status === 'active' ? 'inactive' : 'active';
    
    await group.save();
    res.status(200).json(new ApiResponse(200, group, "Status updated!"));
});

export const requestInactiveStatus = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.user.currentGroup);
    if (!group) throw new ApiError(404, "Group nahi mila!");

    const userId = req.user._id;
    const member = group.members.find(m => m.user.toString() === userId.toString());
    
    if (member.status === 'active') {
        member.isRequestingInactive = !member.isRequestingInactive;
        member.inactiveApprovals = []; // NAAM CHANGE KIYA: inactiveApprovals
    } else {
        member.status = 'active';
        member.isRequestingInactive = false;
        member.inactiveApprovals = []; // NAAM CHANGE KIYA
    }

    await group.save();

    const updatedGroup = await Group.findById(group._id).populate({
        path: "members.user",
        select: "name email avatar"
    });

    const io = getIO();
    io.to(group._id.toString()).emit("groupUpdate", {
        type: "STATUS_REQUEST",
        updatedGroup
    });

    res.status(200).json(new ApiResponse(200, updatedGroup, "Request updated!"));
});


export const approveInactiveRequest = asyncHandler(async (req, res) => {
    const { targetUserId } = req.params; 
    const group = await Group.findById(req.user.currentGroup);
    if (!group) throw new ApiError(404, "Group nahi mila!");

    const memberToUpdate = group.members.find(m => m.user.toString() === targetUserId);
    if (!memberToUpdate) throw new ApiError(404, "Member nahi mila!");

    // NAAM CHANGE KIYA: inactiveApprovals
    if (!memberToUpdate.inactiveApprovals.includes(req.user._id)) {
        memberToUpdate.inactiveApprovals.push(req.user._id);
    }

    const otherActiveMembers = group.members.filter(
        m => m.status === 'active' && m.user.toString() !== targetUserId
    );

    if (memberToUpdate.inactiveApprovals.length >= otherActiveMembers.length) {
        memberToUpdate.status = 'inactive';
        memberToUpdate.isRequestingInactive = false;
    }

    await group.save();

    const updatedGroup = await Group.findById(group._id).populate({
        path: "members.user",
        select: "name email avatar"
    });

    const io = getIO();
    io.to(group._id.toString()).emit("groupUpdate", {
        type: "APPROVE_UPDATE",
        updatedGroup
    });

    res.status(200).json(new ApiResponse(200, updatedGroup, "Approved successfully!"));
});