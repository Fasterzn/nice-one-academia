import { UnitPickerProvider } from '../components/UnitPicker';
import { WhatsAppFab } from '../components/WhatsAppFab';
import { Schema } from '../components/Schema';
import { Navbar } from '../sections/Navbar';
import { Hero } from '../sections/Hero';
import { Marquee } from '../sections/Marquee';
import { Stats } from '../sections/Stats';
import { About } from '../sections/About';
import { Units } from '../sections/Units';
import { Classes } from '../sections/Classes';
import { Structure } from '../sections/Structure';
import { Assessment } from '../sections/Assessment';
import { Plans } from '../sections/Plans';
import { AppTreino } from '../sections/AppTreino';
import { Community } from '../sections/Community';
import { Social } from '../sections/Social';
import { Testimonials } from '../sections/Testimonials';
import { Contact } from '../sections/Contact';
import { Footer } from '../sections/Footer';

/** Site público — a home continua exatamente como era antes das rotas. */
export default function Home() {
  return (
    <UnitPickerProvider>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Navbar />

      <main id="conteudo">
        <Hero />
        <Marquee />
        <Stats />
        <About />
        <Units />
        <Classes />
        <Structure />
        <Assessment />
        <Plans />
        <AppTreino />
        <Community />
        <Social />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />
      <Schema />
    </UnitPickerProvider>
  );
}
