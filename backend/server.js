const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");

// 🚀 Initialize Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// 🚀 Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  const serviceAccount = require(serviceAccountPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
  console.error("Make sure serviceAccountKey.json exists in the backend folder");
  process.exit(1);
}

// 📌 In-memory OTP storage
let otpStore = {};

// 🏥 Health check endpoint
app.get("/health", (req, res) => {
  console.log("[Health] Request received");
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? "connected" : "not connected"
  });
});

// ✉️ Send OTP via mock SMS (stored in memory)
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    console.log(`📱 [OTP] Generated for ${email}: ${otp}`);

    res.status(200).json({ 
      success: true, 
      message: "OTP sent!", 
      otp // Return OTP in response for demo (remove in production)
    });
  } catch (error) {
    console.error("[Send OTP Error]:", error.message);
    res.status(500).json({ success: false, message: "Error sending OTP", error: error.message });
  }
});

// 🔐 Verify OTP
app.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > otpStore[email].expires) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    console.log(`✅ [OTP] Verified for ${email}`);
    res.status(200).json({ success: true, message: "OTP verified!" });
  } catch (error) {
    console.error("[Verify OTP Error]:", error.message);
    res.status(500).json({ success: false, message: "Error verifying OTP", error: error.message });
  }
});

// 🔑 Reset Password via Firebase Admin
app.post("/api/resetPassword", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and newPassword are required" 
      });
    }

    console.log(`[Reset Password] Attempting to reset for: ${email}`);

    // Find user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`[Reset Password] Found user UID: ${user.uid}`);

    // Update password
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    console.log(`✅ [Reset Password] Password updated successfully for: ${email}`);

    // Clean up OTP
    if (otpStore[email]) {
      delete otpStore[email];
    }

    res.status(200).json({ 
      success: true, 
      message: "Password updated successfully!",
      email: email
    });
  } catch (error) {
    console.error(`❌ [Reset Password Error] for ${req.body.email}:`, error.message);
    
    let statusCode = 500;
    let errorMessage = error.message;

    if (error.code === "auth/user-not-found") {
      statusCode = 404;
      errorMessage = "User not found";
    } else if (error.code === "auth/invalid-password") {
      statusCode = 400;
      errorMessage = "Invalid password (minimum 6 characters required)";
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: error.code || error.message
    });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health`);
  console.log(`  POST /api/resetPassword\n`);
});
