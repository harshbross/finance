import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '../../../../data/mockProducts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = MOCK_PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
