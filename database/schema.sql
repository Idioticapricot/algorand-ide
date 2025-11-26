-- Projects table
CREATE TABLE projects (
  project_id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template VARCHAR(50) NOT NULL CHECK (template IN ('TealScript', 'PuyaPy', 'PuyaTs', 'PyTeal')),
  shareable VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (shareable IN ('private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project files table
CREATE TABLE project_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(50) REFERENCES projects(project_id) ON DELETE CASCADE,
  file_structure JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_shareable ON projects(shareable);
CREATE INDEX idx_projects_template ON projects(template);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);

-- RLS (Row Level Security) policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public projects" ON projects
  FOR SELECT USING (shareable = 'public');

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for project_files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project files" ON project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.project_id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public project files" ON project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.project_id = project_files.project_id 
      AND projects.shareable = 'public'
    )
  );

CREATE POLICY "Users can insert own project files" ON project_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.project_id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project files" ON project_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.project_id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project files" ON project_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.project_id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- AI Embeddings tables (optional - for RAG functionality)
-- These tables store documentation chunks with vector embeddings for semantic search

-- PyTeal documentation embeddings
CREATE TABLE IF NOT EXISTS pyteal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TealScript documentation embeddings
CREATE TABLE IF NOT EXISTS tealscript (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PuyaPy (AlgoPy) documentation embeddings
CREATE TABLE IF NOT EXISTS algopy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PuyaTs documentation embeddings
CREATE TABLE IF NOT EXISTS puyats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for embeddings tables (optional, for faster queries)
CREATE INDEX IF NOT EXISTS idx_pyteal_created_at ON pyteal(created_at);
CREATE INDEX IF NOT EXISTS idx_tealscript_created_at ON tealscript(created_at);
CREATE INDEX IF NOT EXISTS idx_algopy_created_at ON algopy(created_at);
CREATE INDEX IF NOT EXISTS idx_puyats_created_at ON puyats(created_at);

-- Note: Embeddings tables are public (no RLS) for read access
-- They contain documentation only, no user data