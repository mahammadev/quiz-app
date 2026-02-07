import type React from "react"

interface YourWorkInSyncProps {
  /** Fixed width from Figma: 482px */
  width?: number | string
  /** Fixed height from Figma: 300px */
  height?: number | string
  /** Optional className to pass to root */
  className?: string
  /** Theme palette */
  theme?: "light" | "dark"
}

/**
 * Your work, in sync – Chat conversation UI
 * Generated from Figma via MCP with exact measurements (482×300px)
 * Single-file component following the v0-ready pattern used in this repo.
 */
const YourWorkInSync: React.FC<YourWorkInSyncProps> = ({
  width = 482,
  height = 300,
  className = "",
  theme = "dark",
}) => {
  // Design tokens (derived from Figma local variables)
  const themeVars =
    theme === "light"
      ? {
        "--yws-surface": "hsl(var(--background))",
        "--yws-text-primary": "hsl(var(--foreground))",
        "--yws-text-secondary": "hsl(var(--muted-foreground))",
        "--yws-bubble-light": "hsl(var(--muted))",
        "--yws-bubble-dark": "hsl(var(--foreground))",
        "--yws-bubble-white": "hsl(var(--background))",
        "--yws-border": "hsl(var(--border))",
        "--yws-shadow": "rgba(0,0,0,0.05)",
      }
      : ({
        "--yws-surface": "hsl(var(--background))",
        "--yws-text-primary": "hsl(var(--foreground))",
        "--yws-text-secondary": "hsl(var(--muted-foreground))",
        "--yws-bubble-light": "hsl(var(--muted))",
        "--yws-bubble-dark": "hsl(var(--foreground))",
        "--yws-bubble-white": "hsl(var(--background))",
        "--yws-border": "hsl(var(--border))",
        "--yws-shadow": "rgba(0,0,0,0.2)",
      } as React.CSSProperties)

  // Figma-exported assets
  const imgFrame2147223205 = "/professional-woman-avatar-with-short-brown-hair-an.jpg"
  const imgFrame2147223206 = "/professional-man-avatar-with-beard-and-glasses-loo.jpg"
  const imgFrame2147223207 = "/professional-person-avatar-with-curly-hair-and-war.jpg"
  const imgArrowUp =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='m5 12 7-7 7 7'/%3E%3Cpath d='M12 19V5'/%3E%3C/svg%3E"

  return (
    <div
      className={className}
      style={
        {
          width,
          height,
          position: "relative",
          background: "transparent",
          ...themeVars,
        } as React.CSSProperties
      }
      role="img"
      aria-label="Chat conversation showing team collaboration sync"
    >
      {/* Root frame size 482×300 – content centered */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "356px",
          height: "216px",
        }}
      >
        {/* Remove the flip transformation and position messages normally */}
        <div style={{ width: "356px", height: "216px", position: "relative", transform: "scale(1.1)" }}>
          {/* Message 1: Left side with avatar */}
          <div
            style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              width: "356px",
              height: "36px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                backgroundImage: `url('${imgFrame2147223205}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid var(--yws-border)",
                flexShrink: 0,
              }}
            />
            {/* Message bubble */}
            <div
              style={{
                background: "var(--yws-bubble-light)",
                borderRadius: "var(--radius-full)",
                padding: "0px 12px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16px",
                  letterSpacing: "-0.4px",
                  color: "var(--yws-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                Team updates flow seamlessly
              </span>
            </div>
          </div>

          {/* Message 2: Right side with avatar */}
          <div
            style={{
              position: "absolute",
              right: "0px",
              top: "60px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              justifyContent: "flex-end",
            }}
          >
            {/* Message bubble */}
            <div
              style={{
                background: "var(--yws-bubble-dark)",
                borderRadius: "var(--radius-full)",
                padding: "0px 12px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16px",
                  letterSpacing: "-0.4px",
                  color: "hsl(var(--background))",
                  whiteSpace: "nowrap",
                }}
              >
                Hi everyone
              </span>
            </div>
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                backgroundImage: `url('${imgFrame2147223206}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid var(--yws-border)",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Message 3: Left side with avatar */}
          <div
            style={{
              position: "absolute",
              left: "0px",
              top: "120px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              width: "210px",
              height: "36px",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                backgroundImage: `url('${imgFrame2147223207}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid var(--yws-border)",
                flexShrink: 0,
              }}
            />
            {/* Message bubble */}
            <div
              style={{
                background: "var(--yws-bubble-light)",
                borderRadius: "var(--radius-full)",
                padding: "0px 12px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "16px",
                  letterSpacing: "-0.4px",
                  color: "var(--yws-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                How about this instead?
              </span>
            </div>
          </div>

          {/* Message 4: Center with send button */}
          <div
            style={{
              position: "absolute",
              left: "146px",
              top: "180px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              height: "36px",
            }}
          >
            {/* Message bubble */}
            <div
              style={{
                background: "var(--yws-bubble-white)",
                borderRadius: "var(--radius-md)",
                padding: "0px 12px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 0px 0px 1px var(--yws-border), 0px 1px 2px -0.4px var(--yws-shadow)",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "var(--yws-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                Great work, everyone!
              </span>
            </div>
            {/* Send button */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                background: "var(--yws-bubble-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 1px 2px 0px var(--yws-shadow)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <img
                src={imgArrowUp || "/placeholder.svg"}
                alt="Send"
                style={{
                  width: "20px",
                  height: "20px",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YourWorkInSync
