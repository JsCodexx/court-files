import {
  findByNormalizedName,
  formatPersonName,
  nameMatchesQuery,
  normalizePersonName,
  personNamesEqual,
} from './personName';

describe('formatPersonName', () => {
  it('trims and collapses spaces in English', () => {
    expect(formatPersonName('  John   Smith  ')).toBe('John Smith');
  });

  it('trims and collapses spaces in Urdu', () => {
    expect(formatPersonName('  شمشاد   علی  ')).toBe('شمشاد علی');
  });

  it('strips zero-width characters', () => {
    expect(formatPersonName('John\u200B Smith')).toBe('John Smith');
  });
});

describe('normalizePersonName — English', () => {
  it('is case-insensitive', () => {
    expect(normalizePersonName('Mr Shamshad Ali')).toBe(
      normalizePersonName('mr shamshad ali')
    );
  });

  it('treats extra spaces as the same name', () => {
    expect(personNamesEqual('John  Smith', 'John Smith')).toBe(true);
  });

  it('ignores simple punctuation', () => {
    expect(personNamesEqual("Mr. Shamshad Ali", 'Mr Shamshad Ali')).toBe(
      true
    );
  });

  it('does not collapse different English names', () => {
    expect(personNamesEqual('Ali Khan', 'Ali Ahmed')).toBe(false);
  });
});

describe('normalizePersonName — Urdu', () => {
  it('strips Arabic diacritics (tashkeel)', () => {
    expect(personNamesEqual('شَمْشَاد', 'شمشاد')).toBe(true);
  });

  it('unifies alef variants', () => {
    expect(personNamesEqual('أحمد', 'احمد')).toBe(true);
    expect(personNamesEqual('إسماعیل', 'اسماعیل')).toBe(true);
  });

  it('unifies yeh variants (ي / ی / ى)', () => {
    expect(personNamesEqual('علي', 'علی')).toBe(true);
  });

  it('unifies kaf (ك / ک)', () => {
    expect(personNamesEqual('ملك', 'ملک')).toBe(true);
  });

  it('treats extra Urdu spaces as the same name', () => {
    expect(personNamesEqual('شمشاد  علی رانا', 'شمشاد علی رانا')).toBe(true);
  });

  it('does not collapse different Urdu names', () => {
    expect(personNamesEqual('شمشاد علی', 'خواور فرید')).toBe(false);
  });
});

describe('findByNormalizedName', () => {
  const people = [
    { id: '1', name: 'Mr. Shamshad Ali Rana' },
    { id: '2', name: 'شمشاد علی رانا' },
  ];

  it('finds an English duplicate ignoring case and punctuation', () => {
    expect(findByNormalizedName(people, 'mr shamshad ali rana')?.id).toBe('1');
  });

  it('finds an Urdu duplicate ignoring yeh/alef variants', () => {
    expect(findByNormalizedName(people, 'شمشاد علي رانا')?.id).toBe('2');
  });

  it('returns undefined when the name is new', () => {
    expect(findByNormalizedName(people, 'Raja Ghazanfar')).toBeUndefined();
  });
});

describe('nameMatchesQuery', () => {
  it('matches a partial English query case-insensitively', () => {
    expect(nameMatchesQuery('Shamshad Ali Rana', 'sham')).toBe(true);
  });

  it('matches a partial Urdu query', () => {
    expect(nameMatchesQuery('شمشاد علی رانا', 'علی')).toBe(true);
  });

  it('empty query matches everything', () => {
    expect(nameMatchesQuery('Anyone', '   ')).toBe(true);
  });
});
