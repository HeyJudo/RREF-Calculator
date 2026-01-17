/**
 * @fileoverview Core RREF (Reduced Row Echelon Form) Solver Module
 * 
 * This module implements Gaussian Elimination with back-substitution to transform
 * an augmented matrix into Reduced Row Echelon Form. It uses math.js Fraction
 * arithmetic to maintain 100% precision (no floating-point errors).
 * 
 * ## Algorithm Overview
 * The solver performs three types of elementary row operations:
 * - **Type I (E_ij)**: Swap two rows
 * - **Type II (E_i(α))**: Multiply a row by a non-zero scalar
 * - **Type III (E_ij(α))**: Add a scalar multiple of one row to another
 * 
 * ## Mathematical Background
 * RREF is the canonical form of a matrix where:
 * 1. All leading coefficients (pivots) are 1
 * 2. Each pivot is the only non-zero entry in its column
 * 3. Pivots move to the right as you go down rows
 * 4. Rows of all zeros are at the bottom
 * 
 * @author RREF Calculator Team
 * @version 1.0.0
 */

import { create, all, Fraction, MathJsStatic } from 'mathjs';

/**
 * Configure math.js to use exact Fraction arithmetic by default.
 * This prevents floating-point precision errors in calculations.
 */
const math = create(all, {
    number: 'Fraction'
}) as MathJsStatic;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Alias for math.js Fraction type for cleaner code.
 * Represents an exact rational number (numerator/denominator).
 */
export type FractionValue = Fraction;

/**
 * Represents a single step in the RREF transformation process.
 * Each step captures the matrix state after an elementary row operation.
 * 
 * @interface Step
 * @property {string} operation - Human-readable description of the operation performed
 * @property {string[][]} matrix - The matrix state after this operation (as display strings)
 * @property {number[]} [highlightRows] - Optional row indices to highlight in the UI
 */
export interface Step {
    operation: string;
    matrix: string[][];
    highlightRows?: number[];
}

/**
 * Categorizes the solution type of a linear system.
 * 
 * - `unique`: System has exactly one solution (rank = number of variables)
 * - `infinite`: System has infinitely many solutions (free variables exist)
 * - `inconsistent`: System has no solution (contains contradiction like 0 = 5)
 */
export type SolutionType =
    | 'unique'
    | 'infinite'
    | 'inconsistent';

/**
 * Complete result object returned by the RREF solver.
 * Contains the final matrix, all transformation steps, and solution analysis.
 * 
 * @interface SolverResult
 * @property {string[][]} rref - The final Reduced Row Echelon Form matrix
 * @property {Step[]} steps - Array of all steps taken during transformation
 * @property {SolutionType} solutionType - Classification of the solution
 * @property {string[] | null} solution - The solution values (null if inconsistent)
 * @property {number[]} freeVariables - Column indices of free variables (for infinite solutions)
 * @property {number} rank - The rank of the coefficient matrix
 */
export interface SolverResult {
    rref: string[][];
    steps: Step[];
    solutionType: SolutionType;
    solution: string[] | null;
    freeVariables: number[];
    rank: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRACTION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts a string or number to a math.js Fraction for precise arithmetic.
 * 
 * This function handles multiple input formats:
 * - Integers: "5", "-3", 42
 * - Decimals: "0.5", "3.14"
 * - Fractions: "1/3", "-2/5"
 * - Empty/invalid: defaults to 0
 * 
 * @param {string | number} value - The value to convert to a Fraction
 * @returns {Fraction} A math.js Fraction representing the exact value
 * @throws Never throws - invalid inputs return Fraction(0)
 * 
 * @example
 * toFraction("1/3")  // Returns Fraction with n=1, d=3
 * toFraction(0.5)    // Returns Fraction with n=1, d=2
 * toFraction("")     // Returns Fraction(0)
 */
export function toFraction(value: string | number): Fraction {
    try {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            // Handle empty or incomplete input
            if (trimmed === '' || trimmed === '-') return math.fraction(0) as Fraction;

            // Handle explicit fraction notation (e.g., "1/3", "-2/5")
            if (trimmed.includes('/')) {
                const [num, den] = trimmed.split('/');
                return math.fraction(parseInt(num), parseInt(den)) as Fraction;
            }

            // Handle integers and decimals
            return math.fraction(trimmed) as Fraction;
        }
        return math.fraction(value) as Fraction;
    } catch {
        // Fallback for any parsing errors
        return math.fraction(0) as Fraction;
    }
}

