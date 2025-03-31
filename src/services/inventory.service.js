'use strict';

const { BadRequestError } = require('../core/error.response');
const inventory = require('../models/inventory.model');
const { product } = require('../models/product.model');
const { getProductById } = require('../models/repositories/product.repo');
const { convertToObjectIdMongodb } = require('../utils');

class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = 'Cu Da, Cu Khe, Thanh Oai, Ha Noi',
    }) {
        const products = await getProductById(productId);
        if (!products) {
            throw new BadRequestError(`The product does not exists!`);
        }

        const query = {
                inven_productId: convertToObjectIdMongodb(productId),
                inven_shopId: convertToObjectIdMongodb(shopId),
            },
            updateSet = {
                $inc: { inven_stock: stock },
                $set: { inven_location: location },
            },
            options = { upsert: true, new: true };

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;
