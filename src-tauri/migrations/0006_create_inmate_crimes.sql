CREATE TABLE IF NOT EXISTS inmate_crimes (
    inmate_id TEXT NOT NULL,
    crime_id TEXT NOT NULL,

    PRIMARY KEY (
        inmate_id,
        crime_id
    ),

    FOREIGN KEY (inmate_id)
        REFERENCES inmates(id)
        ON DELETE CASCADE,

    FOREIGN KEY (crime_id)
        REFERENCES crimes(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inmate_crimes_inmate_id
ON inmate_crimes(inmate_id);

CREATE INDEX IF NOT EXISTS idx_inmate_crimes_crime_id
ON inmate_crimes(crime_id);