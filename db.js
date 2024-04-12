const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(`mongodb+srv://bot:${process.env.DB_KEY}@bot.zszeh7e.mongodb.net/`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const Schema = mongoose.Schema;

const combinationSchema = new Schema({
  base: String,
  intermediate: String,
  ticker: String,
});

const ProfitLossSchema = new mongoose.Schema({
  profitLoss: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  arbitrageType: {
    type: String,
    required: true,
  },
  scrip1: {
    type: String,
    required: true,
  },
  scrip2: {
    type: String,
    required: true,
  },
  scrip3: {
    type: String,
    required: true,
  },
});

const ProfitLossData = mongoose.model("ProfitLoss", ProfitLossSchema);

const Combination = mongoose.model("Combination", combinationSchema);

module.exports = {
  Combination,
  ProfitLossData,
};
