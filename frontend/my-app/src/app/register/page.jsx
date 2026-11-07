"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConvergeLogo from "@/components/common/ConvergeLogo";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect");
    const roleParam = searchParams.get("role");
    const { register, user, isLoading } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "FRESHER",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // If already authenticated, redirect
    useEffect(() => {
        if (!isLoading && user) {
            const destination = redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")
                ? redirectUrl
                : "/dashboard";
            router.push(destination);
        }
    }, [user, isLoading, redirectUrl, router]);

    // Support links such as /register?role=FREELANCER
    useEffect(() => {
        if (roleParam && ["FRESHER", "FREELANCER"].includes(roleParam)) {
            setForm((prev) => ({
                ...prev,
                role: roleParam,
            }));
        }
    }, [roleParam]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });

            // Redirect to intended destination or dashboard
            const destination = redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")
                ? redirectUrl
                : "/dashboard";

            router.push(destination);
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div style={{ marginBottom: "28px" }}>
                    <ConvergeLogo size="lg" href="/" />
                </div>

                <div className="auth-heading">
                    <p className="auth-eyebrow">GET STARTED</p>
                    <h1>Create your account</h1>
                    <p>
                        Join a community where real projects create real
                        opportunities.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-name-grid">
                        <div className="auth-field">
                            <label htmlFor="firstName">First name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={form.firstName}
                                onChange={handleChange}
                                autoComplete="given-name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="lastName">Last name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={form.lastName}
                                onChange={handleChange}
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                        <span className="auth-hint">
                            Must be 8+ chars with uppercase, lowercase, number & symbol.
                        </span>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="role">I want to join as a</label>
                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="FRESHER">
                                Fresher — gain real project experience
                            </option>
                            <option value="FREELANCER">
                                Experienced freelancer — post opportunities
                            </option>
                        </select>
                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}>
                        Log in
                    </Link>
                </p>

                <p className="auth-terms">
                    By creating an account, you agree to use the platform
                    respectfully and professionally.
                </p>
            </div>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="auth-page"><div className="auth-card">Loading...</div></div>}>
            <RegisterForm />
        </Suspense>
    );
}
