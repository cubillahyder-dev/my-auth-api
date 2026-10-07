const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// A temporary in-memory array to simulate a database.
// Note: If Render spins down the free instance, this data resets.
const users = [];

// Sign Up Endpoint
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    users.push({ email, password });
    return res.status(201).json({ success: true, message: "Account created successfully" });
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        return res.status(200).json({ success: true, message: "Login successful!" });
    } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Render injects the PORT automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});