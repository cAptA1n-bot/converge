"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FresherDashboard from "@/components/dashboard/FresherDashboard";
import FreelancerDashboard from "@/components/dashboard/FreelancerDashboard";
import { LoadingState } from "@/components/common/LoadingState";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || (!user && isAuthenticated)) {
        return <LoadingState message="Loading your dashboard..." />;
    }

    if (!user) return null;

    return (
        <main className="container section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
            {user.role === "FREELANCER" ? (
                <FreelancerDashboard user={user} />
            ) : (
                <FresherDashboard user={user} />
            )}
        </main>
    );
}

