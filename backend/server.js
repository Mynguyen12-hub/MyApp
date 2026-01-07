const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");

// 🚀 Initialize Express App
const app = express();
// Enable CORS for all origins (permissive for development/demo)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Handle preflight requests explicitly
app.options("*", cors());
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
// 🔐 Sign Up - Create new user with Firebase Admin
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email: email.trim(),
      password: password,
      displayName: displayName || email.split("@")[0],
    });

    console.log(`✅ [Signup] User created: ${userRecord.uid} (${email})`);

    res.status(201).json({ 
      success: true, 
      message: "Account created successfully!",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || email.split("@")[0],
        username: username || email.split("@")[0],
      }
    });
  } catch (error) {
    console.error(`❌ [Signup Error]:`, error.message);
    
    let statusCode = 500;
    let errorMessage = error.message;

    if (error.code === "auth/email-already-exists") {
      statusCode = 409;
      errorMessage = "Email already registered";
    } else if (error.code === "auth/invalid-email") {
      statusCode = 400;
      errorMessage = "Invalid email format";
    } else if (error.code === "auth/invalid-password") {
      statusCode = 400;
      errorMessage = "Password must be at least 6 characters";
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: error.code || error.message
    });
  }
});

// 🔐 Sign In - Authenticate user with Firebase Admin
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Verify user exists and password is correct via Firebase REST API
    // (Firebase Admin SDK doesn't directly verify passwords, so we use the REST API)
    const firebaseKey = process.env.FIREBASE_API_KEY || "AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4";
    
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const errorMsg = firebaseData.error?.message || "Invalid credentials";
      let message = "Invalid email or password";
      
      if (errorMsg.includes("EMAIL_NOT_FOUND")) {
        message = "Email not registered";
      } else if (errorMsg.includes("INVALID_PASSWORD")) {
        message = "Incorrect password";
      }

      return res.status(401).json({ 
        success: false, 
        message: message,
        error: errorMsg
      });
    }

    // Get user details from Firebase Admin
    const user = await admin.auth().getUserByEmail(email);

    console.log(`✅ [Signin] User authenticated: ${user.uid} (${email})`);

    res.status(200).json({ 
      success: true, 
      message: "Login successful!",
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
      },
      token: firebaseData.idToken
    });
  } catch (error) {
    console.error(`❌ [Signin Error]:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: "Authentication failed",
      error: error.message
    });
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
  console.log(`  POST /api/auth/signup`);
  console.log(`  POST /api/auth/signin`);
  console.log(`  POST /api/resetPassword\n`);
});
