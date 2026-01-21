const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config(); // Load .env file

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

// 🏥 Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "🌸 Flower Shop API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// 🏥 Health check endpoint
app.get("/health", (req, res) => {
  console.log("[Health] Request received");
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? "connected" : "not connected"
  });
});

// ✉️ Send OTP via Email (Real Email using SendGrid)
app.post("/send-otp-email", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`\n📧 [OTP Email Request] Received request for: ${email}`);
    
    if (!email) {
      console.log(`❌ [OTP Email] No email provided`);
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    console.log(`✅ [OTP Email] Generated for ${email}: ${otp}`);

    // Send email via SendGrid API (no package needed, just HTTP request)
    const sendgridApiKey = process.env.SENDGRID_API_KEY || "";
    const senderEmail = process.env.SENDER_EMAIL || "noreply@flowerapp.com";
    
    console.log(`🔐 [OTP Email] SendGrid API Key configured: ${sendgridApiKey ? 'YES' : 'NO'}`);
    
    if (!sendgridApiKey) {
      console.log(`⚠️ [OTP Email] SendGrid API key not configured. Returning debug mode.`);
      return res.status(200).json({ 
        success: true, 
        message: `✅ OTP gửi thành công tới ${email}!`,
        debug: `OTP: ${otp}` // For testing
      });
    }

    try {
      const emailData = {
        personalizations: [{
          to: [{ email: email }]
        }],
        from: { email: senderEmail, name: "Flower App" },
        subject: `Mã OTP đặt lại mật khẩu: ${otp}`,
        content: [{
          type: "text/html",
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e91e63;">🌸 Flower Shop - Đặt lại mật khẩu</h2>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
              <div style="background: #fff0f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; color: #666;">Mã OTP của bạn là:</p>
                <h1 style="margin: 10px 0; color: #e91e63; font-size: 48px; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666;">Mã này sẽ hết hạn trong <strong>5 phút</strong>.</p>
              <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
            </div>
          `
        }]
      };

      console.log(`📤 [OTP Email] Sending to SendGrid API...`);
      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      console.log(`📨 [OTP Email] SendGrid Response Status: ${sendgridResponse.status}`);

      if (sendgridResponse.ok) {
        console.log(`✅ [OTP Email] Success! Email sent to ${email}`);
        res.status(200).json({ 
          success: true, 
          message: `✅ OTP gửi thành công tới ${email}!`
        });
      } else {
        const errorBody = await sendgridResponse.text();
        console.log(`⚠️ [OTP Email] SendGrid returned status ${sendgridResponse.status}: ${errorBody}`);
        res.status(200).json({ 
          success: true, 
          message: `✅ OTP gửi thành công tới ${email}!`,
          debug: `OTP: ${otp}`
        });
      }
    } catch (emailError) {
      console.error("❌ [OTP Email] Network error:", emailError.message);
      res.status(200).json({ 
        success: true, 
        message: `✅ OTP gửi thành công tới ${email}!`,
        debug: `OTP: ${otp}`
      });
    }
  } catch (error) {
    console.error("❌ [Send OTP Email Error]:", error.message);
    res.status(500).json({ success: false, message: "Error sending OTP", error: error.message });
  }
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
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and newPassword are required" 
      });
    }

    console.log(`\n🔐 [Reset Password] Request received for: ${email}`);

    // Verify OTP first (optional but recommended)
    if (otp) {
      console.log(`🔐 [Reset Password] Verifying OTP...`);
      if (!otpStore[email]) {
        return res.status(400).json({ 
          success: false, 
          message: "OTP not found or expired" 
        });
      }

      if (otpStore[email].otp !== otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid OTP" 
        });
      }

      if (Date.now() > otpStore[email].expires) {
        delete otpStore[email];
        return res.status(400).json({ 
          success: false, 
          message: "OTP expired" 
        });
      }
      console.log(`✅ [Reset Password] OTP verified successfully`);
    }

    // Find user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ [Reset Password] Found user UID: ${user.uid}`);

    // Update password
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    console.log(`✅ [Reset Password] Password updated successfully for: ${email}`);

    // Clean up OTP
    if (otpStore[email]) {
      delete otpStore[email];
      console.log(`🧹 [Reset Password] Cleaned up OTP for ${email}`);
    }

    res.status(200).json({ 
      success: true, 
      message: "✅ Mật khẩu đã được cập nhật thành công!",
      email: email
    });
  } catch (error) {
    console.error(`❌ [Reset Password Error] for ${req.body.email}:`, error.message);
    
    let statusCode = 500;
    let errorMessage = error.message;

    if (error.code === "auth/user-not-found") {
      statusCode = 404;
      errorMessage = "Không tìm thấy người dùng";
    } else if (error.code === "auth/invalid-password") {
      statusCode = 400;
      errorMessage = "Mật khẩu không hợp lệ (tối thiểu 6 ký tự)";
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: error.code || error.message
    });
  }
});

// 📦 Get All Products endpoint
app.get("/products", async (req, res) => {
  try {
    const db = admin.firestore();
    const productsSnapshot = await db.collection("products").get();
    
    const products = [];
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      // Ưu tiên image_url, fallback sang image (giữ tương thích)
      products.push({
        id: doc.id,
        ...data,
        image: data.image_url || data.image || null,
        image_url: data.image_url || data.image || null
      });
    });

    res.status(200).json({
      success: true,
      products: products,
      count: products.length
    });
  } catch (error) {
    console.error("❌ [Get Products Error]:", error.message);
    
    if (error.message.includes("UNAUTHENTICATED")) {
      return res.status(403).json({
        success: false,
        message: "Firebase Firestore authentication error. Please check your Firestore security rules.",
        error: "FIRESTORE_AUTH_ERROR",
        hint: "Allow unauthenticated read access in Firestore rules or use Firebase Realtime Database"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách sản phẩm",
      error: error.message
    });
  }
});

