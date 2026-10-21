import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: 1,
        name: body.name || 'User',
        email: body.email || 'user@example.com',
        role: 'ADMIN',
        address: body.address || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error updating profile' }, { status: 500 });
  }
}
