import React from "react";
import { appleTheme } from "./theme";

// ========================================================
// 1. Paramedic Figurine (108 ALS Field EMT)
// Story: Field stabilization, live 5G vitals sync to cloud
// ========================================================
export const ParamedicFigurine: React.FC<{
  scale?: number;
  armAngle?: number;
  isReporting?: boolean;
  armMode?: "tablet" | "cpr" | "radio";
  showNarrativeBubble?: boolean;
}> = ({
  scale = 1,
  armAngle = 0,
  isReporting = true,
  armMode = "tablet",
  showNarrativeBubble = true,
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Story Narrative Action Bubble */}
      {showNarrativeBubble && (
        <div
          style={{
            position: "absolute",
            top: -24 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(18, 18, 20, 0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${appleTheme.neonMint}66`,
            borderRadius: 9999,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 4px 16px ${appleTheme.neonMint}33`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: appleTheme.neonMint,
              boxShadow: `0 0 6px ${appleTheme.neonMint}`,
            }}
          />
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 10 * scale,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.5,
            }}
          >
            5G VITALS SYNC • SPO2 88%
          </span>
        </div>
      )}

      <svg
        width={180 * scale}
        height={320 * scale}
        viewBox="0 0 180 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop Shadow */}
        <ellipse cx="90" cy="305" rx="55" ry="10" fill="rgba(0, 0, 0, 0.28)" />

        {/* Legs & Trousers */}
        <rect x="62" y="195" width="22" height="95" rx="6" fill="#1d1d1f" />
        <rect x="96" y="195" width="22" height="95" rx="6" fill="#1d1d1f" />
        {/* Boots */}
        <path d="M56 280 H86 V298 H50 Q50 280 56 280 Z" fill="#000000" />
        <path d="M96 280 H126 V298 H90 Q90 280 96 280 Z" fill="#000000" />

        {/* High-vis Reflective Stripe */}
        <rect x="62" y="258" width="22" height="5" fill="#ffd60a" />
        <rect x="96" y="258" width="22" height="5" fill="#ffd60a" />

        {/* Torso & High-Visibility Paramedic Jacket */}
        <path
          d="M52 105 C52 95 65 90 90 90 C115 90 128 95 128 105 L132 198 C132 203 126 206 120 206 H60 C54 206 48 203 48 198 Z"
          fill="#0066cc"
        />
        {/* Safety Stripes */}
        <path d="M50 145 H130 V153 H50 Z" fill="#ffd60a" />
        <path d="M50 168 H130 V176 H50 Z" fill="#f5f5f7" />

        {/* Medical Star of Life */}
        <circle cx="90" cy="125" r="14" fill="#ffffff" />
        <rect x="87" y="116" width="6" height="18" rx="2" fill="#ff453a" />
        <rect x="81" y="122" width="18" height="6" rx="2" fill="#ff453a" />

        {/* Head & Face */}
        <g>
          <ellipse cx="90" cy="62" rx="20" ry="24" fill="#FBD38D" />
          <circle cx="83" cy="60" r="2.5" fill="#1d1d1f" />
          <circle cx="97" cy="60" r="2.5" fill="#1d1d1f" />
          <path d="M85 70 Q90 75 95 70" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />

          {/* Paramedic Cap */}
          <path d="M66 52 C66 32 80 26 90 26 C100 26 114 32 114 52 Z" fill="#1d1d1f" />
          <rect x="62" y="48" width="56" height="6" rx="3" fill="#0066cc" />
        </g>

        {/* Left Arm */}
        <path
          d="M48 102 C38 120 36 150 42 175"
          stroke="#0066cc"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Right Arm: Holding Telemetry Tablet */}
        <g
          transform={`rotate(${armAngle}, 128, 105)`}
          style={{ transformOrigin: "128px 105px" }}
        >
          <path
            d="M128 105 C142 125 146 148 136 172"
            stroke="#0066cc"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle cx="136" cy="176" r="9" fill="#FBD38D" />

          {/* Apple iPad-Style Telemetry Device */}
          <g transform="translate(118, 148) rotate(-12)">
            <rect
              x="0"
              y="0"
              width="58"
              height="44"
              rx="6"
              fill="#1d1d1f"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.5"
            />
            <rect x="4" y="4" width="50" height="36" rx="3" fill="#000000" />
            {/* Crisp Static ECG Line */}
            <path
              d="M7 22 L16 22 L19 16 L22 28 L25 18 L28 22 L49 22"
              stroke={appleTheme.neonMint}
              strokeWidth="2"
              fill="none"
            />
            {/* 5G Wireless Status Beacon */}
            {isReporting && (
              <circle
                cx="46"
                cy="10"
                r="3"
                fill={appleTheme.neonBlue}
                opacity={0.9}
              />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

// ========================================================
// 2. Patient Figurine on Trauma Gurney
// Story: Trauma patient on ALS gurney with SpO2 and IV
// ========================================================
export const PatientFigurine: React.FC<{
  scale?: number;
  heartRateBeat?: number;
  showNarrativeBubble?: boolean;
}> = ({ scale = 1, heartRateBeat = 1, showNarrativeBubble = true }) => {
  // Pure static pose: gurney and patient
  const dropY = 62;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {showNarrativeBubble && (
        <div
          style={{
            position: "absolute",
            top: -26 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(18, 18, 20, 0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${appleTheme.neonRed}66`,
            borderRadius: 9999,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 4px 16px ${appleTheme.neonRed}33`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: appleTheme.neonRed,
              boxShadow: `0 0 6px ${appleTheme.neonRed}`,
            }}
          />
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 10 * scale,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.5,
            }}
          >
            CODE RED • CRITICAL HYPOXIA
          </span>
        </div>
      )}

      <svg
        width={340 * scale}
        height={180 * scale}
        viewBox="0 0 340 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground Shadow */}
        <ellipse cx="170" cy="170" rx="140" ry="8" fill="rgba(0, 0, 0, 0.22)" />

        {/* Gurney Wheels & Stand */}
        <circle cx="70" cy="162" r="9" fill="#1d1d1f" stroke="#0066cc" strokeWidth="2" />
        <circle cx="270" cy="162" r="9" fill="#1d1d1f" stroke="#0066cc" strokeWidth="2" />
        <path d="M70 162 L120 120 H220 L270 162" stroke="#7a7a7a" strokeWidth="5" strokeLinecap="round" />
        <path d="M120 162 L170 120 L220 162" stroke="#555555" strokeWidth="4" strokeLinecap="round" />

        {/* Mattress */}
        <rect x="40" y="105" width="260" height="16" rx="6" fill="#272729" />
        <rect x="42" y="96" width="256" height="10" rx="4" fill="#0066cc" />

        {/* Patient Resting on Gurney */}
        <g>
          <path
            d="M75 96 C75 80 120 72 190 72 C250 72 275 84 275 96 Z"
            fill="#333333"
          />
          {/* Patient Head */}
          <ellipse cx="80" cy="90" rx="18" ry="10" fill="#f5f5f7" />
          <ellipse cx="76" cy="82" rx="14" ry="15" fill="#FBD38D" />
          <path d="M72 82 Q76 85 80 82" stroke="#555555" strokeWidth="2" strokeLinecap="round" />
          {/* Oxygen Mask */}
          <path d="M68 84 Q62 88 68 92 Z" fill={appleTheme.neonBlue} opacity={0.7} />
          <path d="M64 90 Q50 98 46 112" stroke={appleTheme.neonBlue} strokeWidth="2" fill="none" />
        </g>

        {/* IV Drip Stand */}
        <rect x="282" y="24" width="4" height="90" rx="2" fill="#7a7a7a" />
        <path d="M276 24 H293" stroke="#7a7a7a" strokeWidth="2.5" />
        <rect x="273" y="28" width="10" height="18" rx="3" fill="#2997ff" opacity="0.75" />
        <path d="M278 46 Q270 65 240 82" stroke="#2997ff" strokeWidth="1.5" fill="none" />
        {/* Saline Droplet */}
        <circle cx="278" cy={dropY} r="2" fill="#ffffff" opacity={0.8} />

        {/* Vital Monitor Tag */}
        <g style={{ transformOrigin: "180px 45px" }}>
          <rect
            x="145"
            y="25"
            width="82"
            height="38"
            rx="8"
            fill="#1d1d1f"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
          />
          <text
            x="186"
            y="42"
            textAnchor="middle"
            fill={appleTheme.neonRed}
            fontSize="11"
            fontWeight="700"
            fontFamily={appleTheme.fontFamily}
          >
            SpO2 88%
          </text>
          <text
            x="186"
            y="55"
            textAnchor="middle"
            fill={appleTheme.neonMint}
            fontSize="10"
            fontWeight="600"
            fontFamily={appleTheme.fontFamily}
          >
            118 BPM
          </text>
        </g>
      </svg>
    </div>
  );
};

