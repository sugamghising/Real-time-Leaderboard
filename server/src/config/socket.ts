import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwt";

export function initSocket(server: HTTPServer) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout: 60000,
    });

    // MIDDLEWARE: JWT AUTH for sockets
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("NO_TOKEN"));

            const payload = verifyToken(token);
            socket.data.user = payload;

            next();
        } catch (err) {
            next(new Error("INVALID_TOKEN"));
        }
    });

    // MAIN CONNECTION HANDLER
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`Socket connected: ${user.userId}`);

        // Join personal user room (DMs)
        socket.join(`user:${user.userId}`);

        // Listen for game room joining
        socket.on("joinGameRoom", (gameId) => {
            socket.join(`game:${gameId}`);
        });

        socket.on("leaveGameRoom", (gameId) => {
            socket.leave(`game:${gameId}`);
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${user.userId}`);
        });
    });

    return io;
}
