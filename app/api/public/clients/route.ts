import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ClientDB } from '@/app/Types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');
    
    const clients = (await collection.find({}).toArray()) as unknown as (ClientDB & { _id: { toString(): string } })[];
    
    const formatted = clients.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      imageUrl: c.imageUrl || "",
      projectCount: c.projectCount || 0
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
    console.error('Public Clients API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch clients' 
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
