-- Up
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY ASC,
    email TEXT UNIQUE,
    new_email TEXT UNIQUE,
    email_token TEXT,
    created INTEGER,
    updated INTEGER,
    last_user INTEGER,
    kdf_salt BLOB,
    srp_salt BLOB,
    srp_verifier BLOB,
    time_based_one_time_secret BLOB
);

-- Down
DROP TABLE Users;