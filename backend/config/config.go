package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	WahaBaseURL string
	WahaAPIKey  string
	Port        string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: .env file not found or could not be loaded, using environment variables")
	}

	wahaBaseURL := os.Getenv("WAHA_BASE_URL")
	if wahaBaseURL == "" {
		wahaBaseURL = "https://wa.mohaproject.tech"
	}

	wahaAPIKey := os.Getenv("WAHA_API_KEY")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		WahaBaseURL: wahaBaseURL,
		WahaAPIKey:  wahaAPIKey,
		Port:        port,
	}
}
