const mongoose = require('mongoose');
let MongoMemoryServer;
try {
    const mms = require('mongodb-memory-server');
    MongoMemoryServer = mms.MongoMemoryServer;
} catch (e) {
    console.error("[Database] Note: 'mongodb-memory-server' not found (Safe for Render).");
}

async function connectDB() {
    console.log("[Database] Initializing connection sequence...");

    try {
        let uri = process.env.MONGO_URI;

        if (process.env.USE_LOCAL_DB === 'true') {
            if (!MongoMemoryServer) {
                throw new Error("Local DB requested but package is missing.");
            }
            console.log("[Database] Starting Local In-Memory Server...");
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`[Database] Local DB Server Ready at: ${uri}`);
        }

        if (!uri) {
             throw new Error("No MONGO_URI found and USE_LOCAL_DB is false.");
        }

        console.log("[Database] Connecting to Mongoose...");
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4 for stability
        });

        console.log("[Database] Koharu has successfully connected to her memory.");
    } catch (err) {
        console.error("------------------------------------------------");
        console.error("[Database] CRITICAL CONNECTION ERROR");
        console.error(err.message);
        console.error("------------------------------------------------");
        process.exit(1);
    }
}

module.exports = connectDB;