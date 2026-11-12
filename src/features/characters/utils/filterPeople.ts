import { BiblicalPerson } from '@/src/types/bible';

export function normalizePersonSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filterPeople(people: BiblicalPerson[], category: string, query: string): BiblicalPerson[] {
  const search = normalizePersonSearch(query);
  return people.filter(person =>
    (category === 'Todos' || person.category === category) &&
    (!search || normalizePersonSearch([person.name_es, person.display_title_es, person.archetype, person.category, person.bio_es].join(' ')).includes(search))
  );
}
