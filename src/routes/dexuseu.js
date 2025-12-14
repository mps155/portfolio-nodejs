const express = require('express');
const router = express.Router();
const { queryDexUseuByDateRange } = require('../data');

router.get('/', async (req, res) => {
  try {
    const { start, end, dateField } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Query params start and end required, format mm-dd-yyyy' });
    }

    const re = /^\d{2}-\d{2}-\d{4}$/;
    if (!re.test(start) || !re.test(end)) {
      return res.status(400).json({ error: 'Invalid date format, use mm-dd-yyyy' });
    }

    const records = await queryDexUseuByDateRange(start, end, dateField || 'Date');
    return res.json(records);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

module.exports = router;
