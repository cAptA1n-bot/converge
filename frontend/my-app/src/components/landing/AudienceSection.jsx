
import Link from "next/link";

const fresherBenefits = [
    "Work on practical, real-world projects",
    "Learn from experienced freelancers",
    "Build a portfolio beyond tutorials",
];

const freelancerBenefits = [
    "Find collaborators for your projects",
    "Share work with capable developers",
    "Grow your network through collaboration",
];

const BenefitList = ({ items }) => {
    return (
        <ul className="audience-benefits">
            {items.map((item) => (
                <li key={item}>
                    <span className="benefit-check" aria-hidden="true">
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                        >
                            <path
                                d="m5 12 4 4L19 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    {item}
                </li>
            ))}
        </ul>
    );
};

const AudienceSection = () => {
    return (
        <section className="audience-section">
            <div className="container">
                <div className="section-heading audience-heading">
                    <span className="section-eyebrow">
                        BUILT FOR BOTH SIDES
                    </span>

                    <h2>
                        Better together.{" "}
                        <span>Stronger individually.</span>
                    </h2>

                    <p>
                        Whether you&apos;re building your career or
                        building a team, find the right opportunities
                        to move forward.
                    </p>
                </div>

                <div className="audience-grid">
                    {/* Freshers */}
                    <article className="audience-card fresher-card">
                        <div className="audience-card-header">
                            <div className="audience-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="27"
                                    height="27"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 3 3 8l9 5 9-5-9-5Z"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="m7 10.3 0 5.2c3.1 2.4 6.9 2.4 10 0v-5.2M21 8v6"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <span className="audience-label">
                                FOR FRESHERS
                            </span>
                        </div>

                        <h3>
                            Turn your skills into{" "}
                            <span>real experience.</span>
                        </h3>

                        <p className="audience-description">
                            You don&apos;t need years of experience to
                            start doing meaningful work. Find
                            opportunities where you can contribute,
                            learn, and grow.
                        </p>

                        <BenefitList items={fresherBenefits} />

                        <Link
                            href="/register?role=FRESHER"
                            className="audience-link"
                        >
                            Start building experience
                            <span aria-hidden="true">↗</span>
                        </Link>

                        <div className="audience-decoration fresher-decoration">
                            <div className="growth-card">
                                <span className="growth-card-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="22"
                                        height="22"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="m4 16 5-5 4 3 7-8M14 6h6v6"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>

                                <span>
                                    <strong>Learn by doing</strong>
                                    <small>Grow with every project</small>
                                </span>
                            </div>
                        </div>
                    </article>

                    {/* Experienced freelancers */}
                    <article
                        className="audience-card freelancer-card"
                        id="for-freelancers"
                    >
                        <div className="audience-card-header">
                            <div className="audience-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="27"
                                    height="27"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="7"
                                        width="18"
                                        height="13"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <path
                                        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <span className="audience-label">
                                FOR FREELANCERS
                            </span>
                        </div>

                        <h3>
                            Have more work?{" "}
                            <span>Build together.</span>
                        </h3>

                        <p className="audience-description">
                            Take on projects with the support of
                            other capable people. Share opportunities
                            with motivated developers and grow your
                            collaborative network.
                        </p>

                        <BenefitList items={freelancerBenefits} />

                        <Link
                            href="/register?role=FREELANCER"
                            className="audience-link"
                        >
                            Find your next collaborator
                            <span aria-hidden="true">↗</span>
                        </Link>

                        <div className="audience-decoration freelancer-decoration">
                            <div className="collaborator-card">
                                <span className="collaborator-avatar">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="22"
                                        height="22"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="9"
                                            cy="8"
                                            r="3"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                        <path
                                            d="M3 20v-2a6 6 0 0 1 12 0v2M17 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6V20"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>

                                <span>
                                    <strong>Better collaboration</strong>
                                    <small>More hands, shared progress</small>
                                </span>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default AudienceSection;
