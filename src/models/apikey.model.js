'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Apikey';
const COLLECTION_NAME = 'Apikeys';

// Declare the Schema of the Mongo model
var apiSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
        permissions: {
            type: [String], // 1 mảng có các item là chuỗi
            required: true,
            enum: ['0000', '1111', '2222'], // chỉ chấp nhận các giá trị bên trong, nếu không sẽ báo lỗi
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, apiSchema);
