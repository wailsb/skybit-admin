import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ServiceCreateDTO, ServiceDB } from '@/app/Types';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');
    
    // Explicitly cast to unknown first to safely convert from MongoDB's generic document array
    const services = (await collection.find({}).toArray()) as unknown as (ServiceDB & { _id: { toString(): string } })[];
    
    // Convert _id to string for the client
    const formattedServices = services.map((s) => ({
      ...s,
      _id: s._id.toString(),
      id: s._id.toString() // for frontend compatibility
    }));

    return NextResponse.json(formattedServices, { status: 200 });
  } catch (error) {
    console.error('GET Services Error:', error);
    return NextResponse.json({ message: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ServiceCreateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('services');

    const newService: Omit<ServiceDB, '_id'> = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newService);

    return NextResponse.json({ 
      message: 'Service created successfully',
      service: { ...newService, _id: result.insertedId.toString(), id: result.insertedId.toString() }
    }, { status: 201 });
  } catch (error) {
    console.error('POST Service Error:', error);
    return NextResponse.json({ message: 'Failed to create service' }, { status: 500 });
  }
}
