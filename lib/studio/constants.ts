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
  { id: 'female', label: 'Vrouw', prompt: 'woman, female model' },
  { id: 'male', label: 'Man', prompt: 'man, male model' },
] as const;

// ---------------------------------------------------------------------------
// Ethnicities
// ---------------------------------------------------------------------------
export const STUDIO_ETHNICITIES = [
  { id: 'caucasian', label: 'Europees', prompt: 'caucasian, fair complexion, European features' },
  { id: 'african', label: 'Afrikaans', prompt: 'Black, African American, dark skin, African features' },
  { id: 'asian', label: 'Aziatisch', prompt: 'East Asian, Asian features, Korean or Japanese appearance' },
  { id: 'latino', label: 'Latino', prompt: 'Hispanic, Latin American, olive skin, Latino features' },
  { id: 'middle-eastern', label: 'Midden-Oosters', prompt: 'Middle Eastern, Mediterranean features, olive complexion' },
  { id: 'south-asian', label: 'Zuid-Aziatisch', prompt: 'South Asian, Indian features, brown skin' },
  { id: 'mixed', label: 'Gemengd', prompt: 'mixed race, multiracial features, diverse ethnicity' },
] as const;

// ---------------------------------------------------------------------------
// Body types
// ---------------------------------------------------------------------------
export const STUDIO_BODY_TYPES = [
  { id: 'slim', label: 'Slank', prompt: 'slim build, lean physique, slender figure' },
  { id: 'average', label: 'Gemiddeld', prompt: 'average build, regular physique, standard figure' },
  { id: 'athletic', label: 'Atletisch', prompt: 'athletic build, toned and muscular physique' },
  { id: 'curvy', label: 'Curvy', prompt: 'curvy build, voluptuous figure, full-figured' },
  { id: 'plus', label: 'Plus-size', prompt: 'plus-size, full body, body-positive figure' },
] as const;

// ---------------------------------------------------------------------------
// Poses
// ---------------------------------------------------------------------------
export const STUDIO_POSES = [
  { id: 'standing-straight', label: 'Recht Staand', prompt: 'standing straight, neutral upright pose, facing forward' },
  { id: 'casual-stand', label: 'Casual Staand', prompt: 'casual relaxed standing pose, weight shifted naturally, easy confident stance' },
  { id: 'walking', label: 'Lopend', prompt: 'walking forward pose, mid-stride, natural walking motion' },
  { id: 'hand-on-hip', label: 'Hand op Heup', prompt: 'one hand on hip, confident fashion model pose' },
  { id: 'arms-crossed', label: 'Armen Gekruist', prompt: 'arms crossed across chest, confident crossed arms stance' },
  { id: 'looking-away', label: 'Opzij Kijkend', prompt: 'looking to the side, three-quarter profile, gazing away from camera' },
  { id: 'sitting', label: 'Zittend', prompt: 'sitting naturally, seated pose on surface' },
  { id: 'dynamic', label: 'Dynamisch', prompt: 'dynamic energetic pose, mid-movement, action-oriented fashion pose' },
  { id: 'hand-in-pocket', label: 'Hand in Zak', prompt: 'one hand in pocket, casual relaxed pose, stylish stance' },
] as const;

// ---------------------------------------------------------------------------
// Facial expressions
// ---------------------------------------------------------------------------
export const STUDIO_EXPRESSIONS = [
  { id: 'neutral', label: 'Neutraal', prompt: 'neutral facial expression, serious look, composed face' },
  { id: 'natural-smile', label: 'Natuurlijk', prompt: 'natural subtle smile, pleasant relaxed expression' },
  { id: 'confident', label: 'Zelfverzekerd', prompt: 'confident strong expression, intense direct gaze, determined look' },
  { id: 'soft-smile', label: 'Zachte Glimlach', prompt: 'soft gentle smile, warm approachable expression' },
  { id: 'editorial', label: 'Editoriaal', prompt: 'serious high-fashion editorial expression, intense model look' },
  { id: 'joyful', label: 'Blij', prompt: 'joyful happy expression, bright genuine smile, positive energy' },
] as const;

