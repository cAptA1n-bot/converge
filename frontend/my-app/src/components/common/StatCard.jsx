"use client";

export default function StatCard({ label, value, description, icon }) {
    return (
        <div
            style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {label}
                </span>
                {icon && <span style={{ color: "var(--color-primary)" }}>{icon}</span>}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-foreground)", letterSpacing: "-0.03em" }}>
                {value}
            </div>
            {description && (
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                    {description}
                </div>
            )}
        </div>
    );
}

