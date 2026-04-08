import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { TeamMemberCreateDTO, TeamMemberDB } from '@/app/Types';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');
    
    // Explicitly cast to unknown first to safely convert from MongoDB's generic document array
    const team = (await collection.find({}).toArray()) as unknown as (TeamMemberDB & { _id: { toString(): string } })[];
    
    const formatted = team.map((member) => ({
      ...member,
      _id: member._id.toString(),
      id: member._id.toString()
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: TeamMemberCreateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');

    const newMember: Omit<TeamMemberDB, '_id'> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newMember);

    return NextResponse.json({ 
      message: 'Team member created successfully',
      member: { ...newMember, _id: result.insertedId.toString(), id: result.insertedId.toString() }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Failed to create team member' }, { status: 500 });
  }
}
