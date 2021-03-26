const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// Receive a post request to add an item to cart
router.post('/cart/products', async (req, res) => {
    // console.log(req.body.productId);

    // figure out the cart!!
    let cart;
    if (!req.session.cartId) {
        // if there is no cart.. create it, and 
        // store the cart id on the req.session.cartId property
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else {
        // we have a cart!, get it from the repo..
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    const existingItem = cart.items.find(item => item.id === req.body.productId);

    if (existingItem) {
        // increment quantity and save cart
        existingItem.quantity++;
    } else {
        // add new product id to the items array
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }
    // save the changes
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    // either increment quantity for existing product
    // or add new product to items array

    res.redirect('/cart');

});

// Receive a get request to show all items in cart
router.get('/cart', async (req, res) => {
    if (!req.session.cartId) {  // if user doesnt have cart created..
        return res.redirect('/'); // redirect him to the product page
    }
    // else, get the correct cart by cart-id..
    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        // item === {id: quantity}
        const product = await productsRepo.getOne(item.id);
        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a post request to delete an item from cart
router.post('/cart/products/delete', async (req, res) => {
    // console.log(req.body.itemId);
    const { itemId } = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    // filter-out the item whose item.id is not equal to itemId 
    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId, { items });

    res.redirect('/cart');
});


module.exports = router;