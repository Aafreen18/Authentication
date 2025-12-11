import { readFile, writeFile } from "fs/promises";
import { createServer } from "http";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


const port = 3000;
const USERS_FILE = path.join("data", "users.json");

// -------------------------------
// Helper Functions
// -------------------------------
const loadUsers = async () => {
    try {
        const data = await readFile(USERS_FILE, "utf-8");
        if (!data.trim()) return [];
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            await writeFile(USERS_FILE, "[]");
            return [];
        }
        throw err;
    }
};

const saveUsers = async (users) => {
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};

const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Configure email transporter. Prefer Gmail (app password) via env vars.
let transporter;
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // use an App Password
        },
    });
    console.log('Configured Gmail transporter');
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    console.log('Configured custom SMTP transporter');
} else {
    // Fallback: a simple object with sendMail that logs the message to console.
    transporter = {
        sendMail: async (mailOptions) => {
            console.log("--- Email (console fallback) ---");
            console.log("To:", mailOptions.to);
            console.log("Subject:", mailOptions.subject);
            console.log("HTML:\n", mailOptions.html || mailOptions.text);
            console.log("--------------------------------");
            return Promise.resolve();
        },
    };
    console.log('No SMTP configured: emails will be logged to console');
}

// Serve static files
const serveFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 File Not Found");
    }
};

// Add CORS headers
const addCORSHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

// -------------------------------
// Server
// -------------------------------
const server = createServer(async (req, res) => {
    // Add CORS headers
    addCORSHeaders(res);

    // Handle OPTIONS requests
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        return res.end();
    }

    // -------------------------------
    // GET Routes
    // -------------------------------
    if (req.method === "GET") {
        if (req.url === "/") {
            return serveFile(res, path.join("public", "index.html"), "text/html");
        }

        if (req.url === "/dashboard.html") {
            return serveFile(res, path.join("public", "dashboard.html"), "text/html");
        }

        // Serve reset page (also allow querystring token)
        if (req.url === "/reset-password.html" || req.url.startsWith('/reset-password.html?')) {
            return serveFile(res, path.join("public", "reset-password.html"), "text/html");
        }

        if (req.url === "/style.css") {
            return serveFile(res, path.join("public", "style.css"), "text/css");
        }

        if (req.url === "/app.js") {
            return serveFile(res, path.join("public", "app.js"), "application/javascript");
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Route not found");
    }

    // -------------------------------
    // POST /api/signup
    // -------------------------------
    if (req.method === "POST" && req.url === "/api/signup") {
        let body = "";

        req.on("data", (chunk) => (body += chunk));

        req.on("end", async () => {
            try {
                const { name, email, password } = JSON.parse(body);
                const users = await loadUsers();

                if (!name || !email || !password) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "All fields required" }));
                }

                if (users.some((u) => u.email === email)) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "User already exists" }));
                }

                const hashed = hashPassword(password);

                const newUser = {
                    id: crypto.randomBytes(8).toString("hex"),
                    name,
                    email,
                    password: hashed,
                    createdAt: new Date().toISOString(),
                };

                users.push(newUser);
                await saveUsers(users);

                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Signup successful" }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid request" }));
            }
        });
    }

    // -------------------------------
    // POST /api/login
    // -------------------------------
    if (req.method === "POST" && req.url === "/api/login") {
        let body = "";

        req.on("data", (chunk) => (body += chunk));

        req.on("end", async () => {
            try {
                const { email, password } = JSON.parse(body);
                const users = await loadUsers();

                if (!email || !password) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Email & password required" }));
                }

                const user = users.find((u) => u.email === email);

                if (!user || user.password !== hashPassword(password)) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Invalid credentials" }));
                }

                const token = generateToken();

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        message: "Login successful",
                        token,
                        user: { id: user.id, name: user.name, email: user.email },
                    })
                );
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid request" }));
            }
        });
    }

    // -------------------------------
    // POST /api/forgot-password (token-based reset)
    // -------------------------------
    if (req.method === "POST" && req.url === "/api/forgot-password") {
        let body = "";

        req.on("data", (chunk) => (body += chunk));

        req.on("end", async () => {
            try {
                const { email } = JSON.parse(body);
                const users = await loadUsers();

                if (!email) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Email required" }));
                }

                const userIndex = users.findIndex((u) => u.email === email);

                if (userIndex === -1) {
                    // Do not reveal whether the email exists
                    res.writeHead(200, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "If an account with that email exists, you will receive an email shortly." }));
                }

                // Generate a secure reset token and expiry (15 minutes)
                const token = crypto.randomBytes(20).toString("hex");
                const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

                users[userIndex].resetToken = token;
                users[userIndex].resetTokenExpiry = expiry;
                await saveUsers(users);

                // Build reset link
                const host = req.headers.host || `localhost:${port}`;
                const resetLink = `http://${host}/reset-password.html?token=${token}`;

                // Send email with reset link (Gmail via nodemailer if configured)
                const mailOptions = {
                    from: process.env.GMAIL_FROM || process.env.SMTP_FROM || "no-reply@example.com",
                    to: email,
                    subject: "Password Reset Request",
                    html: `
                        <h2>Password Reset</h2>
                        <p>Click the link below to reset your password:</p>
                        <a href="${resetLink}">${resetLink}</a>
                        <p>This link will expire in 15 minutes.</p>
                    `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                } catch (err) {
                    console.error("Error sending reset email:", err);
                }

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "If an account with that email exists, you will receive an email shortly." }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid request" }));
            }
        });
    }

    // -------------------------------
    // Serve reset page
    // -------------------------------
    if (req.method === "GET" && (req.url === "/reset-password.html" || req.url.startsWith('/reset-password.html?'))) {
        return serveFile(res, path.join("public", "reset-password.html"), "text/html");
    }

    // -------------------------------
    // POST /api/reset-password
    // -------------------------------
    if (req.method === "POST" && req.url === "/api/reset-password") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const { token, password } = JSON.parse(body);
                if (!token || !password) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Token and new password required" }));
                }

                const users = await loadUsers();
                const userIndex = users.findIndex((u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now());

                if (userIndex === -1) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Invalid or expired token" }));
                }

                // Update password
                users[userIndex].password = hashPassword(password);
                // Clear token fields
                delete users[userIndex].resetToken;
                delete users[userIndex].resetTokenExpiry;
                await saveUsers(users);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Password has been reset successfully" }));
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid request" }));
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Authentication server running at http://localhost:${port}`);
});
