import "dotenv/config";
import express from "express";
import { successMessage } from "./utils/apiResponse.js";
import { connectDB } from "./config/database.js";
import blogRoute from "./routes/blogRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/blogs", blogRoute);

app.get("/", (req, res) => {
  return successMessage(res, "Welcome to my Personal Blog API");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
