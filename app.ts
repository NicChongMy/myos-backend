const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/** Start -- Connection Firebase database **/
var admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
/** End -- Connection Firebase database **/

app.post(
  '/fetch-product-lists',
  urlencodedParser,
  async (req, res) => {
    var requestBody: iProductFilter = req.body;
    const resultBody = await fullTextSearchAPI(requestBody);
    res.send({ status: 200, data: resultBody });
  }
);

app.post('/add-to-cart', urlencodedParser, async (req, res) => {
  var requestBody: iAddToCart = req.body;
  const resultBody = await addProductsToCart(requestBody);
  res.send({ status: 200, data: { input: resultBody } });
});

app.post('/create-order', urlencodedParser, async (req, res) => {
  var requestBody: iCreateOrder = req.body;
  const resultBody = await createOrder(requestBody);
  res.send({ status: 200, data: resultBody });
});

/**
 * @description Firebase is a noSQL database, we need to use third library that support full text search to find product
 * @param sortBy - can be sort by @priceASC or @priceDESC In the future, other method can be added here as well eg, rating low to high, rating high to low
 * @param searchBy - can be search by @title or @desc
 * @param searchText - free text input to search
 * @returns related product listing
 */
function fullTextSearchAPI(requestBody: iProductFilter) {
  const sortBy = requestBody.sortBy || '';
  const searchBy = requestBody.searchBy || 'title';
  const searchText = requestBody.searchText || '';
  const algoliasearch = require('algoliasearch');

  const client = algoliasearch(
    'JQ1SF32KZ0',
    '241199636211185260d3bc65099fd308'
  );
  const index = client.initIndex('productCatalog');
  return index
    .search(searchText, {
      restrictSearchableAttributes: [searchBy],
    })
    .then(({ hits }) => {
      if (sortBy) {
        return productListingSorting(hits, sortBy);
      } else {
        return hits;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * @param resultList - related search result list
 * @param sortBy - price low to high, price high to low, other method can be added here as well eg, rating low to high, rating high to low
 * @returns sorted product listing
 */
function productListingSorting(resultList: any, sortBy: string) {
  const _ = require('lodash');

  if (sortBy === 'priceDESC') {
    return _.orderBy(resultList, ['price'], ['desc']);
  } else if (sortBy === 'priceASC') {
    return _.orderBy(resultList, ['price'], ['asc']);
  } else {
    return resultList;
  }
}
/**
 *
 * @description Call this api after product is validated and status is OK to add to cart.
 * @description This function will try to find same productId in customer cart, if found then will change the quantity instead
 * @description This function will try to find same productId in customer cart, if cannot be found then will add the new productId into customer cart
 * @param productId Unique customer Id to update cart object
 * @param qty added product quantity
 * @param price added product price
 */
async function addProductsToCart(requestBody: iAddToCart) {
  const addToCartProductId = requestBody.productId;
  const addToCartProductQty = Number(requestBody.qty);
  const addToCartProductPrice = Number(requestBody.price);
  const customerId = requestBody.customerId || '';

  const _ = require('lodash');
  const db = getFirestore();

  await db
    .collection('cart')
    .doc(customerId)
    .get()
    .then(async (result) => {
      const custCartDetails = result.data() as iCartObj;

      if (custCartDetails) {
        const custCartItem =
          (custCartDetails.cartItem as iCartItemObj[]) || [];
        //Lodash to find same product in cart
        const foundSameProductObj = _.find(
          custCartItem,
          function (o) {
            return o.productId === addToCartProductId;
          }
        );

        //if found same product in cart, change to latest quantity
        if (foundSameProductObj) {
          foundSameProductObj.qty =
            foundSameProductObj.qty + addToCartProductQty;

          triggerFinalAddToCartLogic(customerId, custCartItem);
        } else {
          const newCartItemObj = {
            productId: addToCartProductId,
            qty: addToCartProductQty,
            price: addToCartProductPrice,
          };
          custCartItem.push(newCartItemObj);
          triggerFinalAddToCartLogic(customerId, custCartItem);
        }
      } //if new product, then add into cart array
      else {
        const newCartItemObj = {
          productId: addToCartProductId,
          qty: addToCartProductQty,
          price: addToCartProductPrice,
        };
        triggerFinalAddToCartLogic(customerId, [newCartItemObj]);
      }
    });
  return requestBody;
}

/**
 *
 * @param customerId Unique customer Id to update cart object
 * @param newCartItemObj Cart object to replace existing object in database
 */
function triggerFinalAddToCartLogic(
  customerId: string,
  newCartItemObj: iCartItemObj | iCartItemObj[]
) {
  const db = getFirestore();
  db.collection('cart').doc(customerId).set({
    customerId: customerId,
    cartItem: newCartItemObj,
  });
}

/**
 *
 * @param customerId Unique customer Id to find cart object and create order
 * @param fakePaymentStatus For this demo only, fake payment status to silmulate payment gateway status
 * @returns Order status with order details
 */
function createOrder(requestBody: iCreateOrder) {
  const customerId = requestBody.customerId;
  const fakePaymentStatus =
    requestBody.fakePaymentStatus === 'true' ? true : false;
  if (processPayment(fakePaymentStatus)) {
    return processOrder(customerId);
  } else {
    return { customerId, paymentStatus: 'failed', orderId: null };
  }
}

/**
 * @description This function should trigger an api call to payment gateway, and return the payment status accordingly
 * @param statusBol But for this demo, we will fake it via statusBol that we retreived from @function createOrder api
 */
function processPayment(statusBol) {
  return statusBol;
}

/**
 * @description1 This function will create an order according to customer cart
 * @description2 This function will trigger @function deleteCustCart to reset customer cart after order created succesfully
 */
function processOrder(customerId: string) {
  const _ = require('lodash');
  const db = getFirestore();

  return db
    .collection('cart')
    .doc(customerId)
    .get()
    .then(async (result) => {
      const custCartDetails = result.data() as iCartObj;
      console.log('custCartDetails', custCartDetails);
      const custCartItems = custCartDetails.cartItem;

      const totalGMV =
        _.sumBy(custCartItems, function (o) {
          return o.price * o.qty;
        }) || 0;

      const uniqueOrderId = Math.random().toString(36).slice(2);

      const orderObj = {
        totalValue: totalGMV,
        orderId: uniqueOrderId,
        customerId,
        customerName: 'John Doe',
        customerAddress:
          'Fake address - KLCC, Suria, Kuala Lumpur City Centre, 50088 Kuala Lumpur',
        cartItem: custCartItems,
        paymentTransactionId: Math.random().toString(36).slice(2),
      };

      await db
        .collection('orders')
        .doc(uniqueOrderId)
        .set(orderObj)
        .then((res) => {
          deleteCustCart(customerId);
        });

      return orderObj;
    });
}

/**
 * @description This function will reset customer cart
 */
function deleteCustCart(customerId: string) {
  const db = getFirestore();
  db.collection('cart').doc(customerId).delete();
}

const port = 3000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

interface iProductFilter {
  sortBy: 'priceASC' | 'priceDESC';
  searchBy: 'title' | 'desc';
  searchText: string;
}

interface iAddToCart {
  customerId: string;
  productId:
    | 'UO7P4C2l5rA1zHtCKq7F'
    | 'psMACL6HT8GAlp38NK73'
    | 'yBGng01LtUFfabV6rKYA';
  qty: number;
  price: number;
}

interface iCartObj {
  cartItem: any[];
  customerId: string;
}

interface iCartItemObj {
  productId: string;
  qty: number;
}

interface iCreateOrder {
  customerId: string;
  fakePaymentStatus: string;
}
