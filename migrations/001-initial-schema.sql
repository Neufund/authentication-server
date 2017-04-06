-- Up
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY ASC,
    email TEXT UNIQUE NOT NULL,
    new_email TEXT UNIQUE,
    email_token TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kdf_salt BLOB NOT NULL,
    srp_salt BLOB NOT NULL,
    srp_verifier BLOB NOT NULL,
    time_based_one_time_secret BLOB NOT NULL
);

-- Down
DROP TABLE Users;