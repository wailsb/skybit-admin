import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { TeamMemberUpdateDTO } from '@/app/Types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');

    const member = await collection.findOne({ _id: new ObjectId(id) });
    if (!member) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ ...member, _id: member._id.toString(), id: member._id.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch team member' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const body: TeamMemberUpdateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Team member updated', member: result }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('team');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Team member deleted' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to delete team member' }, { status: 500 });
  }
}
