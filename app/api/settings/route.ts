import { NextResponse } from 'next/server';
import { Database } from '@/config/db';
import { SettingsUpdateDTO } from '@/app/Types';

export async function GET() {
  try {
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('settings');
    
    // Fetch the single settings document (or default if none exists)
    const settings = await collection.findOne({});
    
    if (!settings) {
      // Return a default structure if none exists in DB
      return NextResponse.json({
        socialLinks: [],
        metadata: {
          receivingEmail: '',
          logoUrl: '',
          section3dTitle: '',
          section3dDescription: '',
          section3dSubtext: '',
          scene3dFiles: [],
          missionText: ''
        }
      }, { status: 200 });
    }

    return NextResponse.json({ ...settings, _id: settings._id.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: SettingsUpdateDTO = await request.json();
    
    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('settings');

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Update the first document it finds (since there should only be one)
    // If it doesn't exist, upsert it.
    const result = await collection.findOneAndUpdate(
      {},
      { 
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ message: 'Settings updated', settings: result }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to update settings' }, { status: 500 });
  }
}
