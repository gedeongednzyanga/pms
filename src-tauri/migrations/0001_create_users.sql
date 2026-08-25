CREATE TABLE IF NOT EXISTS users (
    id NUMERIC PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    user_name TEXT,
    password TEXT,
    created_at TEXT,
    updated_at TEXT
);