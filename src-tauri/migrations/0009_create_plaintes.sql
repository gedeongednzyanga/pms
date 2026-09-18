CREATE TABLE IF NOT EXISTS plaintes (
    id TEXT PRIMARY KEY,

    objet TEXT NOT NULL,
    description TEXT NOT NULL,

    date_faits TEXT,
    lieu_faits TEXT,

    statut TEXT NOT NULL DEFAULT 'ENREGISTREE' CHECK (statut IN (
            'ENREGISTREE',
            'EN_COURS',
            'TRANSMISE',
            'CLASSEE',
            'CLOTUREE'
        )
    ),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

);