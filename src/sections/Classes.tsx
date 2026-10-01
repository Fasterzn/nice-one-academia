import { useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  classesForDay,
  classesNote,
  dayLabels,
  getGrid,
  periodLabels,
  scheduledUnitIds,
  type Day,
  type Period,
} from '../data/classes';
import { units } from '../data/units';
import { whatsappLink } from '../utils/whatsapp';
import { SectionTitle } from '../components/SectionTitle';
import './Classes.css';

const weekdayByIndex: Record<number, Day> = {
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex',
  6: 'sab',
};

/** Dia de hoje, calculado uma vez no carregamento. */
const todayKey = weekdayByIndex[new Date().getDay()];

/** Dia de hoje quando ele existe na grade; senão, o primeiro dia disponível. */
function defaultDay(days: Day[]): Day {
  return todayKey && days.includes(todayKey) ? todayKey : (days[0] as Day);
}

const unitsWithoutSchedule = units.filter((unit) => !unit.hasClassSchedule);

export function Classes() {
  const [unitId, setUnitId] = useState(scheduledUnitIds[0] as number);
  const [period, setPeriod] = useState<Period>('manha');

  const grid = useMemo(() => getGrid(unitId, period), [unitId, period]);
  const days = useMemo(() => grid?.days ?? [], [grid]);
  const [chosenDay, setDay] = useState<Day | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Ao trocar unidade ou período, mantém o dia escolhido se ele existir na nova grade.
  const day = chosenDay && days.includes(chosenDay) ? chosenDay : defaultDay(days);

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = days.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const target = days[next];
    if (!target) return;
    setDay(target);
    tabRefs.current[next]?.focus();
  };

  const dayClasses = grid ? classesForDay(grid, day) : [];
  const selectedUnit = units.find((unit) => unit.id === unitId);

  return (
    <section className="section classes" id="aulas">
      <div className="container">
        <SectionTitle
          kicker="Aulas coletivas"
          lead="Grade real das unidades com aulas coletivas. Escolha a unidade e o período."
        >
          Treine <span className="hl">em grupo.</span>
        </SectionTitle>

        <div className="classes__filters">
          <div className="classes__filter" role="group" aria-label="Escolher unidade">
            {scheduledUnitIds.map((id) => (
              <button
                key={id}
                type="button"
                className={`classes__chip ${unitId === id ? 'classes__chip--on' : ''}`}
                aria-pressed={unitId === id}
                onClick={() => setUnitId(id)}
              >
                Unidade {id}
              </button>
            ))}
          </div>

          <div className="classes__filter" role="group" aria-label="Escolher período">
            {(['manha', 'noite'] as Period[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`classes__chip ${period === value ? 'classes__chip--on' : ''}`}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
              >
                {periodLabels[value]}
              </button>
            ))}
          </div>
        </div>

        {grid && (
          <>
            {/* Desktop — tabela real */}
            <div className="classes__table-wrap">
              <table className="classes__table">
                <caption className="visually-hidden">
                  Grade de aulas da Unidade {unitId} — período {periodLabels[period].toLowerCase()}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Horário</th>
                    {grid.days.map((value) => (
                      <th scope="col" key={value}>
                        {dayLabels[value].short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.rows.map((row, rowIndex) => (
                    <tr key={`${row.time}-${rowIndex}`}>
                      <th scope="row">{row.time}</th>
                      {grid.days.map((value) => {
                        const entry = row.cells[value];
                        return (
                          <td key={value}>
                            {entry ? (
                              <span className="classes__cell">
                                <span className="classes__cell-name">{entry.name}</span>
                                {entry.teacher && (
                                  <span className="classes__cell-teacher">{entry.teacher}</span>
                                )}
                              </span>
                            ) : (
                              <span className="classes__empty" aria-hidden="true">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile — abas por dia */}
            <div className="classes__mobile">
              <div className="classes__tabs" role="tablist" aria-label="Dia da semana">
                {grid.days.map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    id={`tab-${value}`}
                    aria-selected={day === value}
                    aria-controls={`panel-${value}`}
                    tabIndex={day === value ? 0 : -1}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    className={`classes__tab ${day === value ? 'classes__tab--on' : ''}`}
                    onClick={() => setDay(value)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                  >
                    {dayLabels[value].short}
                  </button>
                ))}
              </div>

              <div
                className="classes__panel"
                role="tabpanel"
                id={`panel-${day}`}
                aria-labelledby={`tab-${day}`}
                tabIndex={0}
              >
                {dayClasses.length > 0 ? (
                  <ul className="classes__list">
                    {dayClasses.map((item, index) => (
                      <li key={`${item.time}-${index}`}>
                        <span className="classes__list-time">{item.time}</span>
                        <span className="classes__list-main">
                          <span className="classes__list-name">{item.entry.name}</span>
                          {item.entry.teacher && (
                            <span className="classes__list-teacher">{item.entry.teacher}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="classes__none">
                    Sem aulas neste dia e período. Veja os outros dias ou fale com a unidade.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <p className="classes__note">{classesNote}</p>

        {selectedUnit && (
          <p className="classes__unit-contact">
            <a
              className="classes__link"
              href={whatsappLink(
                selectedUnit,
                `Olá! Quero saber mais sobre as aulas coletivas da Nice One ${selectedUnit.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Tirar dúvidas sobre as aulas da {selectedUnit.name}
              <span className="visually-hidden"> no WhatsApp (abre em nova aba)</span>
            </a>
          </p>
        )}

        <div className="classes__other">
          <p className="classes__other-title">Consulte a grade de aulas desta unidade pelo WhatsApp</p>
          <div className="classes__other-links">
            {unitsWithoutSchedule.map((unit) => (
              <a
                key={unit.id}
                className="classes__other-link"
                href={whatsappLink(
                  unit,
                  `Olá! Quero saber a grade de aulas da Nice One ${unit.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} aria-hidden="true" />
                {unit.name}
                <span className="visually-hidden"> — consultar a grade no WhatsApp (abre em nova aba)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
