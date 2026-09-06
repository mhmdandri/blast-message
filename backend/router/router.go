package router

import (
	"net/http"

	"blast-message-backend/handlers"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Api-Key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func SetupRouter(sessionHandler *handlers.SessionHandler, broadcastHandler *handlers.BroadcastHandler) *gin.Engine {
	r := gin.Default()

	// Apply CORS
	r.Use(CORSMiddleware())

	// Healthcheck endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "WAHA Broadcast Service is running"})
	})

	api := r.Group("/api")
	{
		// Session endpoints
		api.POST("/sessions/init", sessionHandler.InitSession)
		api.GET("/sessions/:id/qr", sessionHandler.GetQR)
		api.GET("/sessions/:id/status", sessionHandler.GetStatus)
		api.POST("/sessions/:id/restart", sessionHandler.RestartSession)
		api.POST("/sessions/:id/logout", sessionHandler.LogoutSession)

		// Broadcast endpoints
		api.POST("/messages/broadcast", broadcastHandler.StartBroadcast)
		api.GET("/messages/broadcast/:id/status", broadcastHandler.GetStatus)
	}

	return r
}
