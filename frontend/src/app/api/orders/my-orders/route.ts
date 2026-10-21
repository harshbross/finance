import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 10482,
      totalAmount: 189.99,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    },
    {
      id: 10471,
      totalAmount: 1499.99,
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 10455,
      totalAmount: 349.99,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ]);
}
