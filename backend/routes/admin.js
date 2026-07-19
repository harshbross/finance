const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const orderCount = await prisma.order.count();

    const orders = await prisma.order.findMany({
      where: { status: { not: 'Cancelled' } }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        categories: categoryCount,
        orders: orderCount
      },
      totalRevenue,
      latestOrders
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
