// =============================================================================
// Drapit Studio — Option constants
// =============================================================================

export type StudioMode = 'virtual-model' | 'product-only' | 'video-360';
export type LensType = '35mm' | '50mm' | '85mm';
export type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// ---------------------------------------------------------------------------
// Models (gender)
// ---------------------------------------------------------------------------
export const STUDIO_MODELS = [
  { id: 'female', label: 'Vrouw', description: 'Een vrouwelijk model voor je kledingpresentatie.', prompt: 'woman, female model' },
  { id: 'male', label: 'Man', description: 'Een mannelijk model voor je kledingpresentatie.', prompt: 'man, male model' },
] as const;

// ---------------------------------------------------------------------------
// Ethnicities
// ---------------------------------------------------------------------------
export const STUDIO_ETHNICITIES = [
  { id: 'caucasian', label: 'Europees', description: 'Lichte huidskleur met Europese gelaatstrekken.', prompt: 'caucasian, fair complexion, European features' },
  { id: 'african', label: 'Afrikaans', description: 'Donkere huidskleur met Afrikaanse gelaatstrekken.', prompt: 'Black, African American, dark skin, African features' },
  { id: 'asian', label: 'Aziatisch', description: 'Oost-Aziatische gelaatstrekken (o.a. Koreaans of Japans).', prompt: 'East Asian, Asian features, Korean or Japanese appearance' },
  { id: 'latino', label: 'Latino', description: 'Latijns-Amerikaanse gelaatstrekken met een licht getinte huid.', prompt: 'Hispanic, Latin American, olive skin, Latino features' },
  { id: 'middle-eastern', label: 'Midden-Oosters', description: 'Midden-Oosterse of mediterrane gelaatstrekken met een getinte huid.', prompt: 'Middle Eastern, Mediterranean features, olive complexion' },
  { id: 'south-asian', label: 'Zuid-Aziatisch', description: 'Zuid-Aziatische gelaatstrekken (o.a. Indiaas) met een bruine huid.', prompt: 'South Asian, Indian features, brown skin' },
  { id: 'mixed', label: 'Gemengd', description: 'Een combinatie van verschillende etniciteiten voor een diverse look.', prompt: 'mixed race, multiracial features, diverse ethnicity' },
] as const;

// ---------------------------------------------------------------------------
// Body types
// ---------------------------------------------------------------------------
export const STUDIO_BODY_TYPES = [
  { id: 'slim', label: 'Slank', description: 'Een slank en tenger postuur.', prompt: 'slim build, lean physique, slender figure' },
  { id: 'average', label: 'Gemiddeld', description: 'Een alledaags, gemiddeld postuur.', prompt: 'average build, regular physique, standard figure' },
  { id: 'athletic', label: 'Atletisch', description: 'Een sportief en gespierd postuur.', prompt: 'athletic build, toned and muscular physique' },
  { id: 'curvy', label: 'Curvy', description: 'Een vrouwelijk postuur met duidelijke vormen.', prompt: 'curvy build, voluptuous figure, full-figured' },
  { id: 'plus', label: 'Plus-size', description: 'Een voller en krachtig postuur.', prompt: 'plus-size, full body, body-positive figure' },
] as const;

// ---------------------------------------------------------------------------
// Poses
// ---------------------------------------------------------------------------
export const STUDIO_POSES = [
  { id: 'standing-straight', label: 'Recht Staand', description: 'Een neutrale houding waarbij het model recht vooruit kijkt.', prompt: 'standing straight, neutral upright pose, facing forward' },
  { id: 'casual-stand', label: 'Casual Staand', description: 'Een ontspannen houding met een natuurlijke gewichtsverdeling.', prompt: 'casual relaxed standing pose, weight shifted naturally, easy confident stance' },
  { id: 'walking', label: 'Lopend', description: 'Een dynamische houding die beweging suggereert (mid-stap).', prompt: 'walking forward pose, mid-stride, natural walking motion' },
  { id: 'hand-on-hip', label: 'Hand op Heup', description: 'Een zelfverzekerde mode-houding met één hand op de heup.', prompt: 'one hand on hip, confident fashion model pose' },
  { id: 'arms-crossed', label: 'Armen Gekruist', description: 'Een krachtige houding met de armen over elkaar.', prompt: 'arms crossed across chest, confident crossed arms stance' },
  { id: 'looking-away', label: 'Opzij Kijkend', prompt: 'looking to the side, three-quarter profile, gazing away from camera', description: 'Het model kijkt opzij voor een artistieke of afgeleide look.' },
  { id: 'sitting', label: 'Zittend', description: 'Een zittende houding op een onzichtbaar oppervlak.', prompt: 'sitting naturally, seated xpose on surface' },
  { id: 'dynamic', label: 'Dynamisch', description: 'Een energieke houding vol actie en beweging.', prompt: 'dynamic energetic pose, mid-movement, action-oriented fashion pose' },
  { id: 'hand-in-pocket', label: 'Hand in Zak', description: 'Een informele en stijlvolle houding met één hand in de zak.', prompt: 'one hand in pocket, casual relaxed pose, stylish stance' },
] as const;

