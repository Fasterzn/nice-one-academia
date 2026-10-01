import { Phone, Clock, MapPin, MessageCircle } from 'lucide-react';
import { site, openingHours, openingHoursNote } from '../data/site';
import { social } from '../data/social';
import { units, unitLocation } from '../data/units';
import { whatsappLink } from '../utils/whatsapp';
import { mapsLink } from '../utils/maps';
import { SectionTitle } from '../components/SectionTitle';
import { Reveal } from '../components/Reveal';
import './Contact.css';

export function Contact() {
  return (
    <section className="section section--surface contact" id="contato">
      <div className="container">
        <SectionTitle kicker="Contato" lead="Escolha a unidade e fale direto pelo WhatsApp.">
          Vamos <span className="hl">começar?</span>
        </SectionTitle>

        <div className="contact__grid">
          {/* Seletor de unidade inline */}
          <Reveal className="contact__units">
            <ul className="contact__list">
              {units.map((unit) => {
                const maps = mapsLink(unit);
                return (
                  <li key={unit.id} className="contact__unit">
                    <div className="contact__unit-head">
                      <h3 className="contact__unit-name">
                        {unit.name}
                        {unit.is24h && <span className="contact__unit-24h">24 horas</span>}
                      </h3>
                      <span className="contact__unit-place">{unitLocation(unit)}</span>
                    </div>
                    <div className="contact__unit-actions">
                      <a
                        className="contact__wpp"
                        href={whatsappLink(unit)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={16} aria-hidden="true" />
                        Falar no WhatsApp
                        <span className="visually-hidden"> com a Nice One {unit.name} (abre em nova aba)</span>
                      </a>
                      {maps && (
                        <a
                          className="contact__maps"
                          href={maps}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin size={15} aria-hidden="true" />
                          Ver localização
                          <span className="visually-hidden"> da Nice One {unit.name} no mapa (abre em nova aba)</span>
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal className="contact__aside" delay={80}>
            <div className="contact__box">
              <h3 className="contact__box-title">
                <Phone size={16} aria-hidden="true" />
                Telefone
              </h3>
              <a className="contact__phone" href={site.phoneHref}>
                {site.phone}
              </a>
            </div>

            <div className="contact__box">
              <h3 className="contact__box-title">
                <Clock size={16} aria-hidden="true" />
                Horário
              </h3>
              <ul className="contact__hours">
                {openingHours.map((item) => (
                  <li key={item.days}>
                    <span>{item.days}</span>
                    <strong>{item.hours}</strong>
                  </li>
                ))}
              </ul>
              <p className="contact__hours-note">{openingHoursNote}</p>
            </div>

            <div className="contact__box">
              <h3 className="contact__box-title">Redes</h3>
              <div className="contact__social">
                <a href={social.instagram.url} target="_blank" rel="noopener noreferrer">
                  {social.instagram.handle}
                  <span className="visually-hidden"> no Instagram (abre em nova aba)</span>
                </a>
                <a href={social.youtube.url} target="_blank" rel="noopener noreferrer">
                  {social.youtube.handle}
                  <span className="visually-hidden"> no YouTube (abre em nova aba)</span>
                </a>
                <a href={social.facebook.url} target="_blank" rel="noopener noreferrer">
                  Facebook
                  <span className="visually-hidden"> da Nice One (abre em nova aba)</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
