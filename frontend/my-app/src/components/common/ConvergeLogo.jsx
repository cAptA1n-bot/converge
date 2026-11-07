"use client";

import Link from "next/link";

export default function ConvergeLogo({
    variant = "light",
    mode = "full",
    size = "md",
    showTagline = false,
    href = "/",
    className = "",
}) {
    const isDark = variant === "dark";

    // Sizing
    const dimensions = {
        sm: { height: 28, symbolSize: 26, fontSize: 18, dotSize: 4 },
        md: { height: 36, symbolSize: 34, fontSize: 22, dotSize: 5 },
        lg: { height: 44, symbolSize: 42, fontSize: 26, dotSize: 6 },
    }[size] || { height: 36, symbolSize: 34, fontSize: 22, dotSize: 5 };

    const topPathColor = isDark ? "#FFFFFF" : "#176B5B";
    const bottomPathColor = isDark ? "#A7E4CD" : "#238F7A";
    const nodeColor = isDark ? "#FFFFFF" : "#176B5B";
    const nodeInnerColor = isDark ? "#125548" : "#DDF4E8";
    const textColor = isDark ? "#FFFFFF" : "#17211F";
    const dotColor = isDark ? "#A7E4CD" : "#176B5B";

    const symbolElement = (
        <svg
            width={dimensions.symbolSize}
            height={dimensions.symbolSize}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
        >
            {/* Top converging stream */}
            <path
                d="M 6 10 C 14 10 20 14 26 18 L 30 18"
                stroke={topPathColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Bottom converging stream */}
            <path
                d="M 6 26 C 14 26 20 22 26 18 L 30 18"
                stroke={bottomPathColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Focal convergence nexus */}
            <circle cx="26" cy="18" r="3" fill={nodeColor} />
            <circle cx="26" cy="18" r="1.3" fill={nodeInnerColor} />
        </svg>
    );

    const logoContent = (
        <div
            className={`converge-brand-lockup ${className}`}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                lineHeight: 1,
            }}
        >
            {symbolElement}

            {mode !== "symbol" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                        style={{
                            fontSize: `${dimensions.fontSize}px`,
                            fontWeight: 750,
                            letterSpacing: "-0.04em",
                            color: textColor,
                            fontFamily: "var(--font-sans), system-ui, sans-serif",
                            display: "inline-flex",
                            alignItems: "baseline",
                        }}
                    >
                        converge
                        <span
                            style={{
                                color: dotColor,
                                marginLeft: "1px",
                                display: "inline-block",
                            }}
                        >
                            .
                        </span>
                    </span>

                    {showTagline && (
                        <span
                            style={{
                                fontSize: "11px",
                                fontWeight: 500,
                                color: isDark ? "rgba(255, 255, 255, 0.7)" : "var(--color-text-secondary)",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Where talent meets opportunity.
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                style={{ textDecoration: "none", display: "inline-flex" }}
                aria-label="Converge Home"
            >
                {logoContent}
            </Link>
        );
    }

    return logoContent;
}

