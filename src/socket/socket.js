import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "https://management-system-wine-eight.vercel.app",
                "https://management-system-rahul-vishwakarmas-projects-456a19b1.vercel.app",
                "https://management-system-9uyz8uxd7.vercel.app",
                "http://localhost:5173" 
            ],
            credentials: true,
            methods: ["GET", "POST"]
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