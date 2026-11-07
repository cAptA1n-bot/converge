"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { LoadingState, EmptyState } from "@/components/common/LoadingState";

export default function FreelancerApplicationsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [selectedJobFilter, setSelectedJobFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [updatingAppId, setUpdatingAppId] = useState(null);

    // Authorization
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?redirect=/dashboard/applications");
            } else if (user?.role !== "FREELANCER") {
                router.push("/dashboard");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError("");

            const [jobsRes, appsRes] = await Promise.all([
                api(`/jobs?freelancerId=${user.id}&status=ALL&limit=50`),
                api("/applications/freelancer"),
            ]);

            setJobs(jobsRes.data?.jobs || []);
            setApplications(appsRes.data?.applications || []);
        } catch (err) {
            setError(err.message || "Failed to load applications.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "FREELANCER") {
            fetchData();
        }
    }, [isAuthenticated, user, fetchData]);

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            setUpdatingAppId(appId);
            setSuccessMessage("");
            setError("");

            await api(`/applications/${appId}`, {
                method: "PATCH",
                body: { status: newStatus },
            });

            setApplications((prev) =>
                prev.map((app) =>
                    app._id === appId ? { ...app, status: newStatus } : app
                )
            );

            setSuccessMessage(`Application status changed to ${newStatus.toLowerCase()}.`);
        } catch (err) {
            setError(err.message || "Failed to update application status.");
        } finally {
            setUpdatingAppId(null);
        }
    };

    if (authLoading || (!user && isAuthenticated)) {
        return <LoadingState message="Checking permissions..." />;
    }

    if (!user || user.role !== "FREELANCER") return null;

    // Filter applications
    const filteredApplications = applications.filter((app) => {
        const jobId = app.jobId?._id || app.jobId;
        if (selectedJobFilter !== "ALL" && jobId !== selectedJobFilter) {
            return false;
        }
        if (statusFilter !== "ALL" && app.status !== statusFilter) {
            return false;
        }
        return true;
    });

    // Group filtered applications by Job
    const groupedByJob = {};
    for (const app of filteredApplications) {
        const job = app.jobId || {};
        const jobId = job._id || "unknown";

        if (!groupedByJob[jobId]) {
            groupedByJob[jobId] = {
                job,
                applications: [],
            };
        }
        groupedByJob[jobId].applications.push(app);
    }

    const jobGroups = Object.values(groupedByJob);

    return (
        <main className="container section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: "30px", marginTop: "8px", letterSpacing: "-0.03em" }}>
                        Review Received Applications
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        Evaluate candidate proposals, review fresher profiles, and shortlist or accept applicants.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/dashboard/jobs" className="btn btn-secondary">
                        Manage Jobs
                    </Link>
                    <Link href="/jobs/create" className="btn btn-primary">
                        + Post a Job
                    </Link>
                </div>
            </div>

            {successMessage && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-accepted-bg)", color: "var(--color-accepted)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "14px", fontWeight: "500" }}>
                    {successMessage}
                </div>
            )}

            {error && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-rejected-bg)", color: "var(--color-rejected)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "14px", fontWeight: "500" }}>
                    {error}
                </div>
            )}

            {/* Filter controls */}
            <div
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 20px",
                    marginBottom: "28px",
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px" }}>
                    <label htmlFor="jobFilter" style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>
                        Filter by Project:
                    </label>
                    <select
                        id="jobFilter"
                        value={selectedJobFilter}
                        onChange={(e) => setSelectedJobFilter(e.target.value)}
                        className="input"
                        style={{ minHeight: "38px", padding: "6px 12px", fontSize: "13px" }}
                    >
                        <option value="ALL">All Projects ({jobs.length})</option>
                        {jobs.map((j) => (
                            <option key={j._id} value={j._id}>
                                {j.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px" }}>
                    <label htmlFor="statusFilter" style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>
                        Filter by Status:
                    </label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input"
                        style={{ minHeight: "38px", padding: "6px 12px", fontSize: "13px" }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <LoadingState message="Loading applications..." />
            ) : applications.length === 0 ? (
                <EmptyState
                    title="No applications received yet"
                    description="When junior developers and freshers discover your posted projects, their applications will appear here."
                    action={
                        <Link href="/dashboard/jobs" className="btn btn-secondary">
                            View Posted Jobs
                        </Link>
                    }
                />
            ) : jobGroups.length === 0 ? (
                <EmptyState
                    title="No matching applications"
                    description="No applications match your selected filters. Try changing or resetting the filters."
                    action={
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedJobFilter("ALL");
                                setStatusFilter("ALL");
                            }}
                            className="btn btn-secondary"
                        >
                            Reset Filters
                        </button>
                    }
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                    {jobGroups.map(({ job, applications: jobApps }) => (
                        <div
                            key={job._id || "unknown"}
                            style={{
                                backgroundColor: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-lg)",
                                padding: "28px",
                                boxShadow: "var(--shadow-card)",
                            }}
                        >
                            {/* Job Group Header */}
                            <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "18px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                        PROJECT PROPOSALS
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-foreground)" }}
                                        >
                                            {job.title || "Project Opportunity"}
                                        </Link>
                                        <StatusBadge status={job.status} />
                                    </div>

                                    <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "13px", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                                        <span>Budget: <strong>₹{job.budget?.toLocaleString("en-IN")}</strong></span>
                                        <span>Duration: <strong>{job.duration}</strong></span>
                                        <span>Arrangement: <strong>{job.workType}</strong></span>
                                    </div>
                                </div>

                                <div style={{ padding: "6px 14px", backgroundColor: "var(--color-surface-muted)", borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: "600" }}>
                                    {jobApps.length} Application{jobApps.length === 1 ? "" : "s"}
                                </div>
                            </div>

                            {/* Applicants list for this job */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {jobApps.map((app) => {
                                    const applicant = app.applicantId || {};
                                    const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";
                                    const initials = `${applicant.firstName?.[0] || ""}${applicant.lastName?.[0] || ""}`.toUpperCase() || "A";
                                    const isUpdating = updatingAppId === app._id;
                                    const isWithdrawn = app.status === "WITHDRAWN";

                                    return (
                                        <div
                                            key={app._id}
                                            style={{
                                                backgroundColor: "var(--color-background)",
                                                border: "1px solid var(--color-border)",
                                                borderRadius: "var(--radius-md)",
                                                padding: "20px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "14px",
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                                {/* Applicant identity */}
                                                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                                    {applicant.profilePicture ? (
                                                        <img
                                                            src={applicant.profilePicture}
                                                            alt={applicantName}
                                                            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", display: "grid", placeItems: "center", fontSize: "16px", fontWeight: "700" }}>
                                                            {initials}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                            <Link
                                                                href={`/profile/${applicant._id || applicant}`}
                                                                style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-foreground)" }}
                                                            >
                                                                {applicantName}
                                                            </Link>
                                                            <StatusBadge status={app.status} />
                                                        </div>

                                                        <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                                                            <span>Experience: <strong>{applicant.experienceLevel || "Beginner"}</strong></span>
                                                            {applicant.github && (
                                                                <a
                                                                    href={applicant.github.startsWith("http") ? applicant.github : `https://${applicant.github}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: "var(--color-primary)", fontWeight: "500" }}
                                                                >
                                                                    GitHub ↗
                                                                </a>
                                                            )}
                                                            {applicant.portfolio && (
                                                                <a
                                                                    href={applicant.portfolio.startsWith("http") ? applicant.portfolio : `https://${applicant.portfolio}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: "var(--color-primary)", fontWeight: "500" }}
                                                                >
                                                                    Portfolio ↗
                                                                </a>
                                                            )}
                                                            <Link
                                                                href={`/profile/${applicant._id || applicant}`}
                                                                style={{ color: "var(--color-primary)", fontWeight: "600" }}
                                                            >
                                                                View Full Profile →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Proposed budget */}
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                                                        Proposed Budget
                                                    </div>
                                                    <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)" }}>
                                                        ₹{app.proposedBudget?.toLocaleString("en-IN")}
                                                    </div>
                                                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                                        Applied: {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Skills if available */}
                                            {Array.isArray(applicant.skills) && applicant.skills.length > 0 && (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {applicant.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            style={{
                                                                fontSize: "11px",
                                                                padding: "3px 8px",
                                                                backgroundColor: "var(--color-surface)",
                                                                border: "1px solid var(--color-border)",
                                                                borderRadius: "6px",
                                                                color: "var(--color-foreground)",
                                                            }}
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Cover Letter */}
                                            <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
                                                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                                    Candidate&apos;s Cover Letter:
                                                </div>
                                                <p style={{ fontSize: "13px", color: "var(--color-foreground)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                                                    {app.coverLetter}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "12px", flexWrap: "wrap", gap: "10px" }}>
                                                <div>
                                                    {isWithdrawn && (
                                                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                                                            Applicant withdrew this application. Status cannot be modified.
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    {/* Shortlist action */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(app._id, "SHORTLISTED")}
                                                        disabled={isUpdating || isWithdrawn || app.status === "SHORTLISTED"}
                                                        className="btn"
                                                        style={{
                                                            minHeight: "34px",
                                                            padding: "5px 12px",
                                                            fontSize: "12px",
                                                            backgroundColor: app.status === "SHORTLISTED" ? "var(--color-shortlisted-bg)" : "var(--color-surface)",
                                                            color: "var(--color-shortlisted)",
                                                            borderColor: "var(--color-shortlisted)",
                                                        }}
                                                    >
                                                        {app.status === "SHORTLISTED" ? "✓ Shortlisted" : "Shortlist"}
                                                    </button>

                                                    {/* Accept action */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(app._id, "ACCEPTED")}
                                                        disabled={isUpdating || isWithdrawn || app.status === "ACCEPTED"}
                                                        className="btn"
                                                        style={{
                                                            minHeight: "34px",
                                                            padding: "5px 12px",
                                                            fontSize: "12px",
                                                            backgroundColor: app.status === "ACCEPTED" ? "var(--color-accepted-bg)" : "var(--color-surface)",
                                                            color: "var(--color-accepted)",
                                                            borderColor: "var(--color-accepted)",
                                                        }}
                                                    >
                                                        {app.status === "ACCEPTED" ? "✓ Accepted" : "Accept Candidate"}
                                                    </button>

                                                    {/* Reject action */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(app._id, "REJECTED")}
                                                        disabled={isUpdating || isWithdrawn || app.status === "REJECTED"}
                                                        className="btn"
                                                        style={{
                                                            minHeight: "34px",
                                                            padding: "5px 12px",
                                                            fontSize: "12px",
                                                            backgroundColor: app.status === "REJECTED" ? "var(--color-rejected-bg)" : "var(--color-surface)",
                                                            color: "var(--color-rejected)",
                                                            borderColor: "var(--color-rejected)",
                                                        }}
                                                    >
                                                        {app.status === "REJECTED" ? "✓ Rejected" : "Reject"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

