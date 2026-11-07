"use client";

export function LoadingState({ message = "Loading..." }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                color: "var(--color-text-secondary)",
                gap: "12px",
            }}
        >
            <div className="loading-spinner" />
            <p style={{ fontSize: "14px" }}>{message}</p>
        </div>
    );
}

export function EmptyState({ title = "No items found", description = "There are no records to display right now.", action }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
                backgroundColor: "var(--color-surface)",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                gap: "10px",
            }}
        >
            <h3 style={{ fontSize: "18px", fontWeight: "650", color: "var(--color-foreground)" }}>
                {title}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", maxWidth: "400px", lineHeight: "1.6" }}>
                {description}
            </p>
            {action && <div style={{ marginTop: "12px" }}>{action}</div>}
        </div>
    );
}
