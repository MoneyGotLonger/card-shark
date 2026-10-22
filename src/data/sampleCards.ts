import type { Card } from '../game/types';

/**
 * Offline sample deck for the prototype. Prices are placeholders, not real market data;
 * the app shows a "Sample prices" banner while this deck is in use. Real prices come from
 * the nightly import into Supabase (supabase/functions/import-prices).
 */
const SAMPLE_DATE = '2026-10-22';

// [name, set, pokemontcg.io set id, number, placeholder price in cents]
const raw: [string, string, string, string, number][] = [
  ['Charizard ex', 'Obsidian Flames', 'sv3', '223', 9500],
  ['Pikachu', 'Base Set', 'base1', '58', 1800],
  ['Umbreon VMAX', 'Evolving Skies', 'swsh7', '215', 120000],
  ['Mew ex', '151', 'sv3pt5', '205', 2400],
  ['Gengar VMAX', 'Fusion Strike', 'swsh8', '271', 65000],
  ['Lugia V', 'Silver Tempest', 'swsh12', '186', 17500],
  ['Charizard', 'Base Set', 'base1', '4', 45000],
  ['Rayquaza VMAX', 'Evolving Skies', 'swsh7', '218', 52000],
  ['Blastoise', 'Base Set', 'base1', '2', 15000],
  ['Mewtwo', 'Pokemon GO', 'pgo', '30', 90],
  ['Giratina V', 'Lost Origin', 'swsh11', '186', 31000],
  ['Squirtle', '151', 'sv3pt5', '170', 4200],
  ['Bulbasaur', '151', 'sv3pt5', '166', 3900],
  ['Gardevoir ex', 'Scarlet & Violet', 'sv1', '245', 2100],
  ['Magikarp', 'Paldea Evolved', 'sv2', '203', 7800],
  ['Iono', 'Paldea Evolved', 'sv2', '269', 6400],
  ['Mewtwo', 'Base Set', 'base1', '10', 6000],
  ['Dragonite V', 'Evolving Skies', 'swsh7', '192', 4800],
  ['Psyduck', '151', 'sv3pt5', '175', 1100],
  ['Jigglypuff', '151', 'sv3pt5', '39', 40],
  ['Machamp', '151', 'sv3pt5', '68', 60],
  ['Charmander', '151', 'sv3pt5', '168', 3300],
  ['Pikachu VMAX', 'Vivid Voltage', 'swsh4', '188', 26000],
  ['Arceus VSTAR', 'Crown Zenith', 'swsh12pt5gg', 'GG70', 8800],
];

export const SAMPLE_CARDS: Card[] = raw.map(([name, setName, setId, number, priceCents], i) => ({
  id: `sample-${i}`,
  game: 'pokemon',
  name,
  setName,
  number,
  imageUrl: `https://images.pokemontcg.io/${setId}/${number}_hires.png`,
  priceCents,
  priceDate: SAMPLE_DATE,
}));
