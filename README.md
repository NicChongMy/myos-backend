# Requirement

1. NodeJS v16.14.0

# How to install

1. Git clone this project via `git clone https://github.com/NicChongMy/myos-backend.git`
2. Run `npm install` to install required libraries

# How to run on localhost
1. Run `tsc app.ts` to convert typescript files to javascript
2. Run `node app.js` 

# Environment

1. `serviceAccountKey.json` is connection files to database. // This is a very sensitive config files, in production should not be uploaded into github or other VCS.

# Database & libraries

1. Solution implemented with Firestore (noSQL database).
2. Integrated with Algolia, to enable Full-Text Search features.
3. Solution implemented with Lodash, which provides utility functions for common programming tasks.

# Api list

1. `fetch-product-lists` - default api for product list, can be used as filter/sorting as well
2. `add-to-cart` - api for customer to add to cart
3. `create-order` - api for backend to create order

![myos-architecture2022](https://user-images.githubusercontent.com/30789775/209537872-7fb05d04-a73a-4c86-bf9e-5fa6a46eca86.png)
