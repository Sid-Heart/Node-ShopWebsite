# ShopWebsite Built On Node JS

A Simple shopping website in NodeJS.

## PreRequisites

- Node
- MongoDB

## Usage

- ```npm install```
- ```npm start```
- ```setup mongodb```
- Create db ```shopDB```
- Add three collection ```Users```,```Products```,```Orders```

Server Will Start On ```localhost:3000``` and MongoDB should run AT ```mongodb://localhost:27017``` ( **Change Connection URL In ```DBHandler/DBHandler.js```**)

### Roles

- Go to ```/user/register``` and Register for Any Role

#### Buyer

- Can Place Order
- View His Own Placed Orders

#### Seller Can Add Products

- Can Add Products
- Can See His Own Products

#### Courier

- Can View All Order
- Can Mark Undelivered Orders as Delivered
