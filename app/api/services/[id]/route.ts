import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ServiceUpdateDTO } from '@/app/Types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');

    const service = await collection.findOne({ _id: new ObjectId(id) });
    if (!service) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ ...service, _id: service._id.toString(), id: service._id.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const body: ServiceUpdateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');

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

    return NextResponse.json({ message: 'Service updated', service: result }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Service deleted' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to delete service' }, { status: 500 });
  }
}
