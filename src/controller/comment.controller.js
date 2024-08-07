'use strict';

const { SuccessResponse } = require('../core/success.response');
const CommentService = require('../services/comment.service');

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await CommentService.createComment(req.body),
        }).send(res);
    };

    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get comment',
            metadata: await CommentService.getCommentById(req.query),
        }).send(res);
    };
}

module.exports = new CommentController();
