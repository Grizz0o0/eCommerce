'use strict';

const { unGetSelectData, getSelectData } = require('../../untils/index');

const findAllDiscountCodesUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    model,
    unSelect,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const documents = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean();

    return documents;
};

const findAllDiscountCodesSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    model,
    unSelect,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const documents = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(unSelect))
        .lean();

    return documents;
};

const checkDiscountExists = async ({ model, filter }) => {
    return await model.findOne(filter).lean();
};

const updateDiscountById = async ({
    discount_id,
    model,
    bodyUpdate,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(discount_id, bodyUpdate, {
        new: isNew,
    });
};

module.exports = {
    findAllDiscountCodesSelect,
    findAllDiscountCodesUnSelect,
    checkDiscountExists,
    updateDiscountById,
};
