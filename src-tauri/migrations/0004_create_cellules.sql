CREATE TABLE IF NOT EXISTS cellules (
    id TEXT PRIMARY KEY NOT NULL,
    prison_id TEXT NOT NULL,
    code TEXT NOT NULL,
    cellule_name TEXT,
    capacity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prison_id)
        REFERENCES prisons(id)
        ON DELETE CASCADE,

    UNIQUE (prison_id, code)
);

CREATE INDEX idx_cells_prison_id
ON cellules(prison_id);