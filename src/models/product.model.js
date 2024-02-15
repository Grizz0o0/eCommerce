'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema(
    {
        product_name: { type: String, required: true },
        product_thumb: { type: String, required: true },
        product_description: { type: String },
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true },
        product_type: {
            type: String,
            required: true,
            enum: ['Electronics', 'Clothing', 'Furniture'],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
        product_attributes: { type: Schema.Types.Mixed, required: true },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

const clothingSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: { type: String },
        material: { type: String },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        timestamps: true,
        collection: 'clothes',
    }
);

const electronicSchema = new Schema(
    {
        manufacturer: { type: String, required: true },
        model: { type: String },
        color: { type: String },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        timestamps: true,
        collection: 'electronics',
    }
);

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronics', electronicSchema),
};