import { Navbar } from './components/navbar'
import { HeroSection } from './components/hero'
import { AboutSection } from './components/about'
import { ServicesSection } from './components/services'
import { AgentBanner } from './components/agent-banner'
import { ContactSection } from './components/contact'
import { PartnersSection } from './components/partners'
import { Footer } from './components/footer'
import { Cards } from './components/cards-section'

export const Landingpage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <Cards />
                <AboutSection />
                {/* <ServicesSection /> */}
                <AgentBanner />
                <ContactSection />
                <PartnersSection />
            </main>
            <Footer />
        </div>
    )
}