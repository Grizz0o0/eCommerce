'use strict';
const discount = require('../models/discount.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const {
    convertToObjectIdMongodb,
    updateNestedObjectParser,
    removeUndefinedObject,
} = require('../untils');
const { findAllProducts } = require('../models/repositories/product.repo');
const {
    findAllDiscountCodesSelect,
    checkDiscountExists,
    findAllDiscountCodesUnSelect,
    updateDiscountById,
} = require('../models/repositories/discount.repo');

/*
    Discount Services 
    1- Generator Discount Code [Shop | Admin]
    2- Get Discount Amount [User]
    3- Get all discount codes [user | shop]
    4- Verify discount code [user]
    5- Delete discount code [shop | admin]
    6- Cancel discount code [user]
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            name,
            description,
            type,
            value,
            code,
            start_date,
            end_date,
            max_uses,
            uses_count,
            uses_used,
            max_uses_per_user,
            min_order_value,
            shopId,
            is_active,
            applies_to,
            product_ids,
        } = payload;

        // kiem tra
        // if (
        //     new Date() < new Date(start_date) ||
        //     new Date() > new Date(end_date)
        // ) {
        //     throw new BadRequestError('Discount code has expired!');
        // }

        if (new Date(start_date) >= new Date(end_date))
            throw new BadRequestError('Start date must be before end_date');

        // create index for discount code
        const fountDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (fountDiscount && fountDiscount.discount_is_active)
            throw new BadRequestError('Discount exists!');

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: start_date,
            discount_end_date: end_date,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_uses_used: uses_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode({ discount_id, bodyUpdate }) {
        const objectParams = removeUndefinedObject(bodyUpdate);
        const updateDiscount = await updateDiscountById({
            discount_id,
            bodyUpdate: updateNestedObjectParser(objectParams),
            model: discount,
        });

        return updateDiscount;
    }

    /*
        get all discount codes available with products
    */
    static async getAllDiscountCodeWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        const fountDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (!fountDiscount && fountDiscount.discount_is_active)
            throw new NotFoundError('Discount not exists!');

        const { discount_applies_to, discount_product_ids } = fountDiscount;

        let products;
        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            });
        }

        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            });
        }

        return products;
    }

    /* 
        get all discount codes of shop
    */
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount,
        });

        return discounts;
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const fountDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });
        if (!fountDiscount) throw new NotFoundError('Discount expired!');

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_uses_used,
            discount_start_date,
            discount_end_date,
            discount_type,
            discount_value,
        } = fountDiscount;

        if (!discount_is_active) throw new NotFoundError('Discount expired!');
        if (!discount_max_uses) throw new NotFoundError('Discount are out!');

        // if (
        //     new Date() < new Date(discount_start_date) ||
        //     new Date() > new Date(discount_end_date)
        // ) {
        //     throw new NotFoundError('Discount ecode has expired');
        // }

        // check xem co gia tri toi thieu hay khong?
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            if (totalOrder < discount_min_order_value)
                throw new NotFoundError(
                    `discount requires a minimum order value of ${discount_min_order_value}`
                );
        }

        if (discount_max_uses_per_user > 0) {
            const userUsesDiscount = discount_uses_used.find(
                (user) => user.userId === userId
            );

            if (userUsesDiscount) {
                // ...
            }
        }

        // check xem discount la fix-amount hay percentage
        const amount =
            discount_type === 'fixed_amount'
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId),
        });

        return deleted;
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const fountDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
            },
        });

        if (!fountDiscount) throw new NotFoundError(`discount doesn't exist`);

        const result = await discount.findByIdAndUpdate(fountDiscount._id, {
            $pull: {
                discount_uses_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
