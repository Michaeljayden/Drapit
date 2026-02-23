// =============================================================================
// Drapit Design Tokens
// =============================================================================
// Single source of truth for all visual design decisions.
// Use these tokens in every component — never hard-code colours or classes.
// =============================================================================

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const colors = {
    // Brand
    navy: '#0F2744',
    blue: '#1D6FD8',
    blueLight: '#EBF3FF',
    blueHover: '#1558B0',

    // Neutrals
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray300: '#CBD5E1',
    gray500: '#64748B',
    gray900: '#0F172A',

    // Semantic
    green: '#16A34A',
    greenLight: '#DCFCE7',
    greenHover: '#15803D',
    red: '#DC2626',
    redLight: '#FEE2E2',
    amber: '#D97706',
    amberLight: '#FEF3C7',

    // Sidebar
    sidebarHover: '#1A3A5C',
    sidebarText: '#94A3B8',
} as const;

// ---------------------------------------------------------------------------
// Typography (Tailwind class presets)
// ---------------------------------------------------------------------------
export const typography = {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-base font-semibold',
    body: 'text-sm',
    caption: 'text-xs font-medium',
} as const;

// ---------------------------------------------------------------------------
// Component Styles (Tailwind class strings)
// ---------------------------------------------------------------------------
export const componentStyles = {
    // Buttons
    buttonPrimary:
        'bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm',

    buttonSecondary:
        'bg-white hover:bg-[#F1F5F9] text-[#0F172A] font-medium border border-[#CBD5E1] px-5 py-2.5 rounded-xl text-sm transition-colors duration-200',

    buttonCta:
        'bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-6 py-3 rounded-xl text-base w-full transition-colors duration-200 shadow-md',

    // Cards
    dashboardCard:
        'bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-6',

    // Sidebar
    sidebar:
        'bg-[#0F2744] text-white w-64 min-h-screen flex flex-col',

    sidebarItemActive:
        'bg-[#1D6FD8] text-white rounded-lg px-4 py-2.5 text-sm font-medium',

    sidebarItemInactive:
        'text-[#94A3B8] hover:bg-[#1A3A5C] hover:text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150',

    // Inputs
    input:
        'border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white w-full',
} as const;

// ---------------------------------------------------------------------------
// Widget CSS (vanilla — no Tailwind, for embed script)
// ---------------------------------------------------------------------------
export const widgetCSS = {
    btnTrigger: `
    background: #1D6FD8;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 10px 20px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(29, 111, 216, 0.3);
    transition: background 0.2s;
  `,

    modalOverlay: `
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    z-index: 99999;
    backdrop-filter: blur(4px);
  `,

    modal: `
    background: white;
    border-radius: 24px;
    padding: 32px;
    max-width: 560px;
    width: calc(100% - 40px);
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2);
  `,
} as const;

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------
export const animations = {
    spinner: {
        size: 32,
        color: '#1D6FD8',
        duration: '0.8s',
    },
    progressBar: {
        durationSeconds: 45,
        color: '#1D6FD8',
        trackColor: '#EBF3FF',
        height: 6,
        borderRadius: 9999,
    },
    modal: {
        duration: '200ms',
        scaleFrom: 0.96,
        scaleTo: 1.0,
        easing: 'ease-out',
    },
} as const;
