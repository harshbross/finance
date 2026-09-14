const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all products (with search, category filter, price filter, sorting, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, sortBy = 'newest', page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'name-asc') orderBy = { name: 'asc' };
    else if (sortBy === 'name-desc') orderBy = { name: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [rawProducts, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          reviews: { select: { rating: true } }
        },
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    const products = rawProducts.map(p => {
      const revs = p.reviews || [];
      const avgRating = revs.length > 0
        ? parseFloat((revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1))
        : 0;
      return {
        ...p,
        averageRating: avgRating,
        reviewCount: revs.length
      };
    });

    res.json({
      products,
      totalPages: Math.ceil(total / take),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const revs = product.reviews || [];
    const avgRating = revs.length > 0
      ? parseFloat((revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1))
      : 0;

    res.json({
      ...product,
      averageRating: avgRating,
      reviewCount: revs.length
    });
  } catch (error) {
    console.error('Fetch product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    if (!name || !price || stock === undefined || !imageUrl || !categoryId) {
      return res.status(400).json({ message: 'Name, price, stock, imageUrl, and categoryId are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        categoryId: parseInt(categoryId)
      },
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (categoryId) updateData.categoryId = parseInt(categoryId);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
