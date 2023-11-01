"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;

// count connected
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of collection: ${numConnection}`);
};

// check over load
const checkOverload = () => {
    setInterval(() => {
        const numberConnection = mongoose.Collection.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        // Example maximum number of connections based on number osf core
        const maxCollections = numCores * 5;

        console.log(`Active connections: ${numberConnection}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        if (numberConnection > maxCollections) {
            console.log("Connection overload detected !");
            // notify.send(...)
        }
    }, _SECOND); // Monitor every 5 seconds
};

module.exports = {
    countConnect,
    checkOverload,
};
