import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import { solveRREF, SolverResult } from './lib/solver';
import './index.css';

// Constants
const MIN_SIZE = 2;
const MAX_SIZE = 10;

function App() {
    // Matrix dimensions
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(4); // cols includes augmented column

    // Matrix values as strings for input handling
    const [matrix, setMatrix] = useState<string[][]>(() =>
        createEmptyMatrix(3, 4)
    );

    // Solver result
    const [result, setResult] = useState<SolverResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Refs for input navigation
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

    // Create empty matrix
    function createEmptyMatrix(r: number, c: number): string[][] {
        return Array(r).fill(null).map(() => Array(c).fill(''));
    }

    // Handle dimension change
    const handleDimensionChange = useCallback((type: 'rows' | 'cols', value: string) => {
        const num = parseInt(value) || MIN_SIZE;
        const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, num));

        if (type === 'rows') {
            setRows(clamped);
            setMatrix(prev => {
                const newMatrix = createEmptyMatrix(clamped, cols);
                // Preserve existing values
                for (let i = 0; i < Math.min(prev.length, clamped); i++) {
                    for (let j = 0; j < Math.min(prev[0].length, cols); j++) {
                        newMatrix[i][j] = prev[i][j];
                    }
                }
                return newMatrix;
            });
        } else {
            setCols(clamped);
            setMatrix(prev => {
                const newMatrix = createEmptyMatrix(rows, clamped);
                for (let i = 0; i < Math.min(prev.length, rows); i++) {
                    for (let j = 0; j < Math.min(prev[0].length, clamped); j++) {
                        newMatrix[i][j] = prev[i][j];
                    }
                }
                return newMatrix;
            });
        }
        setResult(null);
    }, [rows, cols]);

    // Handle cell value change
    const handleCellChange = useCallback((row: number, col: number, value: string) => {
        // Allow numbers, fractions (1/3), negative signs, and decimals
        const sanitized = value.replace(/[^0-9/.\-]/g, '');
        setMatrix(prev => {
            const newMatrix = prev.map(r => [...r]);
            newMatrix[row][col] = sanitized;
            return newMatrix;
        });
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
        let nextRow = row;
        let nextCol = col;

        switch (e.key) {
            case 'ArrowUp':
                nextRow = Math.max(0, row - 1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                nextRow = Math.min(rows - 1, row + 1);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if ((e.target as HTMLInputElement).selectionStart === 0) {
                    nextCol = Math.max(0, col - 1);
                    e.preventDefault();
                }
                break;
            case 'ArrowRight':
                if ((e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
                    nextCol = Math.min(cols - 1, col + 1);
                    e.preventDefault();
                }
                break;
            case 'Enter':
            case 'Tab':
                if (!e.shiftKey) {
                    if (col < cols - 1) {
                        nextCol = col + 1;
                    } else if (row < rows - 1) {
                        nextRow = row + 1;
                        nextCol = 0;
                    }
                } else {
                    if (col > 0) {
                        nextCol = col - 1;
                    } else if (row > 0) {
                        nextRow = row - 1;
                        nextCol = cols - 1;
                    }
                }
                if (e.key === 'Enter') e.preventDefault();
                break;
            default:
                return;
        }

        if (nextRow !== row || nextCol !== col) {
            inputRefs.current[nextRow]?.[nextCol]?.focus();
        }
    }, [rows, cols]);

    // Solve the matrix
    const handleSolve = useCallback(() => {
        setIsLoading(true);

        // Small delay for UX effect
        setTimeout(() => {
            try {
                const solverResult = solveRREF(matrix);
                setResult(solverResult);
            } catch (err) {
                console.error('Solver error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 500);
    }, [matrix]);

    // Reset
    const handleReset = useCallback(() => {
        setMatrix(createEmptyMatrix(rows, cols));
        setResult(null);
    }, [rows, cols]);

    // Initialize refs when dimensions change
    useEffect(() => {
        inputRefs.current = Array(rows).fill(null).map(() => Array(cols).fill(null));
    }, [rows, cols]);

    return (
        <div className="app-container">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-text">COMPUTING RREF...</div>
                    <div className="loading-bar"></div>
                </div>
            )}

            {/* Header */}
            <header className="header">
                <h1 className="header__title">RREF Calculator</h1>
                <p className="header__subtitle">
                    Gaussian Elimination → <span>Reduced Row Echelon Form</span>
                </p>
            </header>

            <main className="main-content">
                {/* Dimension Input Panel */}
                <section className="panel">
                    <div className="panel__header">
                        <span className="panel__indicator"></span>
                        <h2 className="panel__title">Matrix Configuration</h2>
                    </div>
                    <div className="panel__content">
                        <div className="dimension-controls">
                            <div className="dimension-input">
                                <label htmlFor="rows">Rows (m)</label>
                                <input
                                    id="rows"
                                    type="number"
                                    min={MIN_SIZE}
                                    max={MAX_SIZE}
                                    value={rows}
                                    onChange={(e) => handleDimensionChange('rows', e.target.value)}
                                />
                            </div>
                            <div className="dimension-input">
                                <label htmlFor="cols">Columns (n)</label>
                                <input
                                    id="cols"
                                    type="number"
                                    min={MIN_SIZE}
                                    max={MAX_SIZE}
                                    value={cols}
                                    onChange={(e) => handleDimensionChange('cols', e.target.value)}
                                />
                            </div>
                            <p className="dimension-info">
                                {rows} equations, {cols - 1} variables (augmented matrix: {rows}×{cols})
                            </p>
                        </div>
                    </div>
                </section>

                {/* Matrix Input Panel */}
                <section className="panel">
                    <div className="panel__header">
                        <span className="panel__indicator"></span>
                        <h2 className="panel__title">Input Matrix</h2>
                    </div>
                    <div className="panel__content">
                        <p className="text-dim" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                            Enter coefficients. Use fractions (e.g., 1/3) or decimals. Last column = constants.
                        </p>
                        <div className="matrix-wrapper">
                            <div className="matrix-grid">
                                {matrix.map((row, rowIdx) => (
                                    <div key={rowIdx} className="matrix-row">
                                        {row.map((cell, colIdx) => (
                                            <div
                                                key={colIdx}
                                                className={`matrix-cell ${colIdx === cols - 1 ? 'augmented' : ''}`}
                                            >
                                                <input
                                                    ref={(el) => {
                                                        if (!inputRefs.current[rowIdx]) {
                                                            inputRefs.current[rowIdx] = [];
                                                        }
                                                        inputRefs.current[rowIdx][colIdx] = el;
                                                    }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={cell}
                                                    onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                                    placeholder="0"
                                                    aria-label={`Row ${rowIdx + 1}, Column ${colIdx + 1}${colIdx === cols - 1 ? ' (constant)' : ''}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-primary" onClick={handleSolve}>
                                ▶ Execute RREF
                            </button>
                            <button className="btn btn-secondary" onClick={handleReset}>
                                ↻ Reset Matrix
                            </button>
                        </div>
                    </div>
                </section>

                {/* Results Panel */}
                {result && (
                    <>
                        {/* Solution Panel */}
                        <section className={`panel result-panel ${result.solutionType}`}>
                            <div className="panel__header">
                                <span className="panel__indicator"></span>
                                <h2 className="panel__title">Solution</h2>
                            </div>
                            <div className="panel__content">
                                <div className={`solution-badge ${result.solutionType}`}>
                                    {result.solutionType === 'unique' && '✓ UNIQUE SOLUTION'}
                                    {result.solutionType === 'infinite' && '∞ INFINITE SOLUTIONS'}
                                    {result.solutionType === 'inconsistent' && '✗ NO SOLUTION (INCONSISTENT)'}
                                </div>

                                {result.solution && result.solutionType !== 'inconsistent' && (
                                    <ul className="solution-list">
                                        {result.solution.map((sol, idx) => {
                                            const parts = sol.split(' = ');
                                            return (
                                                <li key={idx} className="solution-item">
                                                    <span className="var">{parts[0]}</span>
                                                    <span>=</span>
                                                    <span className="val">{parts[1]}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {result.solutionType === 'inconsistent' && (
                                    <p className="text-dim mt-md">
                                        The system has no solution because it contains a contradiction (0 = non-zero).
                                    </p>
                                )}

                                <p className="text-dim mt-lg" style={{ fontSize: '0.75rem' }}>
                                    Rank: {result.rank} |
                                    {result.freeVariables.length > 0 &&
                                        ` Free variables: ${result.freeVariables.map(v => `x${v + 1}`).join(', ')}`
                                    }
                                </p>
                            </div>
                        </section>

                        {/* Steps Panel */}
                        <section className="panel">
                            <div className="panel__header">
                                <span className="panel__indicator"></span>
                                <h2 className="panel__title">Step-by-Step Operations</h2>
                            </div>
                            <div className="panel__content">
                                <div className="steps-container">
                                    {result.steps.map((step, idx) => (
                                        <div
                                            key={idx}
                                            className="step"
                                            style={{ animationDelay: `${idx * 0.05}s` }}
                                        >
                                            <div className="step__number">{idx + 1}</div>
                                            <div className="step__content">
                                                <div className="step__operation">{step.operation}</div>
                                                <div className="step__matrix">
                                                    {step.matrix.map((row, rIdx) => (
                                                        <div key={rIdx} className="step__matrix-row">
                                                            {row.map((cell, cIdx) => (
                                                                <span
                                                                    key={cIdx}
                                                                    className={`step__matrix-cell ${step.highlightRows?.includes(rIdx) ? 'highlighted' : ''
                                                                        } ${cIdx === row.length - 1 ? 'augmented' : ''}`}
                                                                >
                                                                    {cell}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
