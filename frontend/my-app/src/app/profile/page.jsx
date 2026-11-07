"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

export default function MyProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, setUser, refreshUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        bio: "",
        skills: "",
        experienceLevel: "BEGINNER",
        github: "",
        portfolio: "",
        profilePicture: "",
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/profile");
        }
    }, [authLoading, isAuthenticated, router]);

    // Populate form data from user
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                bio: user.bio || "",
                skills: Array.isArray(user.skills) ? user.skills.join(", ") : user.skills || "",
                experienceLevel: user.experienceLevel || "BEGINNER",
                github: user.github || "",
                portfolio: user.portfolio || "",
                profilePicture: user.profilePicture || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
            setErrorMessage("First name must be at least 2 characters.");
            setSubmitting(false);
            return;
        }

        if (!formData.lastName.trim()) {
            setErrorMessage("Last name is required.");
            setSubmitting(false);
            return;
        }

        try {
            const skillsArray = formData.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                bio: formData.bio.trim(),
                skills: skillsArray,
                experienceLevel: formData.experienceLevel,
                github: formData.github.trim(),
                portfolio: formData.portfolio.trim(),
                profilePicture: formData.profilePicture.trim(),
            };

            const res = await api("/users/me", {
                method: "PATCH",
                body: payload,
            });

            const updatedUser = res.data?.user;
            if (updatedUser) {
                setUser((prev) => ({ ...prev, ...updatedUser }));
            }
            await refreshUser();

            setSuccessMessage("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            setErrorMessage(err.message || "Failed to update profile.");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || (!user && isAuthenticated)) {
        return <LoadingState message="Loading your profile..." />;
    }

    if (!user) return null;

    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <main className="container section" style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--color-primary)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                        USER ACCOUNT
                    </span>
                    <h1 style={{ fontSize: "32px", marginTop: "4px" }}>My Profile</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                        Manage your platform identity, experience, and contact links.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/dashboard" className="btn btn-secondary">
                        Go to Dashboard
                    </Link>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {successMessage && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-accepted-bg)", color: "var(--color-accepted)", borderRadius: "var(--radius-md)", marginBottom: "24px", fontSize: "14px", fontWeight: "500" }}>
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div style={{ padding: "12px 16px", backgroundColor: "var(--color-rejected-bg)", color: "var(--color-rejected)", borderRadius: "var(--radius-md)", marginBottom: "24px", fontSize: "14px", fontWeight: "500" }}>
                    {errorMessage}
                </div>
            )}

            {!isEditing ? (
                /* Profile View Mode */
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Top Identity Card */}
                    <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "32px", display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={fullName}
                                style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }}
                            />
                        ) : (
                            <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", display: "grid", placeItems: "center", fontSize: "32px", fontWeight: "700" }}>
                                {initials}
                            </div>
                        )}

                        <div style={{ flex: 1, minWidth: "240px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "700" }}>{fullName}</h2>
                                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
                                    {user.role}
                                </span>
                            </div>

                            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                                {user.email}
                            </p>

                            <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px" }}>
                                <div>
                                    <span style={{ color: "var(--color-text-muted)" }}>Experience Level: </span>
                                    <strong style={{ color: "var(--color-foreground)" }}>{user.experienceLevel || "BEGINNER"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>About</h3>
                        <p style={{ color: user.bio ? "var(--color-foreground)" : "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                            {user.bio || "No bio added yet. Tell others about your background, interests, and experience."}
                        </p>
                    </div>

                    {/* Skills Section */}
                    <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Skills & Technologies</h3>
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
                                No skills listed yet. Add your core technical skills to stand out.
                            </p>
                        )}
                    </div>

                    {/* Links Section */}
                    <div style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Links & Profiles</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                            <div style={{ padding: "16px", backgroundColor: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", marginBottom: "4px" }}>GitHub</div>
                                {user.github ? (
                                    <a
                                        href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "var(--color-primary)", fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}
                                    >
                                        {user.github} ↗
                                    </a>
                                ) : (
                                    <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Not provided</span>
                                )}
                            </div>

                            <div style={{ padding: "16px", backgroundColor: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", marginBottom: "4px" }}>Portfolio / Website</div>
                                {user.portfolio ? (
                                    <a
                                        href={user.portfolio.startsWith("http") ? user.portfolio : `https://${user.portfolio}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "var(--color-primary)", fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}
                                    >
                                        {user.portfolio} ↗
                                    </a>
                                ) : (
                                    <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Not provided</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Edit Mode */
                <form
                    onSubmit={handleSave}
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "32px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="auth-field">
                            <label htmlFor="firstName">First name <span style={{ color: "var(--color-rejected)" }}>*</span></label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                minLength={2}
                                maxLength={50}
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="lastName">Last name <span style={{ color: "var(--color-rejected)" }}>*</span></label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                maxLength={50}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="experienceLevel">Experience Level</label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                        >
                            <option value="BEGINNER">Beginner (Junior / Entry level)</option>
                            <option value="INTERMEDIATE">Intermediate (1-3 years experience)</option>
                            <option value="EXPERIENCED">Experienced (3+ years experience)</option>
                        </select>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="bio">Bio / Overview</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                            maxLength={500}
                            placeholder="Briefly describe your experience, what you like building, and what you are looking for..."
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid var(--color-border-strong)",
                                borderRadius: "var(--radius-sm)",
                                fontFamily: "inherit",
                                fontSize: "14px",
                                resize: "vertical",
                            }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                            {formData.bio.length}/500 characters
                        </span>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="skills">Skills (comma-separated)</label>
                        <input
                            id="skills"
                            name="skills"
                            type="text"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="e.g. React, Node.js, TypeScript, Next.js, Python"
                        />
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                            Separate multiple skills with commas.
                        </span>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="profilePicture">Profile Picture URL</label>
                        <input
                            id="profilePicture"
                            name="profilePicture"
                            type="url"
                            value={formData.profilePicture}
                            onChange={handleChange}
                            placeholder="https://example.com/avatar.jpg"
                        />
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                            Provide an image link. Note: Direct file upload requires cloud storage service (e.g. S3/Cloudinary), not configured in this backend.
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="auth-field">
                            <label htmlFor="github">GitHub Profile / URL</label>
                            <input
                                id="github"
                                name="github"
                                type="text"
                                value={formData.github}
                                onChange={handleChange}
                                placeholder="github.com/username"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="portfolio">Portfolio / Personal Website</label>
                            <input
                                id="portfolio"
                                name="portfolio"
                                type="text"
                                value={formData.portfolio}
                                onChange={handleChange}
                                placeholder="https://myportfolio.com"
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setErrorMessage("");
                            }}
                            className="btn btn-secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? "Saving changes..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}

