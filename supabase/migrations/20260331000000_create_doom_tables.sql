-- DOOMD game tables for ice.gritboxops.com

CREATE TABLE doom_scores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  wave INTEGER NOT NULL,
  kills INTEGER DEFAULT 0,
  death_cause VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doom_scores_rank ON doom_scores (score DESC, created_at);

-- Enable public read, authenticated insert
ALTER TABLE doom_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read scores" ON doom_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON doom_scores FOR INSERT WITH CHECK (true);

CREATE TABLE doom_saves (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  slot VARCHAR(10) DEFAULT 'auto',
  score INTEGER NOT NULL,
  wave INTEGER NOT NULL,
  hp INTEGER NOT NULL,
  ammo INTEGER NOT NULL,
  kills INTEGER DEFAULT 0,
  px FLOAT NOT NULL,
  py FLOAT NOT NULL,
  pa FLOAT NOT NULL,
  enemies_json TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_name, slot)
);

ALTER TABLE doom_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read saves" ON doom_saves FOR SELECT USING (true);
CREATE POLICY "Anyone can insert saves" ON doom_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update saves" ON doom_saves FOR UPDATE USING (true);
