export const DEMO_ORG_NAME = 'Northwind Trading Co.';

export const DEMO_ORIGIN = 'https://example.okta.com';

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    const chosen = items[Math.floor(this.next() * items.length)];
    if (chosen === undefined) throw new Error('SeededRandom.pick: empty array');
    return chosen;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}

export function fakeId(prefix: string, n: number): string {
  return `${prefix}FAKE${String(n).padStart(13, '0')}`;
}

export interface Department {
  name: string;
  weight: number;
  titles: readonly string[];
}

export const DEPARTMENTS: readonly Department[] = [
  {
    name: 'Engineering',
    weight: 34,
    titles: [
      'Software Engineer',
      'Senior Software Engineer',
      'Staff Engineer',
      'Principal Engineer',
      'Engineering Manager',
      'Site Reliability Engineer',
      'QA Engineer',
    ],
  },
  {
    name: 'Sales',
    weight: 18,
    titles: [
      'Account Executive',
      'Senior Account Executive',
      'Sales Development Rep',
      'Regional Sales Director',
      'Solutions Engineer',
    ],
  },
  {
    name: 'Customer Success',
    weight: 12,
    titles: [
      'Customer Success Manager',
      'Senior Customer Success Manager',
      'Support Engineer',
      'Support Lead',
    ],
  },
  {
    name: 'Marketing',
    weight: 8,
    titles: ['Content Marketer', 'Demand Gen Manager', 'Product Marketing Manager', 'Designer'],
  },
  {
    name: 'Finance',
    weight: 6,
    titles: ['Financial Analyst', 'Controller', 'Accounts Payable Specialist'],
  },
  {
    name: 'People Ops',
    weight: 5,
    titles: ['Recruiter', 'People Partner', 'People Ops Coordinator'],
  },
  {
    name: 'IT',
    weight: 7,
    titles: ['IT Administrator', 'Helpdesk Technician', 'Identity Engineer'],
  },
  {
    name: 'Security',
    weight: 5,
    titles: ['Security Engineer', 'Security Analyst', 'Compliance Manager'],
  },
  { name: 'Legal', weight: 3, titles: ['Corporate Counsel', 'Paralegal'] },
  { name: 'Data', weight: 6, titles: ['Data Analyst', 'Data Engineer', 'Analytics Manager'] },
];

export const LOCATIONS: readonly { city: string; state?: string; countryCode: string }[] = [
  { city: 'Seattle', state: 'WA', countryCode: 'US' },
  { city: 'Austin', state: 'TX', countryCode: 'US' },
  { city: 'New York', state: 'NY', countryCode: 'US' },
  { city: 'Toronto', countryCode: 'CA' },
  { city: 'London', countryCode: 'GB' },
  { city: 'Berlin', countryCode: 'DE' },
  { city: 'Dublin', countryCode: 'IE' },
  { city: 'Sydney', countryCode: 'AU' },
];

export const EMEA_COUNTRIES: readonly string[] = ['GB', 'DE', 'IE'];

export const FIRST_NAMES: readonly string[] = [
  'Amara',
  'Priya',
  'Sofia',
  'Mateo',
  'Noor',
  'Kenji',
  'Isla',
  'Omar',
  'Lena',
  'Tomas',
  'Zara',
  'Rafael',
  'Ingrid',
  'Dmitri',
  'Yuki',
  'Farida',
  'Callum',
  'Nadia',
  'Hugo',
  'Aisha',
  'Bjorn',
  'Camila',
  'Dev',
  'Elif',
  'Fiona',
  'Gabriel',
  'Hana',
  'Ivan',
  'Jolene',
  'Kwame',
  'Liwei',
  'Marta',
  'Nikolai',
  'Olive',
  'Pedro',
  'Quinn',
  'Rosa',
  'Sanjay',
  'Tariq',
  'Ursula',
  'Viktor',
  'Wren',
  'Xiomara',
  'Yusuf',
  'Zoe',
  'Anders',
  'Beatriz',
  'Cyrus',
  'Delphine',
  'Emeka',
  'Freya',
  'Giovanni',
  'Halima',
  'Ines',
  'Jonas',
  'Keiko',
];

export const LAST_NAMES: readonly string[] = [
  'Okonkwo',
  'Nakamura',
  'Vasquez',
  'Lindqvist',
  'Haddad',
  'Petrov',
  'Silva',
  'Bergman',
  'Adeyemi',
  'Kowalski',
  'Moreau',
  'Rossi',
  'Andersen',
  'Fitzgerald',
  'Novak',
  'Rahman',
  'Castellanos',
  'Bianchi',
  'Volkov',
  'Mbeki',
  'Larsen',
  'Ferreira',
  'Dubois',
  'Kaur',
  'Sandoval',
  'Weber',
  'Iqbal',
  'Marchetti',
  'Nilsson',
  'Osei',
  'Delgado',
  'Hoffmann',
  'Tanaka',
  'Brennan',
  'Achterberg',
  'Villanueva',
  'Sorensen',
  'Chaudhry',
  'Romano',
  'Eriksen',
  'Barbosa',
  'Yamamoto',
  'Kovacs',
  'Mensah',
  'Reyes',
  'Schneider',
  'Oyelaran',
  'Bakker',
];

export function pickDepartment(rng: SeededRandom): Department {
  const total = DEPARTMENTS.reduce((sum, d) => sum + d.weight, 0);
  let roll = rng.next() * total;
  let last = DEPARTMENTS[0];
  for (const dept of DEPARTMENTS) {
    last = dept;
    roll -= dept.weight;
    if (roll <= 0) return dept;
  }
  if (!last) throw new Error('DEPARTMENTS is empty');
  return last;
}

export function isoDaysAgo(daysAgo: number): string {
  const anchor = Date.UTC(2026, 7, 1, 9, 0, 0);
  return new Date(anchor - daysAgo * 86_400_000).toISOString();
}
