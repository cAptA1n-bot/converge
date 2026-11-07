"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConvergeLogo from "@/components/common/ConvergeLogo";

const Navbar = () => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch {
            router.push("/login");
        }
    };

    const isFreelancer = user?.role === "FREELANCER";
    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                {/* Brand */}
                <ConvergeLogo href="/" size="md" />

                {/* Desktop Navigation */}
                <nav className="navbar-links" aria-label="Main navigation">
                    <Link href="/">Home</Link>
                    <Link href="/jobs">Browse Jobs</Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard">Dashboard</Link>
                            {isFreelancer && (
                                <Link href="/jobs/create">Post a Job</Link>
                            )}
                            <Link href="/profile">Profile</Link>
                        </>
                    ) : (
                        <Link href="/#how-it-works">How It Works</Link>
                    )}
                </nav>

                {/* Desktop Actions */}
                <div className="navbar-actions">
                    {isLoading ? (
                        <span className="text-secondary text-sm">...</span>
                    ) : isAuthenticated ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <Link href="/profile" className="navbar-user-badge" title="View profile">
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.firstName}
                                        className="navbar-user-avatar"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <span className="navbar-user-avatar">{initials}</span>
                                )}
                                <span>{user?.firstName}</span>
                                <span className="navbar-user-role">{user?.role}</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "13px" }}
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="navbar-login">
                                Log In
                            </Link>
                            <Link href="/register" className="btn btn-primary navbar-cta">
                                Sign Up
                                <span aria-hidden="true">↗</span>
                            </Link>
                        </>
                    )}

                    {/* Mobile menu toggle button */}
                    <button
                        type="button"
                        className="navbar-mobile-toggle"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile menu drawer */}
            {mobileMenuOpen && (
                <div className="navbar-mobile-menu">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                        Home
                    </Link>
                    <Link href="/jobs" onClick={() => setMobileMenuOpen(false)}>
                        Browse Jobs
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            {isFreelancer && (
                                <Link href="/jobs/create" onClick={() => setMobileMenuOpen(false)}>
                                    Post a Job
                                </Link>
                            )}
                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                Profile ({user?.firstName} - {user?.role})
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                style={{ color: "var(--color-rejected)", textAlign: "left", cursor: "pointer" }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                                How It Works
                            </Link>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                Log In
                            </Link>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
