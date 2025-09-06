import admin from '../../firebase.js';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const data = userDoc.data();

    const profile = {
      level: data.level,
      rank: data.rank,
      messages: data.messages,
      voiceHours: data.voiceHours,
      vcStreak: data.vcStreak,
      prarambhVersion: data.prarambhVersion,
      prarambhDay: data.prarambhDay,
      prarambhStreak: data.prarambhStreak,
      xp: data.xp,
      badges: data.badges
    };

    res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
