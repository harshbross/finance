import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = Math.floor(Math.random() * 90000) + 10000;

    return NextResponse.json({
      id: orderId,
      message: 'Order created successfully',
      shippingAddress: body.shippingAddress || 'Default Address',
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error processing order' }, { status: 500 });
  }
}
