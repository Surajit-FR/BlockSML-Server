const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const os = require('os');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { ConnectToDataBase } = require('./config/database_config');

// PAYMENT
const Webhook_Routes = require('./routes/webhook.routes');
const Payment_Routes = require('./routes/payment.routes');

require('dotenv').config();

// Database connection
ConnectToDataBase();

const app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Apply raw body parser for specific routes (Stripe webhook)
app.use('/user/api', [
    express.raw({ type: 'application/json' }),
    Webhook_Routes,
    Payment_Routes,
]);

// Health check endpoint
app.get('/health', (req, res) => {
    try {
        const networkInterfaces = os.networkInterfaces();

        // Extract IPv4 addresses
        const IPv4Adresses = Object.values(networkInterfaces)
            .flat()
            .filter(interfaceInfo => interfaceInfo.family === 'IPv4')
            .map(interfaceInfo => interfaceInfo.address);

        if (mongoose.connection.name) {
            const message = {
                host: IPv4Adresses,
                message: 'Healthy',
                status: true,
                time: new Date(),
            };
            console.log(message);
            return res.status(200).json({ response: message });
        } else {
            const message = {
                host: IPv4Adresses,
                message: 'Unhealthy',
                status: false,
                time: new Date(),
            };
            console.log(message);
            return res.status(501).json({ response: message });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message });
    }
});

// Default error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err.message
    });
});

// Page not found middleware
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        message: "Page Not Found"
    });
});

const PORT = process.env.PORT || 4006;
const HOST = `${process.env.HOST}:${PORT}` || `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`Server connected on ${HOST}`);
});