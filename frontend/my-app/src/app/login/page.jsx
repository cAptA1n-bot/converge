"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConvergeLogo from "@/components/common/ConvergeLogo";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect");
    const { login, user, isLoading } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
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
            await login({
                email: form.email.trim(),
                password: form.password,
            });

            // If a safe redirect was provided, navigate to it, otherwise dashboard
            const destination = redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")
                ? redirectUrl
                : "/dashboard";

            router.push(destination);
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
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
                    <p className="auth-eyebrow">WELCOME BACK</p>

                    <h1>Log in to your account</h1>

                    <p>
                        Continue discovering opportunities and building
                        meaningful project experience.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
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
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don&apos;t have an account?{" "}
                    <Link href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}>
                        Create an account
                    </Link>
                </p>

                <p className="auth-terms">
                    Your account helps you manage your profile,
                    opportunities, and applications.
                </p>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="auth-page"><div className="auth-card">Loading...</div></div>}>
            <LoginForm />
        </Suspense>
    );
}
