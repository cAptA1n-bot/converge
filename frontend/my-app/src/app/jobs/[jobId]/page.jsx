"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const experienceLabels = {
    BEGINNER: "Beginner friendly",
    INTERMEDIATE: "Intermediate",
    EXPERIENCED: "Experienced",
};

const workTypeLabels = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
};

const formatBudget = (budget) => {
    if (budget == null) return "Negotiable";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(budget);
};

export default function JobDetailsPage() {
    const { jobId } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [userApplication, setUserApplication] = useState(null);
    const [checkingApplication, setCheckingApplication] = useState(false);

    const [coverLetter, setCoverLetter] = useState("");
    const [proposedBudget, setProposedBudget] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState("");
    const [applicationError, setApplicationError] = useState("");

    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    // Fetch job details
    const fetchJob = useCallback(async () => {
        if (!jobId) return;

        try {
            setLoading(true);
            setError("");

            const result = await api(`/jobs/${jobId}`);
            setJob(result.data.job || result.data);
        } catch (err) {
            setError(err.message || "Unable to load this project.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    // Check if current user has already applied
    const checkUserApplication = useCallback(async () => {
        if (!isAuthenticated || user?.role !== "FRESHER" || !jobId) return;

        try {
            setCheckingApplication(true);
            const res = await api("/applications/me");
            const apps = res.data?.applications || [];
            const existing = apps.find(
                (app) => (app.jobId?._id || app.jobId) === jobId
            );
            if (existing) {
                setUserApplication(existing);
            }
        } catch {
            // Ignore error if applications can't be retrieved
        } finally {
            setCheckingApplication(false);
        }
    }, [isAuthenticated, user, jobId]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    useEffect(() => {
        checkUserApplication();
    }, [checkUserApplication]);

    const handleApply = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setApplicationError("");
        setApplicationMessage("");

        if (!coverLetter.trim() || coverLetter.trim().length < 20) {
            setApplicationError("Cover letter must be at least 20 characters.");
            setSubmitting(false);
            return;
        }

        if (proposedBudget === "" || Number(proposedBudget) < 0) {
            setApplicationError("Please provide a valid proposed budget (0 or more).");
            setSubmitting(false);
            return;
        }

        try {
            const body = {
                coverLetter: coverLetter.trim(),
                proposedBudget: Number(proposedBudget),
            };

            const result = await api(`/jobs/${jobId}/applications`, {
                method: "POST",
                body,
            });

            setApplicationMessage("Your application was submitted successfully!");
            setUserApplication(result.data?.application || {
                jobId,
                status: "PENDING",
                coverLetter: body.coverLetter,
                proposedBudget: body.proposedBudget,
                createdAt: new Date().toISOString(),
            });
            setCoverLetter("");
            setProposedBudget("");
        } catch (err) {
            const message = err.message || "Unable to submit your application.";
            setApplicationError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        if (!userApplication?._id) return;

        try {
            setWithdrawing(true);
            await api(`/applications/${userApplication._id}`, {
                method: "PATCH",
                body: { status: "WITHDRAWN" },
            });
            setUserApplication((prev) => ({ ...prev, status: "WITHDRAWN" }));
            setShowWithdrawDialog(false);
            setApplicationMessage("Your application has been withdrawn.");
        } catch (err) {
            setApplicationError(err.message || "Failed to withdraw application.");
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading || authLoading) {
        return (
            <main className="job-details-page">
                <div className="container job-details-state">
                    Loading project details...
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="job-details-page">
                <div className="container job-details-state">
                    <h1>We couldn&apos;t load this project</h1>
                    <p>{error || "This project may no longer be available."}</p>
                    <Link href="/jobs" className="btn btn-primary">
                        Browse projects
                    </Link>
                </div>
            </main>
        );
    }

    const freelancer = job.freelancerId || {};
    const freelancerId = freelancer._id || freelancer;
    const isOwner = Boolean(user && user.id === freelancerId);

    const freelancerName =
        [freelancer.firstName, freelancer.lastName]
            .filter(Boolean)
            .join(" ") || "Freelancer";

    const initials =
        `${freelancer.firstName?.[0] || ""}${freelancer.lastName?.[0] || ""}`
            .toUpperCase() || "F";

    const isOpen = job.status === "OPEN";

    return (
        <main className="job-details-page">
            <section className="job-details-header">
                <div className="container">
                    <Link href="/jobs" className="job-details-back">
                        ← Back to projects
                    </Link>

                    <div className="job-details-header-content">
                        <div>
                            <span className="job-details-eyebrow">
                                CONVERGE PROJECT OPPORTUNITY
                            </span>

                            <h1>{job.title}</h1>

                            <div className="job-details-tags">
                                <span>{workTypeLabels[job.workType] || job.workType}</span>
                                <span>
                                    {experienceLabels[job.experienceLevel] ||
                                        job.experienceLevel}
                                </span>
                                <StatusBadge status={job.status || "OPEN"} />
                            </div>
                        </div>

                        <div className="job-details-budget">
                            <span>Project budget</span>
                            <strong>{formatBudget(job.budget)}</strong>
                            <small>{job.duration || "Flexible duration"}</small>
                        </div>
                    </div>
                </div>
            </section>

            <section className="job-details-content-section">
                <div className="container job-details-layout">
                    <div className="job-details-main">
                        <article className="job-details-panel">
                            <h2>About this project</h2>
                            <p className="job-details-description">
                                {job.description}
                            </p>
                        </article>

                        <article className="job-details-panel">
                            <h2>Skills you&apos;ll need</h2>

                            <div className="job-details-skills">
                                {(job.skills || []).map((skill) => (
                                    <span key={skill}>{skill}</span>
                                ))}
                            </div>
                        </article>

                        <article className="job-details-panel">
                            <h2>Project overview</h2>

                            <div className="job-overview-row">
                                <span>Experience level</span>
                                <strong>
                                    {experienceLabels[job.experienceLevel] ||
                                        job.experienceLevel ||
                                        "Not specified"}
                                </strong>
                            </div>

                            <div className="job-overview-row">
                                <span>Work arrangement</span>
                                <strong>
                                    {workTypeLabels[job.workType] ||
                                        job.workType ||
                                        "Not specified"}
                                </strong>
                            </div>

                            <div className="job-overview-row">
                                <span>Duration</span>
                                <strong>{job.duration || "Flexible"}</strong>
                            </div>

                            <div className="job-overview-row">
                                <span>Budget</span>
                                <strong>{formatBudget(job.budget)}</strong>
                            </div>

                            <div className="job-overview-row">
                                <span>Status</span>
                                <StatusBadge status={job.status || "OPEN"} />
                            </div>
                        </article>
                    </div>

                    <aside className="job-details-sidebar">
                        <article className="job-details-panel job-owner-panel">
                            <h2>Posted by</h2>

                            <div className="job-owner">
                                {freelancer.profilePicture ? (
                                    <img
                                        src={freelancer.profilePicture}
                                        alt={freelancerName}
                                        className="job-owner-avatar"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <span className="job-owner-avatar">
                                        {initials}
                                    </span>
                                )}

                                <div>
                                    <strong>{freelancerName}</strong>
                                    <span>
                                        {freelancer.experienceLevel
                                            ? `${freelancer.experienceLevel} Freelancer`
                                            : "Project owner"}
                                    </span>
                                </div>
                            </div>

                            {freelancer.bio && (
                                <p style={{ fontSize: "13px", marginTop: "12px", color: "var(--color-text-secondary)" }}>
                                    {freelancer.bio}
                                </p>
                            )}

                            {freelancerId && (
                                <Link
                                    href={`/profile/${freelancerId}`}
                                    style={{
                                        display: "inline-block",
                                        marginTop: "12px",
                                        fontSize: "13px",
                                        color: "var(--color-primary)",
                                        fontWeight: "600",
                                    }}
                                >
                                    View public profile →
                                </Link>
                            )}
                        </article>

                        <article className="job-details-panel job-apply-panel">
                            <h2>Project Application</h2>

                            {/* Case 1: Unauthenticated */}
                            {!isAuthenticated ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                                    <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                                        Interested in this opportunity? Log in or create an account to submit your application.
                                    </p>
                                    <Link
                                        href={`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                                        className="btn btn-primary"
                                        style={{ width: "100%" }}
                                    >
                                        Log in to apply
                                    </Link>
                                    <Link
                                        href={`/register?role=FRESHER&redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                                        className="btn btn-secondary"
                                        style={{ width: "100%" }}
                                    >
                                        Sign up as a Fresher
                                    </Link>
                                </div>
                            ) : isOwner ? (
                                /* Case 2: Project Owner */
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                                    <div style={{ padding: "12px 14px", background: "var(--color-surface-muted)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                                        You are the owner of this project.
                                    </div>
                                    <Link
                                        href="/dashboard/applications"
                                        className="btn btn-primary"
                                        style={{ width: "100%" }}
                                    >
                                        Review Applications
                                    </Link>
                                    <Link
                                        href={`/jobs/${jobId}/edit`}
                                        className="btn btn-secondary"
                                        style={{ width: "100%" }}
                                    >
                                        Edit Project Details
                                    </Link>
                                </div>
                            ) : user?.role === "FREELANCER" ? (
                                /* Case 3: Other Freelancer */
                                <div style={{ marginTop: "14px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                                    <p>Freelancer accounts cannot apply to project opportunities.</p>
                                    <p style={{ marginTop: "8px" }}>
                                        This platform is designed for freshers and junior developers to apply and build experience.
                                    </p>
                                </div>
                            ) : userApplication ? (
                                /* Case 4: Fresher already applied */
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: "13px", fontWeight: "600" }}>Application Status:</span>
                                        <StatusBadge status={userApplication.status} />
                                    </div>

                                    <div style={{ background: "var(--color-surface-muted)", padding: "14px", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                                        <p style={{ fontWeight: "600", marginBottom: "4px" }}>
                                            Proposed Budget: {formatBudget(userApplication.proposedBudget)}
                                        </p>
                                        <p style={{ color: "var(--color-text-secondary)", marginTop: "6px" }}>
                                            <strong>Cover Letter:</strong> &ldquo;{userApplication.coverLetter}&rdquo;
                                        </p>
                                    </div>

                                    {applicationMessage && (
                                        <div className="job-application-success" role="status">
                                            {applicationMessage}
                                        </div>
                                    )}

                                    {/* Withdraw option if status allows */}
                                    {["PENDING", "SHORTLISTED"].includes(userApplication.status) && (
                                        <button
                                            type="button"
                                            onClick={() => setShowWithdrawDialog(true)}
                                            className="btn btn-secondary"
                                            style={{ width: "100%", color: "var(--color-rejected)" }}
                                        >
                                            Withdraw Application
                                        </button>
                                    )}

                                    {userApplication.status === "WITHDRAWN" && (
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                            You have withdrawn this application.
                                        </p>
                                    )}
                                </div>
                            ) : !isOpen ? (
                                /* Case 5: Job is closed */
                                <p className="job-closed-message">
                                    This project is closed and no longer accepting applications.
                                </p>
                            ) : (
                                /* Case 6: Open for application */
                                <form onSubmit={handleApply}>
                                    <div className="job-apply-field">
                                        <label htmlFor="coverLetter">
                                            Cover letter <span style={{ color: "var(--color-rejected)" }}>*</span>
                                        </label>

                                        <textarea
                                            id="coverLetter"
                                            value={coverLetter}
                                            onChange={(event) => setCoverLetter(event.target.value)}
                                            placeholder="Introduce yourself, your skills, and why you would love to collaborate on this project... (minimum 20 characters)"
                                            rows={6}
                                            required
                                            minLength={20}
                                            maxLength={2000}
                                        />
                                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                            {coverLetter.length}/2000 characters (min 20)
                                        </span>
                                    </div>

                                    <div className="job-apply-field">
                                        <label htmlFor="proposedBudget">
                                            Proposed budget (₹) <span style={{ color: "var(--color-rejected)" }}>*</span>
                                        </label>

                                        <input
                                            id="proposedBudget"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={proposedBudget}
                                            onChange={(event) => setProposedBudget(event.target.value)}
                                            placeholder={`e.g. ${job.budget || 5000}`}
                                            required
                                        />
                                    </div>

                                    {applicationError && (
                                        <div className="job-application-error" role="alert">
                                            {applicationError}
                                        </div>
                                    )}

                                    {applicationMessage && (
                                        <div className="job-application-success" role="status">
                                            {applicationMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary job-apply-button"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Submitting..." : "Submit application"}
                                    </button>
                                </form>
                            )}
                        </article>
                    </aside>
                </div>
            </section>

            {/* Withdraw confirmation dialog */}
            <ConfirmDialog
                isOpen={showWithdrawDialog}
                title="Withdraw Application"
                message="Are you sure you want to withdraw your application? This will inform the freelancer that you are no longer available for this project."
                confirmText="Withdraw"
                isDestructive={true}
                isLoading={withdrawing}
                onConfirm={handleWithdraw}
                onCancel={() => setShowWithdrawDialog(false)}
            />
        </main>
    );
}
