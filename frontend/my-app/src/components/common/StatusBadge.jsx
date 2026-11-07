"use client";

const statusConfig = {
    PENDING: { label: "Pending", className: "badge badge-pending" },
    SHORTLISTED: { label: "Shortlisted", className: "badge badge-shortlisted" },
    ACCEPTED: { label: "Accepted", className: "badge badge-accepted" },
    REJECTED: { label: "Rejected", className: "badge badge-rejected" },
    WITHDRAWN: { label: "Withdrawn", className: "badge badge-withdrawn" },
    OPEN: { label: "Open", className: "badge badge-accepted" },
    CLOSED: { label: "Closed", className: "badge badge-withdrawn" },
};

export default function StatusBadge({ status }) {
    const normalized = (status || "").toUpperCase();
    const config = statusConfig[normalized] || {
        label: status || "Unknown",
        className: "badge badge-withdrawn",
    };

    return (
        <span className={config.className}>
            {config.label}
        </span>
    );
}

