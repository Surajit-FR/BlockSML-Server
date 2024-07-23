const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { ConnectToDataBase } = require('./config/database_config');
const http = require('http');

// ROUTES
const AuthRoutes = require('./routes/auth.routes');
const Payment_Routes = require('./routes/payment.routes');
const Subscription_Routes = require('./routes/subscription.routes');
const User_Routes = require('./routes/user.routes');
// Stripe Webhook
const stripeWebhook = require('./routes/stripewebhook.routes');

require('dotenv').config();

// Database connection
ConnectToDataBase()

const app = express();

// Use the modular Webhook setup
app.use('/stripe/webhook', stripeWebhook);

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Socket.IO setup
const server = http.createServer(app);

// Server Health check
app.get('/health', (req, res) => {
    try {
        const networkInterfaces = os.networkInterfaces();

        // Extract IPv4 adresses
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
        return res.status(500).json({ response: error.message })
    }
});

/* USER */
//  API routes
app.use('/user/api/v1', [
    Payment_Routes,
    Subscription_Routes,
    User_Routes,
]);

/* AUTH */
// API routes
app.use('/api/v1/auth', AuthRoutes);

app.get('/api/server/check', (req, res) => {
    res.send("Hi!...I am server, Happy to see you boss...");
});

// Internal server error handeling middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err
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

server.listen(PORT, () => {
    console.log(`Server Connected On Port ${HOST}`)
});