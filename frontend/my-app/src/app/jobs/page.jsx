
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/common/StatusBadge";

const formatBudget = (budget) => {
    if (budget == null) return "Negotiable";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(budget);
};

const experienceLabels = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    EXPERIENCED: "Experienced",
};

const workTypeLabels = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
};

function JobCard({ job }) {
    const freelancer = job.freelancerId || {};

    const freelancerName =
        [freelancer.firstName, freelancer.lastName]
            .filter(Boolean)
            .join(" ") || "Freelancer";

    const initials =
        `${freelancer.firstName?.[0] || ""}${freelancer.lastName?.[0] || ""}`
            .toUpperCase() || "F";

    return (
        <article className="jobs-page-card">
            <div className="jobs-card-top">
                <span className="jobs-card-work-type">
                    {workTypeLabels[job.workType] || job.workType}
                </span>

                <StatusBadge status={job.status || "OPEN"} />
            </div>

            <h2 className="jobs-card-title">{job.title}</h2>

            <p className="jobs-card-description">
                {job.description}
            </p>

            <div className="jobs-card-skills">
                {(job.skills || []).map((skill) => (
                    <span key={skill}>{skill}</span>
                ))}
            </div>

            <div className="jobs-card-details">
                <div>
                    <span>Budget</span>
                    <strong>{formatBudget(job.budget)}</strong>
                </div>

                <div>
                    <span>Duration</span>
                    <strong>{job.duration || "Flexible"}</strong>
                </div>

                <div>
                    <span>Experience</span>
                    <strong>
                        {experienceLabels[job.experienceLevel] ||
                            job.experienceLevel ||
                            "Not specified"}
                    </strong>
                </div>
            </div>

            <div className="jobs-card-footer">
                <div className="jobs-card-freelancer">
                    <span className="jobs-card-avatar">{initials}</span>

                    <div>
                        <strong>{freelancerName}</strong>
                        <span>Project owner</span>
                    </div>
                </div>

                <Link
                    href={`/jobs/${job._id}`}
                    className="jobs-card-view-link"
                >
                    View details <span aria-hidden="true">→</span>
                </Link>
            </div>
        </article>
    );
}

export default function JobsPage() {
    const { user, isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [workType, setWorkType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchJobs = async () => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                if (search.trim()) {
                    params.set("search", search.trim());
                }

                if (experienceLevel) {
                    params.set("experienceLevel", experienceLevel);
                }

                if (workType) {
                    params.set("workType", workType);
                }

                params.set("limit", "20");

                const result = await api(
                    `/jobs?${params.toString()}`,
                    { signal: controller.signal }
                );

                setJobs(result.data.jobs || []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load jobs.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchJobs();

        return () => controller.abort();
    }, [search, experienceLevel, workType]);

    return (
        <main className="jobs-page">
            <section className="jobs-page-header">
                <div className="container">
                    <Link href="/" className="jobs-back-home">
                        ← Back to home
                    </Link>

                    <span className="section-eyebrow">
                        WHERE TALENT MEETS OPPORTUNITY
                    </span>

                    <h1>
                        Find projects.{" "}
                        <span>Grow together.</span>
                    </h1>

                    <p>
                        Discover real projects on Converge, collaborate with
                        experienced developers, and build a portfolio
                        that shows what you can do.
                    </p>

                    <div className="jobs-search">
                        <span aria-hidden="true">⌕</span>

                        <input
                            type="search"
                            placeholder="Search projects or skills..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search projects or skills"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="jobs-results-section">
                <div className="container">
                    <div className="jobs-results-heading">
                        <div>
                            <h2>Explore projects</h2>
                            <p>
                                Find an opportunity that matches your skills.
                            </p>
                        </div>

                        {user?.role === "FREELANCER" ? (
                            <Link
                                href="/jobs/create"
                                className="btn btn-primary"
                            >
                                + Post a Project
                            </Link>
                        ) : isAuthenticated ? (
                            <Link
                                href="/dashboard"
                                className="btn btn-secondary"
                            >
                                My Applications
                            </Link>
                        ) : (
                            <Link
                                href="/register?role=FRESHER"
                                className="btn btn-primary"
                            >
                                Join as a fresher
                            </Link>
                        )}
                    </div>

                    <div className="jobs-layout">
                        <aside className="jobs-filters">
                            <div className="jobs-filter-heading">
                                <h3>Filters</h3>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setExperienceLevel("");
                                        setWorkType("");
                                    }}
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="jobs-filter-group">
                                <label htmlFor="experience-filter">
                                    Experience level
                                </label>

                                <select
                                    id="experience-filter"
                                    value={experienceLevel}
                                    onChange={(event) =>
                                        setExperienceLevel(event.target.value)
                                    }
                                >
                                    <option value="">All levels</option>
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">
                                        Intermediate
                                    </option>
                                    <option value="EXPERIENCED">
                                        Experienced
                                    </option>
                                </select>
                            </div>

                            <div className="jobs-filter-group">
                                <label htmlFor="work-type-filter">
                                    Work arrangement
                                </label>

                                <select
                                    id="work-type-filter"
                                    value={workType}
                                    onChange={(event) =>
                                        setWorkType(event.target.value)
                                    }
                                >
                                    <option value="">All arrangements</option>
                                    <option value="REMOTE">Remote</option>
                                    <option value="HYBRID">Hybrid</option>
                                    <option value="ONSITE">On-site</option>
                                </select>
                            </div>
                        </aside>

                        <div className="jobs-results">
                            <div className="jobs-results-count">
                                {loading
                                    ? "Loading projects..."
                                    : `${jobs.length} project${jobs.length === 1 ? "" : "s"} found`}
                            </div>

                            {loading ? (
                                <div className="jobs-state">
                                    Loading available projects...
                                </div>
                            ) : error ? (
                                <div className="jobs-state" role="alert">
                                    <p>{error}</p>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setSearch((value) => value);
                                        }}
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="jobs-state">
                                    <h3>No projects found</h3>
                                    <p>
                                        Try another search or remove some filters.
                                    </p>
                                </div>
                            ) : (
                                <div className="jobs-list">
                                    {jobs.map((job) => (
                                        <JobCard key={job._id} job={job} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
