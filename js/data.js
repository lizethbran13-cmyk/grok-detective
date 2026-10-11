/* Grok Detective - world + case data */
(function () {
'use strict';
const GD = window.GD = window.GD || {};

/* ---------------- areas ----------------
   x: right, z: toward the camera (south). Objects are shared by every case; cases hide clues in them. */
GD.AREAS = {
  town: {
    name: 'Town Square', icon: '\u26f2', color: '#38bdf8', outdoor: true, w: 28, d: 24, spawn: [0, 8.5], sign: [3.2, 9.6],
    walk: [[-13.4, 13.4, -9.6, 11.4]],
    objs: [
      { id: 'town_board', name: 'Notice Board', kind: 'board', x: -7, z: -8, text: 'Lost cat posters and a flyer for the Grok City Bake-Off.' },
      { id: 'town_mailbox', name: 'Mailbox', kind: 'mailbox', x: 7, z: -8, text: 'Just a few letters for other people. Nothing useful.' },
      { id: 'town_stall', name: 'Bakery Stall', kind: 'stall', x: -10, z: -3, text: 'Warm cinnamon buns. Smells amazing, but no clues.' },
      { id: 'town_phone', name: 'Phone Booth', kind: 'phone', x: 10.5, z: -3, text: 'A phone book and a lonely coin. Nothing else.' },
      { id: 'town_bench', name: 'Park Bench', kind: 'bench', x: -6, z: 4, text: 'Someone left half a sandwich here. Yuck.' },
      { id: 'town_cart', name: 'Flower Cart', kind: 'cart', x: 7, z: 4, text: 'Tulips, daisies and sunflowers. Very pretty.' },
      { id: 'town_trash', name: 'Trash Can', kind: 'trash', x: -11, z: 4.5, text: 'Banana peels and old newspapers.' },
      { id: 'town_fountain', name: 'Fountain', kind: 'fountain', x: 0, z: -1.5, r: 3.2, text: 'Shiny wishing coins at the bottom. Make a wish!' },
      { id: 'town_lamp', name: 'Lamp Post', kind: 'lamp', x: 3, z: 6, text: 'A tall old lamp post. A moth flutters around it.' },
      { id: 'town_bush', name: 'Hedge', kind: 'bush', x: -2.5, z: -8.5, text: 'Leaves, twigs and a very surprised squirrel.' }
    ],
    npc: [[-4, -4.5], [4, -4.5], [-3, 2.5], [4, 1.5], [10, 0.5], [-8.5, -6]]
  },
  mansion: {
    name: 'Mansion', icon: '\ud83c\udff0', color: '#c084fc', outdoor: false, w: 22, d: 16, spawn: [-4, 6], sign: [-1.2, 7.1],
    walk: [[-10.6, 10.6, -7.6, 7.6]],
    walls: [[1.8, 2.2, -8, -5], [1.8, 2.2, -3, 3], [1.8, 2.2, 5, 8], [2.2, 5.5, -0.2, 0.2], [7.5, 11, -0.2, 0.2]],
    floors: [[-11, 2, -8, 8, '#b45353'], [2, 11, -8, 0, '#5b8a5b'], [2, 11, 0, 8, 'checker']],
    objs: [
      { id: 'man_clock', name: 'Grandfather Clock', kind: 'clock', x: -10, z: -7, text: 'Tick, tock. It is exactly on time.' },
      { id: 'man_fireplace', name: 'Fireplace', kind: 'fireplace', x: -5, z: -7.3, text: 'Warm and crackly. Only ashes inside.' },
      { id: 'man_painting', name: 'Portrait Painting', kind: 'painting', x: -1, z: -7.75, text: 'A painting of a very serious great-great-grandpa.' },
      { id: 'man_wardrobe', name: 'Wardrobe', kind: 'wardrobe', x: -10.1, z: -2.5, text: 'Fancy coats and one fluffy bathrobe.' },
      { id: 'man_piano', name: 'Piano', kind: 'piano', x: -8.8, z: 3.5, text: 'Plink! Plonk! Slightly out of tune.' },
      { id: 'man_rug', name: 'Fancy Rug', kind: 'rug', x: -4.5, z: 0.5, r: 1.8, text: 'You peek underneath. Just dust bunnies.' },
      { id: 'man_bookshelf', name: 'Bookshelf', kind: 'bookshelf', x: 6, z: -7.35, text: 'Books about birds, boats and baking.' },
      { id: 'man_desk', name: 'Study Desk', kind: 'desk', x: 8, z: -4, text: 'Pens, paperclips and a stamp collection.' },
      { id: 'man_fridge', name: 'Fridge', kind: 'fridge', x: 10.2, z: 2, text: 'Milk, eggs and a giant wheel of cheese.' },
      { id: 'man_counter', name: 'Kitchen Counter', kind: 'counter', x: 5.5, z: 7.2, text: 'Mixing bowls and a rolling pin covered in flour.' },
      { id: 'man_window', name: 'Kitchen Window', kind: 'window', x: 10.75, z: 5, text: 'A view of the garden. The latch is a bit loose.' }
    ],
    npc: [[-6, -3.5], [-2, 4], [5, -2.5], [8, 3.5], [-7.5, 6]]
  },
  museum: {
    name: 'Museum', icon: '\ud83c\udfdb\ufe0f', color: '#fbbf24', outdoor: false, w: 22, d: 16, spawn: [0, 6], sign: [2.6, 7.1],
    walk: [[-10.6, 10.6, -7.6, 7.6]],
    walls: [[-11, -6.5, 1.8, 2.2], [6.5, 11, 1.8, 2.2]],
    floors: [[-11, 11, -8, 8, '#e8dcc4']],
    objs: [
      { id: 'mus_case', name: 'Star Gem Display', kind: 'display', x: 0, z: -2, text: 'An empty velvet cushion where a gem used to be.' },
      { id: 'mus_dino', name: 'Dino Skeleton', kind: 'dino', x: -6, z: -5, r: 2.4, text: 'RAWR! A giant T-Rex skeleton. Bones, bones, bones.' },
      { id: 'mus_statue', name: 'Statue', kind: 'statue', x: 6, z: -5, text: 'A marble statue of a thinking detective. Fitting!' },
      { id: 'mus_painting', name: 'Famous Painting', kind: 'painting', x: 0, z: -7.75, text: 'A famous painting of sunflowers. Still here, phew.' },
      { id: 'mus_vase', name: 'Ancient Vase', kind: 'vase', x: 9.6, z: -1, text: 'A 1000-year-old vase. You look but do not touch!' },
      { id: 'mus_plant', name: 'Potted Plant', kind: 'plant', x: -10, z: -1, text: 'A leafy fern. The soil is dry.' },
      { id: 'mus_guard', name: 'Guard Desk', kind: 'guarddesk', x: -8, z: 5, text: 'A coffee mug and a crossword puzzle, half done.' },
      { id: 'mus_bin', name: 'Recycling Bin', kind: 'bin', x: -3.5, z: 7, text: 'Empty water bottles and museum maps.' },
      { id: 'mus_shop', name: 'Gift Shop Shelf', kind: 'shelf', x: 5, z: 7.1, text: 'Dino plushies, postcards and toy gems.' },
      { id: 'mus_crate', name: 'Shipping Crate', kind: 'crate', x: 9.3, z: 5, text: 'Packing peanuts! Lots and lots of packing peanuts.' }
    ],
    npc: [[-4, 0.5], [4, 0.5], [-7.5, -1], [7.5, 0], [2, 4.5]]
  },
  docks: {
    name: 'Docks', icon: '\u2693', color: '#22d3ee', outdoor: true, w: 28, d: 24, spawn: [3, 9], sign: [6, 10.2],
    walk: [[-13.4, 13.4, 0, 11.4], [-2, 2, -10, 0.2], [7, 10, -6, 0.2]],
    objs: [
      { id: 'dock_crates', name: 'Crate Stack', kind: 'crates', x: 5, z: 3, text: 'Crates full of fish. Phew, stinky!' },
      { id: 'dock_net', name: 'Fishing Nets', kind: 'net', x: -6, z: 1.6, text: 'Tangled nets with a few seashells inside.' },
      { id: 'dock_boat', name: 'Rowboat', kind: 'rowboat', x: 11.6, z: -3, r: 2.2, text: 'A little rowboat with two oars and a puddle.' },
      { id: 'dock_barrel', name: 'Barrels', kind: 'barrel', x: 11, z: 4.5, text: 'Barrels of pickles. Who needs this many pickles?' },
      { id: 'dock_office', name: 'Harbor Office Desk', kind: 'officedesk', x: -5, z: 8.6, text: 'Boat schedules and a stack of tide charts.' },
      { id: 'dock_post', name: 'Mooring Post', kind: 'post', x: 1.55, z: -2, text: 'A sturdy wooden post for tying up boats.' },
      { id: 'dock_rope', name: 'Rope Pile', kind: 'rope', x: -0.9, z: -8.6, text: 'A big coil of salty rope.' },
      { id: 'dock_bucket', name: 'Bait Bucket', kind: 'bucket', x: 8.5, z: -1.5, text: 'Wiggly worms. Fish love them. You do not.' },
      { id: 'dock_lighthouse', name: 'Lighthouse Door', kind: 'door', x: -11, z: 4.7, text: 'The door is locked. A seagull stares at you.' },
      { id: 'dock_anchor', name: 'Old Anchor', kind: 'anchor', x: -1.5, z: 4.5, text: 'A rusty old anchor, way too heavy to lift.' }
    ],
    npc: [[-3, 2.5], [3.5, 7], [9, 1.5], [-8, 6.5], [0, -4.5]]
  },
  forest: {
    name: 'Forest Cabin', icon: '\ud83c\udf32', color: '#4ade80', outdoor: true, w: 28, d: 24, spawn: [-2, 9], sign: [1, 10.2],
    walk: [[-13.4, 13.4, -11, 11.4]],
    cabin: [2, 12, -10, -2, 5, 7],
    trees: [[-12, -9], [-9, -10], [-5, -10], [-1, -10], [-12, -4], [-12, 6], [-12, 10], [-8, 11], [12, 10], [12, 6], [12.5, 1], [5, 10.5], [-2.5, -6], [-6.5, 5], [3, 1], [8.5, 1.5], [-9, -1.5]],
    objs: [
      { id: 'for_stump', name: 'Tree Stump', kind: 'stump', x: -8, z: -6, text: 'Lots of rings. This tree was super old.' },
      { id: 'for_campfire', name: 'Campfire', kind: 'campfire', x: -3, z: 3, text: 'Cold ashes and a burnt marshmallow.' },
      { id: 'for_log', name: 'Hollow Log', kind: 'log', x: -10, z: 2, text: 'A family of beetles lives here. Hello, beetles!' },
      { id: 'for_well', name: 'Old Well', kind: 'well', x: -6, z: 8.3, text: 'You shout "HELLO!" The well shouts back.' },
      { id: 'for_woodpile', name: 'Woodpile', kind: 'woodpile', x: 0.6, z: -6, text: 'Neatly stacked firewood.' },
      { id: 'for_tent', name: 'Tent', kind: 'tent', x: 8, z: 6, r: 1.9, text: 'A sleeping bag and a flashlight with dead batteries.' },
      { id: 'for_stove', name: 'Cabin Stove', kind: 'stove', x: 3.1, z: -9.1, text: 'An old iron stove. A kettle sits on top.' },
      { id: 'for_chest', name: 'Wooden Chest', kind: 'chest', x: 6.5, z: -9.2, text: 'Blankets, a board game and a rubber duck.' },
      { id: 'for_table', name: 'Cabin Table', kind: 'table', x: 6.5, z: -5.4, text: 'Cups, a checkers board and a pinecone.' },
      { id: 'for_bed', name: 'Cabin Bed', kind: 'bed', x: 10.9, z: -7.6, text: 'A comfy quilt. You resist taking a nap.' },
      { id: 'for_shelf', name: 'Trophy Shelf', kind: 'trophyshelf', x: 11.55, z: -3.6, text: 'Ribbons and photos of a happy schnauzer.' }
    ],
    npc: [[-6, -2], [-0.5, 5.5], [4.5, 3.5], [8.8, -4], [11, 2.8]]
  }
};
GD.AREA_ORDER = ['town', 'mansion', 'museum', 'docks', 'forest'];

/* ---------------- people ---------------- */
// look: skin, hair, hs (short|long|bun|bald|spiky), shirt, pants, hat (color) + hs2 (cap|top|floppy|beanie|chef|beret|captain),
//       glasses, scarf (color), gloves (color), boots, tall, beard, dress
const SK = ['#f9d4b4', '#e8b48a', '#c68c5b', '#8d5a3b', '#f2c6a0'];

/* ---------------- cases ----------------
   Each case has 4 suspects whose two traits make 4 unique combos. The culprit is random each play,
   two "trait" clues describe the culprit, and motive clues are placed for the culprit + one red herring. */
GD.CASES = [
  {
    id: 'gem', title: 'The Stolen Star Gem', icon: '\ud83d\udc8e', color: '#fbbf24', diff: 'Easy', scene: 'museum',
    intro: 'The famous STAR GEM vanished from the Grok City Museum last night! The cameras went dark for 17 minutes. Four people were seen near the museum. Find the clues, interview everyone and catch the thief!',
    traits: [{ k: 'boots', label: 'Footwear', yes: 'Boots', no: 'Sneakers' }, { k: 'glasses', label: 'Glasses', yes: 'Wears glasses', no: 'No glasses' }],
    victim: { id: 'dot', name: 'Director Dot', role: 'Museum Director', area: 'museum', spot: 4, look: { skin: SK[3], hair: '#222', hs: 'bun', shirt: '#2563eb', pants: '#1e3a8a', dress: true },
      lines: ['Thank goodness you are here, detective!', 'Our Star Gem was stolen between 11:58 PM and 12:15 AM, while the cameras were off.', 'Search everything! Drawers, desks, even trash cans. Clues could be anywhere in town.', 'Stuck? Tap the LENS button and your magnifying glass will glow near hidden clues.'] },
    suspects: [
      { id: 'gus', name: 'Gus', role: 'Night Guard', area: 'museum', spot: 2, t: { boots: 1, glasses: 0 },
        look: { skin: SK[1], hair: '#5a3a22', hs: 'short', shirt: '#1e40af', pants: '#1e293b', hat: '#1e3a8a', hs2: 'cap', boots: true, beard: true },
        lines: ['Evening, detective. Name\'s Gus. I\'m the night guard here.', 'Last night? I was doing my rounds... well, I took a looong snack break around midnight.', 'See these big black BOOTS? Regulation guard boots. I never take them off!', 'And I don\'t need glasses. Eyes like a hawk, me!'],
        motive: { name: 'Overdue Truck Bill', text: 'A letter to Gus from the bank: "Your truck payment of 500 coins is OVERDUE!"', spots: ['mus_guard', 'mus_bin', 'mus_plant'] },
        confess: 'Okay, okay! I needed money for my truck. I switched off the cameras and took the gem during my "snack break". I\'m so sorry!' },
      { id: 'clara', name: 'Clara', role: 'Curator', area: 'mansion', spot: 0, t: { boots: 0, glasses: 1 },
        look: { skin: SK[0], hair: '#cfcfcf', hs: 'bun', shirt: '#7c3aed', pants: '#4c1d95', glasses: true, dress: true },
        lines: ['I\'m Clara, the museum curator. This is a disaster!', 'I was here at the mansion\'s charity gala all evening. Well... I stepped out for some fresh air for a while.', 'I always wear my comfy SNEAKERS. Boots pinch my toes!', 'Without my GLASSES I couldn\'t read a single museum label.'],
        motive: { name: 'Letter From the Board', text: 'A letter to Clara: "The museum board plans to replace you as curator next month."', spots: ['man_desk', 'man_bookshelf', 'man_wardrobe'] },
        confess: 'They wanted to replace me! I thought if the gem went missing, they would need me to find it again. It was a silly plan.' },
      { id: 'rex', name: 'Rex', role: 'Sailor', area: 'docks', spot: 0, t: { boots: 1, glasses: 1 },
        look: { skin: SK[2], hair: '#111', hs: 'short', shirt: '#e2e8f0', pants: '#1d4ed8', hat: '#f8fafc', hs2: 'captain', glasses: true, boots: true, beard: true },
        lines: ['Ahoy! Rex is the name, sailing\'s the game.', 'Last night I was fixing my boat\'s engine. All alone, with a lantern.', 'Rubber BOOTS, matey. A sailor\'s best friend on a wet deck!', 'And these GLASSES? Can\'t tie a single knot without \'em.'],
        motive: { name: 'Gem Sketch', text: 'A sketch of the Star Gem, signed by Rex: "Worth enough to buy a brand-new ship!"', spots: ['dock_office', 'dock_crates', 'dock_barrel'] },
        confess: 'Arr, ye caught me fair and square. I dreamed of a new ship... The gem is hidden in a crate. I\'ll give it back!' },
      { id: 'penny', name: 'Penny', role: 'Painter', area: 'town', spot: 1, t: { boots: 0, glasses: 0 },
        look: { skin: SK[4], hair: '#ef4444', hs: 'long', shirt: '#facc15', pants: '#a16207', hat: '#be123c', hs2: 'beret' },
        lines: ['Hi! I\'m Penny. I paint the fountain every single morning!', 'Last night I was at home, painting stars from memory.', 'I wear SNEAKERS. Boots are way too heavy for dancing around my easel!', 'Glasses? Nope! My eyesight is perfect.'],
        motive: { name: 'Diary Page', text: 'A page from Penny\'s diary: "If only I could keep the Star Gem at home and paint it every day..."', spots: ['town_bench', 'town_cart', 'town_trash'] },
        confess: 'I just wanted to paint it up close... I know it was wrong. The gem is under my easel.' }
    ],
    witness: { id: 'bea', name: 'Bea', role: 'Baker', area: 'town', spot: 3, gives: 'tB', look: { skin: SK[0], hair: '#f59e0b', hs: 'bun', shirt: '#fff', pants: '#f472b6', hat: '#fff', hs2: 'chef', dress: true },
      lines: ['Morning, detective! Want a fresh cinnamon bun?', 'I start baking at midnight. Last night someone ran right past my bakery, coming from the museum!', '{clue}', 'That\'s all I saw. Good luck!'] },
    clues: [
      { id: 'sc1', name: 'Cut Display Glass', text: 'The glass was cut neatly with a special tool. The thief was calm and careful, not in a hurry.', spots: ['mus_case'] },
      { id: 'sc2', name: 'Camera Log', text: 'Security log: every camera switched OFF at 11:58 PM and back ON at 12:15 AM.', spots: ['mus_statue', 'mus_shop', 'mus_vase'] },
      { id: 'tA', trait: 'boots', spots: ['x_prints'],
        yes: { name: 'Boot Prints', text: 'Big muddy BOOT prints with deep treads lead away from the display. The thief wore BOOTS.' },
        no: { name: 'Sneaker Prints', text: 'Zig-zag SNEAKER prints lead away from the display. No boot treads at all. The thief wore SNEAKERS.' } },
      { id: 'tB', trait: 'glasses', witness: true,
        yes: { name: 'Bea\'s Testimony', text: 'Bea saw the thief run past at midnight. The streetlight flashed on their GLASSES.' },
        no: { name: 'Bea\'s Testimony', text: 'Bea saw the thief\'s face clearly at midnight. They were NOT wearing glasses.' } }
    ],
    extras: [{ id: 'x_prints', name: 'Footprints', kind: 'prints', area: 'museum', pos: [[2.6, 0.6], [-2.8, 0.8], [1.5, 3]], text: 'Some footprints on the floor.' }]
  },
  {
    id: 'recipe', title: 'Grandma Rosa\'s Secret Recipe', icon: '\ud83c\udf6a', color: '#f472b6', diff: 'Easy', scene: 'mansion',
    intro: 'Grandma Rosa\'s prize-winning cookie recipe was stolen from the mansion kitchen, the night before the Grok City Bake-Off! Someone climbed out the kitchen window. Who took it?',
    traits: [{ k: 'lefty', label: 'Writing hand', yes: 'Left-handed', no: 'Right-handed' }, { k: 'red', label: 'Scarf', yes: 'Red scarf', no: 'Green scarf' }],
    victim: { id: 'rosa', name: 'Grandma Rosa', role: 'Champion Baker', area: 'mansion', spot: 1, look: { skin: SK[0], hair: '#e5e7eb', hs: 'bun', shirt: '#db2777', pants: '#9d174d', glasses: true, dress: true },
      lines: ['Oh, detective! My secret cookie recipe is GONE!', 'I kept it in my recipe box in the kitchen. Last night I heard the kitchen window creak.', 'Everyone wears scarves this time of year. Look closely at what people wear!', 'If you get stuck, use your LENS. It glows near hidden clues.'] },
    suspects: [
      { id: 'marco', name: 'Marco', role: 'Chef', area: 'mansion', spot: 3, t: { lefty: 1, red: 1 },
        look: { skin: SK[1], hair: '#222', hs: 'short', shirt: '#fff', pants: '#334155', hat: '#fff', hs2: 'chef', scarf: '#dc2626', beard: true },
        lines: ['Buongiorno! I am Chef Marco.', 'Last night I scrubbed pots until ten, then went straight to bed.', 'I chop, stir and write my menus with my LEFT hand.', 'This RED scarf? A gift from my nonna!'],
        motive: { name: 'Blank Entry Form', text: 'Marco\'s Bake-Off entry form. The "secret recipe" box is still blank!', spots: ['man_counter', 'man_fridge'] },
        confess: 'Mamma mia, you got me! I had no recipe for the Bake-Off. I copied Rosa\'s. It is in my apron pocket.' },
      { id: 'higgins', name: 'Higgins', role: 'Butler', area: 'mansion', spot: 2, t: { lefty: 0, red: 1 },
        look: { skin: SK[0], hair: '#9ca3af', hs: 'bald', shirt: '#111827', pants: '#111827', scarf: '#dc2626', tall: true },
        lines: ['Higgins, the butler. At your service.', 'I locked every door at nine o\'clock sharp, then polished the silver.', 'I write with my RIGHT hand, as a proper butler should.', 'The RED scarf is part of my winter uniform.'],
        motive: { name: 'Circled Job Ad', text: 'A newspaper ad circled in pen: "Famous bakery seeks head baker. Bring your best recipe!"', spots: ['man_clock', 'man_wardrobe', 'man_piano'] },
        confess: 'I wanted to be a famous baker, not a butler. I borrowed the recipe. I am terribly sorry, Madam Rosa.' },
      { id: 'ned', name: 'Ned', role: 'Rosa\'s Grand-nephew', area: 'docks', spot: 1, t: { lefty: 1, red: 0 },
        look: { skin: SK[4], hair: '#a16207', hs: 'spiky', shirt: '#0ea5e9', pants: '#1e293b', scarf: '#16a34a' },
        lines: ['Hey. I\'m Ned, Rosa\'s grand-nephew.', 'I was fishing here at the docks last night. Caught nothing.', 'Yeah, I\'m LEFT-handed. Makes casting a fishing rod tricky.', 'This GREEN scarf keeps the sea wind off my neck.'],
        motive: { name: 'IOU Note', text: 'An IOU: "Ned owes 300 coins to his fishing buddy. Pay me back by Sunday!"', spots: ['dock_net', 'dock_bucket', 'dock_anchor'] },
        confess: 'I owed money and a bakery offered cash for the recipe... I never sold it. Here, Aunt Rosa, I\'m sorry.' },
      { id: 'daisy', name: 'Daisy', role: 'Gardener', area: 'forest', spot: 1, t: { lefty: 0, red: 0 },
        look: { skin: SK[2], hair: '#f5d0a9', hs: 'long', shirt: '#86efac', pants: '#166534', hat: '#fde68a', hs2: 'floppy', scarf: '#16a34a', gloves: '#a3e635' },
        lines: ['Oh, hello! I\'m Daisy. I grow herbs out here by the cabin.', 'Last night I was gathering mushrooms in the forest.', 'I write all my plant labels with my RIGHT hand.', 'My GREEN scarf matches my garden!'],
        motive: { name: 'Unfinished Cookbook', text: 'A notebook: "Daisy\'s Cookbook. Needs ONE more amazing recipe!"', spots: ['for_table', 'for_chest', 'for_stump'] },
        confess: 'My cookbook needed one more amazing recipe... and Rosa\'s is the best. I\'ll give it back and say sorry.' }
    ],
    witness: { id: 'molly', name: 'Molly', role: 'Mail Carrier', area: 'town', spot: 0, gives: 'sc2', look: { skin: SK[3], hair: '#111', hs: 'short', shirt: '#3b82f6', pants: '#1e3a8a', hat: '#1d4ed8', hs2: 'cap' },
      lines: ['Hi detective! Molly, mail carrier. I see everything in this town.', 'Last night I was delivering late letters near the mansion...', '{clue}', 'Hope that helps! Gotta deliver these letters.'] },
    clues: [
      { id: 'sc1', name: 'Empty Recipe Box', text: 'The recipe card is gone! Only a few cookie crumbs are left in the box.', spots: ['x_box'] },
      { id: 'sc2', name: 'Molly\'s Testimony', witness: true, text: 'Molly saw someone climb out of the mansion kitchen window at 11 PM. It was too dark to see a face.' },
      { id: 'tA', trait: 'lefty', spots: ['man_counter', 'man_fridge', 'man_rug'],
        yes: { name: 'Thank-You Note', text: 'The thief left a note: "Thanks for the cookies!" The ink is smudged the way a LEFT-handed writer smudges.' },
        no: { name: 'Thank-You Note', text: 'The thief left a note: "Thanks for the cookies!" The neat ink slants like a RIGHT-handed writer\'s.' } },
      { id: 'tB', trait: 'red', spots: ['man_window'],
        yes: { name: 'Red Wool Threads', text: 'Fuzzy RED wool threads are snagged on the window latch. The thief wore a RED scarf.' },
        no: { name: 'Green Wool Threads', text: 'Fuzzy GREEN wool threads are snagged on the window latch. The thief wore a GREEN scarf.' } }
    ],
    extras: [
      { id: 'x_box', name: 'Recipe Box', kind: 'box', area: 'mansion', pos: [[8.6, 7.2], [3.3, 7.2]], text: 'Grandma Rosa\'s recipe box.' }
    ]
  },
  {
    id: 'bell', title: 'The Phantom of the Docks', icon: '\ud83d\udd14', color: '#22d3ee', diff: 'Medium', scene: 'docks',
    intro: 'A glowing "PHANTOM" was seen at the docks last night! By morning the ferry\'s golden bell was gone and its rope was cut. Ghosts aren\'t real, detective. Someone is behind this!',
    traits: [{ k: 'tall', label: 'Height', yes: 'Tall', no: 'Short' }, { k: 'hat', label: 'Hat', yes: 'Wears a hat', no: 'No hat' }],
    victim: { id: 'bo', name: 'Captain Bo', role: 'Ferry Captain', area: 'docks', spot: 4, look: { skin: SK[2], hair: '#e5e7eb', hs: 'short', shirt: '#1e3a8a', pants: '#1e293b', hat: '#1e3a8a', hs2: 'captain', beard: true, boots: true },
      lines: ['Detective! My ferry\'s golden bell has been stolen!', 'People say a glowing phantom did it. Phooey! Phantoms don\'t cut ropes.', 'Look at people carefully: how tall are they? Do they wear a hat?', 'If you get stuck, your LENS will point you to hidden clues.'] },
    suspects: [
      { id: 'finn', name: 'Finn', role: 'Fisherman', area: 'docks', spot: 2, t: { tall: 1, hat: 1 },
        look: { skin: SK[1], hair: '#7c2d12', hs: 'short', shirt: '#ea580c', pants: '#365314', hat: '#facc15', hs2: 'floppy', boots: true, tall: true, beard: true },
        lines: ['Name\'s Finn. Best fisherman on these docks.', 'Last night I was mending my nets. Didn\'t see any phantom.', 'Sure, I\'m TALL. I can reach the top shelf at the bait shop!', 'And I never take off my floppy fishing HAT. Lucky hat!'],
        motive: { name: 'Ferry Fine', text: 'A ticket: "The Ferry Company fines Finn 200 coins for fishing in the ferry lane." Someone scribbled: "UNFAIR!"', spots: ['dock_net', 'dock_barrel', 'dock_crates'] },
        confess: 'That ferry kept scaring away my fish and then they fined ME! I took the bell to get back at them. It\'s under my nets.' },
      { id: 'lola', name: 'Lola', role: 'Lighthouse Keeper', area: 'docks', spot: 3, t: { tall: 0, hat: 1 },
        look: { skin: SK[0], hair: '#111', hs: 'long', shirt: '#dc2626', pants: '#f8fafc', hat: '#2563eb', hs2: 'beanie' },
        lines: ['Hi, I\'m Lola. I keep the lighthouse shining.', 'Last night I was up in the lighthouse, polishing the big lamp.', 'I\'m SHORT, so I use a step stool for everything.', 'My blue beanie HAT keeps my ears warm up there.'],
        motive: { name: 'Complaint Letter', text: 'Lola\'s letter to the mayor: "That ferry bell is too LOUD! It keeps me awake every night!"', spots: ['dock_lighthouse', 'dock_office'] },
        confess: 'Ding, ding, DING! Every single night! I just wanted some sleep. The bell is wrapped in a blanket in my lighthouse.' },
      { id: 'mo', name: 'Mo', role: 'Shopkeeper', area: 'town', spot: 4, t: { tall: 1, hat: 0 },
        look: { skin: SK[3], hair: '#111', hs: 'spiky', shirt: '#16a34a', pants: '#78350f', tall: true },
        lines: ['Welcome, welcome! Mo\'s Treasures, best shop in town!', 'Last night I was counting coins in my shop. Very busy!', 'Being TALL is great for stacking shelves.', 'Hats? Never! They squash my amazing hair.'],
        motive: { name: 'Shop Price List', text: 'Mo\'s price list: "GOLDEN BELL. Coming soon! 1000 coins."', spots: ['town_phone', 'town_board', 'town_mailbox'] },
        confess: 'A golden bell would sell for SO many coins! I painted my coat with glow paint so people would think I was a phantom.' },
      { id: 'ivy', name: 'Prof. Ivy', role: 'Historian', area: 'museum', spot: 1, t: { tall: 0, hat: 0 },
        look: { skin: SK[4], hair: '#9a3412', hs: 'bun', shirt: '#0d9488', pants: '#134e4a', glasses: true, dress: true },
        lines: ['Good day. I am Professor Ivy, town historian.', 'Last night I was at the museum, reading old ship records.', 'I\'m rather SHORT. I need a ladder for the high bookshelves.', 'Hats? I never wear them. They mess up my bun.'],
        motive: { name: 'Museum Wish List', text: 'Prof. Ivy\'s wish list: "#1: The golden ferry bell. It is 200 years old. It belongs in a museum!"', spots: ['mus_shop', 'mus_crate', 'mus_vase'] },
        confess: 'That bell is 200 years old! It belongs in a museum, not on a noisy ferry. I hid it in a museum crate.' }
    ],
    witness: { id: 'kiki', name: 'Kiki', role: 'Kid Reporter', area: 'town', spot: 2, gives: 'tB', look: { skin: SK[2], hair: '#111', hs: 'spiky', shirt: '#f97316', pants: '#1e40af' },
      lines: ['Hi! I\'m Kiki, reporter for the school newspaper!', 'I saw the PHANTOM from my bedroom window last night! It was glowing green!', '{clue}', 'I\'m going to write the best story ever!'] },
    clues: [
      { id: 'sc1', name: 'Empty Bell Hook', text: 'The golden bell\'s hook is empty. There are fresh scratches where it was unhooked.', spots: ['x_hook'] },
      { id: 'sc2', name: 'Glow Paint Bucket', text: 'A bucket of glow-in-the-dark paint! So the "phantom" glow was just a costume trick.', spots: ['dock_bucket', 'dock_rope', 'dock_anchor'] },
      { id: 'tA', trait: 'tall', spots: ['dock_post'],
        yes: { name: 'Cut Rope', text: 'The ferry rope was cut way up HIGH on the post. Only a TALL person could reach there.' },
        no: { name: 'Cut Rope', text: 'The ferry rope was cut LOW, near the bottom of the post. That was a SHORT person.' } },
      { id: 'tB', trait: 'hat', witness: true,
        yes: { name: 'Kiki\'s Testimony', text: 'Kiki saw the phantom from her window. It wore a big HAT pulled down low.' },
        no: { name: 'Kiki\'s Testimony', text: 'Kiki saw the phantom from her window. NO hat. Its hair was blowing in the wind.' } }
    ],
    extras: [{ id: 'x_hook', name: 'Bell Hook', kind: 'hook', area: 'docks', pos: [[-1.3, -6], [-1.3, -4]], text: 'The ferry bell hook.' }]
  },
  {
    id: 'trophy', title: 'Candy\'s Missing Trophy', icon: '\ud83c\udfc6', color: '#a3e635', diff: 'Medium', scene: 'forest',
    intro: 'Candy the schnauzer just won BEST DOG IN GROK CITY! But her golden trophy vanished from the forest cabin during the celebration picnic. Sniff out the clues and find the trophy thief!',
    traits: [{ k: 'cat', label: 'Pet cat', yes: 'Has a cat', no: 'No cat' }, { k: 'gloves', label: 'Gloves', yes: 'Wears gloves', no: 'No gloves' }],
    victim: { id: 'lily', name: 'Lily', role: 'Candy\'s Owner', area: 'forest', spot: 0, look: { skin: SK[1], hair: '#3b2414', hs: 'long', shirt: '#ec4899', pants: '#7e22ce' },
      lines: ['Detective, please help! Candy\'s Best Dog trophy is gone!', 'It was on the trophy shelf in the cabin. We all went out for a picnic, and poof!', 'Ask everyone about their pets. And check if they wear gloves!', 'If you\'re stuck, the LENS glows near hidden clues.'] },
    dog: { id: 'candy', name: 'Candy', role: 'Best Dog', area: 'forest', spot: 2, gives: 'sc2',
      lines: ['Woof! Woof!', '*Candy wags her tail and drops something at your feet.*', '{clue}', '*Candy licks your hand. Good girl!*'] },
    suspects: [
      { id: 'rick', name: 'Ranger Rick', role: 'Park Ranger', area: 'forest', spot: 3, t: { cat: 1, gloves: 1 },
        look: { skin: SK[2], hair: '#3f2a14', hs: 'short', shirt: '#65a30d', pants: '#3f6212', hat: '#a16207', hs2: 'floppy', gloves: '#78350f', boots: true },
        lines: ['Howdy! Ranger Rick. I keep this forest safe.', 'During the picnic I was checking the trails.', 'My orange CAT, Pumpkin, rides along in my truck!', 'I always wear work GLOVES. Splinters, you know.'],
        motive: { name: 'Shiny Things Catalog', text: 'Rick\'s catalog, with an ad circled: "WANTED: shiny gold trophies. Top price paid!"', spots: ['for_woodpile', 'for_tent', 'for_log'] },
        confess: 'That catalog offered SO much money for a gold trophy... I hid it in the hollow log. I\'m sorry, Candy!' },
      { id: 'gina', name: 'Gina', role: 'Dog Groomer', area: 'town', spot: 5, t: { cat: 0, gloves: 1 },
        look: { skin: SK[0], hair: '#ec4899', hs: 'long', shirt: '#a855f7', pants: '#1e1b4b', gloves: '#f0abfc' },
        lines: ['Hi! I\'m Gina. I groom the fluffiest dogs in town!', 'During the picnic I was at my salon, brushing a poodle.', 'Cats? No way! I\'m a dog person. No cats at my house.', 'I wear rubber GLOVES all day for bath time.'],
        motive: { name: 'Second Place Ribbon', text: 'A ribbon: "Gina\'s Groomed Pup: 2nd Place". Someone scribbled "NOT FAIR!!" on it.', spots: ['town_board', 'town_mailbox', 'town_cart'] },
        confess: 'My pup should have won! I took the trophy to my salon. I know, I know. I\'ll bring it back.' },
      { id: 'vince', name: 'Vince', role: 'Rival Dog Owner', area: 'mansion', spot: 4, t: { cat: 1, gloves: 0 },
        look: { skin: SK[0], hair: '#fef08a', hs: 'spiky', shirt: '#be123c', pants: '#111827', hat: '#111', hs2: 'top', tall: true },
        lines: ['Vince. Owner of Fluffy, the most beautiful poodle in the world.', 'During the picnic I was here, having tea in the mansion.', 'I also have a fat orange CAT named Sir Whiskers.', 'Gloves? Never. They hide my fancy rings.'],
        motive: { name: 'Angry Note', text: 'Vince\'s note: "My Fluffy deserved that trophy, NOT a schnauzer!"', spots: ['man_desk', 'man_painting', 'man_fireplace'] },
        confess: 'Fluffy deserved to win! I put the trophy in my wardrobe. Fine, Candy can have it back.' },
      { id: 'cam', name: 'Cam', role: 'Camper', area: 'docks', spot: 4, t: { cat: 0, gloves: 0 },
        look: { skin: SK[3], hair: '#111', hs: 'spiky', shirt: '#f59e0b', pants: '#0f766e', hat: '#ef4444', hs2: 'cap' },
        lines: ['Yo! I\'m Cam. Camping and fishing all week!', 'During the picnic I was here at the docks, buying bait.', 'No cat. Just me, my tent and my fishing rod.', 'Gloves? Nah, I like to feel the fishing line.'],
        motive: { name: 'Shopping List', text: 'Cam\'s shopping list: "Marshmallows, tent pegs, something SHINY for my campsite."', spots: ['dock_boat', 'dock_rope', 'dock_crates'] },
        confess: 'It was just so shiny! I wanted it for my campsite. It\'s in my backpack. Sorry, Candy.' }
    ],
    clues: [
      { id: 'sc1', name: 'Picnic Photo', text: 'A photo of Candy with her trophy at the cabin, taken at 2 PM. The picnic started at 3 PM.', spots: ['for_table', 'for_bed', 'for_stove'] },
      { id: 'sc2', name: 'Chewed Ribbon', witness: true, text: 'Candy found the trophy\'s blue ribbon outside the cabin. The thief dropped it while running away.' },
      { id: 'tA', trait: 'cat', spots: ['for_shelf'],
        yes: { name: 'Cat Hair', text: 'Orange CAT hair all over the empty trophy shelf! The thief lives with a CAT.' },
        no: { name: 'Only Dog Fur', text: 'Only grey schnauzer fur on the shelf. No cat hair at all. The thief has NO cat.' } },
      { id: 'tB', trait: 'gloves', spots: ['x_window'],
        yes: { name: 'No Fingerprints', text: 'The window was opened, but there are NO fingerprints anywhere. The thief wore GLOVES.' },
        no: { name: 'Sticky Fingerprints', text: 'Sticky fingerprints all over the window sill. The thief was NOT wearing gloves.' } }
    ],
    extras: [{ id: 'x_window', name: 'Cabin Window', kind: 'window', area: 'forest', pos: [[9.2, -9.85]], rotN: true, text: 'The cabin\'s back window.' }]
  },
  {
    id: 'crown', title: 'The Mayor\'s Missing Crown', icon: '\ud83d\udc51', color: '#c084fc', diff: 'Hard', scene: 'town',
    intro: 'Mayor Maple\'s golden parade crown vanished from the Town Square stage the night before the Grok City Parade! Five people had a key to the stage. This case is TRICKY: THREE clues describe the thief, so you need all three to be sure.',
    traits: [{ k: 'bike', label: 'Gets around by', yes: 'Bike', no: 'Walking' }, { k: 'mint', label: 'Favorite gum', yes: 'Mint gum', no: 'Cherry gum' }, { k: 'whistle', label: 'Happy habit', yes: 'Whistles', no: 'Hums' }],
    victim: { id: 'maple', name: 'Mayor Maple', role: 'Mayor of Grok City', area: 'town', spot: 0, look: { skin: SK[1], hair: '#6b4226', hs: 'short', shirt: '#7c3aed', pants: '#1e1b4b', hat: '#111', hs2: 'top', beard: true },
      lines: ['Detective! My golden parade crown is GONE, and the parade is tomorrow!', 'I locked it on the stage at 9 PM. At 10 PM the pillow was empty.', 'Five people have a stage key. Ask how they get around, what gum they chew, and if they whistle or hum!', 'This one is tricky. You need THREE clues. Your LENS will help if you get stuck.'] },
    suspects: [
      { id: 'benny', name: 'Benny', role: 'Bike Courier', area: 'town', spot: 4, t: { bike: 1, mint: 1, whistle: 0 },
        look: { skin: SK[2], hair: '#111', hs: 'spiky', shirt: '#f97316', pants: '#1e3a8a', hat: '#22c55e', hs2: 'cap' },
        lines: ['Hey! Benny, fastest courier in Grok City!', 'Last night? Delivering pizzas all over town until midnight.', 'I go everywhere on my BIKE. Zoom zoom!', 'I chew MINT gum all day, and I HUM while I ride. Hmm-hmm-hmmm!'],
        motive: { name: 'Bike Shop Bill', text: 'A bill for Benny: "New golden wheels: 400 coins. Pay by Friday!"', spots: ['town_cart', 'town_stall', 'town_bench'] },
        confess: 'I really wanted those golden wheels... I was going to sell the crown. It\'s in my delivery bag. I\'m sorry, Mayor!' },
      { id: 'olga', name: 'Olga', role: 'Opera Singer', area: 'mansion', spot: 2, t: { bike: 0, mint: 0, whistle: 0 },
        look: { skin: SK[0], hair: '#f59e0b', hs: 'bun', shirt: '#be185d', pants: '#831843', dress: true, scarf: '#fde047' },
        lines: ['Darling! I am Olga, the greatest singer in Grok City!', 'Last night I was rehearsing my parade song here at the mansion.', 'A bike? Never! I WALK everywhere, like a queen.', 'CHERRY gum keeps my voice sweet. And I never whistle, darling. I HUM! La-la-laaa!'],
        motive: { name: 'Costume Note', text: 'Olga\'s note: "Parade costume: Queen of Song. STILL NEED A CROWN!!"', spots: ['man_wardrobe', 'man_piano', 'man_painting'] },
        confess: 'My Queen of Song costume needed a real crown! I only wanted to wear it for one song. It\'s in my hat box.' },
      { id: 'tom', name: 'Tom', role: 'Tour Guide', area: 'museum', spot: 2, t: { bike: 0, mint: 1, whistle: 1 },
        look: { skin: SK[3], hair: '#3b2414', hs: 'short', shirt: '#0ea5e9', pants: '#334155', hat: '#fde68a', hs2: 'floppy', glasses: true },
        lines: ['Welcome, welcome! I\'m Tom, your friendly tour guide.', 'Last night I was planning tomorrow\'s museum tours.', 'I WALK every tour. Good for the legs!', 'I love MINT gum, and I WHISTLE to keep my tour groups together. Fweeet!'],
        motive: { name: 'Exhibit Plan', text: 'Tom\'s plan: "New exhibit: CROWNS OF GROK CITY. Star item: the Mayor\'s crown!"', spots: ['mus_guard', 'mus_shop', 'mus_plant'] },
        confess: 'It would have been the best exhibit ever! I hid the crown in the gift shop. I\'ll give it back right now.' },
      { id: 'skip', name: 'Skip', role: 'Ship\'s Cook', area: 'docks', spot: 1, t: { bike: 1, mint: 0, whistle: 1 },
        look: { skin: SK[1], hair: '#e5e7eb', hs: 'bald', shirt: '#fff', pants: '#0f172a', hat: '#fff', hs2: 'chef', beard: true, tall: true },
        lines: ['Ahoy! Skip, cook of the good ship Biscuit.', 'Last night I was baking 300 muffins for the parade.', 'I ride my old BIKE up and down the docks.', 'CHERRY gum, always. And I WHISTLE while I cook. Fwee-fwee!'],
        motive: { name: 'Cake Contest Entry', text: 'Skip\'s entry: "King\'s Crown Cake. Topped with a REAL golden crown to win first prize!"', spots: ['dock_barrel', 'dock_crates', 'dock_office'] },
        confess: 'I wanted to win the cake contest with a real crown on top! It\'s in my kitchen, a bit sticky. Sorry, Mayor!' },
      { id: 'willow', name: 'Willow', role: 'Woodcarver', area: 'forest', spot: 3, t: { bike: 1, mint: 1, whistle: 1 },
        look: { skin: SK[4], hair: '#7c2d12', hs: 'long', shirt: '#65a30d', pants: '#78350f', hat: '#a16207', hs2: 'beanie', gloves: '#d6a46b' },
        lines: ['Oh, hi! I\'m Willow. I carve wooden toys in this cabin.', 'Last night I was carving a wooden duck by the stove.', 'I ride my BIKE into town on market days.', 'Fresh MINT gum helps me focus, and I WHISTLE with the birds. Tweet tweet!'],
        motive: { name: 'Carving Sketch', text: 'Willow\'s sketch: "Carve a wooden crown for the parade. Need the REAL one to copy it perfectly!"', spots: ['for_woodpile', 'for_table', 'for_stump'] },
        confess: 'I only borrowed it to copy for my carving! It\'s wrapped in a blanket in my chest. I should have asked.' }
    ],
    witness: { id: 'pip', name: 'Pip', role: 'Paper Kid', area: 'town', spot: 2, gives: 'tC', look: { skin: SK[0], hair: '#f5d0a9', hs: 'short', shirt: '#facc15', pants: '#1e40af', hat: '#ef4444', hs2: 'cap' },
      lines: ['Extra! Extra! Hi, I\'m Pip. I deliver the newspaper!', 'Last night I was folding papers behind the fountain. Someone sneaked off the stage!', '{clue}', 'Put THAT in the newspaper!'] },
    clues: [
      { id: 'sc1', name: 'Empty Crown Pillow', text: 'The crown pillow is empty. The lock was opened with a real stage key, so the thief is one of the five key holders.', spots: ['x_stage'] },
      { id: 'sc2', name: 'Parade Schedule', text: 'Parade schedule: "Crown locked on stage at 9 PM." Someone scribbled: "Stage dark from 9:30 to 10."', spots: ['town_board', 'town_mailbox', 'town_phone'] },
      { id: 'tA', trait: 'bike', spots: ['x_tracks'],
        yes: { name: 'Bike Tracks', text: 'Thin BIKE tire tracks lead away from the stage. The thief rode a BIKE.' },
        no: { name: 'Shoe Prints', text: 'Only shoe prints lead away from the stage. No bike tracks at all. The thief WALKED.' } },
      { id: 'tB', trait: 'mint', spots: ['town_trash', 'town_bush', 'town_lamp'],
        yes: { name: 'Mint Gum Wrapper', text: 'A green MINT gum wrapper dropped near the stage. It still smells minty! The thief chews MINT gum.' },
        no: { name: 'Cherry Gum Wrapper', text: 'A red CHERRY gum wrapper dropped near the stage. Still sticky! The thief chews CHERRY gum.' } },
      { id: 'tC', trait: 'whistle', witness: true,
        yes: { name: 'Pip\'s Testimony', text: 'Pip heard the thief WHISTLING a happy tune while running away. Fweet fweet!' },
        no: { name: 'Pip\'s Testimony', text: 'Pip heard the thief HUMMING a tune while running away. Not whistling, humming!' } }
    ],
    extras: [
      { id: 'x_stage', name: 'Parade Stage', kind: 'stage', area: 'town', pos: [[-8, 8.4], [8.5, 8.2]], text: 'The parade stage.' },
      { id: 'x_tracks', name: 'Muddy Ground', kind: 'tracks', area: 'town', pos: [[-10.5, 0.8], [11, 7]], text: 'Some marks in the mud.' }
    ]
  }
];
GD.caseById = (id) => GD.CASES.find((c) => c.id === id);

/* ---------- case setup (host): random culprit, red herring, clue spots ---------- */
GD.setupCase = function (c, rnd) {
  rnd = rnd || Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const culprit = pick(c.suspects).id;
  const herring = pick(c.suspects.filter((s) => s.id !== culprit)).id;
  const extraPos = {};
  (c.extras || []).forEach((e) => { extraPos[e.id] = Math.floor(rnd() * e.pos.length); });
  let alibis = [];
  if (c.alibiCount) { const pool = c.suspects.filter((s) => s.id !== culprit && s.id !== herring && s.alibi).map((s) => s.id); while (alibis.length < c.alibiCount && pool.length) alibis.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]); }
  const used = {}, place = {};
  const all = GD.caseClues(c, culprit, herring, alibis);
  all.forEach((cl) => {
    if (cl.witness) return;
    let opts = cl.spots.filter((s) => !used[s]);
    if (!opts.length) { const area = GD.objArea(c, cl.spots[0]); opts = GD.areaObjIds(c, area).filter((s) => !used[s]); }
    const s = pick(opts); used[s] = 1; place[cl.id] = s;
  });
  return { culprit, herring, place, extraPos, alibis };
};
// every clue in play for this culprit/herring, with resolved name/text
GD.caseClues = function (c, culprit, herring, alibis) {
  const cs = c.suspects.find((s) => s.id === culprit), out = [];
  c.clues.forEach((cl) => {
    const o = { id: cl.id, spots: cl.spots || [], witness: !!cl.witness, kind: cl.trait ? 'trait' : 'scene' };
    if (cl.trait) { const v = cs.t[cl.trait] ? 'yes' : 'no'; o.trait = cl.trait; o.val = cs.t[cl.trait]; o.name = cl[v].name; o.text = cl[v].text; o.points = true; }
    else { o.name = cl.name; o.text = cl.text; }
    out.push(o);
  });
  [culprit, herring].forEach((sid) => { const s = c.suspects.find((q) => q.id === sid); out.push({ id: 'm_' + sid, kind: 'motive', about: sid, name: s.motive.name, text: s.motive.text, spots: s.motive.spots }); });
  (alibis || []).forEach((sid) => { const s = c.suspects.find((q) => q.id === sid); if (s && s.alibi) out.push({ id: 'a_' + sid, kind: 'alibi', about: sid, name: s.alibi.name, text: s.alibi.text, spots: s.alibi.spots }); });
  return out;
};
GD.extraObjs = function (c, extraPos) {
  return (c.extras || []).map((e) => { const p = e.pos[(extraPos && extraPos[e.id]) | 0] || e.pos[0]; return { id: e.id, name: e.name, kind: e.kind, area: e.area, x: p[0], z: p[1], text: e.text, rotN: e.rotN, extra: true }; });
};
GD.caseAreas = function (c) { return (c && c.areas) || GD.AREA_ORDER; };
GD.objArea = function (c, id) {
  for (const a in GD.AREAS) if (GD.AREAS[a].objs.some((o) => o.id === id)) return a;
  const e = (c.extras || []).find((x) => x.id === id); return e ? e.area : null;
};
GD.areaObjIds = function (c, area) { return GD.AREAS[area].objs.map((o) => o.id).concat((c.extras || []).filter((e) => e.area === area).map((e) => e.id)); };
GD.people = function (c) { const a = c.suspects.map((s) => Object.assign({ kind: 'suspect' }, s)); if (c.witness) a.push(Object.assign({ kind: 'witness' }, c.witness)); (c.helpers || []).forEach((h) => a.push(Object.assign({ kind: 'witness' }, h))); if (c.dog) a.push(Object.assign({ kind: 'dog' }, c.dog)); if (c.victim) a.push(Object.assign({ kind: 'victim' }, c.victim)); return a; };
GD.clueGiver = function (c, clueId) { return GD.people(c).find((p) => p.gives === clueId) || null; };
})();
