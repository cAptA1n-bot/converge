const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");

const app = express();

// Trust reverse proxy (Render, Heroku, Vercel, AWS)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Dynamic CORS configuration supporting Vercel and custom production domains
const getOriginChecker = () => {
    const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const allowedList = rawFrontendUrl
        .split(",")
        .map((url) => url.trim().replace(/\/$/, ""))
        .filter(Boolean);

    return (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl, Postman, health checks)
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/$/, "");

        // Allow explicitly configured origins
        if (allowedList.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        // Allow Vercel preview and production subdomains
        if (
            normalizedOrigin.endsWith(".vercel.app") ||
            normalizedOrigin === "http://localhost:3000" ||
            normalizedOrigin === "http://127.0.0.1:3000"
        ) {
            return callback(null, true);
        }

        // Allow in non-production environments
        if (process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    };
};

app.use(
    cors({
        origin: getOriginChecker(),
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root & Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        name: "Converge API",
        version: "1.0.0",
        status: "healthy",
        health: "/api/v1/health",
    });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
    });
});

// Primary versioned API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1", applicationRoutes);

// Unversioned fallback route aliases (in case requests arrive without /api/v1)
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/", applicationRoutes);

module.exports = app;