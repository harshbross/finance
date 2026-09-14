export interface MockReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  averageRating: number;
  reviewCount: number;
  reviews: MockReview[];
}

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Hardware' },
  { id: 2, name: 'Peripherals' },
  { id: 3, name: 'Accessories' },
  { id: 4, name: 'Audio' },
  { id: 5, name: 'Wearables' }
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    name: 'Aether Core Laptop Pro',
    description: 'Ultra-thin aluminum cyber-chassis, 12-core processor, 32GB LPDDR5X RAM, 1TB NVMe Gen4 SSD, and custom glassmorphism trackpad. Designed for high performance.',
    price: 1499.99,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
    categoryId: 1,
    category: { id: 1, name: 'Hardware' },
    averageRating: 4.9,
    reviewCount: 28,
    reviews: [
      {
        id: 101,
        rating: 5,
        comment: 'Phenomenal build quality! The thermal design keeps it silent under heavy compilation workloads.',
        createdAt: '2026-08-15T10:30:00Z',
        user: { id: 11, name: 'Alex Rivera' }
      },
      {
        id: 102,
        rating: 5,
        comment: 'Best display I have ever seen on a creator laptop. Battery easily lasts all day.',
        createdAt: '2026-08-20T14:15:00Z',
        user: { id: 12, name: 'Elena Rostova' }
      }
    ]
  },
  {
    id: 2,
    name: 'Quantum Mechanical Keyboard',
    description: 'Custom hot-swappable linear switches, per-key holographic RGB illumination, aircraft-grade CNC aluminum plate, and PBT double-shot keycaps.',
    price: 189.99,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
    categoryId: 2,
    category: { id: 2, name: 'Peripherals' },
    averageRating: 4.8,
    reviewCount: 34,
    reviews: [
      {
        id: 201,
        rating: 5,
        comment: 'The switch feel is buttery smooth out of the box. Zero spring ping.',
        createdAt: '2026-08-18T09:20:00Z',
        user: { id: 13, name: 'Marcus Chen' }
      },
      {
        id: 202,
        rating: 4,
        comment: 'Great aesthetics and heavy weight on desk. Software config took a moment to setup.',
        createdAt: '2026-08-25T16:45:00Z',
        user: { id: 14, name: 'Sarah Jenkins' }
      }
    ]
  },
  {
    id: 3,
    name: 'Neutron RGB Wireless Mouse',
    description: 'Ultra-lightweight 58g honeycomb shell, 26,000 DPI optical sensor, optical switches rated for 90M clicks, and 80-hour continuous fast-charge battery.',
    price: 89.99,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
    categoryId: 2,
    category: { id: 2, name: 'Peripherals' },
    averageRating: 4.7,
    reviewCount: 19,
    reviews: [
      {
        id: 301,
        rating: 5,
        comment: 'Lightest mouse I have ever owned. Tracking is pixel-perfect in competitive shooters.',
        createdAt: '2026-08-22T11:00:00Z',
        user: { id: 15, name: 'David Kim' }
      }
    ]
  },
  {
    id: 4,
    name: 'Cyberpunk ANC Studio Headphones',
    description: 'Active hybrid noise cancellation up to -45dB, 40mm custom beryllium drivers, spatial audio tracking, plush memory foam earcups, and 50hr battery life.',
    price: 299.99,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    categoryId: 4,
    category: { id: 4, name: 'Audio' },
    averageRating: 4.9,
    reviewCount: 42,
    reviews: [
      {
        id: 401,
        rating: 5,
        comment: 'The noise cancellation completely silences coffee shops and trains. Sound stage is super wide.',
        createdAt: '2026-08-10T15:20:00Z',
        user: { id: 16, name: 'Liam O\'Connor' }
      }
    ]
  },
  {
    id: 5,
    name: 'Prism Aluminum Laptop Stand',
    description: 'Precision-engineered dual-axis ergonomic stand with integrated cable passthrough, heat-dissipating silicone pads, and foldable travel design.',
    price: 49.99,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    categoryId: 3,
    category: { id: 3, name: 'Accessories' },
    averageRating: 4.6,
    reviewCount: 15,
    reviews: [
      {
        id: 501,
        rating: 5,
        comment: 'Solid metal, zero wobbling even when typing on the elevated laptop.',
        createdAt: '2026-08-12T18:00:00Z',
        user: { id: 17, name: 'Chloe Taylor' }
      }
    ]
  },
  {
    id: 6,
    name: 'Aether Nova Smartwatch Ultra',
    description: 'Titanium grade 5 bezel, sapphire crystal AMOLED touchscreen, ECG and blood oxygen tracking, 100m water resistance, and 7-day battery life.',
    price: 349.99,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    categoryId: 5,
    category: { id: 5, name: 'Wearables' },
    averageRating: 4.8,
    reviewCount: 26,
    reviews: [
      {
        id: 601,
        rating: 5,
        comment: 'Looks and feels like a luxury Swiss watch with all the modern health sensors.',
        createdAt: '2026-08-28T12:30:00Z',
        user: { id: 18, name: 'Jordan Patel' }
      }
    ]
  },
  {
    id: 7,
    name: 'Hyperion 100W GaN Charging Hub',
    description: 'Gallium Nitride high-efficiency charging station with dual USB-C PD 3.0 ports, dual USB-A quick charge ports, and smart power allocation technology.',
    price: 59.99,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
    categoryId: 3,
    category: { id: 3, name: 'Accessories' },
    averageRating: 4.9,
    reviewCount: 21,
    reviews: [
      {
        id: 701,
        rating: 5,
        comment: 'Charges my laptop and phone simultaneously without getting warm. Very compact.',
        createdAt: '2026-09-01T08:15:00Z',
        user: { id: 19, name: 'Samira Khan' }
      }
    ]
  },
  {
    id: 8,
    name: 'Aether Vision Spatial Headset',
    description: 'Next-gen dual 4K micro-OLED spatial display system with precision eye tracking, spatial audio speakers, and seamless wireless desktop mirror.',
    price: 899.99,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&q=80&w=800',
    categoryId: 1,
    category: { id: 1, name: 'Hardware' },
    averageRating: 5.0,
    reviewCount: 39,
    reviews: [
      {
        id: 801,
        rating: 5,
        comment: 'The clarity is astonishing. Working in a 3-monitor virtual workspace is a game changer.',
        createdAt: '2026-09-04T19:40:00Z',
        user: { id: 20, name: 'Victor Vance' }
      }
    ]
  }
];
