import { Reveal } from '../components/Reveal';
import { Logo } from '../components/Logo';
import './AppTreino.css';

/** Bloco compacto do App Treino — sem prints e sem links de loja (não confirmados). */
export function AppTreino() {
  return (
    <section className="section app" aria-labelledby="app-title">
      <div className="container">
        <Reveal className="app__inner">
          <div className="app__text">
            <p className="kicker">App Treino</p>
            <h2 id="app-title">
              Seu treino <span className="hl">no bolso.</span>
            </h2>
            <p className="lead">
              Com o App Treino, você acompanha seus treinos e sua evolução direto pelo celular.
            </p>
          </div>

          {/* Mockup desenhado em CSS — nenhuma imagem fictícia do app */}
          <div className="app__phone" aria-hidden="true">
            <div className="app__notch" />
            <div className="app__screen">
              <Logo size="md" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
