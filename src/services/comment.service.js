'use strict';

const { NotFoundError } = require('../core/error.response');
const Comment = require('../models/comment.model');
const { convertToObjectIdMongodb } = require('../untils');
const { findProduct } = require('../models/repositories/product.repo');

/**
  Key features: Comment Service
  + add comment [User, Shop]
  + get a list of comments [User, Shop]
  + delete a comment [User | Shop | Admin]
 */

class CommentService {
    static async createComment({
        productId,
        userId,
        content,
        parentCommentId,
    }) {
        const comment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        });

        let rightValue;
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment)
                throw new Notification(`Parent Comment not found!`);

            rightValue = parentComment.comment_right;

            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_right: { $gte: rightValue },
                },
                {
                    $inc: { comment_right: 2 },
                }
            );

            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_left: { $gt: rightValue },
                },
                {
                    $inc: { comment_left: 2 },
                }
            );
        } else {
            const maxRightValue = await Comment.findOne(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                },
                'comment_right',
                { sort: { comment_right: -1 } }
            );

            if (maxRightValue) {
                rightValue = maxRightValue.rightValue + 1;
            } else {
                rightValue = 1;
            }
        }

        // insert to comment
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;
        await comment.save();
        return comment;
    }

    static async getCommentById({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0,
    }) {
        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent)
                throw new NotFoundError(`Not found comment for product`);

            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right },
            })
                .select({
                    comment_left: 1,
                    comment_right: 1,
                    comment_content: 1,
                    comment_parentId: 1,
                })
                .sort({
                    comment_left: 1,
                });
            return comments;
        }

        const comments = await Comment.find({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_parentId: parentCommentId,
        })
            .select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1,
            })
            .sort({
                comment_left: 1,
            });
        return comments;
    }

    static async deleteComments({ commentId, productId }) {
        const foundProduct = await findProduct({
            product_id: productId,
        });

        if (foundProduct) throw new NotFoundError(`Product not found`);
        // Xac dinh gia tri left va right cua commentId
        const comment = await Comment.findById(commentId);
        if (comment) throw new NotFoundError(`Comment not found`);

        const rightValue = comment.comment_right;
        const leftValue = comment.comment_left;
        // Tinh width
        const width = rightValue - leftValue + 1;
        // Xoa tat ca commentId con
        await Comment.deleteMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue },
        });
        // Cao nhat gia tri left va right con lai
        await Comment.updateMany(
            {
                comment_productId: convertToObjectIdMongodb(productId),
                comment_right: { $gt: rightValue },
            },
            {
                $inc: { comment_right: -width },
            }
        );

        await Comment.updateMany(
            {
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: rightValue },
            },
            {
                $inc: { comment_left: -width },
            }
        );
    }
}

module.exports = CommentService;
