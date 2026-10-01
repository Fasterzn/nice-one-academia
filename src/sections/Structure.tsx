import { services } from '../data/services';
import { SectionTitle } from '../components/SectionTitle';
import { useReveal } from '../utils/useReveal';
import './Structure.css';

function ServiceItem({ index, name, text, Icon }: {
  index: number;
  name: string;
  text: string;
  Icon: (typeof services)[number]['icon'];
}) {
  const { ref, visible } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={`structure__item ${visible ? 'structure__item--in' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className="structure__number" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="structure__icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className="structure__content">
        <h3 className="structure__name">{name}</h3>
        <p className="structure__text">{text}</p>
      </div>
    </li>
  );
}

export function Structure() {
  return (
    <section className="section section--surface structure" id="estrutura">
      <div className="container">
        <SectionTitle kicker="Estrutura e serviços">
          Tudo para sua <span className="hl">rotina.</span>
        </SectionTitle>

        <ul className="structure__list">
          {services.map((service, index) => (
            <ServiceItem
              key={service.name}
              index={index}
              name={service.name}
              text={service.text}
              Icon={service.icon}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
