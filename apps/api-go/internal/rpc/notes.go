package rpc

import (
	"context"
	"errors"
	"strings"
	"time"

	"connectrpc.com/connect"

	notesv1 "github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/gen/notes/v1"
	"github.com/veksen-enterprises/monorepo-boilerplate/apps/api-go/internal/store"
)

// NotesServer implements notes.v1.NotesService against the shared @repo/proto contract.
type NotesServer struct {
	store *store.Store
	auth  Authenticator
}

func NewNotesServer(s *store.Store, auth Authenticator) *NotesServer {
	return &NotesServer{store: s, auth: auth}
}

func toProto(n store.Note) *notesv1.Note {
	authorID := ""
	if n.AuthorID != nil {
		authorID = *n.AuthorID
	}
	return &notesv1.Note{
		Id:        n.ID,
		AuthorId:  authorID,
		Title:     n.Title,
		Body:      n.Body,
		CreatedAt: n.CreatedAt.Format(time.RFC3339),
	}
}

func (s *NotesServer) ListNotes(ctx context.Context, _ *connect.Request[notesv1.ListNotesRequest]) (*connect.Response[notesv1.ListNotesResponse], error) {
	rows, err := s.store.List(ctx)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	out := make([]*notesv1.Note, 0, len(rows))
	for _, n := range rows {
		out = append(out, toProto(n))
	}
	return connect.NewResponse(&notesv1.ListNotesResponse{Notes: out}), nil
}

func (s *NotesServer) GetNote(ctx context.Context, req *connect.Request[notesv1.GetNoteRequest]) (*connect.Response[notesv1.GetNoteResponse], error) {
	n, err := s.store.Get(ctx, req.Msg.GetId())
	if errors.Is(err, store.ErrNotFound) {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&notesv1.GetNoteResponse{Note: toProto(n)}), nil
}

func (s *NotesServer) CreateNote(ctx context.Context, req *connect.Request[notesv1.CreateNoteRequest]) (*connect.Response[notesv1.CreateNoteResponse], error) {
	if strings.TrimSpace(req.Msg.GetTitle()) == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("title is required"))
	}
	n, err := s.store.Create(ctx, store.CreateParams{
		Title:    req.Msg.GetTitle(),
		Body:     req.Msg.GetBody(),
		AuthorID: s.auth.UserID(ctx, req.Header()),
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&notesv1.CreateNoteResponse{Note: toProto(n)}), nil
}

func (s *NotesServer) DeleteNote(ctx context.Context, req *connect.Request[notesv1.DeleteNoteRequest]) (*connect.Response[notesv1.DeleteNoteResponse], error) {
	userID := s.auth.UserID(ctx, req.Header())
	if userID == nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("authentication required"))
	}
	deleted, err := s.store.DeleteOwnedBy(ctx, req.Msg.GetId(), *userID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if !deleted {
		return nil, connect.NewError(connect.CodeNotFound, errors.New("note not found"))
	}
	return connect.NewResponse(&notesv1.DeleteNoteResponse{}), nil
}
