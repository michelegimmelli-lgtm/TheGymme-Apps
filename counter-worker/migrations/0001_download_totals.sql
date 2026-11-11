CREATE TABLE IF NOT EXISTS download_totals (
  day TEXT NOT NULL,
  app TEXT NOT NULL,
  release_tag TEXT NOT NULL,
  file_name TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  bytes_total INTEGER NOT NULL DEFAULT 0 CHECK (bytes_total >= 0),
  last_received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (day, app, release_tag)
);

CREATE INDEX IF NOT EXISTS idx_download_totals_app_day
  ON download_totals (app, day DESC);
