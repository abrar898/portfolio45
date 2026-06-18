"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    // Simulate API request latency
    await new Promise((r) => setTimeout(r, 1400));
    setSending(false);
    setFormSent(true);
  };

  return (
    <div className="contact-form-wrap">
      <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: "rgba(255,255,255,0.38)", marginBottom: 48 }}>
        Open to internships, freelance projects, and full-time opportunities. Drop me a message and I&apos;ll get back to you.
      </p>

      {formSent ? (
        <div style={{ padding: "48px 0" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 40, color: "var(--c-ember)", marginBottom: 12 }}>Message Sent ✓</div>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 14 }}>Thanks for reaching out. I&apos;ll reply shortly.</p>
          <button
            onClick={() => setFormSent(false)}
            style={{
              marginTop: 24,
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--c-ember)",
              background: "none",
              border: "1px solid rgba(255,42,95,0.3)",
              padding: "10px 24px",
              cursor: "none",
            }}
          >
            Send Another ↗
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { field: "name", label: "Your Name", type: "text", value: formData.name },
            { field: "email", label: "Email Address", type: "email", value: formData.email },
          ].map(({ field, label, type, value }) => (
            <div key={field} style={{ position: "relative", marginBottom: 32 }}>
              <input
                type={type}
                value={value}
                placeholder=" "
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--c-border)",
                  padding: "14px 0",
                  fontSize: 15,
                  color: "white",
                  outline: "none",
                  fontFamily: "var(--f-body)",
                  cursor: "none",
                }}
              />
              <label
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 0,
                  fontFamily: "var(--f-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  transition: "all 0.3s",
                  pointerEvents: "none",
                }}
              >
                {label}
              </label>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(to right, var(--c-ember), var(--c-gold))",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 0.4s var(--ease-expo)",
                }}
                className="input-line"
              />
            </div>
          ))}
          <div style={{ position: "relative", marginBottom: 40 }}>
            <textarea
              value={formData.message}
              placeholder="Your message..."
              rows={4}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--c-border)",
                padding: "14px 0",
                fontSize: 15,
                color: "white",
                outline: "none",
                resize: "none",
                fontFamily: "var(--f-body)",
                cursor: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(to right, var(--c-ember), var(--c-gold))",
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.4s var(--ease-expo)",
              }}
              className="input-line"
            />
          </div>
          <button
            className="magnetic"
            onClick={handleSend}
            disabled={sending}
            data-hover
            style={{
              alignSelf: "flex-start",
              fontFamily: "var(--f-mono)",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "white",
              background: "var(--c-ember)",
              border: "none",
              padding: "16px 44px",
              cursor: "none",
              opacity: sending ? 0.7 : 1,
              transition: "opacity 0.3s, box-shadow 0.3s",
              boxShadow: sending ? "none" : "0 0 24px rgba(255,42,95,0.35)",
            }}
          >
            {sending ? "Sending..." : "Send Message ↗"}
          </button>
        </div>
      )}
    </div>
  );
}
