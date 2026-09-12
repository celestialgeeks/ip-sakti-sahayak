"use client";

export function WelcomeHero() {
  return (
    <div className="text-center mb-8">
      {/* Emblem */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--saffron-light), var(--emerald-light))",
          border: "2px dashed var(--emerald)",
        }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
            fill="var(--saffron)"
            opacity="0.85"
          />
          <path
            d="M12 14C12 14 8 18 8 20C8 21.1 9.79 22 12 22C14.21 22 16 21.1 16 20C16 18 12 14 12 14Z"
            fill="var(--emerald)"
            opacity="0.6"
          />
          <circle cx="12" cy="12" r="2.5" fill="white" stroke="var(--emerald)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="headline-xl mb-2" style={{ color: "var(--ink-primary)" }}>
        Welcome to IP-SAKTI Sahayak
      </h1>

      {/* Subtitle */}
      <p className="body-lg" style={{ color: "var(--ink-muted)", maxWidth: "520px", margin: "0 auto" }}>
        Empowering Ayush Patent Intelligence & Classical Knowledge Defence — Ministry of Ayush
      </p>
    </div>
  );
}
