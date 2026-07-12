package store_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/store"
	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/testutil"
)

func TestStore_CreateThenGet(t *testing.T) {
	s := testutil.NewStore(t)
	ctx := context.Background()
	author := "user_123"

	created, err := s.Create(ctx, store.CreateParams{Title: "Ship api-go", Body: "wire turbo", AuthorID: &author})
	require.NoError(t, err)

	got, err := s.Get(ctx, created.ID)
	require.NoError(t, err)
	assert.Equal(t, "Ship api-go", got.Title)
	require.NotNil(t, got.AuthorID)
	assert.Equal(t, "user_123", *got.AuthorID)
}

func TestStore_DeleteOnlyForOwner(t *testing.T) {
	s := testutil.NewStore(t)
	ctx := context.Background()
	author := "user_1"
	n, err := s.Create(ctx, store.CreateParams{Title: "mine", AuthorID: &author})
	require.NoError(t, err)

	deleted, err := s.DeleteOwnedBy(ctx, n.ID, "user_2")
	require.NoError(t, err)
	assert.False(t, deleted)

	deleted, err = s.DeleteOwnedBy(ctx, n.ID, "user_1")
	require.NoError(t, err)
	assert.True(t, deleted)
}
