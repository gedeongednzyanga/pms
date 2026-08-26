CREATE TABLE IF NOT EXISTS prisons (
    id NUMERIC PRIMARY KEY,
    prison_name TEXT,
    address_prison TEXT,
    statut_prison TEXT CHECK(statut_prison IN ('active', 'desactive')) DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);