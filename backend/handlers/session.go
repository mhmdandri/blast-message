package handlers

import (
	"fmt"
	"net/http"

	"blast-message-backend/client"
	"blast-message-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SessionHandler struct {
	wahaClient *client.WahaClient
}

func NewSessionHandler(wahaClient *client.WahaClient) *SessionHandler {
	return &SessionHandler{wahaClient: wahaClient}
}

// InitSession handles POST /api/sessions/init
func (h *SessionHandler) InitSession(c *gin.Context) {
	sessionID := fmt.Sprintf("session_%s", uuid.New().String()[:8])

	err := h.wahaClient.CreateAndStartSession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to initialize session: %v", err),
		})
		return
	}

	statusInfo, _ := h.wahaClient.GetSessionStatus(sessionID)
	status := "SCAN_QR_CODE"
	if statusInfo != nil && statusInfo.Status != "" {
		status = statusInfo.Status
	}

	c.JSON(http.StatusOK, models.SessionInitResponse{
		SessionID: sessionID,
		Status:    status,
		Message:   "WhatsApp session created successfully",
	})
}

// GetQR handles GET /api/sessions/:id/qr
func (h *SessionHandler) GetQR(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	qrDataUri, rawImage, err := h.wahaClient.GetQRCode(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":     fmt.Sprintf("Failed to get QR code: %v", err),
			"sessionId": sessionID,
		})
		return
	}

	// If format=raw is passed or request accepts image, return raw image bytes
	if c.Query("format") == "raw" && len(rawImage) > 0 {
		c.Data(http.StatusOK, "image/png", rawImage)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessionId": sessionID,
		"qr":        qrDataUri,
	})
}

// GetStatus handles GET /api/sessions/:id/status
func (h *SessionHandler) GetStatus(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	sessionInfo, err := h.wahaClient.GetSessionStatus(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":     fmt.Sprintf("Failed to get session status: %v", err),
			"sessionId": sessionID,
		})
		return
	}

	c.JSON(http.StatusOK, models.SessionStatusResponse{
		SessionID: sessionID,
		Status:    sessionInfo.Status,
		Me:        sessionInfo.Me,
	})
}

// LogoutSession handles POST /api/sessions/:id/logout
func (h *SessionHandler) LogoutSession(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	err := h.wahaClient.LogoutAndDeleteSession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to logout session: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessionId": sessionID,
		"message":   "Session logged out and cleaned up successfully",
	})
}

// RestartSession handles POST /api/sessions/:id/restart
func (h *SessionHandler) RestartSession(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	err := h.wahaClient.RestartSession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to restart session: %v", err),
		})
		return
	}

	statusInfo, _ := h.wahaClient.GetSessionStatus(sessionID)
	status := "STARTING"
	if statusInfo != nil && statusInfo.Status != "" {
		status = statusInfo.Status
	}

	c.JSON(http.StatusOK, gin.H{
		"sessionId": sessionID,
		"status":    status,
		"message":   "Session restart initiated",
	})
}

