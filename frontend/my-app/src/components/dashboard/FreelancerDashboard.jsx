"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import { LoadingState, EmptyState } from "@/components/common/LoadingState";

export default function FreelancerDashboard({ user }) {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = useCallback(async () => {
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
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalJobs = jobs.length;
    const openJobs = jobs.filter((j) => j.status === "OPEN").length;
    const closedJobs = jobs.filter((j) => j.status === "CLOSED").length;
    const totalApplications = applications.length;

    const recentJobs = jobs.slice(0, 3);
    const recentApplications = applications.slice(0, 5);

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
                        CONVERGE · FREELANCER DASHBOARD
                    </span>
                    <h1 style={{ fontSize: "28px", marginTop: "4px" }}>
                        Welcome back, {user.firstName}!
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                        Manage your posted opportunities, evaluate applicants, and mentor the next generation.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href="/jobs/create" className="btn btn-primary">
                        + Post a Job
                    </Link>
                    <Link href="/dashboard/jobs" className="btn btn-secondary">
                        Manage Jobs
                    </Link>
                    <Link href="/dashboard/applications" className="btn btn-secondary">
                        Review Applications ({totalApplications})
                    </Link>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-rejected-bg)", color: "var(--color-rejected)", borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: "500" }}>
                    {error}
                </div>
            )}

            {/* Overview statistics */}
            <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
                    Overview Statistics
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <StatCard label="Total Jobs Posted" value={totalJobs} />
                    <StatCard label="Open Opportunities" value={openJobs} />
                    <StatCard label="Closed Jobs" value={closedJobs} />
                    <StatCard label="Applications Received" value={totalApplications} />
                </div>
            </div>

            {/* Quick Actions & Navigation Bar */}
            <div
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                }}
            >
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-foreground)" }}>
                    Quick Management:
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href="/dashboard/jobs" className="btn btn-secondary" style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}>
                        View All My Jobs →
                    </Link>
                    <Link href="/dashboard/applications" className="btn btn-secondary" style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}>
                        Manage All Applications →
                    </Link>
                </div>
            </div>

            {/* Recent Posted Jobs */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                        Recent Posted Jobs
                    </h2>
                    {jobs.length > 0 && (
                        <Link href="/dashboard/jobs" style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "650" }}>
                            View all ({totalJobs}) →
                        </Link>
                    )}
                </div>

                {loading ? (
                    <LoadingState message="Loading your jobs..." />
                ) : recentJobs.length === 0 ? (
                    <EmptyState
                        title="You haven't posted any jobs yet"
                        description="Create your first project opportunity to connect with talented junior developers and freshers."
                        action={
                            <Link href="/jobs/create" className="btn btn-primary">
                                + Post Your First Job
                            </Link>
                        }
                    />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {recentJobs.map((job) => {
                            const jobApps = applications.filter(
                                (a) => (a.jobId?._id || a.jobId) === job._id
                            );

                            return (
                                <div
                                    key={job._id}
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "var(--radius-lg)",
                                        padding: "20px 24px",
                                        boxShadow: "var(--shadow-card)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: "16px",
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                            <Link
                                                href={`/jobs/${job._id}`}
                                                style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-foreground)" }}
                                            >
                                                {job.title}
                                            </Link>
                                            <StatusBadge status={job.status} />
                                        </div>

                                        <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "13px", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                                            <span>Budget: <strong>₹{job.budget?.toLocaleString("en-IN")}</strong></span>
                                            <span>Duration: <strong>{job.duration}</strong></span>
                                            <span>Arrangement: <strong>{job.workType}</strong></span>
                                            <span>Applications: <strong style={{ color: "var(--color-primary)" }}>{jobApps.length}</strong></span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            className="btn btn-secondary"
                                            style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/jobs/${job._id}/edit`}
                                            className="btn btn-secondary"
                                            style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Received Applications */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                        Recent Applications Received
                    </h2>
                    {applications.length > 0 && (
                        <Link href="/dashboard/applications" style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "650" }}>
                            Manage all ({totalApplications}) →
                        </Link>
                    )}
                </div>

                {loading ? (
                    <LoadingState message="Loading applications..." />
                ) : recentApplications.length === 0 ? (
                    <EmptyState
                        title="No applications received yet"
                        description="When freshers apply to your open projects, their proposals and profiles will appear here."
                    />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {recentApplications.map((app) => {
                            const applicant = app.applicantId || {};
                            const job = app.jobId || {};
                            const applicantName = `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() || "Applicant";

                            return (
                                <div
                                    key={app._id}
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "var(--radius-lg)",
                                        padding: "20px 24px",
                                        boxShadow: "var(--shadow-card)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: "16px",
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                            <Link
                                                href={`/profile/${applicant._id || applicant}`}
                                                style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-foreground)" }}
                                            >
                                                {applicantName}
                                            </Link>
                                            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>applied for</span>
                                            <Link
                                                href={`/jobs/${job._id || job}`}
                                                style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)" }}
                                            >
                                                {job.title || "Project"}
                                            </Link>
                                            <StatusBadge status={app.status} />
                                        </div>

                                        <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "13px", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                                            <span>Proposed Budget: <strong>₹{app.proposedBudget?.toLocaleString("en-IN")}</strong></span>
                                            <span>Experience: <strong>{applicant.experienceLevel || "Beginner"}</strong></span>
                                            <span>Date: {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/dashboard/applications"
                                        className="btn btn-secondary"
                                        style={{ minHeight: "36px", padding: "6px 14px", fontSize: "13px" }}
                                    >
                                        Review Application →
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

