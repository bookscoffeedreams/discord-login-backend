import fetch from 'node-fetch';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://your-vercel-app.vercel.app/api/auth/callback'; // will update after deployment
const FRONTEND_DASHBOARD = 'https://your-github-pages-dashboard.com/dashboard.html';

export default async function handler(req, res) {
  const { url } = req;

  if (url.startsWith('/api/auth?login')) {
    // Redirect to Discord login
    const redirect = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.writeHead(302, { Location: redirect });
    res.end();
    return;
  }

  if (url.startsWith('/api/auth/callback')) {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code provided');

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: 'identify'
    });

    try {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const tokenData = await tokenRes.json();

      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      const user = await userRes.json();

      const tokenParam = encodeURIComponent(JSON.stringify(user));
      res.writeHead(302, { Location: `${FRONTEND_DASHBOARD}?user=${tokenParam}` });
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Discord login error');
    }
    return;
  }

  res.status(404).send('Not Found');
}
