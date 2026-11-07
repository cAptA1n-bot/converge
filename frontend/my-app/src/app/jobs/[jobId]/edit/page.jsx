"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

export default function EditJobPage() {
    const { jobId } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [form, setForm] = useState({
        title: "",
        description: "",
        skills: "",
        experienceLevel: "BEGINNER",
        budget: "",
        duration: "",
        workType: "REMOTE",
        status: "OPEN",
    });

    const [loadingJob, setLoadingJob] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Authorization & Job Fetch
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirect=/jobs/${jobId}/edit`);
            return;
        }

        if (!authLoading && user && user.role !== "FREELANCER") {
            router.push("/dashboard");
            return;
        }

        if (jobId && isAuthenticated) {
            const fetchJob = async () => {
                try {
                    setLoadingJob(true);
                    setError("");
                    const res = await api(`/jobs/${jobId}`);
                    const job = res.data?.job || res.data;

                    const ownerId = job.freelancerId?._id || job.freelancerId;
                    if (user && ownerId !== user.id) {
                        setError("You are not authorized to edit this job.");
                        return;
                    }

                    setForm({
                        title: job.title || "",
                        description: job.description || "",
                        skills: Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "",
                        experienceLevel: job.experienceLevel || "BEGINNER",
                        budget: job.budget != null ? String(job.budget) : "",
                        duration: job.duration || "",
                        workType: job.workType || "REMOTE",
                        status: job.status || "OPEN",
                    });
                } catch (err) {
                    setError(err.message || "Failed to load job details.");
                } finally {
                    setLoadingJob(false);
                }
            };

            fetchJob();
        }
    }, [jobId, isAuthenticated, authLoading, user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.title.trim() || form.title.trim().length < 5) {
            setError("Title must be at least 5 characters long.");
            return;
        }

        if (!form.description.trim() || form.description.trim().length < 20) {
            setError("Description must be at least 20 characters long.");
            return;
        }

        const skillsArray = form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (skillsArray.length === 0) {
            setError("Please provide at least one required skill.");
            return;
        }

        const numericBudget = Number(form.budget);
        if (form.budget === "" || isNaN(numericBudget) || numericBudget < 0) {
            setError("Please provide a valid budget (0 or higher).");
            return;
        }

        setSubmitting(true);

        try {
            await api(`/jobs/${jobId}`, {
                method: "PATCH",
                body: {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    skills: skillsArray,
                    experienceLevel: form.experienceLevel,
                    budget: numericBudget,
                    duration: form.duration.trim(),
                    workType: form.workType,
                    status: form.status,
                },
            });

            router.push(`/jobs/${jobId}`);
        } catch (err) {
            setError(err.message || "Failed to update project listing.");
            setSubmitting(false);
        }
    };

    if (authLoading || loadingJob) {
        return <LoadingState message="Loading project for editing..." />;
    }

    return (
        <main className="container section" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ marginBottom: "28px" }}>
                <Link href={`/jobs/${jobId}`} style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    ← Back to Project Details
                </Link>
                <h1 style={{ fontSize: "30px", marginTop: "12px", letterSpacing: "-0.03em" }}>
                    Edit Project Opportunity
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                    Update details, modify requirements, or adjust project status.
                </p>
            </div>

            {error && (
                <div style={{ padding: "14px 18px", backgroundColor: "var(--color-rejected-bg)", color: "var(--color-rejected)", borderRadius: "var(--radius-md)", marginBottom: "24px", fontSize: "14px", fontWeight: "500" }}>
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "32px",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "22px",
                }}
            >
                <div className="auth-field">
                    <label htmlFor="title">
                        Project Title <span style={{ color: "var(--color-rejected)" }}>*</span>
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        required
                        minLength={5}
                        maxLength={100}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="status">Project Status</label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="OPEN">Open (Accepting Applications)</option>
                        <option value="CLOSED">Closed (Not Accepting Applications)</option>
                    </select>
                </div>

                <div className="auth-field">
                    <label htmlFor="description">
                        Project Description & Scope <span style={{ color: "var(--color-rejected)" }}>*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={6}
                        value={form.description}
                        onChange={handleChange}
                        required
                        minLength={20}
                        maxLength={2000}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-border-strong)",
                            borderRadius: "var(--radius-sm)",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            resize: "vertical",
                        }}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="skills">
                        Required Skills (comma-separated) <span style={{ color: "var(--color-rejected)" }}>*</span>
                    </label>
                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        value={form.skills}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <div className="auth-field">
                        <label htmlFor="experienceLevel">Experience Level</label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={form.experienceLevel}
                            onChange={handleChange}
                        >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="EXPERIENCED">Experienced</option>
                        </select>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="workType">Work Arrangement</label>
                        <select
                            id="workType"
                            name="workType"
                            value={form.workType}
                            onChange={handleChange}
                        >
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ONSITE">On-site</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <div className="auth-field">
                        <label htmlFor="budget">
                            Budget (₹) <span style={{ color: "var(--color-rejected)" }}>*</span>
                        </label>
                        <input
                            id="budget"
                            name="budget"
                            type="number"
                            min="0"
                            step="1"
                            value={form.budget}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="duration">
                            Estimated Duration <span style={{ color: "var(--color-rejected)" }}>*</span>
                        </label>
                        <input
                            id="duration"
                            name="duration"
                            type="text"
                            value={form.duration}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px", marginTop: "12px", borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                    <Link href={`/jobs/${jobId}`} className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? "Saving changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}

