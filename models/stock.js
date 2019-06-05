"use strict";

var mongoose       = require("mongoose");
var Schema         = mongoose.Schema;


var StockSchema = Schema({
    name: {type: String, required: true},
    likes: {type: [String], required: true},
    price: Number
});

module.exports = mongoose.model("Stock", StockSchema, "stocks");