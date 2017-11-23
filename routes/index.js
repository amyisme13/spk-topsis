const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Dashboard',
        page: 'dashboard'
    });
});

router.get('/foods', (req, res) => {
    res.render('foods', {
        title: 'Daftar Makanan',
        page: 'foods',
    });
});

router.get('/steps', (req, res) => {
    res.render('steps', {
        title: 'Langkah-Langkah',
        page: 'steps',
    });
});

module.exports = router;
