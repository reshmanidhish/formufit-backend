const Recipe = require("../models/Recipe.model");
const Comment = require ("../models/Comment.model");
const router = require("express").Router();

const fileUploader = require("../config/cloudinary.config");
const { isAuthenticated } = require("../middlewares/jwt.middleware.js");

//isadmin middleware

const isAdmin = (req, res, next) => {
  // we're using ut to indicate admin role in the JWT payload
  if (req.user && req.user.ut === 1) {
    next();
  } else {
    res.status(403).json({ error: "Admin authorization required" });
  }
};

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const {bodyType, ut} = req.payload;
    const requestPayload = (ut === 1) ? {} : {bodyType}

    const recipes = await Recipe.find(requestPayload);
    res.status(200).json(recipes);
  } catch (error) {
    console.log("error fetching recipes", error);
    res.status(500).json({ error: "Error fetching recipes" });
  }
});

router.post("/create", fileUploader.single("recipeImage"), (req, res) => {
  const { title, ingredients, instructions, bodyType } = req.body;
  const recipeImage = req.file ? req.file.path : null; // Assign the path of the uploaded file
  console.log("file is:", req.file);
  if (!recipeImage) {
    return res.status(400).json({ error: "No photo uploaded!" });
  }

  // Insert the recipes into the database
  Recipe.create({ title, recipeImage, ingredients, instructions, bodyType })
    .then((createdRecipes) => {
      console.log("Recipes created:", createdRecipes);
      res.status(201).json(createdRecipes);
    })
    .catch((error) => {
      console.error("Error creating recipes:", error);
      res.status(500).json({ error: "Error creating recipe" });
    });
});

router.get("/:recipeId", isAuthenticated, async (req, res) => {
  try {
    const { recipeId } = req.params;

    const singleRecipe = await Recipe.findById(recipeId);
    if (!singleRecipe) {
      res.status(404).json({ message: "Recipe not found" });
    }
    const comments = await Comment.find({recipe: recipeId})
    .populate("user");
    res.status(200).json({singleRecipe, comments});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/edit/:recipeId",
  fileUploader.single("recipeImage"),
  (req, res) => {
    const recipeId = req.params.recipeId;
    const { title, ingredients, instructions, bodyType } = req.body;

    const updatedForm = {
      title,
      recipeImage: req.file ? req.file.path : undefined,
      ingredients,
      instructions,
      bodyType,
    };

    Recipe.findByIdAndUpdate(recipeId, updatedForm, { new: true })
      .then((updatedRecipe) => {
        if (!updatedRecipe) {
          return res.status(404).json({ message: "Recipe not found" });
        }
        res.json({ updatedRecipe });
      })
      .catch((err) => console.error(err));
  }
);

router.delete("/delete/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;

  Recipe.findByIdAndDelete(recipeId)
    .then((deletedRecipe) => {
      if (!deletedRecipe) {
        return res.status(404).json({ message: "recipe not found" });
      }
      res.json({ message: "Recipe deleted successfully" });
    })
    .catch((err) => console.error(err));
});




module.exports = router;
