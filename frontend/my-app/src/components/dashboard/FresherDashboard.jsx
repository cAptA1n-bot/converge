"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { LoadingState, EmptyState } from "@/components/common/LoadingState";

export default function FresherDashboard({ user }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api("/applications/me");
            setApplications(res.data?.applications || []);
        } catch (err) {
            setError(err.message || "Failed to load your applications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleConfirmWithdraw = async () => {
        if (!withdrawingId) return;

        try {
            setWithdrawing(true);
            await api(`/applications/${withdrawingId}`, {
                method: "PATCH",
                body: { status: "WITHDRAWN" },
            });

            setApplications((prev) =>
                prev.map((app) =>
                    app._id === withdrawingId ? { ...app, status: "WITHDRAWN" } : app
                )
            );
            setActionMessage("Application successfully withdrawn.");
            setShowWithdrawDialog(false);
            setWithdrawingId(null);
        } catch (err) {
            setError(err.message || "Failed to withdraw application.");
        } finally {
            setWithdrawing(false);
        }
    };

    // Calculate application stats
    const totalApps = applications.length;
    const pendingApps = applications.filter((a) => a.status === "PENDING").length;
    const shortlistedApps = applications.filter((a) => a.status === "SHORTLISTED").length;
    const acceptedApps = applications.filter((a) => a.status === "ACCEPTED").length;
    const rejectedApps = applications.filter((a) => a.status === "REJECTED").length;
    const withdrawnApps = applications.filter((a) => a.status === "WITHDRAWN").length;

    // Check profile completion
    const isProfileIncomplete =
        !user.bio ||
        !user.skills ||
        user.skills.length === 0 ||
        (!user.github && !user.portfolio);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Welcome banner */}
            <div
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "32px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                }}
            >
                <div>
                    <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--color-primary)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                        CONVERGE · FRESHER DASHBOARD
                    </span>
                    <h1 style={{ fontSize: "28px", marginTop: "4px" }}>
                        Welcome back, {user.firstName}!
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                        Track your project submissions, manage applications, and accelerate your experience.
                    </p>
                </div>

                <Link href="/jobs" className="btn btn-primary">
                    Browse New Projects ↗
                </Link>
            </div>

            {/* Profile completion callout if needed */}
            {isProfileIncomplete && (
                <div
                    style={{
                        backgroundColor: "var(--color-primary-soft)",
                        border: "1px solid var(--color-accent)",
                        borderRadius: "var(--radius-md)",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "14px",
                    }}
                >
                    <div>
                        <strong style={{ color: "var(--color-primary)", fontSize: "14px" }}>
                            Complete your profile to stand out
                        </strong>
                        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                            Adding a bio, skills, and portfolio increases your chances of being shortlisted by freelancers.
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className="btn btn-secondary"
                        style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}
                    >
                        Update Profile
                    </Link>
                </div>
            )}

            {actionMessage && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-accepted-bg)", color: "var(--color-accepted)", borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: "500" }}>
                    {actionMessage}
                </div>
            )}

            {error && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-rejected-bg)", color: "var(--color-rejected)", borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: "500" }}>
                    {error}
                </div>
            )}

            {/* Application Statistics */}
            <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
                    Application Overview
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                    <StatCard label="Total Applications" value={totalApps} />
                    <StatCard label="Pending Review" value={pendingApps} />
                    <StatCard label="Shortlisted" value={shortlistedApps} />
                    <StatCard label="Accepted" value={acceptedApps} />
                    <StatCard label="Rejected / Withdrawn" value={rejectedApps + withdrawnApps} />
                </div>
            </div>

            {/* Applications List */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                        My Applications ({totalApps})
                    </h2>
                </div>

                {loading ? (
                    <LoadingState message="Loading your applications..." />
                ) : applications.length === 0 ? (
                    <EmptyState
                        title="You haven't applied to any projects yet"
                        description="Explore real project opportunities posted by experienced freelancers to start building your portfolio."
                        action={
                            <Link href="/jobs" className="btn btn-primary">
                                Find Opportunities
                            </Link>
                        }
                    />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {applications.map((app) => {
                            const job = app.jobId || {};
                            const canWithdraw = ["PENDING", "SHORTLISTED"].includes(app.status);

                            return (
                                <div
                                    key={app._id}
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "var(--radius-lg)",
                                        padding: "24px",
                                        boxShadow: "var(--shadow-card)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "16px",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                <Link
                                                    href={`/jobs/${job._id || job}`}
                                                    style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-foreground)" }}
                                                >
                                                    {job.title || "Project Opportunity"}
                                                </Link>
                                                <StatusBadge status={app.status} />
                                            </div>

                                            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "6px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                                <span>Work: <strong>{job.workType || "Remote"}</strong></span>
                                                <span>Level: <strong>{job.experienceLevel || "Beginner"}</strong></span>
                                                <span>Job Status: <StatusBadge status={job.status || "OPEN"} /></span>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                                                Your Proposed Budget
                                            </div>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)" }}>
                                                ₹{app.proposedBudget?.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cover Letter preview */}
                                    <div style={{ backgroundColor: "var(--color-background)", padding: "14px 16px", borderRadius: "var(--radius-md)", fontSize: "13px" }}>
                                        <div style={{ fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                            Your Cover Letter:
                                        </div>
                                        <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                                            {app.coverLetter}
                                        </p>
                                    </div>

                                    {/* Footer details & actions */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "14px", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                            Applied on {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </div>

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <Link
                                                href={`/jobs/${job._id || job}`}
                                                className="btn btn-secondary"
                                                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                                            >
                                                View Project Details
                                            </Link>

                                            {canWithdraw && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setWithdrawingId(app._id);
                                                        setShowWithdrawDialog(true);
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px", color: "var(--color-rejected)" }}
                                                >
                                                    Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Withdraw confirmation modal */}
            <ConfirmDialog
                isOpen={showWithdrawDialog}
                title="Withdraw Application"
                message="Are you sure you want to withdraw this application? Once withdrawn, the project owner will see it as withdrawn and you cannot revert this action."
                confirmText="Withdraw Application"
                isDestructive={true}
                isLoading={withdrawing}
                onConfirm={handleConfirmWithdraw}
                onCancel={() => {
                    setShowWithdrawDialog(false);
                    setWithdrawingId(null);
                }}
            />
        </div>
    );
}

