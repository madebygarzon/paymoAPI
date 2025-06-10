import axios from 'axios';

const PAYMO_API_KEY = process.env.PAYMO_API_KEY;

if (!PAYMO_API_KEY) {
  throw new Error('PAYMO_API_KEY not defined in environment');
}

const paymo = axios.create({
  baseURL: 'https://app.paymoapp.com/api',
  headers: {
    Accept: 'application/json',
  },
  auth: {
    username: PAYMO_API_KEY,
    password: 'X',
  },
});

export default paymo;
