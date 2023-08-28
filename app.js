require("dotenv").config();
require("./db");
const express = require("express");

const app = express();

const { isAuthenticated } = require("./middlewares/jwt.middleware");

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

const recipeRouter = require("./routes/recipe.routes");
app.use("/recipes", recipeRouter);

const profileRouter = require("./routes/profile.routes");
app.use("/profile", isAuthenticated, profileRouter);

const commentRouter = require("./routes/comment.routes");
app.use("/comment", isAuthenticated, commentRouter);


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