// ========================================================
// 3. Dispatcher Figurine (State Command Deck)
// Story: State operator at dual displays, routing 108 units
// ========================================================
export const DispatcherFigurine: React.FC<{
  scale?: number;
  showNarrativeBubble?: boolean;
}> = ({ scale = 1, showNarrativeBubble = true }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {showNarrativeBubble && (
        <div
          style={{
            position: "absolute",
            top: -24 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(18, 18, 20, 0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${appleTheme.neonBlue}66`,
            borderRadius: 9999,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 4px 16px ${appleTheme.neonBlue}33`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: appleTheme.neonBlue,
              boxShadow: `0 0 6px ${appleTheme.neonBlue}`,
            }}
          />
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 10 * scale,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.5,
            }}
          >
            HUNGARIAN ROUTER: RIMS OR-3 LOCKED
          </span>
        </div>
      )}

      <svg
        width={240 * scale}
        height={260 * scale}
        viewBox="0 0 240 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="120" cy="250" rx="90" ry="10" fill="rgba(0,0,0,0.25)" />

        {/* Command Desk */}
        <rect x="20" y="165" width="200" height="14" rx="4" fill="#272729" stroke="#3a3a3c" strokeWidth="1.5" />
        <rect x="110" y="179" width="20" height="65" fill="#1d1d1f" />
        <path d="M70 244 H170 V250 H70 Z" fill="#3a3a3c" />

        {/* Left Apple Studio Display (Hospital Capacity Matrix) */}
        <g transform="rotate(-5, 75, 120)">
          <rect x="35" y="80" width="80" height="75" rx="8" fill="#1d1d1f" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <rect x="40" y="85" width="70" height="65" rx="4" fill="#000000" />
          <circle cx="75" cy="115" r="20" stroke="#0066cc" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="82" cy="110" r="3" fill={appleTheme.neonMint} />
          <circle cx="68" cy="122" r="3" fill={appleTheme.neonRed} />
        </g>

        {/* Right Apple Studio Display (Highway GPS Telematics) */}
        <g transform="rotate(5, 165, 120)">
          <rect x="125" y="80" width="80" height="75" rx="8" fill="#1d1d1f" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <rect x="130" y="85" width="70" height="65" rx="4" fill="#000000" />
          <rect x="138" y="94" width="54" height="6" rx="2" fill={appleTheme.neonMint} opacity="0.8" />
          <rect x="138" y="106" width="42" height="6" rx="2" fill={appleTheme.neonBlue} opacity="0.8" />
          <rect x="138" y="118" width="50" height="6" rx="2" fill={appleTheme.neonAmber} opacity="0.8" />
        </g>

        {/* Ergonomic Office Chair */}
        <rect x="100" y="72" width="40" height="88" rx="8" fill="#1d1d1f" stroke="#333333" strokeWidth="2" />

        {/* Operator Body */}
        <path d="M102 120 C102 110 110 105 120 105 C130 105 138 110 138 120 L142 165 H98 Z" fill="#0066cc" />

        {/* Head with Headset */}
        <g>
          <ellipse cx="120" cy="85" rx="15" ry="18" fill="#FBD38D" />
          <path d="M105 78 C105 65 115 62 120 62 C125 62 135 65 135 78 Z" fill="#1d1d1f" />
          {/* Headset & Boom Mic */}
          <path d="M104 84 C104 68 136 68 136 84" stroke="#7a7a7a" strokeWidth="3" fill="none" />
          <rect x="101" y="80" width="6" height="12" rx="3" fill="#0066cc" />
          <rect x="133" y="80" width="6" height="12" rx="3" fill="#0066cc" />
          <path d="M103 90 L115 98" stroke="#7a7a7a" strokeWidth="2" />
          <circle cx="116" cy="98" r="2.5" fill={appleTheme.neonMint} />
        </g>

        {/* Static Hands on Keyboard */}
        <ellipse cx="106" cy={166} rx="5" ry="4" fill="#FBD38D" />
        <ellipse cx="134" cy={166} rx="5" ry="4" fill="#FBD38D" />
      </svg>
    </div>
  );
};

