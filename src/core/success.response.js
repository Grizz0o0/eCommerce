'use strict';

const StatusCode = {
    OK: 200,
    CREATED: 201,
};

const ReasonStatusCode = {
    OK: 'Success',
    CREATED: 'Created',
};

class SuccessResponse {
    constructor({
        massage,
        statusCode = StatusCode.OK,
        reasonStatusCode = ReasonStatusCode.OK,
        metadata = {},
    }) {
        this.massage = !massage ? reasonStatusCode : massage;
        this.statusCode = statusCode;
        this.metadata = metadata;
    }

    send(res, header = {}) {
        return res.status(this.statusCode).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ massage, metadata }) {
        super({ massage, metadata });
    }
}

class CREATED extends SuccessResponse {
    constructor({
        options = {},
        massage,
        statusCode = StatusCode.CREATED,
        reasonStatusCode = ReasonStatusCode.CREATED,
        metadata,
    }) {
        super({ massage, statusCode, reasonStatusCode, metadata });
        this.options = options;
    }
}

module.exports = {
    OK,
    CREATED,
    SuccessResponse,
};
