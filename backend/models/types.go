package models

import "time"

// Guest represents a target message recipient
type Guest struct {
	Name  string `json:"name" binding:"required"`
	Phone string `json:"phone" binding:"required"`
	Link  string `json:"link,omitempty"`
}

// BroadcastRequest payload from frontend
type BroadcastRequest struct {
	SessionID       string  `json:"sessionId" binding:"required"`
	Guests          []Guest `json:"guests" binding:"required,gt=0"`
	TemplateMessage string  `json:"templateMessage" binding:"required"`
}

// BroadcastLog details per guest
type BroadcastLog struct {
	GuestName string    `json:"guestName"`
	Phone     string    `json:"phone"`
	ChatID    string    `json:"chatId"`
	Status    string    `json:"status"` // PENDING, SUCCESS, FAILED
	Error     string    `json:"error,omitempty"`
	SentAt    time.Time `json:"sentAt,omitempty"`
}

// BroadcastProgress tracks real-time progress
type BroadcastProgress struct {
	BroadcastID string         `json:"broadcastId"`
	SessionID   string         `json:"sessionId"`
	Total       int            `json:"total"`
	Sent        int            `json:"sent"`
	Failed      int            `json:"failed"`
	Status      string         `json:"status"` // IN_PROGRESS, COMPLETED, STOPPED
	Logs        []BroadcastLog `json:"logs"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

// SessionInitResponse payload
type SessionInitResponse struct {
	SessionID string `json:"sessionId"`
	Status    string `json:"status"`
	Message   string `json:"message"`
}

// SessionStatusResponse payload
type SessionStatusResponse struct {
	SessionID string      `json:"sessionId"`
	Status    string      `json:"status"`
	Me        interface{} `json:"me,omitempty"`
}

// WAHA Session Request DTO
type WahaCreateSessionPayload struct {
	Name   string                 `json:"name"`
	Start  bool                   `json:"start"`
	Config map[string]interface{} `json:"config,omitempty"`
}

// WAHA Send Text Payload
type WahaSendTextPayload struct {
	Session string `json:"session"`
	ChatID  string `json:"chatId"`
	Text    string `json:"text"`
}

// WAHA Session Info Response
type WahaSessionInfo struct {
	Name   string      `json:"name"`
	Status string      `json:"status"`
	Me     interface{} `json:"me"`
}
