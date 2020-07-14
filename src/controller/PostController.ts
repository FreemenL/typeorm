import { Request } from "express";
import { validate } from "class-validator";

import {User} from "../entity/User";
import { Post } from "../entity/Post";
import { Comment } from "../entity/Comment";
import { throwInputError,throwActionNotAllowedError } from "../utils/throwError";

export class PostController {
    /**
     * Show all posts
     *
     * @Method GET
     * @URL /api/posts
     *
    */
    async all(req: Request) {
      let { current, pageSize } = req.query as any;

      [current, pageSize] = [+current, +pageSize];
      const count = await Post.count();
      // take limit 
      // skip offset
      const data = await Post.findAndCount({
        take: pageSize,
        skip: (current - 1) * pageSize,
      });
      const result =  data[0];
      return { result, count }
    }
    
    async one(request: Request) { 
      return await Post.findOneOrFail(request.params.id, {
        relations: ["comments"]
      });
    }

    async create(req: Request) {
      const { body } = req.body;
      const currentUser = req.currentUser as User;

      let post = new Post();
      post.body = body;
      post.user = currentUser;

      const errors = await validate(post);

      if (errors.length > 0) {
        throwInputError(errors, "Post input error");
      }

      return await Post.save(post);
    }

  /**
   * Update post
   *
   * @Method PUT
   * @URL /api/posts/:id
   *
   */
  async update(req: Request): Promise<Post> {
    const { body } = req.body;
    const post = await Post.findOneOrFail(req.params.id);
    post.body = body;

    const currentUser = req.currentUser as User;

    const errors = await validate(post);

    if (errors.length > 0) {
      throwInputError(errors, "Post input error");
    }

    if (post.user.id !== currentUser.id) {
      throwActionNotAllowedError();
    }

    return await Post.save(post);
  }
  /**
   * Delete post
   *
   * @Method DELETE
   * @URL /api/posts/:id
   *
   */
  async remove(req: Request) {
    const post = await Post.findOneOrFail(req.params.id);
    const currentUser = req.currentUser as User;

    if (post.user.id !== currentUser.id) {
      throwActionNotAllowedError();
    }

    await Post.remove(post);
    return { message: "deleted sucessfully" };
  }
  /**
   * Create comment for post
   *
   * @Method POST
   * @URL /api/posts/:id/comments 
   *
   */
  async createComment(req: Request): Promise<Comment> {
    const currentUser = req.currentUser as User;
    const { body } = req.body;
    const post = await Post.findOneOrFail(req.params.id);

    let comment = new Comment();
    comment.body = body;
    comment.user = currentUser;
    comment.post = post;

    const errors = await validate(comment);

    if (errors.length > 0) {
      throwInputError(errors, "Comment input error");
    }

    return await Comment.save(comment);
  }
  /**
   * 删除评论
   *
   * @Method DELETE
   * @URL /api/posts/comments/:id
   *
   */
  async removeComment(req: Request) {
    const comment = await Comment.findOneOrFail(req.params.id);
    console.log('comment :>> ', comment);
    const currentUser = req.currentUser as User;

    if (comment.user.id !== currentUser.id) {
      throwActionNotAllowedError();
    }

    await Comment.remove(comment);
    return { message: "deleted sucessfully" };
  }

}