"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

export default function CreateJobPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [form, setForm] = useState({
        title: "",
        description: "",
        skills: "",
        experienceLevel: "BEGINNER",
        budget: "",
        duration: "2-4 weeks",
        workType: "REMOTE",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Authorization checks
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login?redirect=/jobs/create");
            } else if (user?.role !== "FREELANCER") {
                router.push("/dashboard");
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
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

        if (!form.duration.trim()) {
            setError("Please specify the expected duration.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await api("/jobs", {
                method: "POST",
                body: {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    skills: skillsArray,
                    experienceLevel: form.experienceLevel,
                    budget: numericBudget,
                    duration: form.duration.trim(),
                    workType: form.workType,
                },
            });

            const createdJob = res.data?.job;
            if (createdJob?._id) {
                router.push(`/jobs/${createdJob._id}`);
            } else {
                router.push("/dashboard/jobs");
            }
        } catch (err) {
            setError(err.message || "Failed to create project listing.");
            setSubmitting(false);
        }
    };

    if (isLoading || !isAuthenticated || user?.role !== "FREELANCER") {
        return <LoadingState message="Checking permissions..." />;
    }

    return (
        <main className="container section" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ marginBottom: "28px" }}>
                <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    ← Back to Dashboard
                </Link>
                <h1 style={{ fontSize: "30px", marginTop: "12px", letterSpacing: "-0.03em" }}>
                    Post a Project Opportunity
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                    Create a real-world project task, set the requirements, and invite junior developers to apply.
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
                        placeholder="e.g. Build an interactive analytics dashboard with Next.js & Tailwind"
                        value={form.title}
                        onChange={handleChange}
                        required
                        minLength={5}
                        maxLength={100}
                    />
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        5 to 100 characters. Keep it clear and specific.
                    </span>
                </div>

                <div className="auth-field">
                    <label htmlFor="description">
                        Project Description & Scope <span style={{ color: "var(--color-rejected)" }}>*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={6}
                        placeholder="Describe the project goal, key deliverables, expectations, and how the junior contributor will collaborate with you... (minimum 20 characters)"
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
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {form.description.length}/2000 characters (min 20)
                    </span>
                </div>

                <div className="auth-field">
                    <label htmlFor="skills">
                        Required Skills (comma-separated) <span style={{ color: "var(--color-rejected)" }}>*</span>
                    </label>
                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        placeholder="e.g. React, Next.js, Node.js, REST APIs"
                        value={form.skills}
                        onChange={handleChange}
                        required
                    />
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Specify the main technologies and libraries contributors will use.
                    </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <div className="auth-field">
                        <label htmlFor="experienceLevel">Experience Level Needed</label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={form.experienceLevel}
                            onChange={handleChange}
                        >
                            <option value="BEGINNER">Beginner (Mentorship provided)</option>
                            <option value="INTERMEDIATE">Intermediate (Some experience needed)</option>
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
                            placeholder="e.g. 5000"
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
                            placeholder="e.g. 2 weeks, 1 month, Flexible"
                            value={form.duration}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px", marginTop: "12px", borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                    <Link href="/dashboard" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? "Publishing project..." : "Publish Project"}
                    </button>
                </div>
            </form>
        </main>
    );
}

