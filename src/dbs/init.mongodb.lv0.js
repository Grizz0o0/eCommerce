"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://localhost:27017/eCommerces";

mongoose
    .connect(connectString)
    .then((_) => console.log("Connect MongoDB Success !!!"))
    .catch((err) => console.log("Error Connect !!!"));

// DEV
if (1 === 1) {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });
}

module.exports = mongoose;
