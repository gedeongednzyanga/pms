CREATE TABLE IF NOT EXISTS users (
    id NUMERIC PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    user_name TEXT,
    password TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UTILISATEUR PAR DEFAUT
INSERT INTO users (id, first_name, last_name, user_name, password) VALUES
(1, 'Admin', 'PMS', 'admin', 'admin123')