export interface MockReview {
  id: number;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  verified?: boolean;
  helpfulCount?: number;
  photos?: string[];
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
  { id: 5, name: 'Wearables' },
  { id: 6, name: 'Furniture' },
  { id: 7, name: 'Sports & Fitness' }
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    name: 'Aether Core Laptop Pro',
    description: 'Ultra-thin aluminum cyber-chassis, 12-core processor, 32GB LPDDR5X RAM, 1TB NVMe Gen4 SSD, and custom glassmorphism trackpad. Designed for high performance.',
    price: 124999,
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
        title: 'Phenomenal build quality and thermal performance',
        comment: 'Phenomenal build quality! The thermal design keeps it silent under heavy compilation workloads.',
        createdAt: '2026-08-15T10:30:00Z',
        verified: true,
        helpfulCount: 14,
        photos: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=400'],
        user: { id: 11, name: 'Alex Rivera' }
      },
      {
        id: 102,
        rating: 5,
        title: 'Outstanding display and day-long battery',
        comment: 'Best display I have ever seen on a creator laptop. Battery easily lasts all day.',
        createdAt: '2026-08-20T14:15:00Z',
        verified: true,
        helpfulCount: 9,
        user: { id: 12, name: 'Elena Rostova' }
      }
    ]
  },
  {
    id: 2,
    name: 'Quantum Mechanical Keyboard',
    description: 'Custom hot-swappable linear switches, per-key holographic RGB illumination, aircraft-grade CNC aluminum plate, and PBT double-shot keycaps.',
    price: 14999,
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
        title: 'Butter smooth linear switches!',
        comment: 'The switch feel is buttery smooth out of the box. Zero spring ping.',
        createdAt: '2026-08-18T09:20:00Z',
        verified: true,
        helpfulCount: 21,
        photos: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400'],
        user: { id: 13, name: 'Marcus Chen' }
      },
      {
        id: 202,
        rating: 4,
        title: 'Stunning desk aesthetic',
        comment: 'Great aesthetics and heavy weight on desk. Software config took a moment to setup.',
        createdAt: '2026-08-25T16:45:00Z',
        verified: true,
        helpfulCount: 6,
        user: { id: 14, name: 'Sarah Jenkins' }
      }
    ]
  },
  {
    id: 3,
    name: 'Neutron RGB Wireless Mouse',
    description: 'Ultra-lightweight 58g honeycomb shell, 26,000 DPI optical sensor, optical switches rated for 90M clicks, and 80-hour continuous fast-charge battery.',
    price: 6999,
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
    price: 24999,
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
    price: 3499,
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
    price: 28999,
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
    price: 4999,
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
    price: 74999,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800',
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
  },
  {
    id: 9,
    name: 'Nordic Solid Oak Minimalist Study Table',
    description: 'Crafted from sustainable European white oak with seamless cable management conduits, beveled anti-scratch edges, and heavy-duty matte black steel architectural hairpin legs.',
    price: 16999,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800',
    categoryId: 6,
    category: { id: 6, name: 'Furniture' },
    averageRating: 4.8,
    reviewCount: 19,
    reviews: [
      {
        id: 901,
        rating: 5,
        comment: 'Stunning solid oak finish. Assembled in under 15 minutes and holds my dual monitor setup effortlessly.',
        createdAt: '2026-09-10T11:20:00Z',
        user: { id: 21, name: 'Rohan Mehra' }
      },
      {
        id: 902,
        rating: 4,
        comment: 'Very sturdy with no wobble. The wood grain has a gorgeous satin texture.',
        createdAt: '2026-09-15T15:30:00Z',
        user: { id: 22, name: 'Priya Sharma' }
      }
    ]
  },
  {
    id: 10,
    name: 'Scandinavian Luxury 3-Seater Velvet Sofa',
    description: 'High-resilience pocket spring cushioning upholstered in stain-resistant performance velvet. Kiln-dried solid beechwood frame with brass-accented tapered legs for ultimate living room comfort.',
    price: 38499,
    stock: 7,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    categoryId: 6,
    category: { id: 6, name: 'Furniture' },
    averageRating: 4.9,
    reviewCount: 27,
    reviews: [
      {
        id: 1001,
        rating: 5,
        comment: 'The emerald velvet is so soft yet easy to maintain. Cushioning gives firm yet plush support.',
        createdAt: '2026-09-12T14:40:00Z',
        user: { id: 23, name: 'Aarav Gupta' }
      },
      {
        id: 1002,
        rating: 5,
        comment: 'Delivered in mint condition. The deep seat depth makes it perfect for lounging or hosting.',
        createdAt: '2026-09-18T18:10:00Z',
        user: { id: 24, name: 'Ananya Verma' }
      }
    ]
  },
  {
    id: 11,
    name: 'Voltric Pro Carbon Fiber Badminton Racket',
    description: 'Aerodynamic Nanocell Neo graphite frame engineered for high-velocity smashes and rapid net defense. Isometric head shape expands sweet spot by 32%. Pre-strung at 26 lbs competition tension.',
    price: 3899,
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800',
    categoryId: 7,
    category: { id: 7, name: 'Sports & Fitness' },
    averageRating: 4.9,
    reviewCount: 35,
    reviews: [
      {
        id: 1101,
        rating: 5,
        comment: 'Unbelievable smash power! The balance point is head-heavy, giving intense kinetic whip on clears and drops.',
        createdAt: '2026-09-14T08:30:00Z',
        user: { id: 25, name: 'Kabir Singh' }
      },
      {
        id: 1102,
        rating: 5,
        comment: 'Extremely lightweight yet rigid frame. Excellent feel and control around the net.',
        createdAt: '2026-09-20T17:15:00Z',
        user: { id: 26, name: 'Deepak Nair' }
      }
    ]
  },
  {
    id: 12,
    name: 'ErgoCurve Breathable Mesh Executive Chair',
    description: 'Ergonomic high-back task chair featuring self-adjusting lumbar support, 4D multi-directional armrests, 135-degree synchro-tilt lock, and heavy-duty alloy wheelbase with silent nylon casters.',
    price: 12499,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
    categoryId: 6,
    category: { id: 6, name: 'Furniture' },
    averageRating: 4.7,
    reviewCount: 16,
    reviews: [
      {
        id: 1201,
        rating: 5,
        comment: 'Saved my lower back during 10-hour coding marathons. Highly adjustable and stays cool.',
        createdAt: '2026-09-16T10:00:00Z',
        user: { id: 27, name: 'Siddharth Roy' }
      }
    ]
  },
  {
    id: 13,
    name: 'Aerospeed Pro Feather Shuttlecocks (Pack of 12)',
    description: 'Tournament grade select goose feathers treated for maximum endurance. Two-piece natural solid cork core provides pristine flight trajectory, repeatable speed rating, and crack resistance.',
    price: 1299,
    stock: 48,
    imageUrl: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&q=80&w=800',
    categoryId: 7,
    category: { id: 7, name: 'Sports & Fitness' },
    averageRating: 4.8,
    reviewCount: 22,
    reviews: [
      {
        id: 1301,
        rating: 5,
        comment: 'Longest lasting shuttlecocks we have used at our local club. Feathers don’t fray after a single set.',
        createdAt: '2026-09-22T19:00:00Z',
        user: { id: 28, name: 'Aditya Rao' }
      }
    ]
  }
];
