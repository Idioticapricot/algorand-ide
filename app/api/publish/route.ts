import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { code, templateType } = await request.json();
    
    console.log('Creating share for template:', templateType);
    
    const shareId = Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('publish_shares')
      .insert({
        id: crypto.randomUUID(),
        share_id: shareId,
        code,
        template_type: templateType,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Share created successfully:', shareId);
    return NextResponse.json({ shareId });
  } catch (error: any) {
    console.error('POST /api/publish error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const shareId = request.nextUrl.searchParams.get('shareId');
    
    if (!shareId) {
      return NextResponse.json({ error: 'shareId required' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('publish_shares')
      .select('*')
      .eq('share_id', shareId)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return NextResponse.json({ error: 'Share not found or expired' }, { status: 404 });
    }
    
    return NextResponse.json({
      code: data.code,
      templateType: data.template_type
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
