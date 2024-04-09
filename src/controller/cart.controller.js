'use strict';

const CartService = require('../services/cart.service');
const { SuccessResponse } = require('../core/success.response');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Create New Cart Success',
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };

    update = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Create New Cart Success',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    };

    delete = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Delete Cart Success',
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Cart Success',
            metadata: await CartService.getListUserCart(req.body),
        }).send(res);
    };
}

module.exports = new CartController();
