import { body } from "express-validator";

const createBlogValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title can only have a maximum of 255 characters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required")
    .isLength({ max: 100 })
    .withMessage("Author can only have a maximum of 100 characters"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be provided as an array list"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
];

const updateBlogValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title can only have a maximum of 255 characters"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
  body("author")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Author is required")
    .isLength({ max: 100 })
    .withMessage("Author can only have a maximum of 100 characters"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be provided as an array list"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
];

export { createBlogValidation, updateBlogValidation };
