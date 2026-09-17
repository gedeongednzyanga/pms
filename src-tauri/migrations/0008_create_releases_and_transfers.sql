CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY NOT NULL,
    inmate_id TEXT NOT NULL UNIQUE,
    release_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inmate_id)
        REFERENCES inmates(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_releases_release_date
ON releases(release_date);

CREATE TABLE IF NOT EXISTS inmate_transfers (
    id TEXT PRIMARY KEY NOT NULL,
    inmate_id TEXT NOT NULL,
    from_cellule_id TEXT NOT NULL,
    to_cellule_id TEXT NOT NULL,
    transfer_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inmate_id)
        REFERENCES inmates(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (from_cellule_id)
        REFERENCES cellules(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (to_cellule_id)
        REFERENCES cellules(id)
        ON DELETE RESTRICT,
    CHECK (from_cellule_id != to_cellule_id)
);

CREATE INDEX IF NOT EXISTS idx_inmate_transfers_inmate_id
ON inmate_transfers(inmate_id);

CREATE INDEX IF NOT EXISTS idx_inmate_transfers_transfer_date
ON inmate_transfers(transfer_date);
