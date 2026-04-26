import React from "react";

export default function LoginPage({ onProviderClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "30vh" }}>
      <h2 style={{ marginBottom: 24 }}>Sign in</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 260 }}>
        {/* Microsoft Login Button */}
        <button
          style={{
            border: "1px solid #dadce0",
            borderRadius: 4,
            background: "#fff",
            color: "#3c4043",
            fontWeight: 500,
            fontSize: 16,
            padding: "0 24px 0 0",
            height: 24,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,.08)",
            cursor: "pointer"
          }}
          onClick={() => onProviderClick && onProviderClick("microsoft")}
        >
          <span style={{
            background: "#fff",
            borderRadius: 2,
            marginRight: 12,
            display: "flex",
            alignItems: "center",
            height: 24,
            width: 32,
            justifyContent: "center"
          }}>
            {/* Microsoft SVG from official brand site */}
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect width="9" height="9" x="1" y="1" fill="#F25022"/>
              <rect width="9" height="9" x="10" y="1" fill="#7FBA00"/>
              <rect width="9" height="9" x="1" y="10" fill="#00A4EF"/>
              <rect width="9" height="9" x="10" y="10" fill="#FFB900"/>
            </svg>
          </span>
          Sign in with Microsoft
        </button>
        {/* Google Login Button */}
        <button
          style={{
            border: "1px solid #dadce0",
            borderRadius: 4,
            background: "#fff",
            color: "#3c4043",
            fontWeight: 500,
            fontSize: 16,
            padding: "0 24px 0 0",
            height: 32,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,.08)",
            cursor: "pointer"
          }}
          onClick={() => onProviderClick && onProviderClick("google")}
        >
          <span style={{
            background: "#fff",
            borderRadius: 2,
            marginRight: 12,
            display: "flex",
            alignItems: "center",
            height: 24,
            width: 32,
            justifyContent: "center"
          }}>
            {/* Google G SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20">
              <g>
                <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.48a4.68 4.68 0 0 1-2.03 3.07v2.55h3.28c1.92-1.77 3.03-4.38 3.03-7.41z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.97-.9 6.63-2.44l-3.28-2.55c-.91.61-2.07.97-3.35.97-2.57 0-4.75-1.74-5.53-4.07H1.09v2.56A10 10 0 0 0 10 20z" fill="#34A853"/>
                <path d="M4.47 11.91A5.99 5.99 0 0 1 4.09 10c0-.66.11-1.31.18-1.91V5.53H1.09A10 10 0 0 0 0 10c0 1.64.39 3.19 1.09 4.47l3.38-2.56z" fill="#FBBC05"/>
                <path d="M10 4.01c1.47 0 2.78.51 3.81 1.51l2.85-2.85C14.97 1.09 12.7 0 10 0A10 10 0 0 0 1.09 5.53l3.38 2.56C5.25 5.75 7.43 4.01 10 4.01z" fill="#EA4335"/>
              </g>
            </svg>
          </span>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
