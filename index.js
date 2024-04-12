const express = require("express");
const ccxt = require("ccxt");
const { DateTime } = require("luxon");
const math = require("mathjs");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3000;

const INVESTMENT_AMOUNT_DOLLARS = 100;
const MIN_PROFIT_DOLLARS = 0.7;
const BROKERAGE_PER_TRANSACTION_PERCENT = 0.2;

// const apiKey = "YOUR_API_KEY";
// const secret = "YOUR_SECRET";
const exchange = new ccxt.bybit();
let CombinationData = {};
const { getCryptoCombinations } = require("./Combinations");
const { sleep, performTriangularArbitrage } = require("./bot1");
const { Combination } = require("./db");

let action = false;

async function bot() {
  let i = 0;
  action = true;
  while (action) {
    if (Array.isArray(CombinationData)) {
      for (const combination of CombinationData) {
        const base = combination["base"];
        const intermediate = combination["intermediate"];
        const ticker = combination["ticker"];

        const s1 = `${intermediate}/${base}`; // Eg: BTC/USDT
        const s2 = `${ticker}/${intermediate}`; // Eg: ETH/BTC
        const s3 = `${ticker}/${base}`; // Eg: ETH/USDT

        // Check triangular arbitrage for buy-buy-sell
        console.log("BUY_BUY_SELL");
        await performTriangularArbitrage(
          s1,
          s2,
          s3,
          "BUY_BUY_SELL",
          INVESTMENT_AMOUNT_DOLLARS,
          BROKERAGE_PER_TRANSACTION_PERCENT,
          MIN_PROFIT_DOLLARS
        );

        await sleep(1000);
        console.log("--------------------------!!!!!!!!!!----------------");
        console.log("BUY_SELL_SELL");
        await performTriangularArbitrage(
          s3,
          s2,
          s1,
          "BUY_SELL_SELL",
          INVESTMENT_AMOUNT_DOLLARS,
          BROKERAGE_PER_TRANSACTION_PERCENT,
          MIN_PROFIT_DOLLARS
        );
        await sleep(1000);
        console.log("--------------------------!!!!!!!!!!----------------");
      }
    } else {
      console.error("CombinationsUSDT is not an array");
    }
  }
}

app.get("/load", async (req, res) => {
  try {
    const markets = await exchange.loadMarkets();
    const marketSymbols = Object.keys(markets);

    const CombinationsUSDT = getCryptoCombinations(marketSymbols, "USDT");
    await Combination.deleteMany({});
    await Combination.insertMany(CombinationsUSDT);
    res.status(200).json({ msg: "Combinations Successfully saved" });
  } catch (err) {
    console.log("Error", err);
  }
});

app.get("/run", async (req, res) => {
  try {
    CombinationData = await Combination.find();

    const data = await bot();
    console.log("data--", data);
    res.status(200).json({ msg: "Process Started..." });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

app.get("/stop", (req, res) => {
  action = false;
  console.log("action false");
  res.status(200).json({ msg: "Process Terminated..." });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