/**
 * Converts a math.js Fraction to a human-readable display string.
 * 
 * Output formats:
 * - Zero: "0"
 * - Integer: "5", "-3"
 * - Fraction: "1/3", "-2/5"
 * 
 * @param {Fraction} frac - The Fraction to convert to a string
 * @returns {string} The display string representation
 * 
 * @example
 * fractionToString(Fraction(1, 3))  // Returns "1/3"
 * fractionToString(Fraction(-6, 2)) // Returns "-3" (simplified)
 * fractionToString(Fraction(0))     // Returns "0"
 */
export function fractionToString(frac: Fraction): string {
    const n = Number(frac.n);  // Numerator (always positive)
    const d = Number(frac.d);  // Denominator (always positive)
    const s = frac.s < 0 ? -1 : 1;  // Sign (-1 or 1)

    if (n === 0) return '0';
    if (d === 1) return String(s * n);  // Integer result
    return `${s * n}/${d}`;  // Fraction result
}

/**
 * Checks if a Fraction is equal to zero.
 * Used to identify zero elements during pivot selection.
 * 
 * @param {Fraction} frac - The Fraction to check
 * @returns {boolean} True if the fraction equals zero
 */
function isZero(frac: Fraction): boolean {
    return Number(frac.n) === 0;
}

/**
 * Checks if a Fraction equals 1 (positive one).
 * Used to determine if a pivot needs to be normalized.
 * 
 * @param {Fraction} frac - The Fraction to check
 * @returns {boolean} True if the fraction equals +1
 */
function isOne(frac: Fraction): boolean {
    // Fraction equals 1 when numerator = denominator and sign is positive
    return Number(frac.n) === Number(frac.d) && frac.s >= 0;
}

/**
 * Converts a number to subscript Unicode characters for mathematical notation.
 * Used to format row operation labels like E₁₂ (swap rows 1 and 2).
 * 
 * @param {number} num - The number to convert (0-9 digits only)
 * @returns {string} The number in subscript form (e.g., 12 → "₁₂")
 * 
 * @example
 * subscript(1)  // Returns "₁"
 * subscript(23) // Returns "₂₃"
 */
function subscript(num: number): string {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return String(num).split('').map(d => subscripts[parseInt(d)] || d).join('');
}

/**
 * Converts a matrix of Fractions to a matrix of display strings.
 * Used to create the visual representation of matrix states for each step.
 * 
 * @param {Fraction[][]} matrix - The matrix of exact Fraction values
 * @returns {string[][]} The matrix with each cell as a formatted string
 */
function matrixToStrings(matrix: Fraction[][]): string[][] {
    return matrix.map(row => row.map(cell => fractionToString(cell)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main RREF Solver using Gaussian Elimination with back-substitution.
 * 
 * ## Algorithm Steps
 * 1. **Parse Input**: Convert string matrix to exact Fraction arithmetic
 * 2. **Forward Elimination**: For each column (left to right):
 *    - Find a pivot (first non-zero element in column at/below current row)
 *    - Swap rows if needed (Type I operation)
 *    - Scale pivot to 1 (Type II operation)
 *    - Eliminate all other entries in column (Type III operation)
 * 3. **Solution Analysis**: After RREF is complete:
 *    - Check for inconsistency (row of zeros equals non-zero)
 *    - Identify free variables (columns without pivots)
 *    - Classify as unique, infinite, or inconsistent
 * 
 * ## Elementary Row Operations
 * - **Type I (E_ij)**: Swap rows i and j
 * - **Type II (E_i(α))**: Multiply row i by scalar α (α ≠ 0)
 * - **Type III (E_ij(α))**: Add α times row j to row i
 * 
 * @param {string[][]} inputMatrix - The augmented matrix as strings (last column = constants)
 * @returns {SolverResult} Complete solution with RREF, steps, solution type, and values
 * 
 * @example
 * // Solve system: 2x + y = 8, -3x - y = -11, -2x + y = -3
 * solveRREF([
 *   ['2', '1', '8'],
 *   ['-3', '-1', '-11'],
 *   ['-2', '1', '-3']
 * ]);
 * // Returns: { solutionType: 'unique', solution: ['x₁ = 2', 'x₂ = 3'], ... }
 */
export function solveRREF(inputMatrix: string[][]): SolverResult {
    const rows = inputMatrix.length;
    const cols = inputMatrix[0].length;

    // STEP 1: Convert input strings to Fractions for exact arithmetic
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
