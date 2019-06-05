"use strict";

const StockController = require("../controllers/stock");


module.exports = function (app) {

    app.route("/api/stock-prices")
        .get(StockController.getStockPrices);

};
