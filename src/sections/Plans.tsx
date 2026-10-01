import { Check, Network } from 'lucide-react';
import { plans, plansHighlight } from '../data/plans';
import { SectionTitle } from '../components/SectionTitle';
import { Button } from '../components/Button';
import { useUnitPicker } from '../components/unit-picker-context';
import { useReveal } from '../utils/useReveal';
import './Plans.css';

export function Plans() {
  const { open } = useUnitPicker();

  return (
    <section className="section plans" id="planos">
      <div className="plans__bg" aria-hidden="true" />
      <div className="container">
        <SectionTitle kicker="Planos">
          Escolha e <span className="hl">comece.</span>
        </SectionTitle>

        <p className="plans__highlight">
          <Network size={18} aria-hidden="true" />
          {plansHighlight}
        </p>

        <ul className="plans__list">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              index={index}
              plan={plan}
              onConsult={() =>
                open(`Olá! Quero saber os valores do Plano Anual ${plan.payment}.`)
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  index,
  onConsult,
}: {
  plan: (typeof plans)[number];
  index: number;
  onConsult: () => void;
}) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`plans__card ${visible ? 'plans__card--in' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="plans__head">
        <h3 className="plans__name">{plan.name}</h3>
        <p className="plans__payment">{plan.payment}</p>
      </div>

      <ul className="plans__features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {plan.footnote && <p className="plans__footnote">*{plan.footnote}</p>}

      <Button withChevron onClick={onConsult}>
        Consultar valores
      </Button>
    </li>
  );
}