// ---------------------------------------------------------------------------
// Facial expressions
// ---------------------------------------------------------------------------
export const STUDIO_EXPRESSIONS = [
  { id: 'neutral', label: 'Neutraal', description: 'Een serieuze en rustige gezichtsuitdrukking.', prompt: 'neutral facial expression, serious look, composed face' },
  { id: 'natural-smile', label: 'Natuurlijk', description: 'Een subtiele en vriendelijke glimlach.', prompt: 'natural subtle smile, pleasant relaxed expression' },
  { id: 'confident', label: 'Zelfverzekerd', description: 'Een krachtige blik met een vastberaden uitstraling.', prompt: 'confident strong expression, intense direct gaze, determined look' },
  { id: 'soft-smile', label: 'Zachte Glimlach', description: 'Een warme en toegankelijke glimlach.', prompt: 'soft gentle smile, warm approachable expression' },
  { id: 'editorial', label: 'Editoriaal', description: 'Een intense, professionele mode-blik (high-fashion).', prompt: 'serious high-fashion editorial expression, intense model look' },
  { id: 'joyful', label: 'Blij', description: 'Een enthousiaste en vrolijke lach vol energie.', prompt: 'joyful happy expression, bright genuine smile, positive energy' },
] as const;

// ---------------------------------------------------------------------------
// Framing / crop
// ---------------------------------------------------------------------------
export const STUDIO_FRAMINGS = [
  { id: 'full-body', label: 'Heel Lichaam', description: 'Het model van top tot teen in beeld.', prompt: 'full body shot, head to toe, full length' },
  { id: 'three-quarter', label: 'Driekwart', description: 'De opname gaat van boven het hoofd tot aan de kuiten.', prompt: 'three-quarter body shot, from head to mid-shin' },
  { id: 'half-body', label: 'Halflichaam', description: 'De opname gaat van het hoofd tot aan de middel.', prompt: 'half body shot, from head to waist' },
  { id: 'close-up', label: 'Close-up', description: 'Alleen het hoofd en de schouders zijn zichtbaar.', prompt: 'close-up portrait, head and shoulders only' },
] as const;

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------
export const STUDIO_BACKGROUNDS = [
  { id: 'white-studio', label: 'Witte Studio', description: 'Een strakke, egale witte studio-achtergrond.', prompt: 'pure white seamless studio backdrop, clean white background' },
  { id: 'light-gray', label: 'Lichtgrijs', description: 'Een zachte, neutrale lichtgrijze achtergrond.', prompt: 'light gray seamless studio background, soft neutral gray backdrop' },
  { id: 'dark-gray', label: 'Donkergrijs', description: 'Een diepe, houtskoolgrijze studio-achtergrond.', prompt: 'dark gray studio background, charcoal gray seamless backdrop' },
  { id: 'black-studio', label: 'Zwarte Studio', description: 'Een volledig zwarte, dramatische studio-omgeving.', prompt: 'pure black studio background, dark seamless backdrop' },
  { id: 'cream-beige', label: 'Crème', description: 'Een warme, beige-achtige achtergrond voor een zachte look.', prompt: 'warm cream beige background, soft off-white seamless backdrop' },
  { id: 'gradient-white', label: 'Gradient Wit', description: 'Wit met een subtiel kleurverloop naar de randen.', prompt: 'white gradient background, soft white vignette, bright and airy' },
  { id: 'fashion-studio', label: 'Fashion Studio', description: 'Een professionele studio-opstelling met felle verlichting.', prompt: 'professional fashion photography studio setup, high-key lighting environment' },
  { id: 'outdoor-city', label: 'Stadsstraat', description: 'Een moderne stedelijke omgeving met gebouwen op de achtergrond.', prompt: 'urban city street environment, modern architecture background, city bokeh' },
  { id: 'outdoor-nature', label: 'Natuur', description: 'Een groene, natuurlijke omgeving in een park of bos.', prompt: 'natural outdoor setting, lush green park environment, soft nature backdrop' },
  { id: 'indoor-minimal', label: 'Modern Interieur', description: 'Een minimalistische kamer met moderne architectuur.', prompt: 'minimalist modern interior, clean contemporary room, architectural background' },
  { id: 'marble', label: 'Marmer', description: 'Een luxe achtergrond van marmeren wanden of vloeren.', prompt: 'luxury marble floor and wall background, high-end marble surface' },
  { id: 'concrete-loft', label: 'Betonnen Loft', description: 'Een industriële look met onafgewerkte betonnen muren.', prompt: 'exposed concrete wall background, industrial loft aesthetic, urban texture' },
  { id: 'beach', label: 'Strand', description: 'Een zonnige achtergrond met zand en zee.', prompt: 'beach setting, sand and sea background, coastal environment' },
  { id: 'neon-studio', label: 'Neon Studio', description: 'Een artistieke studio met gekleurde neonlichten.', prompt: 'studio with colored neon lights, moody colored light background, artistic neon ambiance' },
] as const;

