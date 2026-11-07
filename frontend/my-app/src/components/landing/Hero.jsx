
import Link from "next/link";

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-grid">
                {/* Left: Main message */}
                <div className="hero-content">
                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />
                        WHERE TALENT MEETS OPPORTUNITY
                    </div>

                    <h1 className="hero-title">
                        Where talent meets{" "}
                        <span>opportunity.</span>
                    </h1>

                    <p className="hero-description">
                        Connect with people. Build real projects. Grow together.
                        Converge brings experienced freelancers and ambitious developers
                        together to create meaningful, real-world work.
                    </p>

                    <div className="hero-actions">
                        <Link
                            href="/jobs"
                            className="btn btn-primary hero-primary-btn"
                        >
                            Explore projects
                            <span aria-hidden="true">↗</span>
                        </Link>

                        <Link
                            href="/register"
                            className="btn btn-secondary hero-secondary-btn"
                        >
                            Find collaborators
                        </Link>
                    </div>

                    <div className="hero-note">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="m5 12 4 4L19 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span>
                            Build experience through real collaboration
                        </span>
                    </div>
                </div>

                {/* Right: Featured project preview */}
                <div className="hero-visual">
                    <div className="hero-decoration hero-decoration-one" />
                    <div className="hero-decoration hero-decoration-two" />

                    <article className="featured-project">
                        <div className="project-topline">
                            <span className="project-label">
                                PROJECT SPOTLIGHT
                            </span>

                            <span className="project-status">
                                <span />
                                Accepting applications
                            </span>
                        </div>

                        <div className="project-heading">
                            <div className="project-icon">
                                <svg
                                    width="27"
                                    height="27"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h2>Build a REST API</h2>
                                <p>Backend development</p>
                            </div>
                        </div>

                        <p className="project-description">
                            Help build a scalable API using Node.js,
                            Express, and MongoDB while learning from
                            a real project.
                        </p>

                        <div className="project-skills">
                            <span>Node.js</span>
                            <span>Express</span>
                            <span>MongoDB</span>
                        </div>

                        <div className="project-divider" />

                        <div className="project-details">
                            <div>
                                <span className="project-detail-label">
                                    EXPERIENCE
                                </span>
                                <strong>Beginner friendly</strong>
                            </div>

                            <div>
                                <span className="project-detail-label">
                                    WORK MODE
                                </span>
                                <strong>Remote</strong>
                            </div>
                        </div>

                        <Link
                            href="/jobs"
                            className="project-link"
                        >
                            View project details
                            <span aria-hidden="true">→</span>
                        </Link>
                    </article>

                    <div className="hero-floating-note">
                        <div className="floating-note-icon">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 3v18M3 12h18"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <strong>Learn by doing</strong>
                            <span>Build work you can showcase</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
