# RREF Calculator - Architecture Documentation

This document provides a comprehensive technical overview of the RREF Calculator's architecture, data flow, and implementation details.

## Table of Contents

1. [System Overview](#system-overview)
2. [Directory Structure](#directory-structure)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Core Algorithm](#core-algorithm)
6. [State Management](#state-management)
7. [Audio System](#audio-system)

---

## System Overview

The RREF Calculator is a **single-page React application** that solves systems of linear equations using Gaussian Elimination. It transforms an augmented matrix into Reduced Row Echelon Form (RREF) with step-by-step visualization.

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Framework** | React 18 | Component-based UI with hooks |
| **Language** | TypeScript 5 | Type-safe development |
| **Build Tool** | Vite 5 | Fast development & optimized builds |
| **Math Engine** | math.js | Exact fraction arithmetic |
| **Audio** | Web Audio API | Programmatic sound synthesis |
| **Styling** | CSS3 | Custom cyberpunk theme |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App.tsx (Main UI)                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │   │
│  │  │ Matrix      │  │ Solution     │  │ Animation      │   │   │
│  │  │ Input Panel │  │ Panel        │  │ Player         │   │   │
│  │  │             │  │              │  │                │   │   │
│  │  │ [Dimension] │  │ [Type Badge] │  │ [Step Display] │   │   │
│  │  │ [Grid ]     │  │ [Variables]  │  │ [Controls]     │   │   │
│  │  │ [Presets]   │  │ [RREF Matrix]│  │ [Speed]        │   │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      src/lib/                             │   │
│  │  ┌─────────────────────────┐  ┌────────────────────────┐ │   │
│  │  │       solver.ts         │  │      sounds.ts         │ │   │
│  │  │                         │  │                        │ │   │
│  │  │  • toFraction()         │  │  • playKeyClick()      │ │   │
│  │  │  • fractionToString()   │  │  • playChargeUp()      │ │   │
│  │  │  • solveRREF()          │  │  • playSuccess()       │ │   │
│  │  │                         │  │  • playError()         │ │   │
│  │  │  Uses: math.js          │  │  Uses: Web Audio API   │ │   │
│  │  └─────────────────────────┘  └────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
rref-calc/
├── docs/                    # Documentation
│   └── ARCHITECTURE.md      # This file
├── public/                  # Static assets (copied to dist/)
│   ├── neo/                 # Neo mascot images
│   │   ├── Neo_Waving.png
│   │   ├── Neo_Celebrating.png
│   │   └── Neo_Thinking.png
│   └── favicon.png          # Custom favicon
├── src/                     # Source code
│   ├── lib/                 # Core logic modules
│   │   ├── solver.ts        # RREF algorithm (≈400 lines)
│   │   └── sounds.ts        # Audio effects (≈280 lines)
│   ├── App.tsx              # Main React component (≈800 lines)
│   ├── index.css            # All styles (≈1700 lines)
│   ├── main.tsx             # React entry point
│   └── vite-env.d.ts        # Vite type declarations
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # Project documentation
```

---

## Component Architecture

### App.tsx - Main Component

The entire UI is contained in a single `App` component using React hooks for state management.

#### Key State Variables

| State | Type | Purpose |
|-------|------|---------|
| `rows`, `cols` | `number` | Matrix dimensions |
| `matrix` | `string[][]` | User input values |
| `result` | `SolverResult \| null` | Calculation output |
| `animationMode` | `boolean` | Step-by-step playback active |
| `currentStep` | `number` | Current animation frame |
| `soundEnabled` | `boolean` | Audio toggle |

#### Key Callbacks

| Function | Trigger | Action |
|----------|---------|--------|
| `handleCellChange` | Cell input | Update matrix, play click sound |
| `handleSolve` | Execute button | Run solver, show results |
| `loadPreset` | Preset button | Load example matrix |
| `generateRandomMatrix` | Random button | Fill with random values |
| `copyMatrixAsText` | Copy button | Copy RREF to clipboard |

---

## Data Flow

### Input → Processing → Output

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User Input     │     │   Processing     │     │     Output       │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│                  │     │                  │     │                  │
│ Matrix Config    │────▶│ Validation       │────▶│ Solution Type    │
│ • Rows (2-10)    │     │ • Size check     │     │ • Unique         │
│ • Cols (2-10)    │     │ • Value parse    │     │ • Infinite       │
│                  │     │                  │     │ • Inconsistent   │
│ Cell Values      │────▶│ solveRREF()      │────▶│                  │
│ • Integers       │     │ • Fraction math  │     │ Solution Values  │
│ • Decimals       │     │ • Row operations │     │ • x₁ = value     │
│ • Fractions      │     │ • Step recording │     │ • x₂ = value     │
│                  │     │                  │     │                  │
│ Presets          │     │ Audio Feedback   │────▶│ RREF Matrix      │
│ • Unique example │     │ • Success chime  │     │ • Final form     │
│ • Infinite       │     │ • Error buzz     │     │                  │
│ • No solution    │     │                  │     │ Step Animation   │
│                  │     │                  │     │ • Operation log  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Core Algorithm

### Gaussian Elimination → RREF

The solver implements the standard Gaussian Elimination algorithm with back-substitution to achieve Reduced Row Echelon Form.

#### Mathematical Foundation

An augmented matrix represents a system of linear equations:

```
[A|b] where Ax = b

Example:
[ 2  1 -1 |  8 ]     2x₁ + x₂ - x₃ = 8
[-3 -1  2 |-11 ]  →  -3x₁ - x₂ + 2x₃ = -11
[-2  1  2 | -3 ]     -2x₁ + x₂ + 2x₃ = -3
```

#### Elementary Row Operations

| Type | Notation | Operation | Matrix Effect |
|------|----------|-----------|---------------|
| I | E_ij | Swap rows i and j | Permutation matrix |
| II | E_i(α) | Multiply row i by α ≠ 0 | Scaling matrix |
| III | E_ij(α) | Add α × row j to row i | Shear matrix |

#### Algorithm Steps

```python
# Pseudocode for solveRREF()

1. PARSE: Convert strings → Fractions
2. FOR each column (left to right):
   a. FIND pivot (first non-zero at/below current row)
   b. IF no pivot: skip column (free variable)
   c. SWAP: Move pivot row to current position (Type I)
   d. SCALE: Divide row to make pivot = 1 (Type II)
   e. ELIMINATE: Zero out all other entries in column (Type III)
3. ANALYZE solution:
   - Check for 0 = non-zero (inconsistent)
   - Count pivots vs variables (rank)
   - Identify free variables
4. RETURN: RREF matrix, steps, solution
```

#### Solution Classification

| Condition | Type | Example |
|-----------|------|---------|
| rank = n variables | Unique | One exact solution |
| rank < n, consistent | Infinite | Free variables exist |
| 0 = non-zero row | Inconsistent | No solution |

---

## State Management

### React Hooks Usage

```typescript
// Dimension state
const [rows, setRows] = useState(3);
const [cols, setCols] = useState(4);

// Input binding state (allows free typing)
const [rowsInput, setRowsInput] = useState('3');
const [colsInput, setColsInput] = useState('4');

// Matrix data
const [matrix, setMatrix] = useState<string[][]>(() => 
    createEmptyMatrix(3, 4)
);

// Calculation results
const [result, setResult] = useState<SolverResult | null>(null);

// Animation playback
const [animationMode, setAnimationMode] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
const animationTimerRef = useRef<number | null>(null);
```

### State Update Flow

```
User Action → setState → Re-render → Updated UI
     │
     ├── handleCellChange(row, col, value)
     │        └── setMatrix(newMatrix)
     │
     ├── handleSolve()
     │        └── setResult(solveRREF(matrix))
     │
     └── toggleAnimation()
              └── setAnimationMode(!animationMode)
```

---

## Audio System

### Web Audio API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AudioContext (Singleton)                  │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Oscillator  │───▶│   Filter     │───▶│   GainNode   │──┼──▶ 🔊
│  │  (waveform)  │    │  (optional)  │    │  (volume)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  Waveforms: sine, square, sawtooth, triangle                │
└─────────────────────────────────────────────────────────────┘
```

### Sound Catalog

| Function | Trigger | Duration | Character |
|----------|---------|----------|-----------|
| `playKeyClick()` | Cell typing | 20ms | Sharp click |
| `playChargeUp()` | Execute button | 300ms | Rising sweep |
| `playSuccess()` | Solution found | 500ms | C major chord |
| `playError()` | Invalid input | 300ms | Low buzz |
| `playNeoWelcome()` | Welcome modal | 500ms | Swoosh |
| `playNeoCelebrate()` | Unique solution | 600ms | Victory fanfare |

---

## Performance Considerations

1. **Lazy AudioContext**: Created only on first sound playback
2. **Fraction Precision**: Uses math.js for exact arithmetic (no floating-point errors)
3. **Efficient Re-renders**: Matrix updates only affected cells
4. **CSS Animations**: GPU-accelerated transforms for smooth UI

---

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (AudioContext may require user gesture)
- **Mobile**: Responsive design, touch-friendly inputs

---

*Last updated: January 2026*