// ---------------------------------------------------------------------------
// Lighting
// ---------------------------------------------------------------------------
export const STUDIO_LIGHTING = [
  { id: 'natural-soft', label: 'Zacht Daglicht', description: 'Zacht en gelijkmatig invallend buitenlicht.', prompt: 'soft natural daylight, diffused gentle illumination, flattering natural light' },
  { id: 'studio-softbox', label: 'Studio Softbox', description: 'Gebalanceerde studioverlichting met zachte schaduwen.', prompt: 'professional studio softbox lighting, even balanced illumination, clean shadows' },
  { id: 'dramatic', label: 'Dramatisch', description: 'Sterke contrasten met diepe schaduwen van opzij.', prompt: 'dramatic side lighting, strong directional light, bold shadow contrast' },
  { id: 'golden-hour', label: 'Gouden Uur', description: 'Warme, oranje gloed van de laagstaande zon.', prompt: 'warm golden hour sunlight, amber glow, sunset warmth' },
  { id: 'high-key', label: 'High-key', description: 'Zeer heldere verlichting met weinig schaduw voor een frisse look.', prompt: 'high-key bright lighting, overexposed bright aesthetic, light and airy' },
  { id: 'low-key', label: 'Low-key', description: 'Donkere, mysterieuze verlichting met focus op details.', prompt: 'low-key moody lighting, dark atmosphere, minimal soft light' },
  { id: 'ring-light', label: 'Ring Light', description: 'Egalige verlichting van voren die perfect is voor gezichten.', prompt: 'ring light illumination, even frontal circular light, bright catchlights in eyes' },
  { id: 'rembrandt', label: 'Rembrandt', description: 'Klassieke portretbelichting met een lichtdriehoek op de wang.', prompt: 'Rembrandt lighting technique, triangle of light on cheek, classic portrait light' },
] as const;

// ---------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------
export const STUDIO_TIME_OF_DAY = [
  { id: 'none', label: 'Geen', prompt: '', description: 'Geen specifiek tijdstip geselecteerd.' },
  { id: 'morning', label: 'Ochtend', description: 'Fris en koel ochtendlicht.', prompt: 'morning atmosphere, soft morning light, fresh dawn' },
  { id: 'midday', label: 'Middag', description: 'Fel en direct zonlicht van boven.', prompt: 'midday bright daylight, noon sun, crisp clear light' },
  { id: 'afternoon', label: 'Namiddag', description: 'Warm en zacht licht van de namiddag.', prompt: 'warm afternoon light, late afternoon glow' },
  { id: 'golden-hour', label: 'Gouden Uur', description: 'De warme, gouden gloed vlak voor zonsondergang.', prompt: 'golden hour, warm sunset light, orange and gold tones' },
  { id: 'dusk', label: 'Schemering', description: 'Het blauwe uurtje met zachte, mysterieuze schemering.', prompt: 'dusk blue hour, twilight atmosphere, soft evening light' },
] as const;

// ---------------------------------------------------------------------------
// Lens types
// ---------------------------------------------------------------------------
export const STUDIO_LENSES: { id: LensType; label: string; description: string; detailDescription: string; prompt: string }[] = [
  { id: '35mm', label: '35mm', description: 'Breed', detailDescription: 'Een groothoeklens die meer van de omgeving laat zien.', prompt: '35mm wide angle lens perspective, environmental context visible' },
  { id: '50mm', label: '50mm', description: 'Standaard', detailDescription: 'Komt het dichtst overeen met het menselijk oog.', prompt: '50mm standard lens, natural perspective, true to life view' },
  { id: '85mm', label: '85mm', description: 'Portret', detailDescription: 'Ideaal voor portretten met een flatteuze compressie.', prompt: '85mm portrait lens, slightly compressed perspective, flattering focal length' },
];

