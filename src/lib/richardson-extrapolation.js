export const DEFAULT_FACTOR_OF_SAFETY = 1.25;
export const DEFAULT_MAX_ITERATIONS = 10000;
export const DEFAULT_TOLERANCE = 1e-10;

function ensureFiniteNumber(value, label) {
	if (!Number.isFinite(value)) {
		throw new Error(`${label} must be a finite number.`);
	}
}

function ensurePositiveNumber(value, label) {
	ensureFiniteNumber(value, label);
	if (value <= 0) {
		throw new Error(`${label} must be greater than zero.`);
	}
}

function ensureStrictlyDescending(values, label) {
	for (let index = 1; index < values.length; index += 1) {
		if (values[index - 1] <= values[index]) {
			throw new Error(`${label} must decrease from coarsest to finest mesh.`);
		}
	}
}

function ensureDistinctChange(delta, label) {
	if (Math.abs(delta) <= Number.EPSILON) {
		throw new Error(`${label} must change between meshes to estimate convergence.`);
	}
}

/**
 * @typedef {Object} RichardsonInput
 * @property {number[]} meshSizes - Exactly three mesh sizes in descending order.
 * @property {number[]} resultValues - Exactly three result values corresponding to the mesh sizes.
 * @property {number} [factorOfSafety=1.25] - The factor of safety for GCI calculation.
 * @property {number} [maxIterations=10000] - Maximum iterations for fixed-point convergence.
 * @property {number} [tolerance=1e-10] - Convergence tolerance for the order of convergence.
 */

/**
 * @typedef {Object} RichardsonResults
 * @property {number} extrapolatedValue - The estimated continuum value.
 * @property {number} lowerBound - 95% confidence interval lower bound.
 * @property {number} upperBound - 95% confidence interval upper bound.
 * @property {number} orderOfConvergence - The calculated order of convergence (p).
 * @property {number} convergenceCheck - The asymptotic range check value.
 * @property {{ r12: number, r23: number }} refinementRatios - The calculated mesh refinement ratios.
 * @property {{ gci12: number, gci23: number }} gridConvergenceIndex - The calculated Grid Convergence Indices.
 * @property {number} iterations - Number of iterations used for convergence.
 * @property {number} factorOfSafety - The factor of safety used.
 * @property {string[]} warnings - Any warning messages generated during calculation.
 */

/**
 * Calculates the Richardson extrapolation and Grid Convergence Index.
 * 
 * @param {RichardsonInput} [options={}]
 * @returns {RichardsonResults}
 */
export function calculateRichardsonExtrapolation({
	meshSizes,
	resultValues,
	factorOfSafety = DEFAULT_FACTOR_OF_SAFETY,
	maxIterations = DEFAULT_MAX_ITERATIONS,
	tolerance = DEFAULT_TOLERANCE,
} = {}) {
	if (!Array.isArray(meshSizes) || meshSizes.length !== 3) {
		throw new Error('Provide exactly three mesh sizes.');
	}

	if (!Array.isArray(resultValues) || resultValues.length !== 3) {
		throw new Error('Provide exactly three result values.');
	}

	meshSizes.forEach((value, index) => ensurePositiveNumber(value, `Mesh size ${index + 1}`));
	resultValues.forEach((value, index) => ensureFiniteNumber(value, `Result value ${index + 1}`));
	ensureStrictlyDescending(meshSizes, 'Element edge lengths');

	const [value1, value2, value3] = resultValues;
	const [length1, length2, length3] = meshSizes;

	if (Math.abs(value2) <= Number.EPSILON || Math.abs(value3) <= Number.EPSILON) {
		throw new Error('Medium and finest mesh results must be non-zero for the GCI calculation.');
	}

	const r12 = length1 / length2;
	const r23 = length2 / length3;

	if (r12 <= 1 || r23 <= 1) {
		throw new Error('Each mesh must be finer than the one before it.');
	}

	const df12 = value1 - value2;
	const df23 = value2 - value3;

	ensureDistinctChange(df12, 'The coarse-to-medium result');
	ensureDistinctChange(df23, 'The medium-to-fine result');

	const ratio = df12 / df23;

	if (!Number.isFinite(ratio) || Math.abs(ratio) <= Number.EPSILON) {
		throw new Error('The change between mesh levels is too small to estimate the order of convergence.');
	}

	let qp = 0;
	let iteration = 0;
	let p = 0;
	let gci12 = 0;
	let gci23 = 0;
	let convergenceCheck = 0;
	let extrapolatedValue = 0;
	let lowerBound = 0;
	let upperBound = 0;

	while (iteration < maxIterations) {
		p = Math.abs((Math.log(Math.abs(ratio)) + qp) / Math.log(r23));

		if (!Number.isFinite(p) || p <= 0) {
			throw new Error('The calculated order of convergence is not valid for these inputs.');
		}

		const sign = ratio < 0 ? -1 : 1;
		const denominator12 = (r12 ** p) - 1;
		const denominator23 = (r23 ** p) - 1;

		if (Math.abs(denominator12) <= Number.EPSILON || Math.abs(denominator23) <= Number.EPSILON) {
			throw new Error('The refinement ratios are too small to perform Richardson extrapolation.');
		}

		gci12 = factorOfSafety * (Math.abs((value1 - value2) / value2) / denominator12);
		gci23 = factorOfSafety * (Math.abs((value2 - value3) / value3) / denominator23);

		if (!Number.isFinite(gci12) || !Number.isFinite(gci23)) {
			throw new Error('The grid convergence index could not be computed from these inputs.');
		}

		convergenceCheck = gci12 / ((r23 ** p) * gci23);
		extrapolatedValue = ((r23 ** p) * value3 - value2) / ((r23 ** p) - 1);

		const intervalA = value3 * (1 - gci23);
		const intervalB = value3 * (1 + gci23);
		lowerBound = Math.min(intervalA, intervalB);
		upperBound = Math.max(intervalA, intervalB);

		const qpActual = Math.log((((r23 ** p) - sign) / ((r12 ** p) - sign)));

		if (!Number.isFinite(qpActual)) {
			throw new Error('The extrapolation iteration diverged for this mesh sequence.');
		}

		if (Math.abs(qp - qpActual) <= tolerance) {
			const warnings = [];

			if (Math.min(r12, r23) < 1.3) {
				warnings.push('The refinement factor between meshes is below 1.3, so the extrapolation may be less reliable.');
			}

			if (convergenceCheck < 0.9 || convergenceCheck > 1.1) {
				warnings.push('The convergence check is not close to 1.0, which suggests the solution may not yet be in the asymptotic range.');
			}

			if (ratio < 0) {
				warnings.push('Oscillatory convergence was detected because successive mesh differences change sign.');
			}

			return {
				extrapolatedValue,
				lowerBound,
				upperBound,
				orderOfConvergence: p,
				convergenceCheck,
				refinementRatios: {
					r12,
					r23,
				},
				gridConvergenceIndex: {
					gci12,
					gci23,
				},
				iterations: iteration + 1,
				factorOfSafety,
				warnings,
			};
		}

		qp = qpActual;
		iteration += 1;
	}

	throw new Error('The Richardson extrapolation iteration did not converge.');
}
