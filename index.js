const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const users = [];

// Updated Sign Up Endpoint with OTP
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, message: "User already exists" });

    // Generate 4-digit OTP (1000 to 9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    // Set expiry to 30 seconds from now
    const otpExpiry = Date.now() + 30000; 

    // Save user as UNVERIFIED initially
    users.push({ email, password, otp, otpExpiry, isVerified: false });
    
    // IMPORTANT FOR TESTING: Log the OTP so you can see it in Render's dashboard
    console.log(`[OTP GENERATED] Email: ${email} | Code: ${otp}`);

    return res.status(201).json({ success: true, message: "Account created. Check Render logs for OTP." });
});

// New Verify OTP Endpoint
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified" });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ success: false, message: "OTP has expired (30s passed)" });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP code" });

    // Success: Mark user as verified and clear the OTP
    user.isVerified = true;
    user.otp = null;
    return res.status(200).json({ success: true, message: "Verification complete!" });
});

// Updated Login Endpoint to check verification status
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!user.isVerified) return res.status(401).json({ success: false, message: "Account not verified. Please complete OTP." });
    
    return res.status(200).json({ success: true, message: "Login successful!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));