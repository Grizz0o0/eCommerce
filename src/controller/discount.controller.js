'use strict';

const DiscountService = require('../services/discount.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new CREATED({
            massage: 'Create DiscountCode success!',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    updateDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Update DiscountCode success!',
            metadata: await DiscountService.updateDiscountCode({
                discount_id: req.params.discountId,
                bodyUpdate: req.body,
            }),
        }).send(res);
    };

    getAllDiscountCodeWithProduct = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Discount Code With Product Success!',
            metadata: await DiscountService.getAllDiscountCodeWithProduct({
                ...req.query,
            }),
        }).send(res);
    };

    getAllDiscountCodesByShop = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Discount Codes By Shop Found!',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get Discount Amount Success!',
            metadata: await DiscountService.getDiscountAmount({ ...req.body }),
        }).send(res);
    };

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Delete Discount Success!',
            metadata: await DiscountService.deleteDiscountCode({ ...req.body }),
        }).send(res);
    };

    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Cancel Discount Success!',
            metadata: await DiscountService.cancelDiscountCode({ ...req.body }),
        }).send(res);
    };
}

module.exports = new DiscountController();
