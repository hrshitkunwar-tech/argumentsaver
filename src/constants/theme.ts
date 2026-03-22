// ─── ArgumentSaver Design Tokens (Stitch / Material 3) ────────────────────────
// Single source of truth for all colors. Match the Stitch design system exactly.

export const C = {
  // Primary — teal
  primary:          '#3b6c73',
  primaryDim:       '#2e5f67',
  primaryContainer: '#b9ebf4',
  onPrimary:        '#ffffff',
  onPrimaryContainer: '#275960',
  primaryFixed:     '#b9ebf4',
  primaryFixedDim:  '#abdde5',

  // Secondary
  secondary:          '#50686d',
  secondaryContainer: '#cde7ec',
  onSecondary:        '#ffffff',
  onSecondaryContainer: '#3e565a',

  // Tertiary
  tertiary:          '#476786',
  tertiaryContainer: '#badaff',
  onTertiary:        '#ffffff',
  onTertiaryContainer: '#2d4d6b',

  // Surface
  surface:              '#fffbff',
  surfaceBright:        '#fffbff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow:  '#fdf9f5',
  surfaceContainer:     '#f7f3ef',
  surfaceContainerHigh: '#f1ede9',
  surfaceContainerHighest: '#ebe8e3',
  surfaceDim:           '#e5e2dd',

  // On-surface
  onSurface:        '#393835',
  onSurfaceVariant: '#666461',
  onBackground:     '#393835',
  background:       '#fffbff',

  // Outline
  outline:        '#82807c',
  outlineVariant: '#bcb9b4',

  // Error
  error:          '#af3d3b',
  errorContainer: '#fa746f',
  onError:        '#ffffff',

  // Inverse
  inverseSurface:   '#0e0e0d',
  inverseOnSurface: '#9f9c9a',
  inversePrimary:   '#bff1fa',

  // Misc
  surfaceTint: '#3b6c73',
} as const;

// Typography scale
export const T = {
  headlineXL: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  headlineLG: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  headlineMD: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  headlineSM: { fontSize: 18, fontWeight: '700' as const },
  bodyLG:     { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  bodyMD:     { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySM:     { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  labelXS:    { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.2 },
  labelSM:    { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.8 },
  labelMD:    { fontSize: 13, fontWeight: '600' as const },
} as const;

// Radius
export const R = {
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,
  xl:   24,
  xxl:  32,
  full: 999,
} as const;

// Shadows
export const shadow = {
  ghost: {
    shadowColor: '#393835',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  card: {
    shadowColor: '#393835',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;
