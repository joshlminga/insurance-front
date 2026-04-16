import { Navbar } from './components/navbar'
import { HeroSection } from './components/hero'
import { PartnersSection } from './components/partners'
import { Footer } from './components/footer'
import { Cards } from './components/cards-section'
import { HowItWorks } from './components/how-it-works'
import { FaqsPage } from './components/faqs'
import { ClaimsPage } from './components/claims'

export const Landingpage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <Cards />
                <HowItWorks/>
                <ClaimsPage/>
                <FaqsPage/>
                <PartnersSection />
            </main>
            <Footer />
        </div>
    )
}