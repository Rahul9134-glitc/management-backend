import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ User Connected:", socket.id);

        socket.on("joinGroup", (groupId) => {
            if (groupId) {
                socket.join(groupId);
                console.log(`👥 User ${socket.id} joined group: ${groupId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log("❌ User Disconnected", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};