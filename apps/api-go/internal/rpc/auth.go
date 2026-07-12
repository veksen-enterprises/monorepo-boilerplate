package rpc

import (
	"context"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
)

// Authenticator resolves the caller's user id from request headers, or nil when
// unauthenticated. It's an interface so tests can inject a fake without hitting Clerk.
type Authenticator interface {
	UserID(ctx context.Context, h http.Header) *string
}

// ClerkAuth verifies a Clerk session JWT from the Authorization: Bearer header.
// Requires clerk.SetKey(secret) to have been called at startup.
type ClerkAuth struct{}

func (ClerkAuth) UserID(ctx context.Context, h http.Header) *string {
	authz := h.Get("Authorization")
	token := strings.TrimPrefix(authz, "Bearer ")
	if token == "" || token == authz {
		return nil
	}
	claims, err := jwt.Verify(ctx, &jwt.VerifyParams{Token: token})
	if err != nil {
		return nil
	}
	return &claims.Subject
}
