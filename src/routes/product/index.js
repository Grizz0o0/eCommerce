'use strict';

const express = require('express');
const productController = require('../../controller/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get(
    '/search/:keySearch',
    asyncHandler(productController.getListSearchProduct)
);

router.get('', asyncHandler(productController.getAllProducts));
router.get('/:product_id', asyncHandler(productController.getProduct));

// authentication
router.use(authentication);
///////////////////

router.post('', asyncHandler(productController.createProduct));
router.patch('/:productId', asyncHandler(productController.updateProduct));
router.delete('/:productId', asyncHandler(productController.deleteProduct));
router.post(
    '/publish/:id',
    asyncHandler(productController.publishProductByShop)
);
router.post(
    '/unpublish/:id',
    asyncHandler(productController.unPublishProductByShop)
);

// QUERY //
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop));
router.get(
    '/published/all',
    asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
