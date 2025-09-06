import fetch from 'node-fetch';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const FRONTEND_DASHBOARD = 'https://bookscoffeedreams.github.io/dashboard.html';

export default async function handler(req, res) {
  const { query } = req;

  // Step 1: Login redirect
  if (query.login) {
    const REDIRECT_URI = 'https://discord-login-backend.vercel.app/api/auth';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;

    res.writeHead(302, { Location: discordAuthUrl });
    res.end();
    return;
  }

  // Step 2: Callback from Discord
  if (query.code) {
    const code = query.code;

    const REDIRECT_URI = 'https://discord-login-backend.vercel.app/api/auth';
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

      // Redirect to frontend dashboard
      res.writeHead(302, { Location: `${FRONTEND_DASHBOARD}?user=${tokenParam}` });
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500).send('Discord login error');
    }
    return;
  }

  // If neither login nor code, show simple message
  res.status(200).send('BCD Discord Login Endpoint');
}
