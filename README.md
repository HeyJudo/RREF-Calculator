# 🧮 RREF Calculator

A modern, cyberpunk-themed **Reduced Row Echelon Form (RREF) Calculator** that transforms augmented matrices using Gaussian Elimination with step-by-step visualization.

🌐 **Live Demo:** [rref-calculator.vercel.app](https://rref-calculator.vercel.app)

![Matrix Theme](https://img.shields.io/badge/Theme-Matrix%20Cyberpunk-00ff41?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## ✨ Features

- 📊 **Interactive Matrix Input** - Enter coefficients with support for fractions (e.g., `1/3`) and decimals
- 🎬 **Step-by-Step Animation** - Watch the RREF transformation with playback controls
- 🔊 **Cyberpunk Sound Effects** - Immersive audio feedback (toggleable)
- 📋 **Copy to Clipboard** - Export your final RREF matrix as text
- 🎲 **Random Matrix Generator** - Generate practice problems instantly
- 📱 **Responsive Design** - Works on desktop and mobile
- 🤖 **Neo Mascot** - Pixel art guide character

---

## 🚀 Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rref-calc.git

# Navigate to project directory
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

### Project Structure

```
rref-calc/
├── public/
│   ├── neo/           # Neo mascot images
│   └── favicon.png    # Custom favicon
├── src/
│   ├── lib/
│   │   ├── solver.ts  # RREF algorithm
│   │   └── sounds.ts  # Audio effects
│   ├── App.tsx        # Main component
│   ├── index.css      # All styles
│   └── main.tsx       # Entry point
└── index.html
```

---

## 📖 How It Works

1. **Input**: Enter your augmented matrix (last column = constants)
2. **Execute**: Click "Execute RREF" to solve
3. **View Solution**: See the solution type (unique, infinite, or no solution)
4. **Animate**: Watch the step-by-step row operations
5. **Copy**: Export the final matrix to clipboard

### Solution Types

| Type | Description |
|------|-------------|
| ✓ **Unique** | Exactly one solution exists |
| ∞ **Infinite** | Infinitely many solutions (free variables) |
| ✗ **No Solution** | System is inconsistent |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with 💚 by the Matrix
