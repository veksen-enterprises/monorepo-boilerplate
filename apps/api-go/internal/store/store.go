package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a note does not exist.
var ErrNotFound = errors.New("note not found")

// Note is the stored shape. AuthorID is nil when created anonymously.
type Note struct {
	ID        string
	AuthorID  *string
	Title     string
	Body      string
	CreatedAt time.Time
}

type CreateParams struct {
	Title    string
	Body     string
	AuthorID *string
}

// Store owns data access over a pgx pool. It's a managed dependency — tests run it
// against a real Postgres via testcontainers (see store_test.go).
type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

const columns = `id::text, author_id, title, body, created_at`

func (s *Store) List(ctx context.Context) ([]Note, error) {
	rows, err := s.pool.Query(ctx, `SELECT `+columns+` FROM notes ORDER BY created_at`)
	if err != nil {
		return nil, fmt.Errorf("list notes: %w", err)
	}
	defer rows.Close()

	notes := make([]Note, 0)
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.AuthorID, &n.Title, &n.Body, &n.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan note: %w", err)
		}
		notes = append(notes, n)
	}
	return notes, rows.Err()
}

func (s *Store) Get(ctx context.Context, id string) (Note, error) {
	var n Note
	err := s.pool.QueryRow(ctx, `SELECT `+columns+` FROM notes WHERE id = $1`, id).
		Scan(&n.ID, &n.AuthorID, &n.Title, &n.Body, &n.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Note{}, ErrNotFound
	}
	if err != nil {
		return Note{}, fmt.Errorf("get note: %w", err)
	}
	return n, nil
}

func (s *Store) Create(ctx context.Context, p CreateParams) (Note, error) {
	var n Note
	err := s.pool.QueryRow(ctx,
		`INSERT INTO notes (author_id, title, body) VALUES ($1, $2, $3) RETURNING `+columns,
		p.AuthorID, p.Title, p.Body,
	).Scan(&n.ID, &n.AuthorID, &n.Title, &n.Body, &n.CreatedAt)
	if err != nil {
		return Note{}, fmt.Errorf("create note: %w", err)
	}
	return n, nil
}

func (s *Store) DeleteOwnedBy(ctx context.Context, id, authorID string) (bool, error) {
	tag, err := s.pool.Exec(ctx, `DELETE FROM notes WHERE id = $1 AND author_id = $2`, id, authorID)
	if err != nil {
		return false, fmt.Errorf("delete note: %w", err)
	}
	return tag.RowsAffected() > 0, nil
}
