'use strict';

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Create Product Success!',
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            massage: 'publishProductByShop Success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            massage: 'unPublishProductByShop Success!',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    // QUERY //
    /**
     * @desc Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllDraftForShop = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Drafts Success!',
            metadata: await ProductServiceV2.findAllDraftForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Published Success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get List Search Products Success!',
            metadata: await ProductServiceV2.searchProducts(req.params),
        }).send(res);
    };

    getAllProducts = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get All Products Success!',
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res);
    };

    GetProduct = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Get Product Success!',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id,
            }),
        }).send(res);
    };
    // END QUERY //
}

module.exports = new ProductController();
