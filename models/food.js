const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    fat: {
        type: Number,
        required: true
    },
    carbohydrate: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        required: true
    },


    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    deletedAt: Date
});

foodSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

foodSchema.pre('find', function(next) {
    if (!this.options.withDeleted) {
        this.where({ deletedAt: { $exists: false } });
    }
    next();
});

foodSchema.pre('findOne', function(next) {
    if (!this.options.withDeleted) {
        this.where({ deletedAt: { $exists: false } });
    }
    next();
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
