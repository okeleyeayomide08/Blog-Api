import { validationResult } from "express-validator";
import { Blog } from "../models/Blog.js";
import { generateSlug } from "../utils/slug.js";
import { successMessage, errorMessage } from "../utils/apiResponse.js";
import { where, Op } from "sequelize";

const createBlog = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return errorMessage(res, error.array()[0].msg, 422);
    }

    const { title, content, author, tags, status } = req.body;

    const baseSlug = generateSlug(title);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await Blog.findOne({ where: { slug: uniqueSlug } });

      if (!existing) {
        break;
      }

      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const publishedAt = status === "published" ? new Date() : null;

    const blog = await Blog.create({
      title,
      slug: uniqueSlug,
      content,
      author,
      tags,
      status,
      publishedAt,
    });

    return successMessage(res, "Blog created successfully", blog, 201);
  } catch (error) {
    next(error);
  }
};

const getAllBlogs = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const where = {};

    if (status) {
      where.status = status;
    }

    const { rows, count } = await Blog.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return successMessage(res, "Blogs fetched successfully", {
      total: count,
      page: pageNumber,
      totalPages: Math.ceil(count / pageSize),
      blogs: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ where: { slug } });

    if (!blog) {
      return errorMessage(res, "Blog doesn't exist", 404);
    }

    return successMessage(res, "Blog fetched successfully", blog);
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return errorMessage(res, error.array()[0].msg);
    }

    const { id } = req.params;

    const blog = await Blog.findOne({ where: { id } });
    if (!blog) {
      return errorMessage(res, "Blog doesn't exist", 404);
    }

    const { title, content, author, tags, status } = req.body;

    let newSlug = blog.slug;

    if (title) {
      const baseSlug = generateSlug(title);
      newSlug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await Blog.findOne({
          where: { slug: newSlug, id: { [Op.ne]: id } },
        });

        if (!existing) {
          break;
        }

        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    let publishedAt = blog.publishedAt;

    if (status === "published" && blog.status === "draft") {
      publishedAt = new Date();
    }

    if (status === "draft" && blog.status === "published") {
      publishedAt = null;
    }

    await blog.update({
      title: title || blog.title,
      slug: newSlug,
      content: content || blog.content,
      author: author || blog.author,
      tags: tags || blog.tags,
      status: status || blog.status,
      publishedAt,
    });

    return successMessage(res, "Blog updated successfully", blog);
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ where: { id } });

    if (!blog) {
      return errorMessage(res, "Blog doesn't exist", 404);
    }

    await blog.destroy();

    return successMessage(res, "Blog deleted successfully");
  } catch (error) {
    next(error);
  }
};

export { createBlog, getAllBlogs, getBlog, updateBlog, deleteBlog };
