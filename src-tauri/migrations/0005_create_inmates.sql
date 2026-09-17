CREATE TABLE IF NOT EXISTS inmates (
    id TEXT PRIMARY KEY NOT NULL,

    cellule_id TEXT NOT NULL,

    firstname TEXT NOT NULL,
    middlename TEXT,
    lastname TEXT NOT NULL,

    dob TEXT NOT NULL,

    sex TEXT NOT NULL DEFAULT 'Male',

    address TEXT NOT NULL,

    marital_status TEXT NOT NULL DEFAULT 'Single',

    arreter_par TEXT,
    lieu_arreter TEXT,

    date_from TEXT NOT NULL,
    date_to TEXT,

    emergency_name TEXT,
    emergency_relation TEXT,
    emergency_contact TEXT,

    photo_path TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cellule_id)
        REFERENCES cellules(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_inmates_cell_id
ON inmates(cellule_id);

CREATE INDEX IF NOT EXISTS idx_inmates_lastname
ON inmates(lastname);