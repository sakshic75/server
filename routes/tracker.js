const express = require('express');
const router = express.Router();

const Tracker = require('../models/tracker');

router.delete('/:trackerId', async (req, res) => {
    try {
        const deletedTracker = await Tracker.findOneAndDelete({
            _id: req.params.trackerId,
        });

        res.send(deletedTracker);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
