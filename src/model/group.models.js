import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    groupUniqueId: { type: String, required: true, unique: true },
    groupPassword: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["active", "inactive", "pending_inactive"],
          default: "active",
        },
        isRequestingInactive: { type: Boolean, default: false },
        inactiveApprovals: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
      },
    ],
  },
  { timestamps: true },
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
