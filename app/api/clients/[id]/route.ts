import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ClientUpdateDTO } from '@/app/Types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');

    const client = await collection.findOne({ _id: new ObjectId(id) });
    if (!client) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ ...client, _id: client._id.toString(), id: client._id.toString() }, { status: 200 });
  } catch (error) {
    console.error('GET /api/clients/[id] failed:', error);
    return NextResponse.json({ message: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const body = (await request.json()) as ClientUpdateDTO & {
      _id?: string;
      id?: string;
      createdAt?: string | Date;
      updatedAt?: string | Date;
    };
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');

    const { _id, id: bodyId, createdAt, updatedAt, ...safeBody } = body;
    void _id;
    void bodyId;
    void createdAt;
    void updatedAt;

    const updateData = {
      ...safeBody,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Client updated', client: result }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/clients/[id] failed:', error);
    return NextResponse.json({ message: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Client deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/clients/[id] failed:', error);
    return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 });
  }
}
