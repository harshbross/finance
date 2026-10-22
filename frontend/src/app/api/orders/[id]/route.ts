import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '../../../../data/mockProducts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id) || 10482;

    return NextResponse.json({
      id: orderId,
      totalAmount: 4999,
      status: 'PROCESSING',
      shippingAddress: 'Express Home Delivery, Mumbai, Maharashtra - 400053',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 1,
          priceAtPurchase: 2499,
          product: {
            name: MOCK_PRODUCTS[0]?.name || 'Luminary ANC Wireless Headphones',
            imageUrl: MOCK_PRODUCTS[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
          }
        }
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Order not found' }, { status: 404 });
  }
}
