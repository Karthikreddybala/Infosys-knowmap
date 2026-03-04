// import node from 'node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import apiRoutes from './src/routes/api.js';
import knowledgeGraphRoutes from './src/routes/knowledgeGraph.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const getEnv = (primary, fallback) => process.env[primary] ?? process.env[fallback];
// ===== MIDDLEWARE =====----------------
// Allow requests from any origin (useful for testing with Postman)
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// Parse incoming form data
app.use(express.urlencoded({ extended: true }));

// ======= database connection =====
// Validate environment variables
const requiredEnvVars = [
    ['db_username', 'DB_USERNAME'],
    ['db_host', 'DB_HOST'],
    ['db_name', 'DB_NAME'],
    ['db_password', 'DB_PASSWORD'],
    ['db_port', 'DB_PORT']
];
const missingVars = requiredEnvVars
    .filter(([primary, fallback]) => !getEnv(primary, fallback))
    .map(([primary]) => primary);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please ensure all database configuration variables are set in your .env file');
    process.exit(1);
}

// Ensure password is a string
const dbPassword = getEnv('db_password', 'DB_PASSWORD');
if (typeof dbPassword !== 'string') {
    console.error('Database password must be a string, got:', typeof dbPassword);
    process.exit(1);
}

const db = new pg.Client({
    user: getEnv('db_username', 'DB_USERNAME'),
    host: getEnv('db_host', 'DB_HOST'),
    database: getEnv('db_name', 'DB_NAME'),
    password: dbPassword,
    port: getEnv('db_port', 'DB_PORT')
});

db.connect()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
        console.error("This might be due to incorrect credentials or database server issues");
        process.exit(1);
    });
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
app.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    if (!/\S+@\S+\.\S+/.test(req.body.username)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    if (/\s/.test(req.body.password)) {
        return res.status(400).json({ error: "Password cannot contain spaces" });
    }
    const { username, password } = req.body;

    try {
        const existingUser = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        await db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, password]);
        console.log("Registration successful");
        return res.json({ status: 'success' });
    } catch (err) {
        console.error('Error executing query', err.stack);
        return res.status(500).json({ error: "Database error" });
    }
});




// ===== API ROUTES =====
// Mount the API routes
app.use('/api', apiRoutes);

// Mount the knowledge graph routes
console.log('Mounting knowledge graph routes...');
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
console.log('Knowledge graph routes mounted successfully');

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
    console.log(`  - GET /api/metrics - Get real-time metrics`);
    console.log(`  - GET /api/graph-stats - Get knowledge graph statistics`);
    console.log(`  - GET /api/pipeline-feedback - Get NLP pipeline feedback`);
    console.log(`  - POST /api/knowledge-graph/process - Process text and extract knowledge graph`);
    console.log(`  - GET /api/knowledge-graph/system-info - Get system information`);
    console.log(`  - GET /api/knowledge-graph/check-dependencies - Check Python dependencies`);
    console.log(`  - POST /api/knowledge-graph/analyze - Analyze knowledge graph`);
    console.log(`  - POST /api/knowledge-graph/query - Query knowledge graph`);
});
