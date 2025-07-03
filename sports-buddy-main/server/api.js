const express = require("express");
const mongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const app = express();

// Basic CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://sports-buddy-react-1.onrender.com'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));
}

// Serve static files from the public and src directories
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle HTML routes by serving files from public directory
app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', req.path));
});

const conString = process.env.MONGO_URL;
if (!conString) {
    console.error("MongoDB connection string not found in environment variables!");
    process.exit(1);
}

// MongoDB connection setup
let dbClient = null;
let db = null;

async function connectDB() {
    try {
        if (!dbClient) {
            dbClient = await mongoClient.connect(conString);
            db = dbClient.db("sportsBuddy");
            console.log("Successfully connected to MongoDB database: sportsBuddy");
        }
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}

// API Routes
app.get("/sportsInfo", async (req, res) => {
    try {
        const db = await connectDB();
        const sportsInfo = await db.collection("sportsInfo").find({}).toArray();
        res.json(sportsInfo);
    } catch (err) {
        console.error("Error fetching sports info:", err);
        res.status(500).json({ error: "Failed to fetch Sports info" });
    }
});


// Register user
app.post("/register-user", async (req, res) => {
    try {
        const db = await connectDB();

        // Validate required fields
        const { userName, email, password, mobile } = req.body;
        
        if (!userName || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields. Name, email and password are required." 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "Password must be at least 6 characters long" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Check if email already exists (case insensitive)
        const existingUser = await db.collection("users").findOne({ 
            email: { $regex: new RegExp('^' + email + '$', 'i') }
        });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Email already exists" 
            });
        }

        // Register new user
        const user = {
            userName,
            email,
            password,
            mobile: mobile ? parseInt(mobile) : null
        };
        
        await db.collection("users").insertOne(user);
        console.log("User Registered:", { email });

        res.json({ 
            success: true,
            message: "Registration successful",
            user: {
                userName: user.userName,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to register user" 
        });
    }
});

// Get all providers (for login verification)
app.get("/users", async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("users").find({}).toArray();
        
        res.json({ 
            success: true,
            users: users.map(p => ({
                userName: p.userName,
                email: p.email
            }))
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch users" 
        });
    }
});

// Create provider profile
app.post("/create-post", async (req, res) => {
    try {
        const db = await connectDB();
        const { email, userName, mobileNumber, sport, location, date } = req.body;

       

      
        // Create post
        
        const post = {
            email, 
            userName, 
            mobileNumber, 
            sport, 
            location, 
            date 
        };

        await db.collection("sportsInfo").insertOne(post);
        console.log("Post Created:", { email });

        res.json({ 
            success: true,
            message: "Post created successfully",
            post
        });
    } catch (err) {
        console.error("Error creating Post:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to create Post" 
        });
    }
});

// Get profile by Email
app.get("/get-post/:email", async (req, res) => {
    try {
        const db = await connectDB();
        const email = req.params.email;

        const post = await db.collection("sportsInfo").findOne({ email });
        if (post) {
            res.json({ 
                success: true,
                post
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: "Post not found" 
            });
        }
    } catch (err) {
        console.error("Error fetching Post:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch Post" 
        });
    }
});
// Edit provider profile by Email
app.put("/edit-post/:email", async (req, res) => {
    try {
        const db = await connectDB();
        const emailParam = req.params.email;
        const { 
            email, 
            userName, 
            mobileNumber, 
            sport, 
            location, 
            date 
         } = req.body;

        // Validate required fields
        if (!userName || !sport || !location) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields" 
            });
        }

        const post = {
            email, 
            userName, 
            mobileNumber, 
            sport, 
            location, 
            date 
        };

        const result = await db.collection("sportsInfo").updateOne(
            { email: emailParam },
            { $set: post }
        );

        if (result.modifiedCount > 0) {
            res.json({ 
                success: true, 
                message: "Post updated successfully", 
                post: { ...post, email: emailParam }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "Post not found to update" 
            });
        }
    } catch (err) {
        console.error("Error updating Post:", err);
        res.status(500).json({ 
            success: false, 
            message: "Error updating Post" 
        });
    }
});

// Get all provider profiles
app.get("/sportsInfo", async (req, res) => {
    try {
        const db = await connectDB();
        const posts = await db.collection("sportsInfo").find({}).toArray();
        res.json({ 
            success: true,
            posts
        });
    } catch (err) {
        console.error("Error fetching Posts:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch Posts" 
        });
    }
});


// Get profiles by location
app.get("/get-posts/:location", async (req, res) => {
    try {
        const db = await connectDB();
        const posts = await db.collection("sportsInfo")
            .find({ 
                location: { 
                    $regex: req.params.location, 
                    $options: 'i' 
                } 
            })
            .toArray();

        res.json({ 
            success: true,
            posts
        });
    } catch (err) {
        console.error("Error fetching Posts by location:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch Posts by location" 
        });
    }
});

// Get filtered providers based on service and location
app.get("/get-filtered-providers", async (req, res) => {
    try {
        const db = await connectDB();
        const { sport, location } = req.query;

        let filter = {};

        // Apply service filter if provided
        if (sport) {
            filter.sport = sport;
        }

        // Apply location filter if provided
        if (location) {
            filter.location = location;
        }

        const sports = await db.collection("sportsInfo")
            .find(filter)
            .toArray();

        res.json({ 
            success: true,
            sports
        });
    } catch (err) {
        console.error("Error fetching filtered Sports:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch filtered Sports" 
        });
    }
});

// Check if email exists
app.get("/users/:email", async (req, res) => {
    try {
        const db = await connectDB();
        const email = req.params.email;
        const users = await db.collection("users").find({ email }).toArray();
        
        res.json({ 
            success: true,
            users,
            exists: users.length > 0
        });
    } catch (err) {
        console.error("Error checking Email:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to check Email" 
        });
    }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
    try {
        const db = await connectDB();
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }

        // Find user in providers collection (case insensitive email match)
        const user = await db.collection("users").findOne({ 
            email
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Compare password (in a real app, use bcrypt or similar)
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        res.json({ 
            success: true,
            user: {
                userName: user.userName,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
});

// Handle React routing in production
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../build/index.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

// Catch-all route for serving index.html - MUST BE LAST
app.get("*", (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    }
});

// Ensure database connection before starting the server
connectDB().then(() => {
    const PORT = process.env.PORT || 5678;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Node environment:', process.env.NODE_ENV);
        console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit on database connection failure
});
