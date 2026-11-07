import Link from "next/link";
import ConvergeLogo from "@/components/common/ConvergeLogo";

const footerLinks = {
    Platform: [
        { label: "Explore projects", href: "/jobs" },
        { label: "How it works", href: "/#how-it-works" },
        { label: "For freshers", href: "/register?role=FRESHER" },
        { label: "For freelancers", href: "/register?role=FREELANCER" },
    ],
    Account: [
        { label: "Create an account", href: "/register" },
        { label: "Sign in", href: "/login" },
    ],
};

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <ConvergeLogo
                            variant="dark"
                            size="md"
                            showTagline={true}
                            href="/"
                        />

                        <p className="footer-description" style={{ marginTop: "16px" }}>
                            Where talent meets opportunity. Connect with people,
                            build real projects, and grow together in a community
                            designed for practical collaboration.
                        </p>

                        <Link href="/jobs" className="footer-explore-link">
                            Explore opportunities
                            <span aria-hidden="true">↗</span>
                        </Link>
                    </div>

                    <div className="footer-navigation">
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div className="footer-column" key={heading}>
                                <h3>{heading}</h3>

                                <ul>
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="footer-note">
                        <span className="footer-note-dot" />
                        <p>
                            Connect with people.
                            <br />
                            Build real projects.
                            <br />
                            Grow together.
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} Converge. Where talent meets opportunity.
                    </p>

                    <Link href="/" className="footer-back-to-top">
                        Back to top <span aria-hidden="true">↑</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
