package config

import (
	"fmt"
	"os"
)

// Config holds the validated environment. Load fails fast when a required var is missing.
type Config struct {
	DatabaseURL    string
	Port           string
	ClerkSecretKey string
}

func Load() (Config, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return Config{
		DatabaseURL:    dsn,
		Port:           port,
		ClerkSecretKey: os.Getenv("CLERK_SECRET_KEY"),
	}, nil
}
