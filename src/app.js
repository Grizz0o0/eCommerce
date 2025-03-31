require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

// init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// test pub,sub redis
require('./tests/inventory.test');
const productTest = require('./tests/product.test');
productTest.purchaseProduct('product:001', 10);

// init db
require('./dbs/init.mongodb');
// const { checkOverload } = require('./helpers/check.connect');
// checkOverload();
// init routes

app.use(
    cors({
        origin: 'http://localhost:3000', // Cho phép từ frontend
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Phương thức HTTP được phép
        allowedHeaders: [
            'Content-Type',
            'x-api-key',
            'authorization',
            'x-client-id',
            'x-rtoken-id',
        ], // Các header được phép
    })
);
app.use('/', require('./routes'));

// handling error
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        stack: error.stack,
    });
});
module.exports = app;
