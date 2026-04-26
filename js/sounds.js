/* Synthèse audio via Web Audio API — aucun fichier externe nécessaire.
   Singleton global `Sound` exposé. Les composants appellent Sound.click(),
   Sound.flip(), etc. sans connaître les prefs. App.jsx pousse la config
   dans Sound via Sound.configure(prefs.sounds) au démarrage et à chaque
   changement de réglages. */

const SOUND_CATEGORIES = [
  { id:'click',  label:'Clics',           desc:'Petits clics sur les boutons et tuiles' },
  { id:'tab',    label:'Onglets',         desc:'Changement de page (1–5 ou navigation)' },
  { id:'flip',   label:'Cartes',          desc:'Retournement des flashcards' },
  { id:'answer', label:'Réponses',        desc:'Difficile / OK / Facile pendant la révision' },
  { id:'focus',  label:'Plein écran',     desc:'Entrée et sortie du mode focus (F)' },
  { id:'toggle', label:'Interrupteurs',   desc:'Bascule des switchs (dark mode, sons…)' },
  { id:'modal',  label:'Modales',         desc:"Ouverture et fermeture des fenêtres d'aide" },
];

const Sound = (() => {
  let ctx = null;
  let cfg = {
    enabled: true,
    volume:  0.5,
    categories: { click:true, tab:true, flip:true, answer:true, focus:true, toggle:true, modal:true },
  };

  /* AudioContext doit attendre une interaction utilisateur (politique navigateur).
     On le crée à la volée + on le réveille s'il est suspendu. */
  const ensureCtx = () => {
    try {
      if (!ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch { return null; }
  };

  /* Joue une note simple avec enveloppe ADSR raccourcie. */
  const tone = ({ freq, type='sine', dur=0.12, peak=0.22, attack=0.005, slide=null, glide=0, delay=0 }, category) => {
    if (!cfg.enabled) return;
    if (category && cfg.categories[category] === false) return;
    const ac = ensureCtx();
    if (!ac) return;

    const t0  = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type  = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide !== null) osc.frequency.linearRampToValueAtTime(slide, t0 + glide);

    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak * cfg.volume, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };

  /* Petite rafale de bruit blanc filtrée — utile pour les "swooshes". */
  const noise = ({ dur=0.10, peak=0.10, freq=2000, q=12 }, category) => {
    if (!cfg.enabled) return;
    if (category && cfg.categories[category] === false) return;
    const ac = ensureCtx();
    if (!ac) return;

    const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ac.createBufferSource(); src.buffer = buf;
    const filt = ac.createBiquadFilter(); filt.type = 'bandpass';
    filt.frequency.value = freq; filt.Q.value = q;
    const g = ac.createGain();
    const t0 = ac.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak * cfg.volume, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(filt); filt.connect(g); g.connect(ac.destination);
    src.start(t0); src.stop(t0 + dur + 0.05);
  };

  return {
    configure: (c) => { if (c) cfg = { ...cfg, ...c, categories: { ...cfg.categories, ...(c.categories||{}) } }; },
    getConfig: () => cfg,

    /* --- 12 sons distincts --- */
    click:         () => tone({ freq:880, type:'sine',     dur:0.05, peak:0.15 }, 'click'),
    tabSwitch:     () => tone({ freq:520, type:'triangle', dur:0.09, peak:0.20, slide:780, glide:0.07 }, 'tab'),
    flip:          () => noise({ dur:0.07, peak:0.14, freq:2400, q:8 }, 'flip'),
    answerHard:    () => tone({ freq:240, type:'sawtooth', dur:0.18, peak:0.18, slide:170, glide:0.18 }, 'answer'),
    answerOk:      () => { tone({ freq:660, type:'sine', dur:0.09, peak:0.18 }, 'answer');
                           tone({ freq:880, type:'sine', dur:0.11, peak:0.20, delay:0.07 }, 'answer'); },
    answerEasy:    () => { tone({ freq:660,  type:'sine', dur:0.06, peak:0.16 }, 'answer');
                           tone({ freq:880,  type:'sine', dur:0.06, peak:0.18, delay:0.06 }, 'answer');
                           tone({ freq:1320, type:'sine', dur:0.12, peak:0.22, delay:0.13 }, 'answer'); },
    focusOn:       () => { tone({ freq:440, type:'triangle', dur:0.20, peak:0.20, slide:1100, glide:0.20 }, 'focus');
                           noise({ dur:0.18, peak:0.06, freq:3000, q:6 }, 'focus'); },
    focusOff:      () => { tone({ freq:1100, type:'triangle', dur:0.20, peak:0.20, slide:440, glide:0.20 }, 'focus');
                           noise({ dur:0.18, peak:0.06, freq:1500, q:6 }, 'focus'); },
    toggleOn:      () => tone({ freq:740, type:'sine', dur:0.10, peak:0.18, slide:990, glide:0.08 }, 'toggle'),
    toggleOff:     () => tone({ freq:600, type:'sine', dur:0.10, peak:0.18, slide:380, glide:0.08 }, 'toggle'),
    modalOpen:     () => { tone({ freq:440, type:'triangle', dur:0.13, peak:0.18, slide:880, glide:0.12 }, 'modal');
                           tone({ freq:660, type:'sine',     dur:0.11, peak:0.14, delay:0.08 }, 'modal'); },
    modalClose:    () => tone({ freq:660, type:'triangle', dur:0.14, peak:0.18, slide:330, glide:0.13 }, 'modal'),
  };
})();
