const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin User
  const adminEmail = 'admin@aethershop.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  let adminUser;
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    adminUser = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        address: 'Aether HQ, Cyber City'
      }
    });
    console.log('Admin user created successfully!');
    console.log('Email: admin@aethershop.com');
    console.log('Password: admin123');

    // Create an empty cart for admin
    await prisma.cart.create({
      data: { userId: adminUser.id }
    });
  } else {
    adminUser = existingAdmin;
    console.log('Admin user already exists.');
  }

  // 2. Create Sample Categories
  const categoriesData = [
    { name: 'Hardware' },
    { name: 'Peripherals' },
    { name: 'Accessories' }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
    categories.push(created);
  }
  console.log('Categories seeded.');

  // Find category IDs
  const hardwareCat = categories.find(c => c.name === 'Hardware');
  const peripheralCat = categories.find(c => c.name === 'Peripherals');
  const accessoryCat = categories.find(c => c.name === 'Accessories');

  // 3. Create Sample Products
  const productsData = [
    {
      name: 'Aether Core Laptop',
      description: 'Super-charged CPU, 32GB RAM, 1TB SSD, and custom glassmorphism shell.',
      price: 1499.99,
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=500',
      categoryId: hardwareCat.id
    },
    {
      name: 'Quantum Mechanical Keyboard',
      description: 'Futuristic mechanical keyboard with custom linear switches and holographic RGB.',
      price: 189.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=500',
      categoryId: peripheralCat.id
    },
    {
      name: 'Neutron RGB Mouse',
      description: 'Ultra-lightweight gaming mouse with precision optical sensor and responsive clicks.',
      price: 89.99,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=500',
      categoryId: peripheralCat.id
    },
    {
      name: 'Prism Laptop Stand',
      description: 'Ergonomic aluminum stand with adjustable height and cable management paths.',
      price: 49.99,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=500',
      categoryId: accessoryCat.id
    }
  ];

  for (const prod of productsData) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name }
    });
    if (!existingProduct) {
      await prisma.product.create({
        data: prod
      });
    }
  }
  console.log('Sample products seeded.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
