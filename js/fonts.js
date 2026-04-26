/* Polices disponibles dans le sélecteur "Visuel".
   Toutes sont chargées via Google Fonts dans index.html.
   Sélection volontairement épurée : 1 défaut, 2 monospace dev, 3 sans-serif modernes, 1 serif éditoriale. */

const FONTS = [
  { id:'inter',     name:'Inter',                kind:'Sans',  desc:'Moderne & neutre — défaut',
    stack:"'Inter', system-ui, -apple-system, sans-serif",
    sample:'Aa Bb Cc 0123' },

  { id:'jetbrains', name:'JetBrains Mono',       kind:'Mono',  desc:'Programmeur — minimaliste & nette',
    stack:"'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    sample:'fn() => 0aA' },

  { id:'plex',      name:'IBM Plex Mono',        kind:'Mono',  desc:'Monospace épurée & professionnelle',
    stack:"'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    sample:'const x = 42' },

  { id:'space',     name:'Space Grotesk',        kind:'Sans',  desc:'Géométrique avec du caractère',
    stack:"'Space Grotesk', system-ui, sans-serif",
    sample:'Aa Bb Cc 0123' },

  { id:'manrope',   name:'Manrope',              kind:'Sans',  desc:'Sans-serif douce & très lisible',
    stack:"'Manrope', system-ui, sans-serif",
    sample:'Aa Bb Cc 0123' },

  { id:'atkinson',  name:'Atkinson Hyperlegible',kind:'Sans',  desc:'Lisibilité maximale (Braille Institute)',
    stack:"'Atkinson Hyperlegible', system-ui, sans-serif",
    sample:'Aa Bb Cc 0123' },

  { id:'lora',      name:'Lora',                 kind:'Serif', desc:'Serif éditoriale — sensation papier',
    stack:"'Lora', Georgia, serif",
    sample:'Aa Bb Cc 0123' },
];
