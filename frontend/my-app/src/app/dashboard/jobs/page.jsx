"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { LoadingState, EmptyState } from "@/components/common/LoadingState";

export default function ManageJobsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    // Deletion state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingJobId, setDeletingJobId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Status toggle state
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Authorization
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?redirect=/dashboard/jobs");
            } else if (user?.role !== "FREELANCER") {
                router.push("/dashboard");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    const fetchJobs = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError("");
            const res = await api(`/jobs?freelancerId=${user.id}&status=ALL&limit=50`);
            setJobs(res.data?.jobs || []);
        } catch (err) {
            setError(err.message || "Failed to load your jobs.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "FREELANCER") {
            fetchJobs();
        }
    }, [isAuthenticated, user, fetchJobs]);

    const handleToggleStatus = async (job) => {
        const newStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";

        try {
            setUpdatingStatusId(job._id);
            setSuccessMessage("");
            setError("");

            await api(`/jobs/${job._id}`, {
                method: "PATCH",
                body: { status: newStatus },
            });

            setJobs((prev) =>
                prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
            );

            setSuccessMessage(
                `Job "${job.title}" has been ${newStatus === "OPEN" ? "reopened" : "closed"}.`
            );
        } catch (err) {
            setError(err.message || "Failed to update job status.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingJobId) return;

        try {
            setIsDeleting(true);
            setSuccessMessage("");
            setError("");

            await api(`/jobs/${deletingJobId}`, {
                method: "DELETE",
            });

            setJobs((prev) => prev.filter((j) => j._id !== deletingJobId));
            setSuccessMessage("Project deleted successfully.");
            setShowDeleteDialog(false);
            setDeletingJobId(null);
        } catch (err) {
            setError(err.message || "Failed to delete project.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (authLoading || (!user && isAuthenticated)) {
        return <LoadingState message="Checking permissions..." />;
    }

    if (!user || user.role !== "FREELANCER") return null;

    const filteredJobs = jobs.filter((job) => {
        if (statusFilter === "ALL") return true;
        return job.status === statusFilter;
    });

    return (
        <main className="container section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: "30px", marginTop: "8px", letterSpacing: "-0.03em" }}>
                        Manage Posted Projects
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        View, update, close, reopen, or remove your project opportunities.
                    </p>
                </div>

                <Link href="/jobs/create" className="btn btn-primary">
                    + Post New Project
                </Link>
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

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className="btn"
                    style={{
                        minHeight: "36px",
                        padding: "6px 14px",
                        fontSize: "13px",
                        backgroundColor: statusFilter === "ALL" ? "var(--color-primary)" : "var(--color-surface)",
                        color: statusFilter === "ALL" ? "#ffffff" : "var(--color-foreground)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    All ({jobs.length})
                </button>
                <button
                    type="button"
                    onClick={() => setStatusFilter("OPEN")}
                    className="btn"
                    style={{
                        minHeight: "36px",
                        padding: "6px 14px",
                        fontSize: "13px",
                        backgroundColor: statusFilter === "OPEN" ? "var(--color-primary)" : "var(--color-surface)",
                        color: statusFilter === "OPEN" ? "#ffffff" : "var(--color-foreground)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    Open ({jobs.filter((j) => j.status === "OPEN").length})
                </button>
                <button
                    type="button"
                    onClick={() => setStatusFilter("CLOSED")}
                    className="btn"
                    style={{
                        minHeight: "36px",
                        padding: "6px 14px",
                        fontSize: "13px",
                        backgroundColor: statusFilter === "CLOSED" ? "var(--color-primary)" : "var(--color-surface)",
                        color: statusFilter === "CLOSED" ? "#ffffff" : "var(--color-foreground)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    Closed ({jobs.filter((j) => j.status === "CLOSED").length})
                </button>
            </div>

            {/* Jobs List */}
            {loading ? (
                <LoadingState message="Loading your projects..." />
            ) : filteredJobs.length === 0 ? (
                <EmptyState
                    title="No projects found"
                    description={
                        statusFilter === "ALL"
                            ? "You haven't posted any projects yet. Create your first listing to start collaborating."
                            : `You don't have any ${statusFilter.toLowerCase()} projects.`
                    }
                    action={
                        <Link href="/jobs/create" className="btn btn-primary">
                            + Post a Project
                        </Link>
                    }
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-foreground)" }}
                                        >
                                            {job.title}
                                        </Link>
                                        <StatusBadge status={job.status} />
                                    </div>

                                    <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", marginTop: "6px", maxWidth: "700px", lineHeight: "1.5" }}>
                                        {job.description?.length > 180
                                            ? `${job.description.substring(0, 180)}...`
                                            : job.description}
                                    </p>

                                    <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "13px", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                                        <span>Budget: <strong>₹{job.budget?.toLocaleString("en-IN")}</strong></span>
                                        <span>Duration: <strong>{job.duration}</strong></span>
                                        <span>Arrangement: <strong>{job.workType}</strong></span>
                                        <span>Level: <strong>{job.experienceLevel}</strong></span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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

                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(job)}
                                        disabled={updatingStatusId === job._id}
                                        className="btn btn-secondary"
                                        style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                                    >
                                        {updatingStatusId === job._id
                                            ? "Updating..."
                                            : job.status === "OPEN"
                                            ? "Close Project"
                                            : "Reopen Project"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeletingJobId(job._id);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="btn btn-secondary"
                                        style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px", color: "var(--color-rejected)" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Project Listing"
                message="Are you sure you want to permanently delete this project listing? This action cannot be undone."
                confirmText="Delete Project"
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setDeletingJobId(null);
                }}
            />
        </main>
    );
}

