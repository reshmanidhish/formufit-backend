const { Schema, model } = require("mongoose");

const recipeSchema = new Schema(
    {
        title: {
            type: String,
            required: true
          },
        image: {
            type: String,
            required: true
          },
        ingredients: {
            type: String,
            required: true
          },
        instructions: {
            type: String,
            required: true
          },
        bodyType: {
            type: String,
            required: true
          },
    }
)

const Recipe = model("Comment", recipeSchema);

module.exports = Recipe;
