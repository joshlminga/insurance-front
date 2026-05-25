import { PartnersSection } from './components/partners'
import { Footer } from './components/footer'
import { HowItWorks } from './components/how-it-works'
import { FaqsPage } from './components/faqs'
import { ClaimsPage } from './components/claims'
import { HeroSection } from './components/hero'
import Navbar from './components/navbar'

export const Landingpage = () => {
    return (
        <div className="min-h-screen ">
            <Navbar />
            <main className='relative'>
                <HeroSection />
                <HowItWorks />
                <ClaimsPage />
                <FaqsPage />
                <PartnersSection />
            </main>
            <Footer />
        </div>
    )
}