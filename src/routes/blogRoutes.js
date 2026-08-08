import express from "express";
import {
  createBlogValidation,
  updateBlogValidation,
} from "../validators/blogValidator.js";
import {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.post("/", createBlogValidation, createBlog);
router.get("/", getAllBlogs);
router.get("/:slug", getBlog);
router.patch("/:id", updateBlogValidation, updateBlog);
router.delete("/:id", deleteBlog);

export default router;
