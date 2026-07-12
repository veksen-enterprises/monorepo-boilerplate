package rpc_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"connectrpc.com/connect"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	notesv1 "github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/gen/notes/v1"
	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/gen/notes/v1/notesv1connect"
	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/rpc"
	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/testutil"
)

// fakeAuth injects a user id without hitting Clerk (an unmanaged dependency).
type fakeAuth struct{ userID *string }

func (f fakeAuth) UserID(_ context.Context, _ http.Header) *string { return f.userID }

// newClient serves the connect handler over httptest and returns a typed client —
// the HTTP boundary is exercised end to end (routing, codec, handler, store).
func newClient(t *testing.T, userID *string) notesv1connect.NotesServiceClient {
	t.Helper()
	srv := rpc.NewNotesServer(testutil.NewStore(t), fakeAuth{userID: userID})
	mux := http.NewServeMux()
	mux.Handle(notesv1connect.NewNotesServiceHandler(srv))
	ts := httptest.NewServer(mux)
	t.Cleanup(ts.Close)
	return notesv1connect.NewNotesServiceClient(ts.Client(), ts.URL)
}

func TestNotes_CreateAndList(t *testing.T) {
	client := newClient(t, nil)
	ctx := context.Background()

	created, err := client.CreateNote(ctx, connect.NewRequest(&notesv1.CreateNoteRequest{Title: "Buy milk", Body: "2%"}))
	require.NoError(t, err)
	assert.Equal(t, "Buy milk", created.Msg.GetNote().GetTitle())

	list, err := client.ListNotes(ctx, connect.NewRequest(&notesv1.ListNotesRequest{}))
	require.NoError(t, err)
	assert.Len(t, list.Msg.GetNotes(), 1)
}

func TestNotes_CreateEmptyTitleIsInvalidArgument(t *testing.T) {
	client := newClient(t, nil)

	_, err := client.CreateNote(context.Background(), connect.NewRequest(&notesv1.CreateNoteRequest{Title: "  "}))

	require.Error(t, err)
	assert.Equal(t, connect.CodeInvalidArgument, connect.CodeOf(err))
}

func TestNotes_GetUnknownIsNotFound(t *testing.T) {
	client := newClient(t, nil)

	_, err := client.GetNote(context.Background(), connect.NewRequest(&notesv1.GetNoteRequest{
		Id: "00000000-0000-0000-0000-000000000000",
	}))

	require.Error(t, err)
	assert.Equal(t, connect.CodeNotFound, connect.CodeOf(err))
}

func TestNotes_DeleteUnauthenticated(t *testing.T) {
	client := newClient(t, nil)
	created, err := client.CreateNote(context.Background(), connect.NewRequest(&notesv1.CreateNoteRequest{Title: "temp"}))
	require.NoError(t, err)

	_, err = client.DeleteNote(context.Background(), connect.NewRequest(&notesv1.DeleteNoteRequest{
		Id: created.Msg.GetNote().GetId(),
	}))

	require.Error(t, err)
	assert.Equal(t, connect.CodeUnauthenticated, connect.CodeOf(err))
}

func TestNotes_DeleteByOwner(t *testing.T) {
	user := "user_1"
	client := newClient(t, &user)
	created, err := client.CreateNote(context.Background(), connect.NewRequest(&notesv1.CreateNoteRequest{Title: "temp"}))
	require.NoError(t, err)

	_, err = client.DeleteNote(context.Background(), connect.NewRequest(&notesv1.DeleteNoteRequest{
		Id: created.Msg.GetNote().GetId(),
	}))
	require.NoError(t, err)

	_, err = client.GetNote(context.Background(), connect.NewRequest(&notesv1.GetNoteRequest{
		Id: created.Msg.GetNote().GetId(),
	}))
	assert.Equal(t, connect.CodeNotFound, connect.CodeOf(err))
}
