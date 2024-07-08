require('dotenv').config();
const mongoose = require('mongoose');

const ConnectToDataBase = async () => {
    try {
        console.log("Trying To connect DB...");
        await mongoose.connect(`${process.env.DB_CONNECTION}`);

        // Get the current date and time
        const currentDate = new Date().toLocaleString();

        const DB_Info = {
            STATUS: "Connected",
            HOST: mongoose.connection.host,
            DB_NAME: mongoose.connection.name,
            DATE_TIME: currentDate,
        };
        console.table(DB_Info);
        console.log("MongoDB Connection Successfull...");
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process on connection failure
    };
};

module.exports = { ConnectToDataBase };