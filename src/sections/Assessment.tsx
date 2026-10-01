import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { useUnitPicker } from '../components/unit-picker-context';
import './Assessment.css';

export function Assessment() {
  const { open } = useUnitPicker();

  return (
    <section className="section assessment" id="avaliacao">
      <div className="container">
        <Reveal className="assessment__card">
          <div className="assessment__text">
            <p className="kicker">Avaliação física</p>
            <h2>
              Você sabe como está <span className="hl">evoluindo?</span>
            </h2>
            <p className="lead">
              A avaliação física ajuda a entender seu ponto de partida e acompanhar sua evolução ao
              longo do tempo.
            </p>
          </div>
          <Button
            size="lg"
            withChevron
            onClick={() => open('Olá! Quero agendar uma avaliação física.')}
          >
            Agendar avaliação
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
