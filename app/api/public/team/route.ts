import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { TeamMember } from '@/app/Types';

export const dynamic = 'force-dynamic';

const allowlist = (process.env.NEXT_PUBLIC_CORS_ALLOWLIST || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> | null {
  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }
  if (allowlist.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    if (!corsHeaders) {
      return NextResponse.json({
        success: false,
        message: 'Origin not allowed',
      }, { status: 403 });
    }

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
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Public Team API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch team members' 
    }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  if (!corsHeaders) {
    return NextResponse.json({
      success: false,
      message: 'Origin not allowed',
    }, { status: 403 });
  }
  return NextResponse.json({}, { headers: corsHeaders });
}