// ========================================================
// 4. Doctor / Trauma Surgeon Figurine
// Story: Trauma surgeon ready in OR surgical gear with pager
// ========================================================
export const DoctorFigurine: React.FC<{
  scale?: number;
  pagerAlert?: boolean;
  showNarrativeBubble?: boolean;
}> = ({ scale = 1, pagerAlert = true, showNarrativeBubble = true }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {showNarrativeBubble && (
        <div
          style={{
            position: "absolute",
            top: -24 * scale,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(18, 18, 20, 0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${appleTheme.neonRed}66`,
            borderRadius: 9999,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 4px 16px ${appleTheme.neonRed}33`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: appleTheme.neonRed,
              boxShadow: `0 0 6px ${appleTheme.neonRed}`,
            }}
          />
          <span
            style={{
              fontFamily: appleTheme.fontFamily,
              fontSize: 10 * scale,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.5,
            }}
          >
            TRAUMA SURGEON: OR-3 MOBILIZED
          </span>
        </div>
      )}

      <svg
        width={180 * scale}
        height={320 * scale}
        viewBox="0 0 180 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="90" cy="305" rx="55" ry="10" fill="rgba(0, 0, 0, 0.28)" />

        {/* Clean Static Legs */}
        <rect x="64" y="200" width="20" height="90" rx="6" fill="#0066cc" />
        <path d="M58 285 H88 V298 H52 Q52 285 58 285 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
        <rect x="96" y="200" width="20" height="90" rx="6" fill="#0066cc" />
        <path d="M96 285 H126 V298 H90 Q90 285 96 285 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />

        {/* Scrub Top */}
        <path d="M55 110 H125 V205 H55 Z" fill="#0066cc" />

        {/* Crisp White Lab Coat */}
        <path
          d="M50 110 L42 220 H68 L74 125 Z"
          fill="#ffffff"
          stroke="#e0e0e0"
          strokeWidth="1.5"
        />
        <path
          d="M130 110 L138 220 H112 L106 125 Z"
          fill="#ffffff"
          stroke="#e0e0e0"
          strokeWidth="1.5"
        />

        {/* Stethoscope */}
        <g>
          <path
            d="M74 115 Q90 155 106 115"
            stroke="#1d1d1f"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M90 145 V165" stroke="#1d1d1f" strokeWidth="2.5" />
          <circle cx="90" cy="168" r="6" fill="#7a7a7a" stroke="#1d1d1f" strokeWidth="2" />
        </g>

        {/* Doctor Head */}
        <ellipse cx="90" cy="62" rx="20" ry="24" fill="#FBD38D" />
        <circle cx="83" cy="60" r="2.5" fill="#1d1d1f" />
        <circle cx="97" cy="60" r="2.5" fill="#1d1d1f" />
        <path d="M85 70 Q90 75 95 70" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
        <path d="M68 54 C68 34 82 28 90 28 C98 28 112 34 112 54 Z" fill="#1d1d1f" />

        {/* Left Arm Raised */}
        <path d="M48 112 L32 165" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
        <circle cx="32" cy="168" r="8" fill="#FBD38D" />

        {/* Right Hand with Apple Watch / Trauma Pager */}
        <path d="M132 112 L142 165" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
        <circle cx="142" cy="168" r="8" fill="#FBD38D" />

        <g transform="translate(130, 150)">
          <rect
            x="0"
            y="0"
            width="48"
            height="32"
            rx="8"
            fill="#1d1d1f"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
          />
          <text
            x="24"
            y="15"
            textAnchor="middle"
            fill={appleTheme.neonRed}
            fontSize="9"
            fontWeight="700"
            fontFamily={appleTheme.fontFamily}
          >
            CODE RED
          </text>
          <text
            x="24"
            y="25"
            textAnchor="middle"
            fill={appleTheme.neonMint}
            fontSize="8"
            fontWeight="600"
            fontFamily={appleTheme.fontFamily}
          >
            OR 3 READY
          </text>
        </g>
      </svg>
    </div>
  );
};

