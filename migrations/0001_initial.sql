CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  channel_id TEXT,
  message_id TEXT,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS confirmations (
  notice_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  confirmed_at TEXT NOT NULL,
  PRIMARY KEY (notice_id, user_id),
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_confirmations_notice_id
ON confirmations(notice_id);
