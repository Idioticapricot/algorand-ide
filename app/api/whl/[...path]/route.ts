import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = `https://storage.googleapis.com/puya-metrics/${path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching file', { status: 500 });
  }
}