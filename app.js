require('dotenv').config();
const express = require('express');
const axios = require('axios');
const next = require('next');

const PAYMO_API_KEY = process.env.PAYMO_API_KEY;
if (!PAYMO_API_KEY) {
  console.error('PAYMO_API_KEY not defined in environment');
  process.exit(1);
}

const paymo = axios.create({
  baseURL: 'https://app.paymoapp.com/api',
  headers: {
    Accept: 'application/json'
  },
  auth: {
    username: PAYMO_API_KEY,
    password: 'X'
  }
});

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  const app = express();

  app.get('/projects', async (req, res) => {
    try {
      const { data } = await paymo.get('/projects');
      res.json(data.projects || data);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get('/entries', async (req, res) => {
    try {
      const { data } = await paymo.get('/entries');
      res.json(data.entries || data);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  });

  app.get('/invoices', async (req, res) => {
    try {
      const { data } = await paymo.get('/invoices');
      res.json(data.invoices || data);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  app.get('/reports', async (req, res) => {
    try {
      const { data } = await paymo.get('/reports');
      res.json(data.reports || data);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  app.all('*', (req, res) => handle(req, res));

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