// ========================================================
// 5. 108 Emergency Ambulance Figurine
// Story: High-speed ALS ambulance transport
// ========================================================
export const AmbulanceFigurine: React.FC<{
  scale?: number;
  lightPhase?: number;
  wheelRotation?: number;
  x?: number;
  y?: number;
}> = ({ scale = 1, lightPhase = 0, wheelRotation = 0, x = 0, y = 0 }) => {
  return (
    <svg
      x={x}
      y={y}
      width={420 * scale}
      height={220 * scale}
      viewBox="0 0 420 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground Siren Reflection Glows */}
      <ellipse cx="210" cy="195" rx="180" ry="12" fill="rgba(0, 0, 0, 0.25)" />

      {/* Ambulance Body */}
      <path
        d="M40 70 C40 60 50 50 62 50 H275 C285 50 295 56 302 65 L345 110 C352 118 358 126 365 128 H375 C382 128 388 134 388 142 V175 H32 Z"
        fill="#ffffff"
        stroke="#e0e0e0"
        strokeWidth="2.5"
      />

      {/* Tinted Cabin Glass */}
      <path
        d="M285 65 H270 V115 H335 L300 75 C296 70 290 65 285 65 Z"
        fill="#1d1d1f"
        opacity="0.85"
      />
      <rect x="75" y="70" width="60" height="36" rx="4" fill="#1d1d1f" opacity="0.8" />
      <rect x="155" y="70" width="60" height="36" rx="4" fill="#1d1d1f" opacity="0.8" />

      {/* State Health Authority Accent Stripes */}
      <path d="M34 140 H388 V148 H34 Z" fill="#ffd60a" />
      <path d="M34 148 H388 V156 H34 Z" fill="#0066cc" />

      {/* Red Cross */}
      <circle cx="115" cy="120" r="18" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
      <rect x="111" y="108" width="8" height="24" rx="2" fill="#ff453a" />
      <rect x="103" y="116" width="24" height="8" rx="2" fill="#ff453a" />

      <text
        x="210"
        y="132"
        fill="#1d1d1f"
        fontSize="22"
        fontWeight="700"
        fontFamily={appleTheme.fontFamily}
      >
        108 ALS
      </text>

      {/* Dual High-Intensity Strobe Lightbar */}
      <rect x="235" y="38" width="60" height="12" rx="4" fill="#1d1d1f" />
      <rect
        x="238"
        y="30"
        width="24"
        height="12"
        rx="4"
        fill="#ff453a"
        style={{ filter: "drop-shadow(0 0 10px #ff453a)" }}
      />
      <rect
        x="268"
        y="30"
        width="24"
        height="12"
        rx="4"
        fill="#2997ff"
        style={{ filter: "drop-shadow(0 0 10px #2997ff)" }}
      />

      {/* Forward Siren Sound Wave Arcs */}
      <path
        d="M380 90 Q405 105 380 120"
        stroke={appleTheme.neonMint}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d="M395 80 Q425 105 395 130"
        stroke={appleTheme.neonMint}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* Wheels */}
      <g transform={`translate(100, 175) rotate(${wheelRotation})`}>
        <circle cx="0" cy="0" r="28" fill="#1d1d1f" stroke="#333333" strokeWidth="4" />
        <circle cx="0" cy="0" r="14" fill="#7a7a7a" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="2" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="2" />
      </g>
      <g transform={`translate(320, 175) rotate(${wheelRotation})`}>
        <circle cx="0" cy="0" r="28" fill="#1d1d1f" stroke="#333333" strokeWidth="4" />
        <circle cx="0" cy="0" r="14" fill="#7a7a7a" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="2" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" strokeWidth="2" />
      </g>
    </svg>
  );
};

