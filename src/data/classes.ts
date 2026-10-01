/** Grade de aulas coletivas, transcrita das artes publicadas pela Nice One. */

export type Day = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';
export type Period = 'manha' | 'noite';

export type ClassEntry = { name: string; teacher?: string };
export type ClassRow = { time: string; cells: Partial<Record<Day, ClassEntry>> };

export type ClassGrid = {
  unitId: number;
  period: Period;
  days: Day[];
  rows: ClassRow[];
};

export const dayLabels: Record<Day, { short: string; long: string }> = {
  seg: { short: 'Seg', long: 'Segunda' },
  ter: { short: 'Ter', long: 'Terça' },
  qua: { short: 'Qua', long: 'Quarta' },
  qui: { short: 'Qui', long: 'Quinta' },
  sex: { short: 'Sex', long: 'Sexta' },
  sab: { short: 'Sáb', long: 'Sábado' },
};

export const periodLabels: Record<Period, string> = {
  manha: 'Manhã',
  noite: 'Noite',
};

/** Unidades com grade publicada. */
export const scheduledUnitIds = [3, 5];

export const modalities = [
  'Spinning',
  'Spinning Louvê',
  'Jump',
  'GAP',
  'Ritmos',
  'RIT',
  'Alongamento',
  'Abdômen (ABD)',
  'Cárdio Fight',
  'Fit Dance',
  'Pilates de Solo',
  'Queima 360',
  'Funcional',
];

const weekdays: Day[] = ['seg', 'ter', 'qua', 'qui', 'sex'];
const monToThu: Day[] = ['seg', 'ter', 'qua', 'qui'];

export const classGrids: ClassGrid[] = [
  {
    unitId: 3,
    period: 'manha',
    days: weekdays,
    rows: [
      { time: '6h30', cells: { ter: { name: 'Spinning' }, qui: { name: 'Spinning' } } },
      {
        time: '7h',
        cells: {
          seg: { name: 'Spinning' },
          ter: { name: 'Spinning' },
          qua: { name: 'Spinning' },
          qui: { name: 'Spinning' },
          sex: { name: 'Spinning' },
        },
      },
      {
        time: '7h',
        cells: {
          seg: { name: 'Ritmos' },
          ter: { name: 'Jump' },
          qua: { name: 'Ritmos' },
          qui: { name: 'Jump' },
        },
      },
      {
        time: '7h30',
        cells: { ter: { name: 'GAP' }, qui: { name: 'GAP' }, sex: { name: 'Cárdio Fight' } },
      },
      {
        time: '8h',
        cells: {
          seg: { name: 'Spinning' },
          qua: { name: 'Spinning' },
          sex: { name: 'Cárdio Fight' },
        },
      },
      { time: '8h', cells: { seg: { name: 'Abdômen' }, qua: { name: 'Abdômen' } } },
      {
        time: '8h30',
        cells: {
          seg: { name: 'Alongamento' },
          qua: { name: 'Alongamento' },
          sex: { name: 'Alongamento' },
        },
      },
    ],
  },
  {
    unitId: 3,
    period: 'noite',
    days: monToThu,
    rows: [
      {
        time: '18h',
        cells: {
          seg: { name: 'Spinning' },
          ter: { name: 'Spinning' },
          qua: { name: 'Spinning' },
          qui: { name: 'Spinning' },
        },
      },
      { time: '18h', cells: { ter: { name: 'GAP' }, qui: { name: 'GAP' } } },
      {
        time: '18h30',
        cells: {
          seg: { name: 'Jump' },
          ter: { name: 'Jump' },
          qua: { name: 'Jump' },
          qui: { name: 'Jump' },
        },
      },
      { time: '19h', cells: { seg: { name: 'Spinning' }, qua: { name: 'Spinning' } } },
      {
        time: '19h',
        cells: {
          seg: { name: 'Ritmos' },
          ter: { name: 'Alongamento' },
          qua: { name: 'Ritmos' },
          qui: { name: 'Alongamento' },
        },
      },
      { time: '19h30', cells: { ter: { name: 'Spinning' }, qui: { name: 'Spinning' } } },
    ],
  },
  {
    unitId: 5,
    period: 'manha',
    days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    rows: [
      {
        time: '7h',
        cells: {
          seg: { name: 'Spinning', teacher: 'Bárbara' },
          ter: { name: 'Pilates de Solo', teacher: 'Talita' },
          qua: { name: 'Fit Dance', teacher: 'Uáyra' },
          qui: { name: 'Fit Dance', teacher: 'Uáyra' },
          sex: { name: 'Spinning', teacher: 'Bárbara' },
        },
      },
      {
        time: '7h30',
        cells: {
          seg: { name: 'RIT', teacher: 'Talita' },
          ter: { name: 'Jump', teacher: 'Talita' },
          qua: { name: 'Spinning Louvê', teacher: 'Vitória' },
          qui: { name: 'GAP', teacher: 'Talita' },
          sex: { name: 'ABD', teacher: 'Bárbara' },
        },
      },
      {
        time: '8h',
        cells: {
          seg: { name: 'Jump', teacher: 'Talita' },
          ter: { name: 'GAP', teacher: 'Talita' },
          qua: { name: 'Queima 360', teacher: 'Vitória' },
          qui: { name: 'Jump', teacher: 'Talita' },
          sex: { name: 'Queima 360', teacher: 'Vitória' },
        },
      },
      {
        time: '8h30',
        cells: {
          qua: { name: 'Pilates de Solo', teacher: 'Vitória' },
          sex: { name: 'Pilates de Solo', teacher: 'Vitória' },
          sab: { name: 'Fit Dance', teacher: 'Uáyra' },
        },
      },
      { time: '9h', cells: { ter: { name: 'Fit Dance', teacher: 'Uáyra' } } },
    ],
  },
  {
    unitId: 5,
    period: 'noite',
    days: monToThu,
    rows: [
      {
        time: '18h',
        cells: {
          ter: { name: 'Fit Dance', teacher: 'Uáyra' },
          qua: { name: 'Fit Dance', teacher: 'Uáyra' },
        },
      },
      { time: '18h30', cells: { qui: { name: 'Spinning', teacher: 'Bárbara' } } },
      {
        time: '19h',
        cells: {
          seg: { name: 'Pilates de Solo', teacher: 'Talita' },
          qua: { name: 'Spinning', teacher: 'Talita' },
          qui: { name: 'ABD', teacher: 'Bárbara' },
        },
      },
      {
        time: '19h30',
        cells: {
          seg: { name: 'Funcional', teacher: 'Talita' },
          qui: { name: 'Funcional', teacher: 'Bárbara' },
        },
      },
      { time: '20h', cells: { seg: { name: 'Spinning', teacher: 'Talita' } } },
    ],
  },
];

export const classesNote = 'Grade sujeita a alteração. Confirme com a unidade antes de ir.';

export function getGrid(unitId: number, period: Period): ClassGrid | undefined {
  return classGrids.find((grid) => grid.unitId === unitId && grid.period === period);
}

/** Aulas de um dia específico, usado na visão mobile por abas. */
export function classesForDay(grid: ClassGrid, day: Day): { time: string; entry: ClassEntry }[] {
  return grid.rows
    .filter((row) => row.cells[day])
    .map((row) => ({ time: row.time, entry: row.cells[day] as ClassEntry }));
}
