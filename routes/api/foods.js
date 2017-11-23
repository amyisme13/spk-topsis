const express = require('express');
const router = express.Router();

const Food = require('../../models/food');

router.get('/', async (req, res) => {
    try {
        console.log('test');
        const foods = await Food.find().exec();
        console.log('test2');
        res.json(foods);
    } catch (err) {
        console.log('test3');
        res.send(500, { err: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            throw new Error(`Food with id ${req.params.id} not found`);
        }

        res.json(food);
    } catch (err) {
        res.send(500, { err: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const food = new Food(req.body);
        await food.save();

        res.json(food);
    } catch (err) {
        res.send(500, { err: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            throw new Error(`Food with id ${req.params.id} not found`);
        }

        Object.keys(req.body).forEach(key => {
            food[key] = req.body[key];
        });
        await food.save();

        res.json(food);
    } catch (err) {
        res.send(500, { err: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        food.deletedAt = new Date();
        await food.save();

        res.json(food);
    } catch (err) {
        res.send(500, { err: err.message });
    }
});

module.exports = router;
