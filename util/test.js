const topsis = require('./topsis');

// const matrix = [
//     [2, 5, 1, 6, 8],
//     [4, 7, 1, 5, 3],
//     [5, 9, 4, 2, 1],
//     [8, 3, 7, 2, 7],
//     [6, 8, 3, 3, 5]
// ];
// const weights = [1, 0.2, 0, 0.8, 0.4];

const matrix = [[3, 4, 1], [2, 7, 3]];
const weights = [1, 0.25, 0.5];

console.time();

const normalizedMatrix = topsis.normalizeMatrix(matrix);
console.log('Normalized Matrix:\n', normalizedMatrix);

const weightedNormalizedMatrix = topsis.weightNormalizedMatrix(
    weights,
    normalizedMatrix
);
console.log('Weighted Normalized Matrix:\n', weightedNormalizedMatrix);

const idealSolutions = topsis.determineIdealSolution(weightedNormalizedMatrix);
console.log('Pos-ideal & Neg-ideal Solution:\n', idealSolutions);

const separationMeasures = topsis.calculateSeparationMeasure(
    idealSolutions,
    weightedNormalizedMatrix
);
console.log('Separation Measures:\n', separationMeasures);

const relativeCloseness = topsis.calculateRelativeCloseness(separationMeasures);
console.log('Relative Closeness:\n', relativeCloseness);

const results = matrix
    .map((vector, i) => {
        return {
            alternative: vector,
            result: relativeCloseness[i]
        };
    })
    .sort((x, y) => {
        return y.result - x.result;
    });
console.log('Results:\n', results);

console.timeEnd();
