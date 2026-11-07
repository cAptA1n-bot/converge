"use client";

export default function ConfirmDialog({
    isOpen,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(23, 33, 31, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "20px",
                backdropFilter: "blur(4px)",
            }}
            role="dialog"
            aria-modal="true"
        >
            <div
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-dropdown)",
                    padding: "28px",
                    maxWidth: "440px",
                    width: "100%",
                }}
            >
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", color: "var(--color-foreground)" }}>
                    {title}
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                    {message}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn btn-secondary"
                        style={{ minHeight: "40px" }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn"
                        style={{
                            minHeight: "40px",
                            backgroundColor: isDestructive ? "var(--color-rejected)" : "var(--color-primary)",
                            color: "#ffffff",
                        }}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

