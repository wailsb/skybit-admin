import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'skybit_assets';

    // Convert Web File Object to Node Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource_type (raw needed for 3D gltf/bin files, auto handles images normally)
    const filename = file.name.toLowerCase();
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    
    if (filename.endsWith('.gltf') || filename.endsWith('.glb') || filename.endsWith('.bin')) {
      resourceType = 'raw';
    }

    // Wrap the old callback SDK in a modern async Promise Stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder, 
          resource_type: resourceType,
          // Preserve filename minus extension if needed, or let Cloudinary hash it
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null); // End of stream
        }
      });
      readableStream.pipe(uploadStream);
    });

    const result = await uploadPromise as { secure_url: string; public_id: string; format?: string };

    return NextResponse.json({ 
      secure_url: result.secure_url, 
      public_id: result.public_id,
      format: result.format || 'raw'
    }, { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error('Cloudinary upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
