const { createClient } = require('@supabase/supabase-js');
const { LRUCache } = require('lru-cache');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const TRIAL_DAYS = 7;

// Cache profiles for 5 minutes to prevent N+1 queries on every request
const profileCache = new LRUCache({
  max: 5000,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Check cache first
    let profile = profileCache.get(user.id);

    if (!profile) {
      // Fetch profile for role and usage
      let { data: fetchedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email }])
          .select()
          .single();
          
        if (!insertError) {
          fetchedProfile = newProfile;
        }
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      profile = fetchedProfile;
      if (profile) {
        profileCache.set(user.id, profile);
      }
    }

    let isTrial = false;
    if (profile) {
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - createdAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= TRIAL_DAYS) {
        isTrial = true;
      }
    }

    req.user = {
      ...user,
      profile: profile ? { ...profile, is_trial: isTrial } : { role: 'user', usage_count: 0, subscription_status: 'inactive', is_trial: true }
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

const requireSubscriptionOrAdmin = (req, res, next) => {
  const { profile } = req.user;
  
  if (profile.role === 'admin') {
    return next();
  }

  if (profile.subscription_status === 'active') {
    return next();
  }

  if (!profile.is_trial) {
    return res.status(402).json({ 
      error: 'Free trial has expired. Please subscribe to continue using the service.',
      requiresPayment: true 
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireSubscriptionOrAdmin,
  TRIAL_DAYS,
  supabase
};
