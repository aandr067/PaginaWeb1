import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Process } from '@/components/sections/Process';
import { Measurement } from '@/components/sections/Measurement';
import { Compliance } from '@/components/sections/Compliance';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function Page() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Services />
        <Process />
        <Measurement />
        <Compliance />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
