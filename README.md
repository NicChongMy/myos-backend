# Requirement

1. NodeJS v16.14.0

# How to install

1. Git clone this project via `git clone https://github.com/NicChongMy/myos-backend.git`
2. Run `npm install` to install required libraries

# How to run on localhost
1. Run `tsc app.ts` to convert typescript files to javascript
2. Run `node app.js` 

# Environment

1. `serviceAccountKey.json` is connection files to database. // This is a very sensitive config files. `SHOULD NOT` be uploaded into github or other VCS.

# Database & libraries

1. Solution implemented with Firestore (noSQL database).
2. Integrated with Algolia, to enable Full-Text Search features.
3. Solution implemented with Lodash, which provides utility functions for common programming tasks.

# Api list

1. `fetch-product-lists` - default api for product list, can be used as filter/sorting as well
2. `add-to-cart` - api for customer to add to cart
3. `create-order` - api for backend to create order

![myos-architecture2022](https://user-images.githubusercontent.com/30789775/209538029-9810a6d7-aa5b-4116-9a5f-f6d1d1486588.png)

# API#1 - fetch-product-lists (POST)

## About this API
Method used to fetch product listing. 

Can be used as sorting, filtering, searching as well.

### Parameters
| Keys        | Value           |            |
| ------------- |:-------------:|:-------------:|
| sortBy    | `priceASC` or `priceDESC` | Optional |
| searchBy      | `title` or `desc` | Optional |
| searchText | string | Optional |

### Responses
```json
{
  "status": 200,
  "data": [
    { 
    "title":"",
    "price":"",
    "desc":"",
    "qty":"",
    "featuredImg":"" 
    }
  ]
}
```
```json
{
  "status": 200,
  "data": []
}
```
# API#2 - add-to-cart (POST)

## About this API
Method used to add products to customer's cart

**Assumption**
1. Validated the productId and status is OK for add to cart.
2. Validated the customerId is authorised and have permission for aadd to cart.
3. All details submitted to API is fetched via preRequisited api such as `GetProductDetails`

### Parameters
| Keys        | Value           |            |
| ------------- |:-------------:|:-------------:|
| customerId    | string | Mandatory |
| productId      | string | Mandatory |
| qty | number | Mandatory |
| price | number | Mandatory |

### Responses
```json
{
  "status": 200,
  "data": { 
    "input": {
      "customerId":"",
      "productId":"",
      "qty":"",
      "price":""
      }
    }
}
```
# API#3 - create-order (POST)

## About this API
Method for customer to make payment and create order.

**Assumption**
1. Payment gateway is implemented correctly.
2. Validated customer have active cart and pending for payment.
3. Products details in cart item is always update to date.

### Parameters
| Keys        | Value           |            |
| ------------- |:-------------:|:-------------:|
| fakePaymentStatus    | `true` or `false` | Mandatory |
| customerId      | string | Mandatory |

### Responses
```json
{
  "status": 200,
  "data": { 
    "totalValue":"",
    "orderId":"",
    "customerId":"",
    "customerName":"",
    "customerAddress":"",
    "cartItem":[],
    "paymentTransactionId":""
    }
}
```
```json
{
  "status": 200,
  "data": { 
    "customerId":"",
    "orderId":null,
    "paymentStatus":"failed"
    }
}
```



