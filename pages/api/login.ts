import type { NextApiRequest, NextApiResponse } from 'next';

const PASSWORD = 'P1i5p9;_';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;
    if (password === PASSWORD) {
      res.setHeader('Set-Cookie', 'auth=true; Path=/; HttpOnly; SameSite=Lax');
      res.status(200).json({ ok: true });
    } else {
      res.status(401).json({ ok: false });
    }
  } else if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'auth=; Path=/; Max-Age=0');
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
}
