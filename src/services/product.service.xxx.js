'use strict';

const {
    clothing,
    electronic,
    furniture,
    product,
} = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require('../models/repositories/product.repo');

const {
    removeUndefinedObject,
    updateNestedObjectParser,
} = require('../untils/index');
const { insertInventory } = require('../models/repositories/inventory.repo');

/*
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
*/
class ProductFactory {
    /**
     * type : 'Clothing',
     * payload
     */
    static productRegistry = {}; // key-class

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass)
            throw new BadRequestError(`Invalid Product Types::: ${type}`);

        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass)
            throw new BadRequestError(`Invalid Product Types::: ${type}`);

        return new productClass(payload).updateProduct(productId);
    }

    // PUT //
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
    // END PUT //

    // query
    static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftForShop({ query, limit, skip });
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishForShop({ query, limit, skip });
    }

    static async searchProducts({ keySearch = '' }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = { isPublished: true },
        select = ['product_name', 'product_thumb', 'product_price'],
    }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select,
        });
    }

    static async findProduct({
        product_id,
        unselect = ['__v', 'product_variations'],
    }) {
        return await findProduct({ product_id, unselect });
    }
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id });

        if (newProduct) {
            insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            });
        }
        return newProduct;
    }

    // update product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({
            productId,
            bodyUpdate,
            model: product,
        });
    }
}

// define sub-class for different product types Electronics
class ElectronicsProduct extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic)
            throw new BadRequestError('Create new Electronic error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');
        return newProduct;
    }

    async updateProduct(productId) {
        /**
            {
                a: undefined,
                b: null
            }

            1. remove attr has undefined null
            2. check xem update o cho nao ?
         */

        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: electronic,
            });
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updateProduct;
    }
}

// define sub-class for different product types Clothing
class ClothingsProduct extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError('Create new Clothing error');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }

    async updateProduct(productId) {
        /**
            {
                a: undefined,
                b: null
            }

            1. remove attr has undefined null
            2. check xem update o cho nao ?
         */
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: clothing,
            });
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updateProduct;
    }
}

class FurnitureProduct extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError('Create new Furniture error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }

    async updateProduct(productId) {
        /**
            {
                a: undefined,
                b: null
            }

            1. remove attr has undefined null
            2. check xem update o cho nao ?
         */
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: furniture,
            });
        }

        const updateProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updateProduct;
    }
}

// register product type
ProductFactory.registerProductType('Electronics', ElectronicsProduct);
ProductFactory.registerProductType('Clothing', ClothingsProduct);
ProductFactory.registerProductType('Furniture', FurnitureProduct);

module.exports = ProductFactory;
