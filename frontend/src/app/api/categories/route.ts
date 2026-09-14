import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES } from '../../../data/mockProducts';

export async function GET() {
  return NextResponse.json(MOCK_CATEGORIES);
}
