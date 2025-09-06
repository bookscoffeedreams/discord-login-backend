// profile.js
import admin from '../firebase.js';

export default async function handler(req, res) {
  // Allow your frontend origin
  res.setHeader('Access-Control-Allow-Origin', 'https://bookscoffeedreams.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Preflight request
    return res.status(200).end();
  }

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const data = userDoc.data();

    // Safely extract nested data and provide defaults
    const profile = {
      username: data.username || 'Unknown',
      avatar: data.avatar || 'default-avatar.png',
      level: data.level ?? 0,
      rank: data.rank ?? 'N/A',
      messagesSent: data.messagesSent ?? 0,
      voiceHours: data.vc?.lifetime ?? 0,
      vcStreak: data.vc?.vcStreak ?? 0,
      prarambhVersion: data.prarambhVersion || 'N/A',
      prarambhDay: data.prarambhDay ?? 0,
      prarambhStreak: data.prarambhStreak ?? 0,
      xp: {
        daily: data.stats?.daily ?? 0,
        weekly: data.stats?.weekly ?? 0,
        monthly: data.stats?.monthly ?? 0,
        yearly: data.stats?.yearly ?? 0,
        total: data.stats?.lifetime ?? 0
      },
      badges: data.badges || []
    };

    return res.status(200).json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
