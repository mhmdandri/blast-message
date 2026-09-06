package services

import (
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"sync"
	"time"

	"blast-message-backend/client"
	"blast-message-backend/models"

	"github.com/google/uuid"
)

type BroadcastService struct {
	wahaClient *client.WahaClient
	store      map[string]*models.BroadcastProgress
	mu         sync.RWMutex
}

func NewBroadcastService(wahaClient *client.WahaClient) *BroadcastService {
	return &BroadcastService{
		wahaClient: wahaClient,
		store:      make(map[string]*models.BroadcastProgress),
	}
}

// NormalizePhone converts phone numbers to international WhatsApp format (628xxx@c.us)
func NormalizePhone(phone string) string {
	// Remove non-digit characters
	re := regexp.MustCompile(`\D`)
	cleaned := re.ReplaceAllString(phone, "")

	if strings.HasPrefix(cleaned, "0") {
		cleaned = "62" + cleaned[1:]
	} else if !strings.HasPrefix(cleaned, "62") && len(cleaned) > 0 {
		cleaned = "62" + cleaned
	}

	if !strings.HasSuffix(cleaned, "@c.us") {
		cleaned = cleaned + "@c.us"
	}

	return cleaned
}

// Slugify converts string to URL friendly slug (e.g. "Budi Santoso" -> "budi-santoso")
func Slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	re := regexp.MustCompile(`[^\w\s-]`)
	s = re.ReplaceAllString(s, "")
	reSpace := regexp.MustCompile(`[\s_]+`)
	return reSpace.ReplaceAllString(s, "-")
}

// FormatMessage replaces placeholders like {nama}, {name}, {nomor}, {phone}, {link}, {url}, {slug}, {nama_encoded}
func FormatMessage(template string, guest models.Guest) string {
	msg := template
	nameSlug := Slugify(guest.Name)
	nameEncoded := strings.ReplaceAll(guest.Name, " ", "+")

	msg = strings.ReplaceAll(msg, "{nama}", guest.Name)
	msg = strings.ReplaceAll(msg, "{NAMA}", guest.Name)
	msg = strings.ReplaceAll(msg, "{name}", guest.Name)
	msg = strings.ReplaceAll(msg, "{NAME}", guest.Name)
	msg = strings.ReplaceAll(msg, "{nomor}", guest.Phone)
	msg = strings.ReplaceAll(msg, "{phone}", guest.Phone)
	msg = strings.ReplaceAll(msg, "{slug}", nameSlug)
	msg = strings.ReplaceAll(msg, "{nama_encoded}", nameEncoded)
	msg = strings.ReplaceAll(msg, "{link}", guest.Link)
	msg = strings.ReplaceAll(msg, "{LINK}", guest.Link)
	msg = strings.ReplaceAll(msg, "{url}", guest.Link)
	msg = strings.ReplaceAll(msg, "{URL}", guest.Link)
	return msg
}

// StartBroadcast initializes a new background broadcast process
func (s *BroadcastService) StartBroadcast(req models.BroadcastRequest) (string, error) {
	broadcastID := fmt.Sprintf("broadcast_%s", uuid.New().String()[:8])

	logs := make([]models.BroadcastLog, len(req.Guests))
	for i, guest := range req.Guests {
		logs[i] = models.BroadcastLog{
			GuestName: guest.Name,
			Phone:     guest.Phone,
			ChatID:    NormalizePhone(guest.Phone),
			Status:    "PENDING",
		}
	}

	progress := &models.BroadcastProgress{
		BroadcastID: broadcastID,
		SessionID:   req.SessionID,
		Total:       len(req.Guests),
		Sent:        0,
		Failed:      0,
		Status:      "IN_PROGRESS",
		Logs:        logs,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	s.mu.Lock()
	s.store[broadcastID] = progress
	s.mu.Unlock()

	// Launch Goroutine Worker
	go s.runWorker(broadcastID, req)

	return broadcastID, nil
}

// runWorker processes each message sequentially with a random delay of 4-8 seconds
func (s *BroadcastService) runWorker(broadcastID string, req models.BroadcastRequest) {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	consecutiveSessionFailures := 0

	for i, guest := range req.Guests {
		// Calculate random delay between 4000ms and 8000ms (4 - 8 seconds)
		delayMs := 4000 + rng.Intn(4000)
		time.Sleep(time.Duration(delayMs) * time.Millisecond)

		chatID := NormalizePhone(guest.Phone)
		messageText := FormatMessage(req.TemplateMessage, guest)

		err := s.wahaClient.SendTextMessage(req.SessionID, chatID, messageText)

		s.mu.Lock()
		progress, exists := s.store[broadcastID]
		if exists {
			progress.UpdatedAt = time.Now()
			if err != nil {
				progress.Failed++
				progress.Logs[i].Status = "FAILED"
				progress.Logs[i].Error = err.Error()

				if strings.Contains(err.Error(), "422") || strings.Contains(err.Error(), "Session status is not as expected") {
					consecutiveSessionFailures++
				}
			} else {
				progress.Sent++
				progress.Logs[i].Status = "SUCCESS"
				consecutiveSessionFailures = 0
			}
			progress.Logs[i].SentAt = time.Now()
		}
		s.mu.Unlock()

		// Stop broadcast if session is completely disconnected/failed
		if consecutiveSessionFailures >= 2 {
			s.mu.Lock()
			if progress, exists := s.store[broadcastID]; exists {
				progress.Status = "STOPPED_SESSION_FAILED"
				progress.UpdatedAt = time.Now()
			}
			s.mu.Unlock()
			return
		}
	}

	// Mark status as COMPLETED if not aborted
	s.mu.Lock()
	if progress, exists := s.store[broadcastID]; exists && progress.Status == "IN_PROGRESS" {
		progress.Status = "COMPLETED"
		progress.UpdatedAt = time.Now()
	}
	s.mu.Unlock()
}

// GetProgress returns current broadcast status
func (s *BroadcastService) GetProgress(broadcastID string) (*models.BroadcastProgress, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	progress, exists := s.store[broadcastID]
	if !exists {
		return nil, false
	}
	// Return copy
	progressCopy := *progress
	return &progressCopy, true
}
