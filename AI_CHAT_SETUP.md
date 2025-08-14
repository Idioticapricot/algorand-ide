# AI Chat Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API Key for AI responses
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key-here
```

## Supabase Table Structure

The AI chat expects the following table structure for each template:

### Table: `pyteal` (for Pyteal template)
```sql
CREATE TABLE pyteal (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL
);
```

### Table: `tealscript` (for TealScript template)
```sql
CREATE TABLE tealscript (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL
);
```

### Table: `puyats` (for PuyaTs template)
```sql
CREATE TABLE puyats (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL
);
```

### Table: `algopy` (for PuyaPy template)
```sql
CREATE TABLE algopy (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL
);
```

## How It Works

1. **User sends a message** in the AI chat
2. **Query embedding** is generated using HuggingFace API
3. **Vector search** is performed in the appropriate Supabase table
4. **Top similar chunks** are retrieved based on cosine similarity
5. **Context is built** from the retrieved chunks
6. **AI response** is generated using OpenRouter API with the context

## Console Logging

The component provides comprehensive console logging to track:

- 🔌 Supabase connection status
- 📊 Table chunk counts
- 🔍 Vector search process
- 🧮 Similarity score calculations
- 📚 Context building
- 🤖 AI response generation

## Fallback Mode

If Supabase connection fails, the component falls back to mock data and logs warnings.

## Testing

1. Open browser console
2. Send a message in the AI chat
3. Watch the console logs to see the entire process
4. Verify that real data is being fetched from Supabase
