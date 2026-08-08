import "dotenv/config";
import express from "express";
import { successMessage } from "./utils/apiResponse.js";
import { connectDB } from "./config/database.js";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "./controllers/blogController.js";
import {
  createBlogValidation,
  updateBlogValidation,
} from "./validators/blogValidator.js";
import { blogRoute } from "./routes/blogRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/blogs", blogRoute);

app.get("/", (req, res) => {
  return successMessage(res, "Welcome to my Personal Blog API");
});

app.post("/api/blogs", createBlogValidation, createBlog);
app.get("/api/blogs", getAllBlogs);
app.get("/api/blogs/:id", getBlogById);
app.put("/api/blogs/:id", updateBlogValidation, updateBlog);
app.delete("/api/blogs/:id", deleteBlog);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
