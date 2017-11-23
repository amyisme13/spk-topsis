require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('./models/food');
const foods = require('./foods.json');

mongoose.Promise = global.Promise;
mongoose.connect(
    process.env.MONGODB_URI,
    {
        useMongoClient: true
    },
    err => {
        if (!err) {
            const promises = foods.map(food => {
                const f = new Food(food);
                return f.save();
            });

            Promise.all(promises).then(() => {
                mongoose.disconnect();
            });
        }
    }
);
