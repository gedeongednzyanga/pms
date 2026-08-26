CREATE TABLE IF NOT EXISTS crimes (
    id TEXT PRIMARY KEY NOT NULL,
    crime_name TEXT,
    description_crime TEXT,
    statut_crime TEXT CHECK(statut_crime IN ('active', 'desactive')) DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO crimes (id, crime_name, description_crime) VALUES
('crime-1', 'Vol', '-'),
('crime-2', 'Meurtre', '-'),
('crime-3', 'Agression', '-'),
('crime-4', 'Escroquerie', '-');