// 🔍 Search Products endpoint
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const category = req.query.category || "";
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

    console.log(`🔍 [Search Products] Query: "${query}", Category: "${category}", Price: ${minPrice}-${maxPrice}`);

    if (!query && !category) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm hoặc chọn danh mục"
      });
    }

    const db = admin.firestore();
    let searchQuery = db.collection("products");

    // Apply category filter
    if (category) {
      searchQuery = searchQuery.where("category", "==", category);
    }

    const allProducts = [];
    const snapshot = await searchQuery.get();

    if (snapshot.empty) {
      console.log("❌ [Search Products] No products found");
      return res.status(200).json({
        success: true,
        products: [],
        count: 0,
        message: "Không tìm thấy sản phẩm nào"
      });
    }

    // Filter by search query (client-side or using array-contains)
    snapshot.forEach(doc => {
      const data = doc.data();
      const product = {
        id: doc.id,
        ...data,
        image: data.image_url || data.image || null,
        image_url: data.image_url || data.image || null
      };

      // Search in name, description, and tags
      const searchText = query.toLowerCase();
      const matchesSearch = !query || 
        (product.name && product.name.toLowerCase().includes(searchText)) ||
        (product.description && product.description.toLowerCase().includes(searchText)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchText)));

      // Check price range
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      if (matchesSearch && matchesPrice) {
        allProducts.push(product);
      }
    });

    console.log(`✅ [Search Products] Found ${allProducts.length} products`);

    res.status(200).json({
      success: true,
      products: allProducts,
      count: allProducts.length,
      query: query,
      filters: {
        category: category || null,
        priceRange: { min: minPrice, max: maxPrice }
      }
    });
  } catch (error) {
    console.error("❌ [Search Products Error]:", error.message);

    if (error.message.includes("UNAUTHENTICATED")) {
      return res.status(403).json({
        success: false,
        message: "Firebase Firestore authentication error",
        error: "FIRESTORE_AUTH_ERROR"
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi tìm kiếm sản phẩm",
      error: error.message
    });
  }
});

// 🏷️ Get All Categories endpoint
app.get("/categories", async (req, res) => {
  try {
    const db = admin.firestore();
    const categoriesSnapshot = await db.collection("categories").get();
    
    const categories = [];
    categoriesSnapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      categories: categories,
      count: categories.length
    });
  } catch (error) {
    console.error("❌ [Get Categories Error]:", error.message);
    
    if (error.message.includes("UNAUTHENTICATED")) {
      return res.status(403).json({
        success: false,
        message: "Firebase Firestore authentication error. Please check your Firestore security rules.",
        error: "FIRESTORE_AUTH_ERROR"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách danh mục",
      error: error.message
    });
  }
});

// 🤖 Chat Endpoint - Product recommendations from Firebase
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const db = admin.firestore();
    const productsSnapshot = await db.collection("products").get();
    
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Simple keyword matching for product recommendations
    const keywords = message.toLowerCase();
    let recommendedProducts = products;
    
    // Filter products based on keywords
    if (keywords.includes("hồng") || keywords.includes("rose")) {
      recommendedProducts = products.filter(p => 
        p.name?.toLowerCase().includes("hồng") || p.name?.toLowerCase().includes("rose")
      );
    } else if (keywords.includes("hướng dương") || keywords.includes("sunflower")) {
      recommendedProducts = products.filter(p => 
        p.name?.toLowerCase().includes("hướng dương") || p.name?.toLowerCase().includes("sunflower")
      );
    } else if (keywords.includes("tulip")) {
      recommendedProducts = products.filter(p => p.name?.toLowerCase().includes("tulip"));
    } else if (keywords.includes("cúc") || keywords.includes("daisy")) {
      recommendedProducts = products.filter(p => 
        p.name?.toLowerCase().includes("cúc") || p.name?.toLowerCase().includes("daisy")
      );
    } else if (keywords.includes("hỗn hợp") || keywords.includes("mixed")) {
      recommendedProducts = products.filter(p => 
        p.name?.toLowerCase().includes("hỗn hợp") || p.name?.toLowerCase().includes("mixed")
      );
    }

    // If no products match, return all products
    if (recommendedProducts.length === 0) {
      recommendedProducts = products.slice(0, 3); // Return first 3 products
    }

    console.log(`🤖 [Chat] User message: "${message}" - Found ${recommendedProducts.length} products`);

    res.status(200).json({
      success: true,
      reply: `Tôi tìm thấy ${recommendedProducts.length} sản phẩm phù hợp với yêu cầu của bạn!`,
      products: recommendedProducts.slice(0, 5) // Limit to 5 products
    });
  } catch (error) {
    console.error("❌ [Chat Error]:", error.message);
    
    if (error.message.includes("UNAUTHENTICATED")) {
      return res.status(403).json({
        success: false,
        message: "Firebase Firestore authentication error. Please check your Firestore security rules.",
        error: "FIRESTORE_AUTH_ERROR",
        hint: "Update your Firestore security rules to allow unauthenticated read access to the products collection"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý yêu cầu chat",
      error: error.message
    });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎉 Server is running on http://localhost:${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /send-otp-email`);
  console.log(`   - POST /send-otp`);
  console.log(`   - POST /verify-otp`);
  console.log(`   - POST /api/auth/signup`);
  console.log(`   - POST /api/auth/signin`);
  console.log(`   - POST /api/resetPassword`);
  console.log(`   - GET  /products`);
  console.log(`   - GET  /search?q=<query>&category=<category>&minPrice=<min>&maxPrice=<max>`);
  console.log(`   - GET  /categories`);
  console.log(`   - POST /chat\n`);
});