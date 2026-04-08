import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { TeamMember } from '@/app/Types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');
    
    const team = (await collection.find({}).toArray()) as unknown as (TeamMember & { _id: { toString(): string } })[];
    
    const formatted = team.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      role: m.role,
      email: m.email,
      phone: m.phone,
      bio: m.bio,
      imageUrl: m.imageUrl || ""
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
    console.error('Public Team API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch team members' 
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
