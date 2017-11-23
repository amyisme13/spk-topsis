module.exports = {
    /**
     * Create a matrix with x rows and y columns
     *
     * @param {Number} x - number of rows
     * @param {Number} y - number of columns
     * @return {Array[]}
     */
    createMatrix(x, y) {
        const rows = [];
        for (let i = 0; i < x; i++) {
            rows.push(Array(y));
        }
        return rows;
    },

    /**
     * Normalized an alternative-criteria matrix using this function
     * r(i, j) = x[i][j] / sqrt(x[i][j]^2 + x[i+1][j]^2  + ... + x[m][j]^2)
     * x = alternative-criteria matrix
     * i = 1, 2, ..., m
     * j = 1, 2, ..., n
     *
     * @param {Number[][]} matrix - alternative-criteria matrix
     * @returns {Number[][]}
     */
    normalizeMatrix(matrix) {
        const m = matrix.length;
        const n = matrix[0].length;

        const normalizedMatrix = this.createMatrix(m, n);

        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < m; k++) {
                sum += Math.pow(matrix[k][j], 2);
            }

            for (let i = 0; i < m; i++) {
                normalizedMatrix[i][j] = matrix[i][j] / Math.sqrt(sum);
            }
        }

        return normalizedMatrix;
    },

    /**
     * Weight the normalized alternative-criteria matrix using this function
     * y(i, j) = w[j] * x[i][j]
     * w = weights vector
     * x = normalized alternative-criteria matrix
     * i = 1, 2, ..., m
     * j = 1, 2, ..., n
     *
     * @param {Number[]} weights - vector of weight for each criteria
     * @param {Number[][]} matrix - normalized alternative-criteria matrix
     */
    weightNormalizedMatrix(weights, matrix) {
        const m = matrix.length;
        const n = matrix[0].length;

        const weightedNormalizedMatrix = this.createMatrix(m, n);

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                weightedNormalizedMatrix[i][j] = weights[j] * matrix[i][j];
            }
        }

        return weightedNormalizedMatrix;
    },

    /**
     * Determine both positive-ideal and negative-ideal solution
     * by finding the maximum and minimum value in each criteria
     *
     * @param {Number[][]} matrix - weighted & normalized alternative criteria matrix
     * @returns {Object[]}
     */
    determineIdealSolution(matrix) {
        const m = matrix.length;
        const n = matrix[0].length;

        const idealSolutions = [];

        for (let j = 0; j < n; j++) {
            const solution = {
                values: [],
                positive: matrix[0][j],
                negative: matrix[0][j]
            };

            for (let i = 0; i < m; i++) {
                solution.values.push(matrix[i][j]);

                if (matrix[i][j] > solution.positive) {
                    solution.positive = matrix[i][j];
                }
                if (matrix[i][j] < solution.negative) {
                    solution.negative = matrix[i][j];
                }
            }

            idealSolutions.push(solution);
        }

        return idealSolutions;
    },

    /**
     * Calculate separation measure for each alternative using this function
     * D+(i) = sqrt((A+[j] - x[i][j])^2 + ... + (A+[n] - x[i][n])^2)
     * D-(i) = sqrt((A-[j] - x[i][j])^2 + ... + (A+[n] - x[i][n])^2)
     * x = weighted & normalized alternative-criteria matrix
     * A+/A- = positive/negative ideal solutions vector
     * i = 1, 2, ..., m
     * j = 1, 2, ..., n
     *
     * @param {Object[]} solutions - object of ideal solutions, both positive and negative
     * @param {Number[][]} matrix - weighted & normalized alternative criteria matrix
     * @returns {Object[]}
     */
    calculateSeparationMeasure(solutions, matrix) {
        const m = matrix.length;
        const n = matrix[0].length;

        const separationMeasures = [];

        for (let i = 0; i < m; i++) {
            const separationMeasure = {
                positive: 0,
                negative: 0
            };

            let sumPos = 0;
            let sumNeg = 0;
            for (let j = 0; j < n; j++) {
                sumPos += Math.pow(solutions[j].positive - matrix[i][j], 2);
                sumNeg += Math.pow(solutions[j].negative - matrix[i][j], 2);
            }

            separationMeasure.positive = Math.sqrt(sumPos);
            separationMeasure.negative = Math.sqrt(sumNeg);

            separationMeasures.push(separationMeasure);
        }

        return separationMeasures;
    },

    /**
     * Calculate relative closeness to ideal value using this function
     * V(i) = D-[i] / (D-[i] * D+[i])
     * i = 1, 2, ..., m
     *
     * @param {Object[]} separationMeasures - object of separation measures, both positive and negative
     * @returns {Number[]}
     */
    calculateRelativeCloseness(separationMeasures) {
        const relativeCloseness = [];

        separationMeasures.forEach(sm => {
            relativeCloseness.push(sm.negative / (sm.negative + sm.positive));
        });

        return relativeCloseness;
    },

    /**
     * TOPSIS Algorithm
     *
     * @param {Number[][]} matrix - alternative-criteria matrix
     * @param {Number[]} weights - vector of weight for each criteria
     */
    topsis(matrix, weights) {
        const normalizedMatrix = this.normalizeMatrix(matrix);

        const weightedNormalizedMatrix = this.weightNormalizedMatrix(
            weights,
            normalizedMatrix
        );

        const idealSolutions = this.determineIdealSolution(
            weightedNormalizedMatrix
        );

        const separationMeasures = this.calculateSeparationMeasure(
            idealSolutions,
            weightedNormalizedMatrix
        );

        const relativeCloseness = this.calculateRelativeCloseness(
            separationMeasures
        );

        return relativeCloseness;
    }
};
