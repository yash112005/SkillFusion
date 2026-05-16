const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: 'month',
    limits: {
      ai_matches: 5,
      resume_scans: 10,
      portfolio_builds: 1,
      mock_interviews: 2
    }
  },
  PRO: {
    name: 'Pro',
    price: 299,
    interval: 'month',
    limits: {
      ai_matches: 100,
      resume_scans: 200,
      portfolio_builds: 10,
      mock_interviews: 20
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    limits: {
      ai_matches: 1000,
      resume_scans: 2000,
      portfolio_builds: 100,
      mock_interviews: 200
    }
  }
};

module.exports = { PLANS };
