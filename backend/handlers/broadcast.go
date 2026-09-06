package handlers

import (
	"fmt"
	"net/http"

	"blast-message-backend/client"
	"blast-message-backend/models"
	"blast-message-backend/services"

	"github.com/gin-gonic/gin"
)

type BroadcastHandler struct {
	broadcastService *services.BroadcastService
	wahaClient       *client.WahaClient
}

func NewBroadcastHandler(broadcastService *services.BroadcastService, wahaClient *client.WahaClient) *BroadcastHandler {
	return &BroadcastHandler{
		broadcastService: broadcastService,
		wahaClient:       wahaClient,
	}
}

// StartBroadcast handles POST /api/messages/broadcast
func (h *BroadcastHandler) StartBroadcast(c *gin.Context) {
	var req models.BroadcastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid request payload: %v", err),
		})
		return
	}

	if len(req.Guests) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Guest list cannot be empty",
		})
		return
	}

	if req.TemplateMessage == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Template message cannot be empty",
		})
		return
	}

	// Verify session status on WAHA before starting broadcast worker
	sessionInfo, err := h.wahaClient.GetSessionStatus(req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Gagal memverifikasi status sesi WAHA: %v", err),
		})
		return
	}

	if sessionInfo == nil || sessionInfo.Status != "WORKING" {
		currentStatus := "UNKNOWN"
		if sessionInfo != nil {
			currentStatus = sessionInfo.Status
		}
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":     fmt.Sprintf("Sesi WhatsApp tidak siap (Status WAHA: '%s'). Harap lakukan scan QR atau restart sesi.", currentStatus),
			"sessionId": req.SessionID,
			"status":    currentStatus,
		})
		return
	}

	broadcastID, err := h.broadcastService.StartBroadcast(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to start broadcast: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"broadcastId": broadcastID,
		"message":     "Broadcast started successfully",
		"totalGuests": len(req.Guests),
	})
}

// GetStatus handles GET /api/messages/broadcast/:id/status
func (h *BroadcastHandler) GetStatus(c *gin.Context) {
	broadcastID := c.Param("id")
	if broadcastID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Broadcast ID is required"})
		return
	}

	progress, exists := h.broadcastService.GetProgress(broadcastID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Broadcast task not found"})
		return
	}

	c.JSON(http.StatusOK, progress)
}
