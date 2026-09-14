const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticateToken } = require('../middleware/auth');

// Get current user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if a product is in user's wishlist
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to wishlist
router.post('/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (existing) {
      return res.json({ message: 'Item already in wishlist', item: existing });
    }

    const newItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId
      },
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Item not in wishlist' });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
