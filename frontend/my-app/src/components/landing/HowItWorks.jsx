
const steps = [
    {
        number: "01",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="25"
                height="25"
                fill="none"
                aria-hidden="true"
            >
                <circle
                    cx="10.8"
                    cy="10.8"
                    r="6.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="m16 16 4.2 4.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
        title: "Discover opportunities",
        description:
            "Explore real projects posted by experienced freelancers. Find opportunities that match your skills and interests.",
    },
    {
        number: "02",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="25"
                height="25"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M8 12h8M12 8v8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        ),
        title: "Apply and collaborate",
        description:
            "Share your interest, explain what you bring to the project, and connect with people who need your skills.",
    },
    {
        number: "03",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="25"
                height="25"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        title: "Build real experience",
        description:
            "Learn through practical work, contribute to meaningful projects, and develop experience you can showcase.",
    },
];

const HowItWorks = () => {
    return (
        <section
            className="how-section"
            id="how-it-works"
        >
            <div className="container">
                <div className="section-heading">
                    <span className="section-eyebrow">
                        SIMPLE BY DESIGN
                    </span>

                    <h2>
                        From skills to{" "}
                        <span>real experience.</span>
                    </h2>

                    <p>
                        A straightforward way to turn what you know
                        into what you can do.
                    </p>
                </div>

                <div className="steps-grid">
                    {steps.map((step) => (
                        <article
                            className="step-card"
                            key={step.number}
                        >
                            <div className="step-card-top">
                                <div className="step-icon">
                                    {step.icon}
                                </div>

                                <span className="step-number">
                                    {step.number}
                                </span>
                            </div>

                            <h3>{step.title}</h3>

                            <p>{step.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
