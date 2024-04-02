'use strict';

const express = require('express');
const discountController = require('../../controller/discount.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get(
    '/list_product_code',
    asyncHandler(discountController.getAllDiscountCodeWithProduct)
);
// authentication
router.use(authenticationV2);

router.post('', asyncHandler(discountController.createDiscountCode));
router.patch(
    '/:discountId',
    asyncHandler(discountController.updateDiscountCode)
);
router.get('', asyncHandler(discountController.getAllDiscountCodesByShop));
router.delete('/delete', asyncHandler(discountController.deleteDiscountCode));
router.post('/cancel', asyncHandler(discountController.cancelDiscountCode));

module.exports = router;
