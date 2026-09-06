package main

import (
	"fmt"
	"log"

	"blast-message-backend/client"
	"blast-message-backend/config"
	"blast-message-backend/handlers"
	"blast-message-backend/router"
	"blast-message-backend/services"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	log.Printf("Starting WAHA Broadcast Backend Server...")
	log.Printf("Target WAHA Base URL: %s", cfg.WahaBaseURL)
	log.Printf("Server Port: %s", cfg.Port)

	// 2. Initialize WAHA Client
	wahaClient := client.NewWahaClient(cfg)

	// 3. Initialize Services
	broadcastService := services.NewBroadcastService(wahaClient)

	// 4. Initialize Handlers
	sessionHandler := handlers.NewSessionHandler(wahaClient)
	broadcastHandler := handlers.NewBroadcastHandler(broadcastService, wahaClient)

	// 5. Setup Router & Routes
	r := router.SetupRouter(sessionHandler, broadcastHandler)

	// 6. Run HTTP Server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Listening on http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
