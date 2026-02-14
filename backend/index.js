// import node from 'node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import apiRoutes from './src/routes/api.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// ===== MIDDLEWARE =====----------------
// Allow requests from any origin (useful for testing with Postman)
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// Parse incoming form data
app.use(express.urlencoded({ extended: true }));

// ======= database connection =====
const db=new pg.Client({
    user:process.env.db_username,
    host:process.env.db_host,
    database:process.env.db_name,
    password:process.env.db_password,
    port:process.env.db_port
})
db.connect();
console.log("Database connected successfully");
// db.query('SELECT * FROM users', (err, res) => {
//     if (err) {
//         console.error('Error executing query', err.stack);
//     } else {
//         // data=res.rows;
//         console.log('Database Time:', res.rows);
//     }
// });
// ===== ROUTES =====
// --------------------LOGIN-----------------------------------------
app.post('/login',(req,res) => {
    var status='failure';
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    console.log(req.body);
    const {username,password}=req.body;
    db.query('SELECT * FROM users WHERE username = $1 AND password_hash = $2', [username, password], (err, dbRes) => {
    if (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: "Database error" });
    } else {
        // data=dbRes.rows;(dbres coz not to confuse with res of express)
        if (dbRes.rows.length > 0) {
            console.log("Login successful");
            status='success';
            res.json({status: status});
        } else {
            console.log("Invalid credentials");
            res.json({status: status});
        }
    }});
});

// ------------------------------------------------register---------------------------------------
app.post('/register',(req,res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    if (!/\S+@\S+\.\S+/.test(req.body.username)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    if (/\s/.test(req.body.password)) {
        return res.status(400).json({ error: "Password cannot contain spaces" });
    }
    db.query('SELECT * FROM users WHERE username = $1', [req.body.username], (err, dbRes) => {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).json({ error: "Database error" });
        }
        else {
            if (dbRes.rows.length > 0) {
                return  res.status(400).json({ error: "User already exists" });
            }
        }
    });

    const {username,password}=req.body;
    db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, password], (err, dbRes) => {
    if (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: "Database error" });
    } else {
        console.log("Registration successful");
        res.send("Registration successful "+username+" "+password);
    }});
});




// ===== API ROUTES =====
// Mount the API routes
app.use('/api', apiRoutes);

// Start the server----------------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at:`);
    console.log(`  - GET /api/sources - Get available data sources`);
    console.log(`  - POST /api/search - Unified search (user selects source)`);
    console.log(`  - POST /api/search/multi - Search multiple sources`);
    console.log(`  - GET /api/search/wikipedia?q=query - Direct Wikipedia search`);
    console.log(`  - GET /api/search/arxiv?q=query - Direct arXiv search`);
    console.log(`  - GET /api/search/news?q=query - Direct News search`);
    console.log(`  - GET /api/news/headlines?category=tech - Get news headlines`);
});
