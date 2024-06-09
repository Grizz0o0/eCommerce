'use strict';

const { findCartById } = require('../models/repositories/cart.repo');
const { getDiscountAmount } = require('../services/discount.service');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { acquireLock, releaseLock } = require('./redis.service');
const order = require('../models/order.model');
class CheckoutService {
    // login and without login
    /*
        {
            cartId, 
            userId, 
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shop_discounts: [
                        {
                            "shopId",
                            "discountId",
                            `codeId
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        // check cartId co ton tai ?
        const foundCard = await findCartById(cartId);
        if (!foundCard) throw new BadRequestError(`Cart doesn't exists !`);

        const checkout_order = {
                totalPrice: 0, // tong tien hang
                feeShip: 0, // phi van chuyen
                totalDiscount: 0, // tong tien discount giam gia
                totalCheckout: 0, // tong thanh toan
            },
            shop_order_ids_new = [];

        // tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];
            // check product available
            const checkProductServer = await checkProductByServer(
                item_products
            );

            if (!checkProductServer[0])
                throw new BadRequestError(`order wrong !`);

            // tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            // tong tien truoc khi xu ly
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            // Neu shop_discounts ton tai > 0, ktra xem co hop le khong
            if (shop_discounts.length > 0) {
                const { totalPrice = 0, discount = 0 } =
                    await getDiscountAmount({
                        codeId: shop_discounts[0].codeId,
                        userId,
                        shopId,
                        products: checkProductServer,
                    });
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount;
                // Neu giam gia > 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }
            // tong tien thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }

    // order
    static async orderbyUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await CheckoutService.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
            });

        // check lai mot lan nua co vuot ton kho hay khong ?
        const products = await shop_order_ids_new.flatMap(
            (order) => order.item_products
        );
        console.log(`[1]::: ${products}`);
        const acquireProduct = [];
        for (let i = 0; i < product.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // check if co mot san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError(
                'Mot so san pham da duoc cap nhat, vui long quay lai gio hang ...'
            );
        }
        const newOder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        });

        // truong hop neu insert thanh cong , thi remove product co trong cart
        if (newOder) {
            // remove product in my cart
        }
        return newOder;
    }

    /*
        Query Orders [Users]
    */
    static async getOrdersByUser() {}

    /*
        Query Orders Using Id [Users]
    */
    static async getOneOrdersByUser() {}

    /*
        Cancel Orders [Users]
    */
    static async cancelOrdersByUser() {}

    /*
        Update Orders Status [Shop | Admin]
    */
    static async updateOrdersStatusByShop() {}
}

module.exports = CheckoutService;
