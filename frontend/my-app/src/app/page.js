import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import AudienceSection from "@/components/landing/AudienceSection";
import FeaturedJobs from "@/components/landing/FeaturedJobs";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
    return (
        <main className="container section">
            <Hero />
            <HowItWorks />
            <AudienceSection />
            <FeaturedJobs />
            <FinalCTA />
        </main>
    );
}
