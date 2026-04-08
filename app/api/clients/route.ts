import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ClientCreateDTO, ClientDB } from '@/app/Types';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');
    
    // Explicitly cast to unknown first to safely convert from MongoDB's generic document array
    const clients = (await collection.find({}).toArray()) as unknown as (ClientDB & { _id: { toString(): string } })[];
    
    const formatted = clients.map((client) => ({
      ...client,
      _id: client._id.toString(),
      id: client._id.toString()
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ClientCreateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('clients');

    const newClient: Omit<ClientDB, '_id'> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newClient);

    return NextResponse.json({ 
      message: 'Client created successfully',
      client: { ...newClient, _id: result.insertedId.toString(), id: result.insertedId.toString() }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Failed to create client' }, { status: 500 });
  }
}
