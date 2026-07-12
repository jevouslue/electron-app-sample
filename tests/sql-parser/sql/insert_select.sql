INSERT INTO archive_users (id, name)
SELECT id, name
FROM users
WHERE status = 'deleted'