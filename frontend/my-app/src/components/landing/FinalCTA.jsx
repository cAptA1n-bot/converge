
import Link from "next/link";

const FinalCTA = () => {
    return (
        <section className="final-cta-section">
            <div className="container">
                <div className="final-cta">
                    <div className="final-cta-content">
                        <span className="final-cta-eyebrow">
                            YOUR NEXT STEP STARTS HERE
                        </span>

                        <h2>
                            Your skills deserve{" "}
                            <span>real experience.</span>
                        </h2>

                        <p>
                            Find meaningful opportunities, work
                            alongside other developers, and keep
                            moving forward.
                        </p>

                        <div className="final-cta-actions">
                            <Link
                                href="/register"
                                className="btn final-cta-primary"
                            >
                                Join the community
                                <span aria-hidden="true">↗</span>
                            </Link>

                            <Link
                                href="/jobs"
                                className="final-cta-secondary"
                            >
                                Explore projects
                            </Link>
                        </div>
                    </div>

                    <div
                        className="final-cta-mark"
                        aria-hidden="true"
                    >
                        <div className="cta-mark-circle">
                            <svg
                                viewBox="0 0 36 36"
                                width="72"
                                height="72"
                                fill="none"
                            >
                                <path
                                    d="M 6 10 C 14 10 20 14 26 18 L 30 18"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 6 26 C 14 26 20 22 26 18 L 30 18"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="26"
                                    cy="18"
                                    r="2.8"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
