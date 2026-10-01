import { Photo } from '../components/Photo';
import { Reveal } from '../components/Reveal';
import { asset } from '../lib/asset';
import './About.css';

export function About() {
  return (
    <section className="section about" id="sobre">
      <div className="container about__inner">
        <Reveal className="about__media">
          <div className="about__photo">
            <Photo
              src={asset('images/sobre.webp')}
              alt="Salão de musculação da Nice One com as máquinas e a marca na parede"
              width={385}
              height={513}
              fallbackLabel="Nice One Academia"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div className="about__seal" aria-hidden="true">
            <span className="about__seal-number">20</span>
            <span className="about__seal-text">Anos</span>
          </div>
        </Reveal>

        <Reveal className="about__text" delay={80}>
          <p className="kicker">Sobre a rede</p>
          <h2>
            Mais que uma <span className="hl">academia.</span>
          </h2>
          <p className="lead">
            Nascida em Sertãozinho em 2006, a Nice One cresceu junto com a cidade e hoje é uma rede
            com 5 unidades. Estrutura completa, aulas coletivas, avaliação física e profissionais
            que acompanham você de perto — em qualquer unidade da rede.
          </p>
          <p className="about__slogan">Invista na saúde para não gastar na doença!</p>
        </Reveal>
      </div>
    </section>
  );
}