// ========================================================
// 6. Hospital Figurine (Apex Trauma Center)
// ========================================================
export const HospitalFigurine: React.FC<{
  scale?: number;
  glow?: boolean;
}> = ({ scale = 1, glow = false }) => {
  return (
    <svg
      width={360 * scale}
      height={320 * scale}
      viewBox="0 0 360 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="180" cy="305" rx="160" ry="12" fill="rgba(0, 0, 0, 0.22)" />

      {/* Main Tower */}
      <rect x="70" y="60" width="220" height="240" rx="10" fill="#1d1d1f" stroke="#333333" strokeWidth="2" />

      {/* Helipad */}
      <rect x="120" y="38" width="120" height="22" rx="4" fill="#272729" stroke="#555555" strokeWidth="1.5" />
      <circle cx="180" cy="49" r="8" fill="none" stroke="#ffd60a" strokeWidth="2" />
      <text x="180" y="53" textAnchor="middle" fill="#ffd60a" fontSize="10" fontWeight="bold">H</text>

      {/* Modern Windows Grid */}
      {[95, 135, 175, 215].map((y, rowIdx) => (
        <g key={rowIdx}>
          {[95, 135, 175, 215, 250].map((x, colIdx) => (
            <rect key={colIdx} x={x} y={y} width="24" height="20" rx="3" fill="#2a2a2c" />
          ))}
        </g>
      ))}

      {/* Red Cross */}
      <circle cx="180" cy="90" r="20" fill="#ffffff" />
      <rect x="175" y="78" width="10" height="24" rx="2" fill="#ff453a" />
      <rect x="168" y="85" width="24" height="10" rx="2" fill="#ff453a" />

      {/* Ground Floor Emergency Department */}
      <rect x="110" y="245" width="140" height="55" rx="4" fill="#272729" stroke="#0066cc" strokeWidth="1.5" />
      <rect x="145" y="255" width="32" height="45" fill="#3a3a3c" />
      <rect x="183" y="255" width="32" height="45" fill="#3a3a3c" />
      <text
        x="180"
        y="252"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
        fontWeight="600"
        fontFamily={appleTheme.fontFamily}
      >
        EMERGENCY ENTRANCE
      </text>
    </svg>
  );
};

