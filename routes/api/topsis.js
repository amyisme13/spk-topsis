const express = require('express');
const { check, validationResult } = require('express-validator/check');

const router = express.Router();

const Food = require('../../models/food');
const topsisUtil = require('../../util/topsis');

router.post(
    '/',
    [
        check('price', 'Kolom harga harus dalam range [0,1]')
            .exists()
            .custom(value => value >= 0 && value <= 1),
        check('calories', 'Kolom kalori harus dalam range [0,1]')
            .exists()
            .custom(value => value >= 0 && value <= 1),
        check('fat', 'Kolom lemak harus dalam range [0,1]')
            .exists()
            .custom(value => value >= 0 && value <= 1),
        check('carbohydrate', 'Kolom karbohidrat harus dalam range [0,1]')
            .exists()
            .custom(value => value >= 0 && value <= 1),
        check('protein', 'Kolom protein harus dalam range [0,1]')
            .exists()
            .custom(value => value >= 0 && value <= 1)
            .custom((value, { req }) => {
                const total =
                    parseFloat(req.body.price) +
                    parseFloat(req.body.calories) +
                    parseFloat(req.body.fat) +
                    parseFloat(req.body.carbohydrate) +
                    parseFloat(req.body.protein);

                return total !== 0;
            })
            .withMessage('Minimal ada 1 kolom yang tidak bernilai 0')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        try {
            const foods = await Food.find({}).exec();
            if (foods.length === 0) {
                throw new Error('No food in database');
            }

            const matrix = foods.map(food => [
                food.price,
                food.calories,
                food.fat,
                food.carbohydrate,
                food.protein
            ]);
            const weights = [
                req.body.price,
                req.body.calories,
                req.body.fat,
                req.body.carbohydrate,
                req.body.protein
            ];

            const results = topsisUtil.topsis(matrix, weights);
            const combinedResults = foods
                .map((food, i) => {
                    return {
                        name: food.name,
                        result: results[i]
                    };
                })
                .sort((x, y) => {
                    return y.result - x.result;
                })
                .slice(0, 10);
            res.json(combinedResults);
        } catch (err) {
            res.send(500, { err: err.message });
        }
    }
);

router.post('/steps/1', [check('initialData').exists()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    const initialData = req.body.initialData;

    const matrix = initialData.map(data => {
        return [
            data.price,
            data.calories,
            data.fat,
            data.carbohydrate,
            data.protein
        ];
    });
    const normalizedMatrix = topsisUtil.normalizeMatrix(matrix);

    const normalizedData = initialData.map((data, i) => {
        data.price = normalizedMatrix[i][0];
        data.calories = normalizedMatrix[i][1];
        data.fat = normalizedMatrix[i][2];
        data.carbohydrate = normalizedMatrix[i][3];
        data.protein = normalizedMatrix[i][4];
        return data;
    });

    res.json(normalizedData);
});

router.post(
    '/steps/2',
    [check('weights').exists(), check('normalizedData').exists()],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        const weights = req.body.weights;
        const normalizedData = req.body.normalizedData;

        const weightsVector = [
            weights.price,
            weights.calories,
            weights.fat,
            weights.carbohydrate,
            weights.protein
        ];
        const normalizedMatrix = normalizedData.map(data => {
            return [
                data.price,
                data.calories,
                data.fat,
                data.carbohydrate,
                data.protein
            ];
        });

        const weightedMatrix = topsisUtil.weightNormalizedMatrix(
            weightsVector,
            normalizedMatrix
        );

        const weightedData = normalizedData.map((data, i) => {
            data.price = weightedMatrix[i][0];
            data.calories = weightedMatrix[i][1];
            data.fat = weightedMatrix[i][2];
            data.carbohydrate = weightedMatrix[i][3];
            data.protein = weightedMatrix[i][4];
            return data;
        });

        res.json(weightedData);
    }
);

router.post('/steps/3', [check('weightedData').exists()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    const weightedData = req.body.weightedData;

    const weightedMatrix = weightedData.map(data => {
        return [
            data.price,
            data.calories,
            data.fat,
            data.carbohydrate,
            data.protein
        ];
    });

    const idealSolutions = topsisUtil.determineIdealSolution(weightedMatrix);

    res.json(idealSolutions);

    // const separationMeasures = topsisUtil.calculateSeparationMeasure(
    //     idealSolutions,
    //     weightedNormalizedMatrix
    // );

    // const relativeCloseness = topsisUtil.calculateRelativeCloseness(
    //     separationMeasures
    // );

    // return relativeCloseness;
});

router.post(
    '/steps/4',
    [check('idealSolutions').exists(), check('weightedData').exists()],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        const idealSolutions = req.body.idealSolutions;
        const weightedData = req.body.weightedData;

        const weightedMatrix = weightedData.map(data => {
            return [
                data.price,
                data.calories,
                data.fat,
                data.carbohydrate,
                data.protein
            ];
        });

        const separationMeasures = topsisUtil.calculateSeparationMeasure(
            idealSolutions,
            weightedMatrix
        );

        res.json(separationMeasures);

        // const relativeCloseness = topsisUtil.calculateRelativeCloseness(
        //     separationMeasures
        // );

        // return relativeCloseness;
    }
);

router.post('/steps/5', [check('separationMeasures').exists()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    const separationMeasures = req.body.separationMeasures;

    const relativeCloseness = topsisUtil.calculateRelativeCloseness(
        separationMeasures
    );

    res.json(relativeCloseness);
});

module.exports = router;
