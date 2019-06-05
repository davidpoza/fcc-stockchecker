/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require("chai-http");
const chai     = require("chai");
const assert   = chai.assert;
chai.use(chaiHttp);

const server = require("../server");
const Stock  = require("../models/stock");


function myTeardown(done){
    Stock.deleteMany({})
        .then(()=>done())
        .catch(err=>done(err));
}

suite("Functional Tests", function() {

    suite("GET /api/stock-prices => stockData object", function() {
        teardown(myTeardown); //borramos base de datos despues de cada test

        test("1 stock", function(done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({stock: "goog"})
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isObject(res.body.stockData, "result is an object");
                    assert.property(res.body.stockData, "stock", "result object has property stock");
                    assert.property(res.body.stockData, "price", "result object has property price");
                    assert.property(res.body.stockData, "likes", "result object has property likes");
                    assert.equal(res.body.stockData.likes, 0, "likes are zero");
                    done();
                })
                .catch(err=>done(err));
        });

        test("1 stock with like", function(done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({stock: "goog", like: true})
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isObject(res.body.stockData, "result is an object");
                    assert.property(res.body.stockData, "likes", "result object has property likes");
                    assert.equal(res.body.stockData.likes, 1, "likes are only one");
                    done();
                })
                .catch(err=>done(err));
        });

        test("1 stock with like again (ensure likes arent double counted)", function(done) {
            chai.request(server)
                .get("/api/stock-prices")
                .query({stock: "goog", like: true})
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isObject(res.body.stockData, "result is an object");
                    assert.property(res.body.stockData, "likes", "result object has property likes");
                    assert.equal(res.body.stockData.likes, 1, "theare are only one like");
                    return Promise.resolve();
                })
                .then(()=>{
                    return chai.request(server)
                        .get("/api/stock-prices")
                        .query({stock: "goog", like: true});
                })
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isObject(res.body.stockData, "result is an object");
                    assert.property(res.body.stockData, "likes", "result object has property likes");
                    assert.equal(res.body.stockData.likes, 1, "likes still are only one");
                    done();
                })
                .catch(err=>done(err));
        });

        test("2 stocks", function(done) {
            chai.request(server)
                .get("/api/stock-prices?stock=goog&stock=msft")
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isArray(res.body.stockData, "result is an array");
                    assert.equal(res.body.stockData.length, 2, "array resulting has a length of 2");
                    assert.property(res.body.stockData[0], "rel_likes", "first object has property rel_likes");
                    assert.property(res.body.stockData[1], "rel_likes", "second object has property rel_likes");
                    done();
                })
                .catch(err=>done(err));
        });

        test("2 stocks with like", function(done) {
            chai.request(server)
                .get("/api/stock-prices?stock=goog&stock=msft&like=true")
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isArray(res.body.stockData, "result is an array");
                    assert.equal(res.body.stockData.length, 2, "array resulting has a length of 2");
                    assert.property(res.body.stockData[0], "rel_likes", "first object has property rel_likes");
                    assert.property(res.body.stockData[1], "rel_likes", "second object has property rel_likes");
                    assert.equal(res.body.stockData[0].rel_likes, 0, "relative likes for first object must be zero");
                    assert.equal(res.body.stockData[1].rel_likes, 0, "relative likes for second object must be zero");
                    return Promise.resolve();
                })
                .then(()=>{
                    return chai.request(server)
                        .get("/api/stock-prices?stock=goog&stock=msft&like=true");
                })
                .then((res)=>{
                    assert.equal(res.status,200, "must return 200");
                    assert.isArray(res.body.stockData, "result is an array");
                    assert.equal(res.body.stockData.length, 2, "array resulting has a length of 2");
                    assert.property(res.body.stockData[0], "rel_likes", "first object has property rel_likes");
                    assert.property(res.body.stockData[1], "rel_likes", "second object has property rel_likes");
                    assert.equal(res.body.stockData[0].rel_likes, 0, "relative likes for first object still must be zero");
                    assert.equal(res.body.stockData[1].rel_likes, 0, "relative likes for second object still must be zero");
                    done();
                })
                .catch(err=>done(err));

        });

    });

});