// ========================================================
// 7. Rural Bystander / ASHA Figurine
// Story: Scene 1 rural community health worker calling 108
// ========================================================
export const RuralBystanderFigurine: React.FC<{
  scale?: number;
}> = ({ scale = 1 }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={160 * scale}
        height={300 * scale}
        viewBox="0 0 160 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="80" cy="285" rx="45" ry="8" fill="rgba(0,0,0,0.22)" />

        {/* Traditional ASHA Attire / Saree */}
        <path d="M50 180 L40 270 H110 L100 180 Z" fill="#b83280" />
        <path d="M48 95 C48 90 60 85 80 85 C100 85 112 90 112 95 L116 185 H44 Z" fill="#b83280" />
        <path d="M45 120 L105 180" stroke="#ffd60a" strokeWidth="4" />

        {/* Head */}
        <ellipse cx="80" cy="58" rx="18" ry="22" fill="#FBD38D" />
        <circle cx="74" cy="56" r="2.2" fill="#1d1d1f" />
        <circle cx="86" cy="56" r="2.2" fill="#1d1d1f" />
        <path d="M76 66 Q80 70 84 66" stroke="#1d1d1f" strokeWidth="1.8" />
        <path d="M60 50 C60 30 72 24 80 24 C88 24 100 30 100 50 Z" fill="#1d1d1f" />

        {/* Right Arm: Holding Phone to Ear calling 108 */}
        <path d="M108 95 C116 110 118 120 106 135" stroke="#b83280" strokeWidth="12" strokeLinecap="round" />
        <circle cx="104" cy="62" r="7" fill="#FBD38D" />
        <rect x="100" y="52" width="8" height="18" rx="2" fill="#1d1d1f" />

        {/* Left Arm: Signaling 108 ambulance */}
        <g>
          <path d="M48 98 L20 40" stroke="#b83280" strokeWidth="12" strokeLinecap="round" />
          <circle cx="20" cy="38" r="7" fill="#FBD38D" />
        </g>
      </svg>
    </div>
  );
};

