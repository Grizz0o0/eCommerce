'use strict';

const { Types } = require('mongoose');
const inventory = require('../inventory.model');
const { convertToObjectIdMongodb } = require('../../utils');
const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = 'unKnown',
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location,
    });
};

const reservationInventory = async ({ productId, cardId, quantity }) => {
    const query = {
            inven_productId: convertToObjectIdMongodb(productId),
            inven_stock: { $gte: quantity },
        },
        updateSet = {
            $inc: {
                inven_stock: -quantity,
            },
            $push: {
                inven_reservations: {
                    quantity,
                    cardId,
                    createOn: new Date(),
                },
            },
        },
        options = {
            upsert: true,
            new: true,
        };

    return await inventory.updateOne(query, updateSet);
};

module.exports = {
    insertInventory,
    reservationInventory,
};
