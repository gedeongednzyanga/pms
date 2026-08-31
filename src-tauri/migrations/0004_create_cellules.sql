CREATE TABLE IF NOT EXISTS cellules (
    id TEXT PRIMARY KEY,

    prison_id TEXT NOT NULL,

    code TEXT,
    cellule_name TEXT NOT NULL,

    capacity INTEGER NOT NULL DEFAULT 0,

    statut_cellule TEXT NOT NULL
        CHECK(statut_cellule IN ('active', 'desactive'))
        DEFAULT 'active',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (prison_id)
        REFERENCES prisons(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cellules_code
ON cellules(code)
WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cellules_prison_id
ON cellules(prison_id);

CREATE INDEX IF NOT EXISTS idx_cellules_statut
ON cellules(statut_cellule);