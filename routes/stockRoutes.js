const express = require("express");
const router = express.Router()
const stockController = require("../controllers/stockController")

router.post("/importStocks", stockController.importStocks)

router
    .route("/")
    .get(stockController.getStocksData)
    .post(stockController.createStock)

router
    .route("/:id")
    .put(stockController.updateStocks)
    .delete(stockController.deleteStockData)
    
module.exports = router
