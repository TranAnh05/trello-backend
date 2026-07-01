import express from "express";
import { connectToDatabase, closeDatabaseConnection } from "./config/mongodb.js";
import exitHook from "async-exit-hook";
import { env } from "./config/environment.js";
import { v1Router } from "./routes/v1/index.js";

const startServer = () => {
    const app = express();

    app.use("/v1", v1Router);

    app.listen(env.APP_PORT, env.APP_HOST, () => {
        console.log(`Server is running at ${env.APP_HOST}:${env.APP_PORT}/`);
    });

    /**
     * Đóng kết nối database khi dừng server
     * exitHook: Thư viện giúp xử lý các sự kiện khi ứng dụng Node.js thoát
     * Khi ứng dụng Node.js thoát, exitHook sẽ gọi hàm closeDatabaseConnection để đóng kết nối MongoDB
     */
    exitHook(() => {
        closeDatabaseConnection();
    });
};

// chi khi ket noi duoc database thi moi start server
// IIFE
(async () => {
    try {
        await connectToDatabase();
        console.log("Connected to MongoDB");

        // Khoi tao server sau khi ket noi duoc database
        startServer();
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        /**
         * process.exit(0): Thoat app voi status code 0, khong co loi
         * process.exit(1): Thoat app voi status code 1, co loi
         */
        process.exit(0);
    }
})();
