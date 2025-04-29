const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        process.exit(1); // Exit process if connection fails
    }
};

// Handle when MongoDB is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

// Handle application shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
});

module.exports = connectDB;
