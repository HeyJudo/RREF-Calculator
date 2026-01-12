/**
 * Core RREF (Reduced Row Echelon Form) Solver
 * Uses math.js Fraction arithmetic for 100% precision
 */

import { create, all, Fraction, MathJsStatic } from 'mathjs';

// Configure math.js to use Fractions by default
const math = create(all, {
    number: 'Fraction'
}) as MathJsStatic;

// Types
export type FractionValue = Fraction;

export interface Step {
    operation: string;
    matrix: string[][];
    highlightRows?: number[];
}

export type SolutionType =
    | 'unique'
    | 'infinite'
    | 'inconsistent';

export interface SolverResult {
    rref: string[][];
    steps: Step[];
    solutionType: SolutionType;
    solution: string[] | null;
    freeVariables: number[];
    rank: number;
}

/**
 * Convert a string or number to a math.js Fraction
 */
export function toFraction(value: string | number): Fraction {
    try {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '' || trimmed === '-') return math.fraction(0) as Fraction;
            // Handle fraction notation like "1/3"
            if (trimmed.includes('/')) {
                const [num, den] = trimmed.split('/');
                return math.fraction(parseInt(num), parseInt(den)) as Fraction;
            }
            return math.fraction(trimmed) as Fraction;
        }
        return math.fraction(value) as Fraction;
    } catch {
        return math.fraction(0) as Fraction;
    }
}

/**
 * Convert a Fraction to a display string
 */
export function fractionToString(frac: Fraction): string {
    const n = Number(frac.n);
    const d = Number(frac.d);
    const s = frac.s < 0 ? -1 : 1;

    if (n === 0) return '0';
    if (d === 1) return String(s * n);
    return `${s * n}/${d}`;
}

/**
 * Check if a fraction is zero
 */
function isZero(frac: Fraction): boolean {
    return Number(frac.n) === 0;
}

/**
 * Check if a fraction equals 1
 */
function isOne(frac: Fraction): boolean {
    return Number(frac.n) === Number(frac.d) && frac.s >= 0;
}

/**
 * Convert a number to subscript Unicode characters for notation like E₁₂
 */
function subscript(num: number): string {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return String(num).split('').map(d => subscripts[parseInt(d)] || d).join('');
}

/**
 * Convert fraction matrix to string matrix for display
 */
function matrixToStrings(matrix: Fraction[][]): string[][] {
    return matrix.map(row => row.map(cell => fractionToString(cell)));
}

/**
 * Main RREF Solver using Gaussian Elimination with back-substitution
 * 
 * IMPORTANT: This processes ALL columns to get the true RREF.
 * Solution analysis happens AFTER the RREF is computed.
 */