// ========================================================
// 8. Health Director / State Governance Figurine
// Story: State health officer verifying digital audits
// ========================================================
export const HealthDirectorFigurine: React.FC<{
  scale?: number;
}> = ({ scale = 1 }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={180 * scale}
        height={320 * scale}
        viewBox="0 0 180 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="90" cy="305" rx="55" ry="10" fill="rgba(0, 0, 0, 0.28)" />

        {/* Formal Trousers */}
        <rect x="64" y="195" width="20" height="95" rx="6" fill="#1d1d1f" />
        <rect x="96" y="195" width="20" height="95" rx="6" fill="#1d1d1f" />
        <path d="M58 285 H88 V298 H52 Q52 285 58 285 Z" fill="#000000" />
        <path d="M96 285 H126 V298 H90 Q90 285 96 285 Z" fill="#000000" />

        {/* Navy Blazer */}
        <path d="M50 100 C50 92 65 88 90 88 C115 88 130 92 130 100 L134 198 H46 Z" fill="#162032" />
        {/* Shirt & Tie */}
        <polygon points="90,92 82,140 98,140" fill="#ffffff" />
        <polygon points="90,105 87,145 93,145" fill={appleTheme.neonMint} />

        {/* Head */}
        <g>
          <ellipse cx="90" cy="60" rx="20" ry="24" fill="#FBD38D" />
          <circle cx="83" cy="58" r="2.5" fill="#1d1d1f" />
          <circle cx="97" cy="58" r="2.5" fill="#1d1d1f" />
          <path d="M85 68 Q90 72 95 68" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 50 C68 32 82 26 90 26 C98 26 112 32 112 50 Z" fill="#2d3748" />
        </g>

        {/* Hands holding Digital Audit Tablet */}
        <rect x="62" y="145" width="56" height="40" rx="4" fill="#1d1d1f" stroke="#ffffff" strokeWidth="1.5" />
        <rect x="66" y="149" width="48" height="32" rx="2" fill="#000000" />
        {/* Verification Checkmark */}
        <path d="M78 165 L86 173 L104 155" stroke={appleTheme.neonMint} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