// ---------------------------------------------------------------------------
// Framing / crop
// ---------------------------------------------------------------------------
export const STUDIO_FRAMINGS = [
  { id: 'full-body', label: 'Heel Lichaam', prompt: 'full body shot, head to toe, full length' },
  { id: 'three-quarter', label: 'Driekwart', prompt: 'three-quarter body shot, from head to mid-shin' },
  { id: 'half-body', label: 'Halflichaam', prompt: 'half body shot, from head to waist' },
  { id: 'close-up', label: 'Close-up', prompt: 'close-up portrait, head and shoulders only' },
] as const;

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------
export const STUDIO_BACKGROUNDS = [
  { id: 'white-studio', label: 'Witte Studio', prompt: 'pure white seamless studio backdrop, clean white background' },
  { id: 'light-gray', label: 'Lichtgrijs', prompt: 'light gray seamless studio background, soft neutral gray backdrop' },
  { id: 'dark-gray', label: 'Donkergrijs', prompt: 'dark gray studio background, charcoal gray seamless backdrop' },
  { id: 'black-studio', label: 'Zwarte Studio', prompt: 'pure black studio background, dark seamless backdrop' },
  { id: 'cream-beige', label: 'Crème', prompt: 'warm cream beige background, soft off-white seamless backdrop' },
  { id: 'gradient-white', label: 'Gradient Wit', prompt: 'white gradient background, soft white vignette, bright and airy' },
  { id: 'fashion-studio', label: 'Fashion Studio', prompt: 'professional fashion photography studio setup, high-key lighting environment' },
  { id: 'outdoor-city', label: 'Stadsstraat', prompt: 'urban city street environment, modern architecture background, city bokeh' },
  { id: 'outdoor-nature', label: 'Natuur', prompt: 'natural outdoor setting, lush green park environment, soft nature backdrop' },
  { id: 'indoor-minimal', label: 'Modern Interieur', prompt: 'minimalist modern interior, clean contemporary room, architectural background' },
  { id: 'marble', label: 'Marmer', prompt: 'luxury marble floor and wall background, high-end marble surface' },
  { id: 'concrete-loft', label: 'Betonnen Loft', prompt: 'exposed concrete wall background, industrial loft aesthetic, urban texture' },
  { id: 'beach', label: 'Strand', prompt: 'beach setting, sand and sea background, coastal environment' },
  { id: 'neon-studio', label: 'Neon Studio', prompt: 'studio with colored neon lights, moody colored light background, artistic neon ambiance' },
] as const;

// ---------------------------------------------------------------------------
// Lighting
// ---------------------------------------------------------------------------
export const STUDIO_LIGHTING = [
  { id: 'natural-soft', label: 'Zacht Daglicht', prompt: 'soft natural daylight, diffused gentle illumination, flattering natural light' },
  { id: 'studio-softbox', label: 'Studio Softbox', prompt: 'professional studio softbox lighting, even balanced illumination, clean shadows' },
  { id: 'dramatic', label: 'Dramatisch', prompt: 'dramatic side lighting, strong directional light, bold shadow contrast' },
  { id: 'golden-hour', label: 'Gouden Uur', prompt: 'warm golden hour sunlight, amber glow, sunset warmth' },
  { id: 'high-key', label: 'High-key', prompt: 'high-key bright lighting, overexposed bright aesthetic, light and airy' },
  { id: 'low-key', label: 'Low-key', prompt: 'low-key moody lighting, dark atmosphere, minimal soft light' },
  { id: 'ring-light', label: 'Ring Light', prompt: 'ring light illumination, even frontal circular light, bright catchlights in eyes' },
  { id: 'rembrandt', label: 'Rembrandt', prompt: 'Rembrandt lighting technique, triangle of light on cheek, classic portrait light' },
] as const;

// ---------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------
export const STUDIO_TIME_OF_DAY = [
  { id: 'none', label: 'Geen', prompt: '' },
  { id: 'morning', label: 'Ochtend', prompt: 'morning atmosphere, soft morning light, fresh dawn' },
  { id: 'midday', label: 'Middag', prompt: 'midday bright daylight, noon sun, crisp clear light' },
  { id: 'afternoon', label: 'Namiddag', prompt: 'warm afternoon light, late afternoon glow' },
  { id: 'golden-hour', label: 'Gouden Uur', prompt: 'golden hour, warm sunset light, orange and gold tones' },
  { id: 'dusk', label: 'Schemering', prompt: 'dusk blue hour, twilight atmosphere, soft evening light' },
] as const;

// ---------------------------------------------------------------------------
// Lens types
// ---------------------------------------------------------------------------
export const STUDIO_LENSES: { id: LensType; label: string; description: string; prompt: string }[] = [
  { id: '35mm', label: '35mm', description: 'Breed', prompt: '35mm wide angle lens perspective, environmental context visible' },
  { id: '50mm', label: '50mm', description: 'Standaard', prompt: '50mm standard lens, natural perspective, true to life view' },
  { id: '85mm', label: '85mm', description: 'Portret', prompt: '85mm portrait lens, slightly compressed perspective, flattering focal length' },
];
