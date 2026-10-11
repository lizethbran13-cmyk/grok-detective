/* Grok Detective DLC: MIDNIGHT EXPRESS (Expansion) - train cars + the Golden Cheese case.
   Unlocked by localStorage 'grokDLC.detective.you_decide_what_to_add' (bought in the Grok Arcade DLC Shop). */
(function () {
'use strict';
const GD = window.GD;
const EX = GD.EX = GD.EX || {};
EX.KEY = 'grokDLC.detective.you_decide_what_to_add';
EX.owned = function () {
  try {
    if (localStorage.getItem(EX.KEY)) return true;
    const l = JSON.parse(localStorage.getItem('grokDLC.owned') || '[]');
    return Array.isArray(l) && (l.indexOf(EX.KEY) >= 0 || l.indexOf('detective.you_decide_what_to_add') >= 0);
  } catch (e) { return false; }
};
EX.CARS = ['tr_obs', 'tr_sleeper', 'tr_dining', 'tr_luggage', 'tr_engine']; // rear (west) -> front (east)
const NIGHT = { sky: '#0b1030', light: [0xc9d4ff, 0x2a2440, 0.7, 0xffe0b0, 0.6] };
function car(o) { return Object.assign({ outdoor: false, train: true, w: 24, d: 8, spawn: [0, 1.6], walk: [[-11.4, 11.4, -3.4, 3.4]], doorZ: 0 }, NIGHT, o); }
Object.assign(GD.AREAS, {
  tr_obs: car({ name: 'Observation Car', short: 'OBSERVATION', icon: '\ud83d\udd2d', color: '#a78bfa', doors: { e: 'tr_sleeper' },
    objs: [
      { id: 'obs_telescope', name: 'Brass Telescope', kind: 'telescope', x: -10.4, z: -1.6, text: 'You peek through. The Moon is HUGE tonight. Craters and everything!' },
      { id: 'obs_sofa', name: 'Velvet Sofa', kind: 'sofa', x: -4.6, z: -3.05, text: 'Squishy purple velvet. You find a button and some popcorn.' },
      { id: 'obs_table', name: 'Coffee Table', kind: 'coffeetable', x: -4.6, z: -1.35, text: 'A tea set and a jigsaw puzzle of a train. Very meta.' },
      { id: 'obs_armchair', name: 'Armchair', kind: 'armchair', x: 0.6, z: -3.0, text: 'A comfy armchair with a knitted blanket. Torty-sized crumbs of lettuce.' },
      { id: 'obs_gramophone', name: 'Gramophone', kind: 'gramophone', x: -1.4, z: 3.0, text: 'It plays a slow jazzy song. Dum-dee-dum.' },
      { id: 'obs_bookcase', name: 'Bookcase', kind: 'bookshelf', x: 6.4, z: -3.35, text: 'Books about trains, stars and "Cheese Through the Ages".' },
      { id: 'obs_map', name: 'Route Map', kind: 'routemap', x: 9.9, z: -3.2, text: 'The route: Grok City, the Midnight Tunnel, Cheddar Valley, then the Grand Cheese Fair.' },
      { id: 'obs_plant', name: 'Potted Palm', kind: 'plant', x: 10.9, z: 3.0, text: 'A fancy palm. Its leaves wave as the train rocks.' }
    ],
    npc: [[-1.6, -1.2], [4.4, 0.4], [-6.6, 1.6], [2.6, 2.2]] }),
  tr_sleeper: car({ name: 'Sleeper Car', short: 'SLEEPER', icon: '\ud83d\udecf\ufe0f', color: '#60a5fa', doors: { w: 'tr_obs', e: 'tr_dining' }, doorZ: 1.75, spawn: [0, 1.9],
    walls: [[-6.15, -5.85, -4, 0.05], [-0.15, 0.15, -4, 0.05], [5.85, 6.15, -4, 0.05],
      [-12, -9.8, -0.1, 0.15], [-8.2, -3.8, -0.1, 0.15], [-2.2, 2.2, -0.1, 0.15], [3.8, 8.2, -0.1, 0.15], [9.8, 12, -0.1, 0.15]],
    objs: [
      { id: 'slp_bunk1', name: 'Cabin 1 Bunk', kind: 'bunk', x: -10.4, z: -3.3, text: 'Empty bunks with fresh sheets. Nobody booked Cabin 1.' },
      { id: 'slp_case', name: 'Suitcases', kind: 'suitcase', x: -7.2, z: -3.2, text: 'Suitcases covered in travel stickers: Paris, Tokyo, Cheddar Valley.' },
      { id: 'slp_bunk2', name: 'Cabin 2 Bunk', kind: 'bunk', x: -4.4, z: -3.3, text: 'Science magazines all over the bed. Holes in Swiss Cheese, Volume 12.' },
      { id: 'slp_vanity', name: 'Vanity Mirror', kind: 'vanity', x: -1.2, z: -3.4, text: 'A mirror, a comb and a tiny bottle of cheese-scented cologne. Ew?' },
      { id: 'slp_bunk3', name: 'Cabin 3 Bunk', kind: 'bunk', x: 1.6, z: -3.3, text: 'A teddy bear in pajamas is tucked in. Cute.' },
      { id: 'slp_trunk', name: 'Steamer Trunk', kind: 'trunk', x: 4.6, z: -3.1, text: 'Fancy hats, fancy gloves, fancier hats.' },
      { id: 'slp_bunk4', name: 'Cabin 4 Bunk', kind: 'bunk', x: 7.6, z: -3.3, text: 'Playing cards everywhere. Even under the pillow!' },
      { id: 'slp_desk', name: 'Writing Desk', kind: 'writingdesk', x: 10.6, z: -3.2, text: 'Train postcards and a pen that writes in gold ink.' },
      { id: 'slp_linen', name: 'Linen Cart', kind: 'linen', x: -4.2, z: 3.05, text: 'Fluffy towels and tiny soaps shaped like trains.' },
      { id: 'slp_bench', name: 'Hallway Bench', kind: 'bench', x: 4.4, z: 3.15, text: 'A little bench to watch the night go by.' }
    ],
    npc: [[-2.6, -1.4], [7.0, 1.7], [9.4, -1.5], [-8.4, 1.8]] }),
  tr_dining: car({ name: 'Dining Car', short: 'DINING', icon: '\ud83c\udf7d\ufe0f', color: '#f472b6', doors: { w: 'tr_sleeper', e: 'tr_luggage' },
    objs: [
      { id: 'din_booth1', name: 'Table 1', kind: 'booth', x: -8.4, z: -2.6, text: 'Cheese soup and a basket of bread rolls. Yum.' },
      { id: 'din_booth2', name: 'Table 2', kind: 'booth', x: -3.4, z: -2.6, text: 'A half-eaten cheese cake and a deck of magic cards.' },
      { id: 'din_booth3', name: 'Table 3', kind: 'booth', x: 1.6, z: -2.6, text: 'Fancy plates folded like swans. Very classy.' },
      { id: 'din_bar', name: 'Lemonade Bar', kind: 'bar', x: 8.4, z: -3.05, text: 'Pink lemonade, cherry fizz and hot cocoa on tap.' },
      { id: 'din_galley', name: 'Kitchen Stove', kind: 'galley', x: 10.8, z: 2.3, text: 'Pots bubbling with cheese fondue. Smells AMAZING.' },
      { id: 'din_cart', name: 'Dessert Trolley', kind: 'trolley', x: -0.8, z: 2.5, text: 'Cupcakes, eclairs and one wobbly jelly.' },
      { id: 'din_piano', name: 'Little Piano', kind: 'piano', x: 4.6, z: 3.0, text: 'Plink! It plays the Midnight Express song.' },
      { id: 'din_coatrack', name: 'Coat Rack', kind: 'coatrack', x: -6.0, z: 3.0, text: 'Coats, scarves and a very fluffy feather boa.' },
      { id: 'din_plant', name: 'Fern', kind: 'plant', x: -11.0, z: -3.2, text: 'A fern in a brass pot. It jiggles with every bump.' }
    ],
    npc: [[-5.8, -0.6], [-0.4, -0.9], [8.2, 1.2], [-9.2, 1.4]] }),
  tr_luggage: car({ name: 'Luggage Car', short: 'LUGGAGE', icon: '\ud83e\uddf3', color: '#fbbf24', staff: true, doors: { w: 'tr_dining', e: 'tr_engine' },
    objs: [
      { id: 'lug_safe', name: 'Big Safe', kind: 'safe', x: 3.2, z: -3.0, text: 'A huge steel safe.' },
      { id: 'lug_trunks', name: 'Trunk Stack', kind: 'trunks', x: -8.2, z: -3.0, text: 'Heavy trunks with labels: FRAGILE, THIS SIDE UP, DO NOT SIT.' },
      { id: 'lug_mailbags', name: 'Mail Bags', kind: 'mailbags', x: -3.2, z: -3.1, text: 'Lumpy sacks of letters. One is addressed to Santa.' },
      { id: 'lug_cage', name: 'Parrot Cage', kind: 'cage', x: 8.6, z: -3.0, text: 'A parrot squawks: "RAWK! GOLDEN CHEESE! RAWK!" Thanks, buddy.' },
      { id: 'lug_crates', name: 'Cargo Crates', kind: 'crates', x: -9.4, z: 2.7, text: 'Crates of Cheddar Valley apples.' },
      { id: 'lug_hatbox', name: 'Hat Boxes', kind: 'hatbox', x: -2.4, z: 3.0, text: 'Round striped hat boxes, stacked like a cake.' },
      { id: 'lug_bike', name: 'Bicycle', kind: 'bike', x: 3.6, z: 3.15, text: 'A red bicycle with a bell. Ring ring!' },
      { id: 'lug_shelf', name: 'Parcel Shelf', kind: 'parcelshelf', x: 9.4, z: 3.0, text: 'Parcels tied with string, waiting for the next station.' }
    ],
    npc: [[6.2, 1.0], [-6.2, -0.9]] }),
  tr_engine: car({ name: 'Engine', short: 'ENGINE', icon: '\ud83d\ude82', color: '#f87171', staff: true, doors: { w: 'tr_luggage' }, doorZ: 1.7, spawn: [-8, 1.8],
    walk: [[-11.4, 6.6, -3.4, 3.4]],
    objs: [
      { id: 'eng_coal', name: 'Coal Pile', kind: 'coal', x: -8.2, z: -1.9, text: 'A mountain of black coal. Your hands are all sooty now.' },
      { id: 'eng_toolbox', name: 'Toolbox', kind: 'toolbox', x: -2.0, z: -3.3, text: 'Wrenches, an oil can and a sandwich wrapped in foil.' },
      { id: 'eng_whistle', name: 'Whistle Cord', kind: 'whistle', x: 1.6, z: -3.2, text: 'You pull the cord: TOOT TOOOOT! Everyone on the train jumps.' },
      { id: 'eng_gauges', name: 'Pressure Gauges', kind: 'gauges', x: 4.4, z: -3.3, text: 'The needles point to FAST and VERY FAST.' },
      { id: 'eng_firebox', name: 'Firebox', kind: 'firebox', x: 6.0, z: -0.4, text: 'Whoosh! The fire roars. Toasty warm in here.' },
      { id: 'eng_levers', name: 'Driving Levers', kind: 'levers', x: 4.2, z: 2.7, text: 'Big brass levers: GO, SLOW and DO NOT TOUCH.' },
      { id: 'eng_bucket', name: 'Water Bucket', kind: 'bucket', x: -1.0, z: 3.0, text: 'Water for the boiler. And a rubber duck.' }
    ],
    npc: [[2.0, 0.2], [-3.4, 1.4]] })
});

const SK = ['#f9d4b4', '#e8b48a', '#c68c5b', '#8d5a3b', '#f2c6a0'];
GD.CASES.push({
  id: 'express', dlc: true, title: 'Midnight Express', icon: '\ud83d\ude82', color: '#f59e0b', diff: 'Expansion \u00b7 Hard', scene: 'tr_dining', areas: EX.CARS, alibiCount: 2,
  intro: 'All aboard the MIDNIGHT EXPRESS! The famous GOLDEN CHEESE vanished from the luggage car safe while the train zoomed through the pitch-black Midnight Tunnel. Nobody got off, so the thief is still on board! Walk through 5 train cars, dust for fingerprints, wear a DISGUISE to get into staff-only cars and pin your clues on the CORKBOARD. THREE clues describe the thief.',
  traits: [{ k: 'ring', label: 'Ring', yes: 'Wears a ring', no: 'No ring' }, { k: 'cabin', label: 'Ticket', yes: 'Sleeper cabin', no: 'Coach seat' }, { k: 'hat', label: 'Hat', yes: 'Wears a hat', no: 'No hat' }],
  victim: { id: 'cole', name: 'Conductor Cole', role: 'Train Conductor', area: 'tr_dining', spot: 0, look: { skin: SK[1], hair: '#e5e7eb', hs: 'short', shirt: '#1e3a8a', pants: '#1e293b', hat: '#1e3a8a', hs2: 'captain', mustache: '#e5e7eb', coat: '#1e3a8a' },
    lines: ['Detective! Thank goodness. I\'m Conductor Cole of the Midnight Express.', 'We\'re carrying the GOLDEN CHEESE to the Grand Cheese Fair. It was locked in the big safe in the LUGGAGE CAR.', 'At midnight we zoomed into the Midnight Tunnel. Lights out! When they came back on... the cheese was GONE!', 'The luggage car and the engine are STAFF ONLY. Tap DISGUISE and dress up as crew to get in. Walk to the doors at the ends of each car to change cars.', 'DUST things for fingerprints, pin clues on the CORKBOARD by Table 3, and talk to Torty in the observation car. That tortoise notices EVERYTHING.'] },
  suspects: [
    { id: 'gloria', name: 'Duchess Gloria', role: 'Cheese Collector', area: 'tr_obs', spot: 0, t: { ring: 1, cabin: 1, hat: 1 },
      look: { skin: SK[0], hair: '#f5d0a9', hs: 'bun', shirt: '#7c3aed', pants: '#4c1d95', dress: true, hat: '#a21caf', hs2: 'floppy', pearls: true },
      lines: ['Darling! I am Duchess Gloria Gouda. I collect the finest cheeses in the world.', 'At midnight? I was right here, gazing at the stars. Alone. The stars were divine.', 'Of course I wear a RING. A diamond as big as a grape!', 'I have the Royal SLEEPER CABIN, naturally. And my HAT never leaves my head.'],
      motive: { name: 'Collector\'s Wish List', text: 'The Duchess\'s notebook: "My collection is missing ONE thing: the GOLDEN CHEESE. I must have it!"', spots: ['obs_sofa', 'obs_bookcase', 'obs_table'] },
      alibi: { name: 'Telescope Logbook', text: 'The telescope logbook: "Duchess Gloria, 11:55 to 12:10, watched the Moon the whole time." Torty signed it as a witness. Gloria is CLEARED!', spots: ['obs_telescope', 'obs_map'] },
      confess: 'Oh, very well! My collection needed it. I hid the Golden Cheese inside my hat box, under a VERY large hat. Take it, darling.' },
    { id: 'mozz', name: 'Great Mozzarella', role: 'Magician', area: 'tr_dining', spot: 1, t: { ring: 1, cabin: 0, hat: 1 },
      look: { skin: SK[2], hair: '#111', hs: 'short', shirt: '#7e22ce', pants: '#111827', hat: '#111', hs2: 'top', mustache: '#111', coat: '#1f1147' },
      lines: ['Ta-daaa! The Great Mozzarella, master of magic!', 'At midnight I was doing card tricks in the dining car. Well... I did vanish for a minute. For a trick!', 'My magic RING sparkles when I wave my wand. Ooooh.', 'No cabin for me, just a COACH SEAT. And my top HAT is where Mr. Fluff the rabbit lives.'],
      motive: { name: 'Magic Show Poster', text: 'A poster: "TONIGHT ONLY: The Great Mozzarella makes the GOLDEN CHEESE DISAPPEAR!" Hmmm.', spots: ['din_booth2', 'din_coatrack', 'din_piano'] },
      alibi: { name: 'Signed Dinner Bill', text: 'A dinner bill signed by three diners: "The Great Mozzarella pulled a coin out of my ear at 12:01!" He never left the dining car. CLEARED!', spots: ['din_bar', 'din_booth3'] },
      confess: 'My greatest trick... ruined! I made the cheese disappear in the dark tunnel. It is in my top hat, right next to Mr. Fluff.' },
    { id: 'pierre', name: 'Chef Pierre', role: 'Train Chef', area: 'tr_dining', spot: 2, t: { ring: 0, cabin: 0, hat: 1 },
      look: { skin: SK[0], hair: '#3b2414', hs: 'short', shirt: '#fff', pants: '#334155', hat: '#fff', hs2: 'chef', mustache: '#3b2414', scarf: '#dc2626' },
      lines: ['Bonjour! Chef Pierre Parmesan. I cook ze finest food on wheels!', 'At midnight I was in my kitchen, baking one hundred cheese souffles.', 'A ring? Non! It would fall into ze soup.', 'I sleep on a little cot in ze kitchen, just a COACH SEAT ticket. And my chef\'s HAT is always on.'],
      motive: { name: 'Secret Recipe Card', text: 'Chef Pierre\'s recipe card: "Golden Cheese Fondue, the most famous dish in the world. Step 1: get the Golden Cheese."', spots: ['din_galley', 'din_cart', 'din_bar'] },
      alibi: { name: 'Kitchen Timer Log', text: 'The kitchen timer log: Chef Pierre opened the oven every 2 minutes from 11:50 to 12:15. He never left his kitchen. CLEARED!', spots: ['din_galley', 'din_cart'] },
      confess: 'Sacre fromage! I only wanted to make ze greatest fondue in history. Ze cheese is in my soup pot. Do not worry, I did not melt it.' },
    { id: 'edna', name: 'Engineer Edna', role: 'Train Driver', area: 'tr_engine', spot: 0, t: { ring: 0, cabin: 0, hat: 0 },
      look: { skin: SK[3], hair: '#f97316', hs: 'spiky', shirt: '#1d4ed8', pants: '#1e3a8a', gloves: '#78350f', boots: true, scarf: '#facc15' },
      lines: ['Name\'s Edna. I drive this train. Chugga chugga!', 'At midnight I was shoveling coal and steering us through the Midnight Tunnel.', 'No rings for me. They get stuck in the levers.', 'I sleep right here by the boiler, no cabin, just a COACH SEAT on paper. And hats? They blow right off my head!'],
      motive: { name: 'Dream Train Plan', text: 'Edna\'s plan: "Buy my very own little train someday. Need LOTS of money... the Golden Cheese is worth a fortune."', spots: ['eng_toolbox', 'eng_gauges', 'eng_bucket'] },
      alibi: { name: 'Speed Chart', text: 'The engine\'s speed chart: brakes and whistle worked by hand at 12:00, 12:01 and 12:03. Edna never left the engine. CLEARED!', spots: ['eng_levers', 'eng_firebox'] },
      confess: 'Okay, okay, you got me. I dreamed of buying my own train. The cheese is hidden in the coal pile. It\'s a bit sooty, sorry!' },
    { id: 'feta', name: 'Professor Feta', role: 'Cheese Scientist', area: 'tr_sleeper', spot: 0, t: { ring: 0, cabin: 1, hat: 0 },
      look: { skin: SK[4], hair: '#d1d5db', hs: 'bald', shirt: '#0d9488', pants: '#134e4a', glasses: true, coat: '#f8fafc' },
      lines: ['Hello hello! Professor Feta, cheese scientist. I study the holes in Swiss cheese!', 'At midnight I was in my cabin, reading. Very quietly. Shhh.', 'No ring. I mix chemicals all day, and rings get gooey.', 'Yes, I have SLEEPER CABIN number 2. And no hat. It would squish my enormous brain.'],
      motive: { name: 'Lab Notes', text: 'The professor\'s notes: "Is the Golden Cheese made of REAL gold? I must test it in my lab... secretly."', spots: ['slp_vanity', 'slp_bunk2', 'slp_case'] },
      alibi: { name: 'Snoring Complaint', text: 'A grumpy note from Cabin 3: "Professor Feta was SNORING super loud from 11:45 until 12:20!" He was asleep in his cabin. CLEARED!', spots: ['slp_bunk3', 'slp_trunk'] },
      confess: 'For SCIENCE! I had to know if it was real gold. It is in my cabin, under my pillow. And yes, it IS real gold. Amazing!' },
    { id: 'lou', name: 'Lucky Lou', role: 'Card Player', area: 'tr_sleeper', spot: 1, t: { ring: 1, cabin: 1, hat: 0 },
      look: { skin: SK[1], hair: '#111', hs: 'short', shirt: '#fde68a', pants: '#111827', vest: '#166534', bowtie: '#dc2626' },
      lines: ['Heya pal, Lucky Lou. I never lose at cards. Well... almost never.', 'At midnight? I was walking the hallway. Couldn\'t sleep a wink.', 'See this shiny gold RING? Won it in a card game.', 'I\'ve got SLEEPER CABIN number 4. Hats? Nah, they mess up my hair.'],
      motive: { name: 'Pile of IOUs', text: 'A stack of IOUs: "Lucky Lou owes 900 coins!" Someone scribbled: "Pay by morning... or ELSE."', spots: ['slp_desk', 'slp_bunk4', 'slp_bench'] },
      alibi: { name: 'Hallway Photo', text: 'A photo from the hallway camera at 12:01: Lucky Lou fast asleep on the hallway bench, drooling. CLEARED!', spots: ['slp_linen', 'slp_bench'] },
      confess: 'My luck ran out, pal. I owed SO many coins. The cheese is in my cabin, inside a deck of cards box. A really big box.' }
  ],
  witness: { id: 'torty', name: 'Torty', role: 'Tortoise Passenger', area: 'tr_obs', spot: 1, gives: 'tC', look: { tortoise: true },
    lines: ['Ohhh... hellooo... detective. I\'m Martina... but everybody calls me Torty.', 'I\'m a tortoise. I go slooow... so I notice EVERYTHING.', 'When the lights came back after the tunnel, I saw a shadow sneak out of the luggage car...', '{clue}', 'Want some lettuce? No? More lettuce for Torty, then.'] },
  helpers: [{ id: 'pete', name: 'Porter Pete', role: 'Luggage Porter', area: 'tr_luggage', spot: 0, gives: 'sc2', look: { skin: SK[2], hair: '#111', hs: 'short', shirt: '#7f1d1d', pants: '#1e293b', hat: '#7f1d1d', hs2: 'cap', coat: '#991b1b', mustache: '#111' },
    lines: ['Whoa! Oh, it\'s you, detective. Nice disguise! I almost called you "boss".', 'I opened the safe at 11:55 to check on the Golden Cheese. It was sparkling away in its glass dome.', '{clue}', 'Look around in here. And dust that glass dome for fingerprints!'] }],
  clues: [
    { id: 'sc1', name: 'Empty Safe', text: 'The safe is wide open and empty! No scratch marks, so the thief opened it while the porter\'s back was turned.', spots: ['lug_safe'] },
    { id: 'sc2', name: 'Pete\'s Testimony', witness: true, text: 'At 12:00 the train went into the Midnight Tunnel and every light went out for 3 minutes. When they came back on, the Golden Cheese was gone!' },
    { id: 'sc3', name: 'Golden Crumbs', text: 'Shiny golden cheese crumbs! The thief carried the cheese out of the luggage car, back toward the passenger cars.', spots: ['lug_hatbox', 'lug_bike', 'lug_shelf'] },
    { id: 'tA', trait: 'ring', spots: ['x_dome'], dust: true,
      yes: { name: 'Ring Fingerprints', text: 'You dusted the glass dome. One fingerprint has a smooth RING band across it. The thief wears a RING!' },
      no: { name: 'Plain Fingerprints', text: 'You dusted the glass dome. Clear fingerprints, and NO ring mark on any finger. The thief does NOT wear a ring.' } },
    { id: 'tB', trait: 'cabin', spots: ['eng_coal', 'lug_mailbags', 'lug_crates'],
      yes: { name: 'Cabin Key Tag', text: 'A brass key tag from a SLEEPER CABIN, dropped while running in the dark. The thief has a sleeper cabin!' },
      no: { name: 'Coach Ticket Stub', text: 'A torn COACH SEAT ticket, dropped while running in the dark. The thief has NO sleeper cabin.' } },
    { id: 'tC', trait: 'hat', witness: true,
      yes: { name: 'Torty\'s Testimony', text: 'Torty saw the thief\'s shadow sneak out of the luggage car. It had a big HAT on its head.' },
      no: { name: 'Torty\'s Testimony', text: 'Torty saw the thief\'s shadow sneak out of the luggage car. NO hat, just hair sticking up.' } }
  ],
  extras: [{ id: 'x_dome', name: 'Glass Dome', kind: 'dome', area: 'tr_luggage', dust: true, pos: [[0.2, -0.9], [-5.8, 1.0], [6.6, -1.4]], text: 'The Golden Cheese\'s glass dome, tipped over on the floor.' }]
});
// dustable objects (fingerprint powder): the dome holds the ring clue; the others are fun red herrings
EX.DUST = { x_dome: 1, lug_safe: 1, slp_vanity: 1, din_bar: 1, obs_telescope: 1 };
EX.DISGUISES = [
  { id: 'porter', name: 'Porter', icon: '\ud83e\uddf3', look: { coat: '#991b1b', hat: '#7f1d1d', hs2: 'cap', mustache: '#3b2414' }, crew: true, tip: 'Carries bags. Opens STAFF ONLY doors.' },
  { id: 'waiter', name: 'Waiter', icon: '\ud83c\udf7d\ufe0f', look: { coat: '#f8fafc', bowtie: '#111', mustache: '#3b2414' }, crew: true, tip: 'Staff too! Suspects whisper secrets to waiters.' },
  { id: 'conductor', name: 'Conductor', icon: '\ud83c\udfab', look: { coat: '#1e3a8a', hat: '#1e3a8a', hs2: 'captain', mustache: '#9ca3af' }, crew: true, tip: 'The boss look. Opens STAFF ONLY doors.' }
];
})();
