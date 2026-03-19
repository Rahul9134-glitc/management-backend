import express from "express";
import cors from "cors"
const app = express();
import cookieParser from "cookie-parser";

//import middleware
import { errorHandler } from "./src/middleware/ErrorHandler.js";

//import all routers
import AuthRouter from "./src/routes/auth.routes.js"
import MoneyRouter from "./src/routes/account.routes.js"
import ShoppingRouter from "./src/routes/shopping.routes.js"
import WorkerRouter from "./src/routes/worker.routes.js"
import AttendenceRouter from "./src/routes/attendence.routes.js"
import PaymentRouter from "./src/routes/payment.routes.js";
import GroupRouter from "./src/routes/group.routes.js";
import ExpenceRouter from "./src/routes/expence.routes.js"

app.use(cors({
    origin: [
      "https://management-system-j976rb3zw.vercel.app", 
      "https://management-system-wine-eight.vercel.app",
      "http://localhost:5173" 
    ], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());
app.use(cookieParser());


//all router of controllers
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/money" , MoneyRouter);
app.use("/api/v1/shopping" , ShoppingRouter);
app.use("/api/v1/worker" , WorkerRouter);
app.use("/api/v1/attendence" , AttendenceRouter);
app.use("/api/v1/payment" , PaymentRouter);
app.use("/api/v1/group",GroupRouter);
app.use("/api/v1/expense" , ExpenceRouter);

//Global error handling
app.use(errorHandler);

export default app;