export function solveRREF(inputMatrix: string[][]): SolverResult {
    const rows = inputMatrix.length;
    const cols = inputMatrix[0].length;

    // Convert input strings to Fractions
    const matrix: Fraction[][] = inputMatrix.map(row =>
        row.map(cell => toFraction(cell))
    );

    const steps: Step[] = [];

    // Record initial state
    steps.push({
        operation: 'Initial augmented matrix',
        matrix: matrixToStrings(matrix)
    });

    let pivotRow = 0;
    const pivotColumns: number[] = []; // Track which columns have pivots

    // ═══════════════════════════════════════════════════════════════════════
    // GAUSSIAN ELIMINATION - Process ALL columns (not cols-1!)
    // ═══════════════════════════════════════════════════════════════════════
    for (let col = 0; col < cols && pivotRow < rows; col++) {
        // Find the best pivot (first non-zero in this column, at or below pivotRow)
        let maxRow = pivotRow;
        let foundPivot = false;

        for (let i = pivotRow; i < rows; i++) {
            if (!isZero(matrix[i][col])) {
                maxRow = i;
                foundPivot = true;
                break;
            }
        }

        if (!foundPivot) {
            // No pivot in this column, skip to next column
            continue;
        }

        pivotColumns.push(col);

        // Swap rows if necessary (Type I operation: E_ij)
        if (maxRow !== pivotRow) {
            [matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]];
            steps.push({
                operation: `[Type I] E${subscript(pivotRow + 1)}${subscript(maxRow + 1)} : Swap R${pivotRow + 1} ↔ R${maxRow + 1}`,
                matrix: matrixToStrings(matrix),
                highlightRows: [pivotRow, maxRow]
            });
        }

        // Scale pivot to 1 (Type II operation: E_i(α))
        const pivotVal = matrix[pivotRow][col];
        if (!isOne(pivotVal)) {
            const scalar = math.divide(1, pivotVal) as Fraction;
            for (let j = 0; j < cols; j++) {
                matrix[pivotRow][j] = math.multiply(matrix[pivotRow][j], scalar) as Fraction;
            }
            steps.push({
                operation: `[Type II] E${subscript(pivotRow + 1)}(${fractionToString(scalar)}) : Multiply R${pivotRow + 1} by ${fractionToString(scalar)}`,
                matrix: matrixToStrings(matrix),
                highlightRows: [pivotRow]
            });
        }

        // Eliminate in all other rows (Type III operation: E_ij(α))
        for (let i = 0; i < rows; i++) {
            if (i !== pivotRow && !isZero(matrix[i][col])) {
                const factor = matrix[i][col];
                const negFactor = math.multiply(factor, -1) as Fraction;
                for (let j = 0; j < cols; j++) {
                    const product = math.multiply(factor, matrix[pivotRow][j]) as Fraction;
                    matrix[i][j] = math.subtract(matrix[i][j], product) as Fraction;
                }
                steps.push({
                    operation: `[Type III] E${subscript(i + 1)}${subscript(pivotRow + 1)}(${fractionToString(negFactor)}) : R${i + 1} + (${fractionToString(negFactor)}) × R${pivotRow + 1}`,
                    matrix: matrixToStrings(matrix),
                    highlightRows: [i, pivotRow]
                });
            }
        }

        pivotRow++;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SOLUTION ANALYSIS - Interpret the RREF as a system of equations
    // We treat the LAST column as the augmented (constants) column
    // ═══════════════════════════════════════════════════════════════════════
    const numVariables = cols - 1; // Last column = constants (augmented)
    const rank = pivotColumns.filter(c => c < numVariables).length; // Only count pivots in coefficient columns

    // Check for inconsistency: row like [0 0 ... 0 | non-zero]
    // This means 0 = non-zero, which is impossible
    let isInconsistent = false;
    for (let i = 0; i < rows; i++) {
        let allZerosInCoeffs = true;
        for (let j = 0; j < numVariables; j++) {
            if (!isZero(matrix[i][j])) {
                allZerosInCoeffs = false;
                break;
            }
        }
        if (allZerosInCoeffs && !isZero(matrix[i][cols - 1])) {
            isInconsistent = true;
            break;
        }
    }

    let solutionType: SolutionType;
    let solution: string[] | null = null;
    const freeVariables: number[] = [];

    // Find free variables (coefficient columns without pivots)
    for (let j = 0; j < numVariables; j++) {
        if (!pivotColumns.includes(j)) {
            freeVariables.push(j);
        }
    }

    if (isInconsistent) {
        solutionType = 'inconsistent';
        steps.push({
            operation: '⚠ System is INCONSISTENT (0 = non-zero detected)',
            matrix: matrixToStrings(matrix)
        });
    } else if (rank < numVariables) {
        solutionType = 'infinite';

        steps.push({
            operation: `∞ Infinite solutions (Free variables: ${freeVariables.map(v => `x${subscript(v + 1)}`).join(', ')})`,
            matrix: matrixToStrings(matrix)
        });

        // Express solution in parametric form
        solution = [];
        for (let j = 0; j < numVariables; j++) {
            if (freeVariables.includes(j)) {
                solution.push(`x${subscript(j + 1)} = t${subscript(freeVariables.indexOf(j) + 1)} (free)`);
            } else {
                // Find the row where this is a pivot
                const pivotRowIdx = pivotColumns.indexOf(j);
                if (pivotRowIdx !== -1 && pivotRowIdx < rows) {
                    let expr = fractionToString(matrix[pivotRowIdx][cols - 1]);
                    // Subtract contributions from free variables
                    for (const fv of freeVariables) {
                        const coef = matrix[pivotRowIdx][fv];
                        if (!isZero(coef)) {
                            const negCoef = math.multiply(coef, -1) as Fraction;
                            const tVar = `t${subscript(freeVariables.indexOf(fv) + 1)}`;
                            const coefStr = fractionToString(math.abs(negCoef) as Fraction);

                            if (Number(negCoef.s) >= 0) {
                                // Positive coefficient
                                if (coefStr === '1') {
                                    expr += ` + ${tVar}`;
                                } else {
                                    expr += ` + ${coefStr}${tVar}`;
                                }
                            } else {
                                // Negative coefficient
                                if (coefStr === '1') {
                                    expr += ` - ${tVar}`;
                                } else {
                                    expr += ` - ${coefStr}${tVar}`;
                                }
                            }
                        }
                    }
                    solution.push(`x${subscript(j + 1)} = ${expr}`);
                }
            }
        }
    } else {
        solutionType = 'unique';
        solution = [];
        for (let i = 0; i < numVariables && i < rows; i++) {
            solution.push(`x${subscript(i + 1)} = ${fractionToString(matrix[i][cols - 1])}`);
        }

        steps.push({
            operation: '✓ Unique solution found',
            matrix: matrixToStrings(matrix)
        });
    }

    return {
        rref: matrixToStrings(matrix),
        steps,
        solutionType,
        solution,
        freeVariables,
        rank
    };
}
