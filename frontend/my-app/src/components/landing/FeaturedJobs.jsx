
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const formatBudget = (budget) => {
    if (budget == null) return "Negotiable";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(budget);
};

const getExperienceLabel = (level) => {
    const labels = {
        BEGINNER: "Beginner friendly",
        INTERMEDIATE: "Intermediate",
        EXPERIENCED: "Experienced",
    };

    return labels[level] || level || "All experience levels";
};

const getWorkTypeLabel = (workType) => {
    const labels = {
        REMOTE: "Remote",
        HYBRID: "Hybrid",
        ONSITE: "On-site",
    };

    return labels[workType] || workType || "Flexible";
};

const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";

    return (first + last).toUpperCase() || "F";
};

const JobCard = ({ job }) => {
    const freelancer = job.freelancerId || {};

    const freelancerName =
        [freelancer.firstName, freelancer.lastName]
            .filter(Boolean)
            .join(" ") || "Freelancer";

    return (
        <article className="featured-job-card">
            <div className="featured-job-top">
                <span className="featured-job-category">
                    {job.category || "Development"}
                </span>

                <span className="featured-job-status">
                    Open
                </span>
            </div>

            <h3 className="featured-job-title">
                {job.title}
            </h3>

            <p className="featured-job-description">
                {job.description}
            </p>

            <div className="featured-job-skills">
                {(job.skills || []).map((skill) => (
                    <span key={skill}>{skill}</span>
                ))}
            </div>

            <div className="featured-job-meta">
                <div>
                    <span>Budget</span>
                    <strong>{formatBudget(job.budget)}</strong>
                </div>

                <div>
                    <span>Duration</span>
                    <strong>{job.duration || "Flexible"}</strong>
                </div>
            </div>

            <div className="featured-job-footer">
                <div className="job-poster">
                    <div className="job-poster-avatar">
                        {getInitials(
                            freelancer.firstName,
                            freelancer.lastName
                        )}
                    </div>

                    <div className="job-poster-info">
                        <strong>{freelancerName}</strong>
                        <span>
                            {getExperienceLabel(job.experienceLevel)}
                            {" · "}
                            {getWorkTypeLabel(job.workType)}
                        </span>
                    </div>
                </div>

                <Link
                    href="/jobs"
                    className="featured-job-arrow"
                    aria-label={`Explore ${job.title}`}
                >
                    <span aria-hidden="true">↗</span>
                </Link>
            </div>
        </article>
    );
};

const FeaturedJobs = () => {
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                const result = await api("/jobs?limit=3");
                setFeaturedJobs(result.data.jobs || []);
            } catch (err) {
                setError(err.message || "Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedJobs();
    }, []);

    return (
        <section
            className="featured-jobs-section"
            id="featured-jobs"
        >
            <div className="container">
                <div className="featured-jobs-heading">
                    <div className="section-heading featured-jobs-intro">
                        <span className="section-eyebrow">
                            OPPORTUNITIES TO GROW
                        </span>

                        <h2>
                            Real projects.{" "}
                            <span>Practical experience.</span>
                        </h2>

                        <p>
                            Explore opportunities where you can
                            put your skills to work, learn by
                            contributing, and grow your portfolio.
                        </p>
                    </div>

                    <Link
                        href="/jobs"
                        className="btn btn-secondary featured-jobs-view-all"
                    >
                        Explore all projects
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="featured-jobs-message">
                        Loading opportunities...
                    </div>
                ) : error ? (
                    <div className="featured-jobs-message" role="alert">
                        {error}
                    </div>
                ) : featuredJobs.length === 0 ? (
                    <div className="featured-jobs-message">
                        No open projects available right now.
                        Check back soon!
                    </div>
                ) : (
                    <div className="featured-jobs-grid">
                        {featuredJobs.map((job) => (
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                )}

                <div className="featured-jobs-bottom">
                    <span>
                        Looking for your first real-world project?
                    </span>

                    <Link href="/register?role=FRESHER">
                        Create your profile
                        <span aria-hidden="true"> →</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedJobs;
