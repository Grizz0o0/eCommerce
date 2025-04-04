'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required
const slugify = require('slugify');
const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema(
    {
        product_name: { type: String, required: true },
        product_thumb: { type: String, required: true },
        product_description: { type: String },
        product_slug: { type: String },
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true },
        product_type: {
            type: String,
            required: true,
            enum: ['Electronics', 'Clothing', 'Furniture'],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
        product_attributes: { type: Schema.Types.Mixed, required: true },
        // more
        product_ratingAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must above 1'],
            max: [5, 'Rating must below 5'],
            set: (val) => Math.round(val * 10) / 10,
        },
        product_variations: { type: Array, default: [] },
        isDraft: { type: Boolean, default: true, index: true, select: false },
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
            select: false,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

// Create index for search
productSchema.index({ product_name: 'text', product_description: 'text' });

// Document middleware: run before .save() and .create()...
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true });
    next();
});

const clothingSchema = new Schema(
    {
        brand: { type: String},
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
        manufacturer: { type: String},
        model: { type: String },
        color: { type: String },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        timestamps: true,
        collection: 'electronics',
    }
);

const furnitureSchema = new Schema(
    {
        manufacturer: { type: String},
        model: { type: String },
        color: { type: String },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        timestamps: true,
        collection: 'furnitures',
    }
);

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronics', electronicSchema),
    furniture: model('Furniture', furnitureSchema),
};
