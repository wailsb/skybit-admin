import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ServiceDB } from '@/app/Types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');
    
    const services = (await collection.find({}).toArray()) as unknown as (ServiceDB & { _id: { toString(): string } })[];
    
    const formatted = services.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      imageUrl: s.ImageUrl || ""
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Public Services API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
