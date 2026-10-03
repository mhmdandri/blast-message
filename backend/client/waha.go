package client

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"blast-message-backend/config"
	"blast-message-backend/models"
)

type WahaClient struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

func NewWahaClient(cfg *config.Config) *WahaClient {
	return &WahaClient{
		BaseURL: strings.TrimRight(cfg.WahaBaseURL, "/"),
		APIKey:  cfg.WahaAPIKey,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// setHeaders adds common headers to the HTTP request
func (w *WahaClient) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	if w.APIKey != "" {
		req.Header.Set("X-Api-Key", w.APIKey)
	}
}

// CreateAndStartSession creates and starts a WAHA session
func (w *WahaClient) CreateAndStartSession(sessionID string) error {
	payload := models.WahaCreateSessionPayload{
		Name:  sessionID,
		Start: true,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal create session payload: %w", err)
	}

	url := fmt.Sprintf("%s/api/sessions", w.BaseURL)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request to WAHA: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// If session already exists, attempt to start it directly
	if resp.StatusCode == http.StatusConflict || resp.StatusCode == 409 || resp.StatusCode == 400 {
		return w.StartSession(sessionID)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("WAHA create session returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Make sure start endpoint is called if needed
	_ = w.StartSession(sessionID)
	return nil
}

// StartSession triggers session start
func (w *WahaClient) StartSession(sessionID string) error {
	url := fmt.Sprintf("%s/api/sessions/%s/start", w.BaseURL, sessionID)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusUnprocessableEntity {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("WAHA start session status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// RestartSession attempts to restart a stopped or failed WAHA session
func (w *WahaClient) RestartSession(sessionID string) error {
	url := fmt.Sprintf("%s/api/sessions/%s/restart", w.BaseURL, sessionID)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// Fallback to start endpoint if restart endpoint is not available
		return w.StartSession(sessionID)
	}

	return nil
}

// GetSessionStatus retrieves session info and status
func (w *WahaClient) GetSessionStatus(sessionID string) (*models.WahaSessionInfo, error) {
	url := fmt.Sprintf("%s/api/sessions/%s", w.BaseURL, sessionID)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to reach WAHA: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusNotFound {
		return &models.WahaSessionInfo{
			Name:   sessionID,
			Status: "NOT_FOUND",
		}, nil
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("WAHA session status returned %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var sessionInfo models.WahaSessionInfo
	if err := json.Unmarshal(bodyBytes, &sessionInfo); err != nil {
		return nil, fmt.Errorf("failed to parse WAHA session status response: %w", err)
	}

	return &sessionInfo, nil
}

// GetQRCode fetches the QR code image or raw base64 from WAHA
func (w *WahaClient) GetQRCode(sessionID string) (qrDataUri string, rawImage []byte, err error) {
	// Try standard endpoints GET /api/sessions/{session}/auth/qr or GET /api/{session}/auth/qr
	endpoints := []string{
		fmt.Sprintf("%s/api/sessions/%s/auth/qr", w.BaseURL, sessionID),
		fmt.Sprintf("%s/api/%s/auth/qr", w.BaseURL, sessionID),
	}

	var lastErr error
	for _, url := range endpoints {
		req, reqErr := http.NewRequest(http.MethodGet, url, nil)
		if reqErr != nil {
			lastErr = reqErr
			continue
		}
		w.setHeaders(req)

		resp, respErr := w.HTTPClient.Do(req)
		if respErr != nil {
			lastErr = respErr
			continue
		}

		bodyBytes, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			lastErr = readErr
			continue
		}

		if resp.StatusCode == http.StatusOK {
			contentType := resp.Header.Get("Content-Type")

			// Check if response is raw PNG/JPEG image
			if strings.HasPrefix(contentType, "image/") || len(bodyBytes) > 0 && bodyBytes[0] == 0x89 && bodyBytes[1] == 'P' {
				base64Str := base64.StdEncoding.EncodeToString(bodyBytes)
				return fmt.Sprintf("data:image/png;base64,%s", base64Str), bodyBytes, nil
			}

			// Try parsing JSON response (e.g., {"value": "data:image/png;base64,..."} or {"qr": "..."})
			var jsonMap map[string]interface{}
			if jsonErr := json.Unmarshal(bodyBytes, &jsonMap); jsonErr == nil {
				if val, ok := jsonMap["value"].(string); ok && val != "" {
					if !strings.HasPrefix(val, "data:") {
						val = "data:image/png;base64," + val
					}
					return val, nil, nil
				}
				if val, ok := jsonMap["qr"].(string); ok && val != "" {
					if !strings.HasPrefix(val, "data:") {
						val = "data:image/png;base64," + val
					}
					return val, nil, nil
				}
			}

			// Fallback string if body is raw base64 string
			bodyStr := strings.TrimSpace(string(bodyBytes))
			if strings.HasPrefix(bodyStr, "data:image/") {
				return bodyStr, nil, nil
			}
			if len(bodyStr) > 50 {
				return "data:image/png;base64," + bodyStr, nil, nil
			}
		} else {
			lastErr = fmt.Errorf("QR endpoint %s returned status %d: %s", url, resp.StatusCode, string(bodyBytes))
		}
	}

	return "", nil, fmt.Errorf("failed to fetch QR code: %v", lastErr)
}

// SendTextMessage sends a WhatsApp text message via POST /api/sendText
func (w *WahaClient) SendTextMessage(sessionID, chatId, text string, linkPreview bool) error {
	payload := models.WahaSendTextPayload{
		Session:                sessionID,
		ChatID:                 chatId,
		Text:                   text,
		LinkPreview:            linkPreview,
		LinkPreviewHighQuality: linkPreview,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/sendText", w.BaseURL)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to WAHA sendText: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("WAHA sendText returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// LogoutSession logs out from WhatsApp Web
func (w *WahaClient) LogoutSession(sessionID string) error {
	url := fmt.Sprintf("%s/api/sessions/%s/logout", w.BaseURL, sessionID)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

// DeleteSession stops and deletes the session in WAHA
func (w *WahaClient) DeleteSession(sessionID string) error {
	url := fmt.Sprintf("%s/api/sessions/%s", w.BaseURL, sessionID)
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		return err
	}
	w.setHeaders(req)

	resp, err := w.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

// LogoutAndDeleteSession performs both logout and delete for clean session destruction
func (w *WahaClient) LogoutAndDeleteSession(sessionID string) error {
	_ = w.LogoutSession(sessionID)
	return w.DeleteSession(sessionID)
}
