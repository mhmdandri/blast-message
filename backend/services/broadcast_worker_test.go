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

	// Test default wedding invitation template with {nama_tamu} and {link_undangan}
	weddingTemplate := `Kepada Yth.
{nama_tamu}

Assalamualaikum Warahmatullahi Wabarakatuh

Berikut link undangan kami, untuk info lengkap acara bisa kunjungi :
{link_undangan}

Salam hangat dari kami sekeluarga.
Cica & Andri`

	expectedWedding := `Kepada Yth.
Wulan & Partner

Assalamualaikum Warahmatullahi Wabarakatuh

Berikut link undangan kami, untuk info lengkap acara bisa kunjungi :
https://weddingofandricica.me/Wulan%20%26%20Partner?code=01197

Salam hangat dari kami sekeluarga.
Cica & Andri`

	gotWedding := FormatMessage(weddingTemplate, guest)
	if gotWedding != expectedWedding {
		t.Fatalf("expectedWedding:\n%s\ngotWedding:\n%s", expectedWedding, gotWedding)
	}
}

func TestNormalizePhone(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"08123456789", "628123456789@c.us"},
		{"8123456789", "628123456789@c.us"},
		{"+628123456789", "628123456789@c.us"},
		{"628123456789@c.us", "628123456789@c.us"},
		{"0812-3456-789", "628123456789@c.us"},
		{"", ""},
		{"   ", ""},
		{"abc-xyz", ""},
	}

	for _, tc := range tests {
		got := NormalizePhone(tc.input)
		if got != tc.expected {
			t.Errorf("NormalizePhone(%q) = %q; want %q", tc.input, got, tc.expected)
		}
	}
}

