# Auth Service Database

## Tables

### users
| Column | Type | Description |
|------|----|------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique user email |
| password | TEXT | Hashed password |
| role | VARCHAR | USER / ADMIN |
| created_at | TIMESTAMP | Creation time |