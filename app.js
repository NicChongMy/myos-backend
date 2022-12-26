"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// import { firestore } from 'firebase-admin';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
/** Start -- Connection Firebase database **/
var admin = require('firebase-admin');
var getFirestore = require('firebase-admin/firestore').getFirestore;
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
/** End -- Connection Firebase database **/
app.post('/fetch-product-lists', urlencodedParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestBody, resultBody;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestBody = req.body;
                return [4 /*yield*/, fullTextSearchAPI(requestBody)];
            case 1:
                resultBody = _a.sent();
                res.send({ status: 200, data: resultBody });
                return [2 /*return*/];
        }
    });
}); });
app.post('/add-to-cart', urlencodedParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestBody, resultBody;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestBody = req.body;
                return [4 /*yield*/, addProductsToCart(requestBody)];
            case 1:
                resultBody = _a.sent();
                res.send({ status: 200, data: { input: resultBody } });
                return [2 /*return*/];
        }
    });
}); });
app.post('/create-order', urlencodedParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestBody, resultBody;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestBody = req.body;
                return [4 /*yield*/, createOrder(requestBody)];
            case 1:
                resultBody = _a.sent();
                res.send({ status: 200, data: resultBody });
                return [2 /*return*/];
        }
    });
}); });
function fullTextSearchAPI(requestBody) {
    var sortBy = requestBody.sortBy || '';
    var searchBy = requestBody.searchBy || 'title';
    var searchText = requestBody.searchText || '';
    var algoliasearch = require('algoliasearch');
    var client = algoliasearch('JQ1SF32KZ0', '241199636211185260d3bc65099fd308');
    var index = client.initIndex('productCatalog');
    return index
        .search(searchText, {
        restrictSearchableAttributes: [searchBy]
    })
        .then(function (_a) {
        var hits = _a.hits;
        if (sortBy) {
            return productListingSorting(hits, sortBy);
        }
        else {
            return hits;
        }
    })["catch"](function (err) {
        console.log(err);
    });
}
/**
 * @param resultList - related search result list
 * @param sortBy - price low to high, price high to low, other method can be added here as well eg, rating low to high, rating high to low
 * @returns sorted product listing
 */
function productListingSorting(resultList, sortBy) {
    var _ = require('lodash');
    if (sortBy === 'priceDESC') {
        return _.orderBy(resultList, ['price'], ['desc']);
    }
    else if (sortBy === 'priceASC') {
        return _.orderBy(resultList, ['price'], ['asc']);
    }
    else {
        return resultList;
    }
}
function addProductsToCart(requestBody) {
    return __awaiter(this, void 0, void 0, function () {
        var addToCartProductId, addToCartProductQty, addToCartProductPrice, customerId, _, db;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    addToCartProductId = requestBody.productId;
                    addToCartProductQty = Number(requestBody.qty);
                    addToCartProductPrice = Number(requestBody.price);
                    customerId = requestBody.customerId || '';
                    _ = require('lodash');
                    db = getFirestore();
                    return [4 /*yield*/, db
                            .collection('cart')
                            .doc(customerId)
                            .get()
                            .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            var custCartDetails, custCartItem, foundSameProductObj, newCartItemObj, newCartItemObj;
                            return __generator(this, function (_a) {
                                custCartDetails = result.data();
                                if (custCartDetails) {
                                    custCartItem = custCartDetails.cartItem || [];
                                    foundSameProductObj = _.find(custCartItem, function (o) {
                                        return o.productId === addToCartProductId;
                                    });
                                    //if found same product in cart, change to latest quantity
                                    if (foundSameProductObj) {
                                        foundSameProductObj.qty =
                                            foundSameProductObj.qty + addToCartProductQty;
                                        triggerFinalAddToCartLogic(customerId, custCartItem);
                                    }
                                    else {
                                        newCartItemObj = {
                                            productId: addToCartProductId,
                                            qty: addToCartProductQty,
                                            price: addToCartProductPrice
                                        };
                                        custCartItem.push(newCartItemObj);
                                        triggerFinalAddToCartLogic(customerId, custCartItem);
                                    }
                                } //if new product, then add into cart array
                                else {
                                    newCartItemObj = {
                                        productId: addToCartProductId,
                                        qty: addToCartProductQty,
                                        price: addToCartProductPrice
                                    };
                                    triggerFinalAddToCartLogic(customerId, [newCartItemObj]);
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, requestBody];
            }
        });
    });
}
function triggerFinalAddToCartLogic(customerId, newCartItemObj) {
    var db = getFirestore();
    db.collection('cart').doc(customerId).set({
        customerId: customerId,
        cartItem: newCartItemObj
    });
}
/**
 *
 * @param customerId Unique customer Id to find cart object and create order
 * @param fakePaymentStatus For this demo only, fake payment status to silmulate payment gateway status
 * @returns
 */
function createOrder(requestBody) {
    var customerId = requestBody.customerId;
    var fakePaymentStatus = requestBody.fakePaymentStatus === 'true' ? true : false;
    if (processPayment(fakePaymentStatus)) {
        return processOrder(customerId);
    }
    else {
        return { customerId: customerId, paymentStatus: 'failed', orderId: null };
    }
}
/**
 * @description This function should trigger an api call to payment gateway, and return the payment status accordingly
 * @param statusBol But for this demo, we will fake it via statusBol that we retreived from create-order api
 */
function processPayment(statusBol) {
    return statusBol;
}
function processOrder(customerId) {
    var _this = this;
    var _ = require('lodash');
    var db = getFirestore();
    return db
        .collection('cart')
        .doc(customerId)
        .get()
        .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
        var custCartDetails, custCartItems, totalGMV, uniqueOrderId, orderObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    custCartDetails = result.data();
                    console.log('custCartDetails', custCartDetails);
                    custCartItems = custCartDetails.cartItem;
                    totalGMV = _.sumBy(custCartItems, function (o) {
                        return o.price * o.qty;
                    }) || 0;
                    uniqueOrderId = Math.random().toString(36).slice(2);
                    orderObj = {
                        totalValue: totalGMV,
                        orderId: uniqueOrderId,
                        customerId: customerId,
                        customerName: 'John Doe',
                        customerAddress: 'Fake address - KLCC, Suria, Kuala Lumpur City Centre, 50088 Kuala Lumpur',
                        cartItem: custCartItems,
                        paymentTransactionId: Math.random().toString(36).slice(2)
                    };
                    return [4 /*yield*/, db
                            .collection('orders')
                            .doc(uniqueOrderId)
                            .set(orderObj)
                            .then(function (res) {
                            deleteCustCart(customerId);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, orderObj];
            }
        });
    }); });
}
function deleteCustCart(customerId) {
    var db = getFirestore();
    db.collection('cart').doc(customerId)["delete"]();
}
var port = 3000;
app.listen(port, function () {
    console.log("API server listening on port ".concat(port));
});
