package services

import (
	"blast-message-backend/models"
	"testing"
)

func TestFormatMessage(t *testing.T) {
	guest := models.Guest{
		Name:  "Wulan & Partner",
		Phone: "08123456789",
		Code:  "01197",
		Link:  "https://weddingofandricica.me/Wulan%20%26%20Partner?code=01197",
	}

	template := "Halo {nama}, buka undangan: {link} dengan kode: {code}"
	got := FormatMessage(template, guest)
	expected := "Halo Wulan & Partner, buka undangan: https://weddingofandricica.me/Wulan%20%26%20Partner?code=01197 dengan kode: 01197"

	if got != expected {
		t.Fatalf("expected:\n%s\ngot:\n%s", expected, got)
	}

	// Test URL encoding with special characters in nama_encoded
	template2 := "https://weddingofandricica.me/{nama_encoded}?code={code}"
	got2 := FormatMessage(template2, guest)
	expected2 := "https://weddingofandricica.me/Wulan%20%26%20Partner?code=01197"
	if got2 != expected2 {
		t.Fatalf("expected2:\n%s\ngot2:\n%s", expected2, got2)
	}
}

