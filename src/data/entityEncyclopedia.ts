export interface EntityEntry {
  id: string;
  name: string;
  category: 'angel' | 'demon' | 'spirit' | 'elemental' | 'ancestor';
  powerLevel: 'low' | 'medium' | 'high' | 'extreme';
  intent: 'benevolent' | 'malevolent' | 'neutral' | 'trickster';
  description: string;
  characteristics: string[];
  visualSigns: string[];
  howToInteract: string[];
  protectionMethods: string[];
  commonLocations: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export const entityEncyclopedia: EntityEntry[] = [
  // ANGELS
  {
    id: 'guardian-angel',
    name: 'Guardian Angel',
    category: 'angel',
    powerLevel: 'high',
    intent: 'benevolent',
    description: 'Celestial beings assigned to protect and guide individuals throughout their lives. They often appear during moments of danger or spiritual crisis.',
    characteristics: [
      'Radiates warm, comforting energy',
      'Often appears as brilliant white or golden light',
      'Creates feelings of peace and safety',
      'May manifest with wing-like light formations'
    ],
    visualSigns: [
      'Orbs of pure white or gold light',
      'Feather-shaped light anomalies',
      'Protective halos around subjects',
      'Warm glowing mist'
    ],
    howToInteract: [
      'Speak with gratitude and reverence',
      'Ask for guidance through prayer or meditation',
      'Trust the intuitive nudges they send',
      'Create a peaceful, clean space for connection'
    ],
    protectionMethods: [
      'No protection needed - they ARE protection',
      'Invite their presence through sincere prayer',
      'Keep sacred objects nearby to strengthen connection'
    ],
    commonLocations: [
      'Near loved ones in danger',
      'Sacred spaces and churches',
      'Hospitals and places of healing',
      'Around sleeping children'
    ],
    rarity: 'common'
  },
  {
    id: 'seraphim',
    name: 'Seraphim',
    category: 'angel',
    powerLevel: 'extreme',
    intent: 'benevolent',
    description: 'The highest order of angels, burning with divine love. Their presence is overwhelming and transformative, often appearing during profound spiritual experiences.',
    characteristics: [
      'Intense burning light that doesn\'t harm',
      'Multiple overlapping wing-like energy patterns',
      'Causes spontaneous tears of joy',
      'Voice sounds like harmonious music'
    ],
    visualSigns: [
      'Brilliant multi-colored fire that gives no heat',
      'Complex geometric light patterns',
      'Six-pointed star formations',
      'Rainbow prismatic effects'
    ],
    howToInteract: [
      'Approach with utmost humility',
      'Prepare through fasting and prayer',
      'Be ready for profound transformation',
      'Simply witness - words often fail'
    ],
    protectionMethods: [
      'Their presence purifies automatically',
      'Surrender to their divine light'
    ],
    commonLocations: [
      'Sites of miraculous events',
      'Deep meditation states',
      'Near-death experiences',
      'Ancient sacred sites'
    ],
    rarity: 'legendary'
  },
  {
    id: 'messenger-angel',
    name: 'Messenger Angel',
    category: 'angel',
    powerLevel: 'medium',
    intent: 'benevolent',
    description: 'Angels tasked with delivering divine messages to humans. They often appear in dreams or during meditation with specific guidance.',
    characteristics: [
      'Clear, direct communication style',
      'Appears with symbols or written messages in light',
      'Brings sudden clarity to confusion',
      'Often appears at crossroads moments in life'
    ],
    visualSigns: [
      'Light forming letters or symbols',
      'Scroll-like energy patterns',
      'Soft blue or violet glows',
      'Repeating number patterns (111, 444, etc.)'
    ],
    howToInteract: [
      'Keep a dream journal nearby',
      'Ask specific questions before sleep',
      'Pay attention to recurring symbols',
      'Act on the guidance received'
    ],
    protectionMethods: [
      'They bring protection with their messages',
      'Stay open and receptive'
    ],
    commonLocations: [
      'Dream states',
      'Meditation spaces',
      'Quiet moments of reflection',
      'During major life decisions'
    ],
    rarity: 'uncommon'
  },

  // DEMONS
  {
    id: 'shadow-entity',
    name: 'Shadow Entity',
    category: 'demon',
    powerLevel: 'medium',
    intent: 'malevolent',
    description: 'Dark beings that feed on fear and negative emotions. They often appear as dark humanoid shapes in peripheral vision and grow stronger from attention.',
    characteristics: [
      'Absorbs light rather than emitting it',
      'Creates feelings of dread and paranoia',
      'Grows larger when given attention',
      'Cannot exist in bright light'
    ],
    visualSigns: [
      'Dark masses with no defined features',
      'Shadows that move against light sources',
      'Cold spots in warm rooms',
      'Flickering lights and electronics'
    ],
    howToInteract: [
      'DO NOT engage or show fear',
      'Firmly command it to leave',
      'Fill the space with bright light',
      'Ignore its presence to starve it'
    ],
    protectionMethods: [
      'Keep spaces well-lit',
      'Burn sage or palo santo',
      'Salt barriers at doorways',
      'Prayers of protection',
      'Maintain positive emotional state'
    ],
    commonLocations: [
      'Dark corners and basements',
      'Abandoned buildings',
      'Sites of trauma or violence',
      'Around depressed individuals'
    ],
    rarity: 'common'
  },
  {
    id: 'incubus-succubus',
    name: 'Incubus/Succubus',
    category: 'demon',
    powerLevel: 'high',
    intent: 'malevolent',
    description: 'Seductive demons that drain life force through dreams and intimate encounters. They often pose as attractive beings to lure victims.',
    characteristics: [
      'Supernaturally attractive appearance',
      'Drains energy leaving exhaustion',
      'Creates obsessive thoughts in victims',
      'Most active during sleep'
    ],
    visualSigns: [
      'Unusually attractive figure in dreams',
      'Red or purple mist formations',
      'Feeling of weight on chest while sleeping',
      'Unexplained scratches or marks'
    ],
    howToInteract: [
      'NEVER engage or invite contact',
      'Break eye contact in dreams',
      'Speak the name of your deity',
      'Seek professional spiritual help'
    ],
    protectionMethods: [
      'Sleep with protective crystals (black tourmaline)',
      'Iron objects under the bed',
      'Prayers before sleep',
      'Avoid sleeping alone during attacks',
      'Professional exorcism if persistent'
    ],
    commonLocations: [
      'Bedrooms',
      'Dream states',
      'Near lonely individuals',
      'Sites of past sexual trauma'
    ],
    rarity: 'uncommon'
  },
  {
    id: 'legion',
    name: 'Legion',
    category: 'demon',
    powerLevel: 'extreme',
    intent: 'malevolent',
    description: 'A collective of demonic entities acting as one. Extremely dangerous and requires professional intervention. Associated with severe possession.',
    characteristics: [
      'Multiple voices or personalities',
      'Superhuman strength in possessed',
      'Aversion to all sacred objects',
      'Can predict future events'
    ],
    visualSigns: [
      'Swirling black mass with multiple faces',
      'Eyes appearing in smoke or mist',
      'Multiple shadow figures moving as one',
      'Objects moving violently'
    ],
    howToInteract: [
      'DO NOT attempt contact',
      'Leave the area immediately',
      'Contact trained exorcist or clergy',
      'Document from safe distance only'
    ],
    protectionMethods: [
      'Immediate professional intervention required',
      'Blessed salt and holy water',
      'Group prayer circles',
      'Complete house blessing',
      'May require relocation'
    ],
    commonLocations: [
      'Sites of mass tragedy',
      'Desecrated sacred grounds',
      'Places of dark rituals',
      'Near severely afflicted individuals'
    ],
    rarity: 'rare'
  },

  // SPIRITS
  {
    id: 'residual-spirit',
    name: 'Residual Spirit',
    category: 'spirit',
    powerLevel: 'low',
    intent: 'neutral',
    description: 'Energy imprints left by strong emotions or repeated actions. They replay like recordings and cannot interact with the living.',
    characteristics: [
      'Repeats same actions on schedule',
      'Cannot respond to communication',
      'Tied to specific locations',
      'Harmless energy echoes'
    ],
    visualSigns: [
      'Translucent figures doing routine tasks',
      'Same apparition at same time/place',
      'Footsteps with no presence',
      'Faint voices repeating phrases'
    ],
    howToInteract: [
      'Observation only - cannot interact',
      'Document patterns and timing',
      'Respect the space they occupy',
      'No intervention needed'
    ],
    protectionMethods: [
      'No protection needed - harmless',
      'Energy cleansing can sometimes fade imprints'
    ],
    commonLocations: [
      'Historic buildings',
      'Battlefields',
      'Old homes with long histories',
      'Places of routine activity'
    ],
    rarity: 'common'
  },
  {
    id: 'intelligent-spirit',
    name: 'Intelligent Spirit',
    category: 'spirit',
    powerLevel: 'medium',
    intent: 'neutral',
    description: 'Conscious spirits of the deceased who remain connected to the physical world. Can communicate and respond to the living.',
    characteristics: [
      'Responds to questions and stimuli',
      'Shows awareness of current events',
      'May have unfinished business',
      'Can manifest physical phenomena'
    ],
    visualSigns: [
      'Full or partial apparitions',
      'Moving objects with purpose',
      'Responding to EVP sessions',
      'Temperature changes on command'
    ],
    howToInteract: [
      'Speak respectfully as to a person',
      'Ask yes/no questions clearly',
      'Set boundaries for communication',
      'Help them find peace if possible'
    ],
    protectionMethods: [
      'Clear boundaries in communication',
      'White light visualization',
      'End sessions with closing prayers',
      'Don\'t invite unwanted contact'
    ],
    commonLocations: [
      'Their former homes',
      'Near loved ones',
      'Places of death',
      'Locations of emotional significance'
    ],
    rarity: 'common'
  },
  {
    id: 'poltergeist',
    name: 'Poltergeist',
    category: 'spirit',
    powerLevel: 'high',
    intent: 'trickster',
    description: 'Chaotic energy manifestations often tied to emotional turmoil, especially in adolescents. Creates physical disturbances.',
    characteristics: [
      'Moves objects violently',
      'Creates loud noises',
      'Often tied to a living person',
      'Feeds on emotional chaos'
    ],
    visualSigns: [
      'Objects flying or levitating',
      'Spontaneous fires',
      'Electrical disturbances',
      'Writing appearing on surfaces'
    ],
    howToInteract: [
      'Identify the human anchor',
      'Address underlying emotional issues',
      'Remain calm to reduce energy',
      'Professional intervention may help'
    ],
    protectionMethods: [
      'Resolve emotional conflicts',
      'Therapy for affected family members',
      'House blessing and cleansing',
      'Remove the human anchor temporarily'
    ],
    commonLocations: [
      'Homes with teenagers',
      'Places of family conflict',
      'Near emotionally volatile individuals',
      'Stressful environments'
    ],
    rarity: 'uncommon'
  },

  // ELEMENTALS
  {
    id: 'nature-spirit',
    name: 'Nature Spirit',
    category: 'elemental',
    powerLevel: 'medium',
    intent: 'neutral',
    description: 'Spirits embodying natural elements like trees, rivers, and stones. Ancient beings tied to the health of their environment.',
    characteristics: [
      'Takes forms related to their element',
      'Protective of natural spaces',
      'Can be helpful if respected',
      'Angered by environmental damage'
    ],
    visualSigns: [
      'Faces in tree bark or water',
      'Unusual animal behavior',
      'Glowing moss or plants',
      'Wind patterns forming shapes'
    ],
    howToInteract: [
      'Approach with offerings (clean water, flowers)',
      'Show respect for the environment',
      'Ask permission before taking anything',
      'Leave the space cleaner than you found it'
    ],
    protectionMethods: [
      'Respect their territory',
      'Make amends for environmental harm',
      'Iron can ward but also offends',
      'Apology rituals if disturbed'
    ],
    commonLocations: [
      'Ancient forests',
      'Natural springs',
      'Standing stones',
      'Untouched wilderness'
    ],
    rarity: 'uncommon'
  },
  {
    id: 'fire-elemental',
    name: 'Fire Elemental',
    category: 'elemental',
    powerLevel: 'high',
    intent: 'neutral',
    description: 'Pure embodiments of fire energy. Passionate and volatile, they can purify or destroy depending on approach.',
    characteristics: [
      'Radiates intense heat without burning',
      'Passionate and quick to anger',
      'Associated with transformation',
      'Cannot exist in water'
    ],
    visualSigns: [
      'Flames that move against wind',
      'Faces in fire',
      'Spontaneous warmth',
      'Dancing sparks with intelligence'
    ],
    howToInteract: [
      'Show respect for fire\'s power',
      'Offer candles or controlled flames',
      'Speak with passion and conviction',
      'Never try to control or trap'
    ],
    protectionMethods: [
      'Water as a barrier',
      'Respectful distance',
      'Acknowledge its power',
      'Safe exit routes always'
    ],
    commonLocations: [
      'Volcanoes',
      'Forge fires',
      'Lightning strike sites',
      'Ritual bonfires'
    ],
    rarity: 'rare'
  },

  // ANCESTORS
  {
    id: 'ancestral-guide',
    name: 'Ancestral Guide',
    category: 'ancestor',
    powerLevel: 'medium',
    intent: 'benevolent',
    description: 'Spirits of deceased family members who watch over and guide their living descendants. Often appear during important life moments.',
    characteristics: [
      'Familiar family resemblance',
      'Brings feelings of nostalgia',
      'Offers guidance through signs',
      'Strongest around family events'
    ],
    visualSigns: [
      'Familiar scents (perfume, tobacco)',
      'Family photos moving or falling',
      'Dreams with deceased relatives',
      'Orbs in family photos'
    ],
    howToInteract: [
      'Create an ancestor altar',
      'Speak to them as family',
      'Honor their memory with traditions',
      'Ask for guidance in family matters'
    ],
    protectionMethods: [
      'They provide protection naturally',
      'Honor their memory to strengthen bond',
      'Keep family traditions alive'
    ],
    commonLocations: [
      'Family homes',
      'Gravesites',
      'Places significant to them in life',
      'During family gatherings'
    ],
    rarity: 'common'
  },
  {
    id: 'vengeful-ancestor',
    name: 'Vengeful Ancestor',
    category: 'ancestor',
    powerLevel: 'high',
    intent: 'malevolent',
    description: 'Ancestors who died with unresolved grievances or were dishonored after death. They seek acknowledgment or revenge.',
    characteristics: [
      'Brings family misfortune',
      'Appears angry or distressed',
      'Connected to family secrets',
      'Demands recognition or justice'
    ],
    visualSigns: [
      'Disturbing dreams of death',
      'Family heirlooms breaking',
      'Illness following family lines',
      'Angry faces in reflections'
    ],
    howToInteract: [
      'Research family history',
      'Acknowledge past wrongs',
      'Perform healing rituals',
      'Seek medium assistance'
    ],
    protectionMethods: [
      'Uncover and address the grievance',
      'Formal apology rituals',
      'Proper burial or memorial if needed',
      'Professional ancestral healing'
    ],
    commonLocations: [
      'Old family properties',
      'Near hidden family secrets',
      'Around specific family members',
      'Places of past family trauma'
    ],
    rarity: 'uncommon'
  }
];

export const getCategoryColor = (category: EntityEntry['category']) => {
  switch (category) {
    case 'angel': return 'from-amber-400 to-yellow-200';
    case 'demon': return 'from-red-600 to-red-900';
    case 'spirit': return 'from-blue-400 to-cyan-300';
    case 'elemental': return 'from-green-500 to-emerald-300';
    case 'ancestor': return 'from-purple-500 to-violet-300';
    default: return 'from-gray-400 to-gray-600';
  }
};

export const getCategoryIcon = (category: EntityEntry['category']) => {
  switch (category) {
    case 'angel': return '👼';
    case 'demon': return '👿';
    case 'spirit': return '👻';
    case 'elemental': return '🌿';
    case 'ancestor': return '🪦';
    default: return '❓';
  }
};

export const getIntentColor = (intent: EntityEntry['intent']) => {
  switch (intent) {
    case 'benevolent': return 'text-green-400';
    case 'malevolent': return 'text-red-400';
    case 'neutral': return 'text-blue-400';
    case 'trickster': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

export const getPowerColor = (power: EntityEntry['powerLevel']) => {
  switch (power) {
    case 'low': return 'bg-green-500/20 text-green-300';
    case 'medium': return 'bg-yellow-500/20 text-yellow-300';
    case 'high': return 'bg-orange-500/20 text-orange-300';
    case 'extreme': return 'bg-red-500/20 text-red-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

export const getRarityColor = (rarity: EntityEntry['rarity']) => {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'legendary': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};
