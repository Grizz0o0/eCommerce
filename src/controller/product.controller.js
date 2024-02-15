'use strict';

const ProductService = require('../services/product.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class ProductController {
    createProducts = async (req, res, next) => {
        new SuccessResponse({
            massage: 'Create Product Success!',
            metadata: await ProductService.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };
}

module.exports = new ProductController();