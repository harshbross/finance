import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '../../../../../data/mockProducts';

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

  const reviews = product.reviews || [];
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  return NextResponse.json({
    reviews,
    totalReviews,
    averageRating
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = MOCK_PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { rating, comment } = body;

    const newReview = {
      id: Date.now(),
      rating: parseInt(rating) || 5,
      comment: comment || '',
      createdAt: new Date().toISOString(),
      user: {
        id: 999,
        name: 'Verified Customer'
      }
    };

    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    product.averageRating = parseFloat(
      (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    );

    return NextResponse.json(newReview, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid review payload' }, { status: 400 });
  }
}
