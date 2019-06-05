const fetch = require("cross-fetch");

const Stock = require("../models/stock");
const errorTypes = require("../controllers/error_types");


const StockController = {
    queryExternApi: (ip,stock,doLike) =>{
        return fetch("https://api.worldtradingdata.com/api/v1/stock?symbol=" + stock + "&api_token=" + process.env.WORLDTRADINGDATA_API_KEY, {
            method: "get"
        })
            .then(res => res.json())
            .then(data => {

                let update = {
                    $set: {
                        price: data.data[0].price
                    }
                };
                if(doLike) update["$addToSet"] = {
                    likes: ip
                };

                return Stock.findOneAndUpdate({ name: stock },
                    update,
                    {
                        upsert: true, //si no existe el documento, lo creamos
                        new: true //devolvemos el objeto ya actualizado
                    });
            });
    },

    getStockPrices: (req, res, next) => {
        let doLike;
        if (!req.query.stock)
            throw new errorTypes.Error400("stock parameter is required.");
        if (!req.query.like)
            doLike = false;
        else
            doLike = req.query.like;

        let stock = req.query.stock;
        let ip = req.connection.remoteAddress || req.headers["x-forwarded-for"].split(",")[0];

        if (!Array.isArray(stock)){
            StockController.queryExternApi(ip, stock, doLike)
                .then(data => {
                    let stockData = {
                        stock: data.name,
                        price: data.price,
                        likes: data.likes.length
                    };

                    res.json({
                        stockData: stockData
                    });
                })
                .catch(err => next(err));
        }
        else {
            let result = [];
            StockController.queryExternApi(ip, stock[0], doLike)
                .then(data => {
                    result.push({
                        stock: data.name,
                        price: data.price,
                        rel_likes: data.likes.length
                    });
                })
                .then(()=>StockController.queryExternApi(ip, stock[1], doLike))
                .then(data => {
                    result.push({
                        stock: data.name,
                        price: data.price,
                        rel_likes: data.likes.length
                    });
                })
                .then(()=>{
                    let aux = result[0]["rel_likes"];
                    result[0]["rel_likes"] -= result[1]["rel_likes"];
                    result[1]["rel_likes"] -= aux;
                    res.json({
                        stockData: result
                    });
                })
                .catch(err => next(err));
        }
    }
};


module.exports = StockController;