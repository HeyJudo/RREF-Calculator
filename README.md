# 🧮 RREF Calculator

A modern, cyberpunk-themed **Reduced Row Echelon Form (RREF) Calculator** that transforms augmented matrices using Gaussian Elimination with step-by-step visualization.

🌐 **Live Demo:** [rref-calculator.vercel.app](https://rref-calculator.vercel.app)

![Matrix Theme](https://img.shields.io/badge/Theme-Matrix%20Cyberpunk-00ff41?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Interactive Matrix Input** | Enter coefficients with support for fractions (e.g., `1/3`) and decimals |
| 🎬 **Step-by-Step Animation** | Watch the RREF transformation with playback controls |
| 🔊 **Cyberpunk Sound Effects** | Immersive audio feedback (toggleable) |
| 📋 **Copy to Clipboard** | Export your final RREF matrix as text |
| 🎲 **Random Matrix Generator** | Generate practice problems instantly |
| 📱 **Responsive Design** | Works on desktop and mobile |
| 🤖 **Neo Mascot** | Pixel art guide character |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rref-calc.git
cd rref-calc

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool & dev server |
| **math.js** | Precise fraction arithmetic |
| **Web Audio API** | Programmatic sound effects |
| **CSS3** | Custom animations & theming |

---

## 📖 How It Works

### User Flow

1. **Configure Dimensions**: Set the number of rows and columns
2. **Enter Values**: Fill in the augmented matrix (last column = constants)
3. **Execute**: Click "Execute RREF" to solve
4. **View Results**: See solution type, values, and final RREF matrix
5. **Animate**: Watch step-by-step row operations
6. **Export**: Copy the final matrix to clipboard

### Solution Types

| Type | Symbol | Description |
|------|--------|-------------|
| **Unique** | ✓ | Exactly one solution exists |
| **Infinite** | ∞ | Infinitely many solutions (free variables) |
| **No Solution** | ✗ | System is inconsistent |

---

## 🔬 The Math Behind RREF

### What is Reduced Row Echelon Form?

RREF is the canonical form of a matrix achieved through Gaussian Elimination. A matrix is in RREF when:

1. All leading coefficients (pivots) are **1**
2. Each pivot is the **only non-zero entry** in its column
3. Pivots move to the **right as you go down** rows
4. Rows of all zeros are at the **bottom**

### Elementary Row Operations

The algorithm uses three types of operations:

| Type | Notation | Operation |
|------|----------|-----------|
| **Type I** | E_ij | Swap rows i and j |
| **Type II** | E_i(α) | Multiply row i by non-zero scalar α |
| **Type III** | E_ij(α) | Add α times row j to row i |

### Example Transformation

```
Input (Augmented Matrix):          RREF Result:
┌                    ┐            ┌                    ┐
│  2   1  -1  │   8  │            │  1   0   0  │   2  │
│ -3  -1   2  │ -11  │     →      │  0   1   0  │   3  │
│ -2   1   2  │  -3  │            │  0   0   1  │  -1  │
└                    ┘            └                    ┘

Solution: x₁ = 2, x₂ = 3, x₃ = -1
```

---

## 📁 Project Structure

```
rref-calc/
├── docs/
│   └── ARCHITECTURE.md    # Detailed technical docs
├── public/
│   └── neo/               # Neo mascot images
├── src/
│   ├── lib/
│   │   ├── solver.ts      # ⭐ RREF algorithm
│   │   └── sounds.ts      # Audio effects
│   ├── App.tsx            # Main React component
│   ├── index.css          # Cyberpunk styles
│   └── main.tsx           # Entry point
├── package.json
└── README.md
```

### Core Files

| File | Lines | Purpose |
|------|-------|---------|
| `solver.ts` | ~400 | Gaussian Elimination with fraction arithmetic |
| `sounds.ts` | ~280 | Web Audio API sound synthesis |
| `App.tsx` | ~800 | React UI with state management |
| `index.css` | ~1700 | Complete cyberpunk design system |

---

## 🧪 Preset Examples

Click these presets to test different solution types:

| Preset | Matrix Size | Solution Type |
|--------|-------------|---------------|
| **Unique** | 3×4 | x₁ = 2, x₂ = 3, x₃ = -1 |
| **Infinite** | 3×5 | Free variables: x₂, x₄ |
| **No Solution** | 3×4 | Inconsistent system (0 = 5) |

---

## 📚 Additional Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed system design and data flow

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with 💚 by the Matrix
