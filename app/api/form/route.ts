import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { ContactSubmissionCreateDTO, ContactSubmissionDB } from '@/app/Types';
import { ObjectId } from 'mongodb';

// Fetch all submissions (Admin View)
export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('forms');
    
    // Explicitly cast to unknown first to safely convert from MongoDB's generic document array
    const forms = (await collection.find({}).sort({ submittedAt: -1 }).toArray()) as unknown as (ContactSubmissionDB & { _id: { toString(): string } })[];
    
    const formatted = forms.map((f) => ({
      ...f,
      _id: f._id.toString(),
      id: f._id.toString()
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// Client submits a new form
export async function POST(request: Request) {
  try {
    const body: ContactSubmissionCreateDTO = await request.json();
    
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('forms');

    const currentTimestamp = new Date().toISOString();

    const newSubmission: Omit<ContactSubmissionDB, '_id'> = {
      ...body,
      submittedAt: currentTimestamp,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await collection.insertOne(newSubmission);

    return NextResponse.json({ message: 'Form submitted successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Failed to submit form' }, { status: 500 });
  }
}

// Admin deletes a form
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing form ID' }, { status: 400 });
    }

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('forms');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to delete form' }, { status: 500 });
  }
}
