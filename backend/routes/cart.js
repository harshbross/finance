const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticateToken } = require('../middleware/auth');

// Get cart items
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // If cart somehow doesn't exist, create it
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
    }

    res.json(cart);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId)
        }
      }
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + parseInt(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: `Cannot add more items. Only ${product.stock} left in stock.` });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      if (parseInt(quantity) > product.stock) {
        return res.status(400).json({ message: `Cannot add. Only ${product.stock} left in stock.` });
      }

      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        },
        include: { product: true }
      });
    }

    res.json(cartItem);
  } catch (error) {
    console.error('Add cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item quantity in cart
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || parseInt(quantity) <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        cart: true,
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (parseInt(quantity) > cartItem.product.stock) {
      return res.status(400).json({ message: `Only ${cartItem.product.stock} items left in stock.` });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) },
      include: { product: true }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
