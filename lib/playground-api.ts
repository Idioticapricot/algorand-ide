// Playground API integration
const PLAYGROUND_URL = process.env.NEXT_PUBLIC_PLAYGROUND_URL || 'http://localhost:3001';

// Store pending publish data
let pendingPublishData: { code: any; templateType: string; popup: Window } | null = null;

// Global listener for READY signal from Playground (set up once)
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== PLAYGROUND_URL) return;
    
    console.log('IDE received message:', event.data);
    
    if (event.data === 'READY' && pendingPublishData) {
      console.log('Playground is ready, sending data...');
      pendingPublishData.popup.postMessage(
        {
          code: pendingPublishData.code,
          templateType: pendingPublishData.templateType,
          ideUrl: window.location.origin,
          timestamp: Date.now()
        },
        PLAYGROUND_URL
      );
      console.log('Data sent successfully');
      pendingPublishData = null;
    }
  });
}

export interface PlaygroundTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  templateType: string;
  code: any;
  author: string;
  createdAt: string;
}

export async function fetchTemplate(slug: string): Promise<PlaygroundTemplate | null> {
  try {
    const response = await fetch(`${PLAYGROUND_URL}/api/templates/${slug}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return null;
  }
}

export async function publishToPlayground(code: any, templateType: string) {
  try {
    console.log('Publishing to playground via API...');
    
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, templateType })
    });
    
    if (!response.ok) throw new Error('Failed to create share');
    
    const { shareId } = await response.json();
    console.log('Share created:', shareId);
    
    window.open(`${PLAYGROUND_URL}/publish/${shareId}`, '_blank');
  } catch (error) {
    console.error('Publish failed:', error);
    alert('Failed to publish. Please try again.');
  }
}
