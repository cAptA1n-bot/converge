"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/common/LoadingState";

export default function UserPublicProfilePage() {
    const { userId } = useParams();
    const router = useRouter();
    const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirect=/profile/${userId}`);
        }
    }, [authLoading, isAuthenticated, userId, router]);

    useEffect(() => {
        if (!userId || !isAuthenticated) return;

        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await api(`/users/${userId}`);
                setUser(res.data?.user);
            } catch (err) {
                setError(err.message || "User profile not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, isAuthenticated]);

    if (authLoading || loading) {
        return <LoadingState message="Loading user profile..." />;
    }

    if (error || !user) {
        return (
            <main className="container section" style={{ maxWidth: "680px", margin: "60px auto", textAlign: "center" }}>
                <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>User not found</h1>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>
                    {error || "The profile you are looking for does not exist or may have been removed."}
                </p>
                <Link href="/jobs" className="btn btn-primary">
                    Browse Projects
                </Link>
            </main>
        );
    }

    const isSelf = currentUser && currentUser.id === userId;
    const fullName = `${user.firstName} ${user.lastName}`;
    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <main className="container section" style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/jobs" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    ← Back to projects
                </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Header Card */}
                <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "32px", display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={fullName}
                                style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }}
                            />
                        ) : (
                            <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "700" }}>
                                {initials}
                            </div>
                        )}

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <h1 style={{ fontSize: "26px", fontWeight: "700" }}>{fullName}</h1>
                                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
                                    {user.role}
                                </span>
                            </div>

                            <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px" }}>
                                <div>
                                    <span style={{ color: "var(--color-text-muted)" }}>Experience: </span>
                                    <strong>{user.experienceLevel || "BEGINNER"}</strong>
                                </div>
                                {user.createdAt && (
                                    <div>
                                        <span style={{ color: "var(--color-text-muted)" }}>Joined: </span>
                                        <span>{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isSelf && (
                        <Link href="/profile" className="btn btn-secondary">
                            Edit My Profile
                        </Link>
                    )}
                </div>

                {/* Bio */}
                <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>About</h2>
                    <p style={{ color: user.bio ? "var(--color-foreground)" : "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                        {user.bio || "This user hasn't written a bio yet."}
                    </p>
                </div>

                {/* Skills */}
                <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Skills</h2>
                    {Array.isArray(user.skills) && user.skills.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {user.skills.map((skill) => (
                                <span
                                    key={skill}
                                    style={{
                                        padding: "6px 12px",
                                        backgroundColor: "var(--color-surface-muted)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                            No skills listed.
                        </p>
                    )}
                </div>

                {/* Links */}
                {(user.github || user.portfolio) && (
                    <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Links & Social</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                            {user.github && (
                                <div style={{ padding: "16px", backgroundColor: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", marginBottom: "4px" }}>GitHub</div>
                                    <a
                                        href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "var(--color-primary)", fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}
                                    >
                                        {user.github} ↗
                                    </a>
                                </div>
                            )}

                            {user.portfolio && (
                                <div style={{ padding: "16px", backgroundColor: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", marginBottom: "4px" }}>Portfolio</div>
                                    <a
                                        href={user.portfolio.startsWith("http") ? user.portfolio : `https://${user.portfolio}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "var(--color-primary)", fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}
                                    >
                                        {user.portfolio} ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

