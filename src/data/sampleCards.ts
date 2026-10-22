import type { Card } from '../game/types';

/**
 * Offline sample deck for the prototype. Prices are placeholders, not real market data;
 * the app shows a "Sample prices" banner while this deck is in use. Real prices come from
 * the nightly import into Supabase (supabase/functions/import-prices).
 */
const SAMPLE_DATE = '2026-10-22';

const raw: [string, string, string, number][] = [
  ['Charizard ex', 'Obsidian Flames', '223', 9500],
  ['Pikachu', 'Base Set', '58', 1800],
  ['Umbreon VMAX', 'Evolving Skies', '215', 120000],
  ['Mew ex', '151', '205', 2400],
  ['Gengar', 'Fusion Strike', '157', 650],
  ['Lugia V', 'Silver Tempest', '186', 17500],
  ['Snorlax', 'Crown Zenith', '102', 150],
  ['Rayquaza VMAX', 'Evolving Skies', '218', 52000],
  ['Eevee', 'Paldean Fates', '173', 300],
  ['Mewtwo', 'Pokemon GO', '30', 90],
  ['Giratina V', 'Lost Origin', '186', 31000],
  ['Squirtle', '151', '170', 4200],
  ['Bulbasaur', '151', '166', 3900],
  ['Gardevoir ex', 'Scarlet & Violet', '245', 2100],
  ['Magikarp', 'Paldea Evolved', '203', 7800],
  ['Iono', 'Paldea Evolved', '269', 6400],
  ['Moonbreon', 'Evolving Skies', '215', 118000],
  ['Dragonite V', 'Evolving Skies', '192', 4800],
  ['Psyduck', '151', '175', 1100],
  ['Jigglypuff', '151', '39', 40],
  ['Machamp', '151', '68', 60],
  ['Mimikyu', 'Paldean Fates', '97', 700],
  ['Lucario VSTAR', 'Crown Zenith', 'GG45', 2600],
  ['Arceus VSTAR', 'Crown Zenith', 'GG70', 8800],
];

export const SAMPLE_CARDS: Card[] = raw.map(([name, setName, number, priceCents], i) => ({
  id: `sample-${i}`,
  game: 'pokemon',
  name,
  setName,
  number,
  priceCents,
  priceDate: SAMPLE_DATE,
}));
