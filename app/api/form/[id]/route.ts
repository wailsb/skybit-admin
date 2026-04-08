import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ObjectId } from 'mongodb';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('forms');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ message: 'Submission deleted' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to delete submission' }, { status: 500 });
  }
}
