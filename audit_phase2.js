const fs = require('fs');

const files = fs.readdirSync('./api-reference').filter(f => f.endsWith('.json'));
const allPaths = {};
const webhooks = new Set();

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync('./api-reference/' + file, 'utf8'));
  if (data.paths) {
    for (const [path, methods] of Object.entries(data.paths)) {
      if (!allPaths[path]) allPaths[path] = Object.keys(methods).filter(m => m !== 'parameters');
      else allPaths[path].push(...Object.keys(methods).filter(m => m !== 'parameters'));
    }
  }
});

try {
  const whData = JSON.parse(fs.readFileSync('./api-reference/webhooks-api.json', 'utf8'));
  if (whData.webhooks) {
    Object.keys(whData.webhooks).forEach(w => webhooks.add(w));
  }
} catch(e) {}

const scenarios = [
  {
    name: '14. Freemium to Paid Converter',
    endpoints: [{p:'/v1/subscriptions', m:'post'}],
    webhooks: ['subscription.trial_ended', 'invoice.payment_failed', 'subscription.past_due']
  },
  {
    name: '15. Community Access Seller',
    endpoints: [{p:'/v1/subscriptions', m:'post'}, {p:'/v1/customers', m:'post'}],
    webhooks: ['order.created', 'subscription.canceled', 'subscription.expired']
  },
  {
    name: '16. Enterprise B2B Payer',
    endpoints: [{p:'/subscription-invoices', m:'get'}, {p:'/subscription-invoices', m:'patch'}], // Wait, we don't have /{id} in paths list yet maybe?
    // Let's assume PATCH /subscription-invoices/{id} is what it should be
    // I will check if they have /subscription-invoices/{id} or just /subscription-invoices
    // Earlier jq output: /subscription-invoices
    // I will just look for POST /subscription-invoices or similar. Let's make it GET /subscription-invoices
    webhooks: ['invoice.finalized', 'invoice.paid']
  },
  {
    name: '17. Volume & Tiered Pricing',
    endpoints: [{p:'/v1/products/{id}/variants', m:'post'}, {p:'/v1/subscriptions/{id}', m:'patch'}],
    webhooks: []
  },
  {
    name: '18. Pay What You Want Creator',
    endpoints: [{p:'/checkout-links', m:'post'}],
    webhooks: []
  },
  {
    name: '19. Lifetime Deal (LTD)',
    endpoints: [{p:'/license-keys', m:'post'}, {p:'/v1/subscriptions', m:'post'}],
    webhooks: []
  },
  {
    name: '20. White-Label Reseller Agency',
    endpoints: [{p:'/checkouts', m:'post'}, {p:'/license-keys', m:'get'}],
    webhooks: []
  },
  {
    name: '21. Hybrid Hardware + Software',
    endpoints: [{p:'/checkout-links', m:'post'}, {p:'/v1/products', m:'post'}],
    webhooks: []
  },
  {
    name: '22. Usage-Based Marketplace Aggregator',
    endpoints: [{p:'/v1/meters', m:'post'}, {p:'/meters/ingest', m:'post'}, {p:'/payouts', m:'get'}, {p:'/checkouts', m:'post'}],
    webhooks: []
  }
];

let totalMissing = 0;

console.log('--- Blink Documentation Audit: Phase 2 ---');
scenarios.forEach(sc => {
  let missing = [];
  
  sc.endpoints.forEach(ep => {
    const hasPath = allPaths[ep.p];
    if (!hasPath) missing.push(`Missing Path: ${ep.m.toUpperCase()} ${ep.p}`);
    else if (!hasPath.includes(ep.m)) missing.push(`Missing Method: ${ep.m.toUpperCase()} ${ep.p}`);
  });

  sc.webhooks.forEach(wh => {
    if (!webhooks.has(wh)) missing.push(`Missing Webhook Event: ${wh}`);
  });

  if (missing.length > 0) {
    console.log(`\n❌ ${sc.name} - Failed!`);
    missing.forEach(m => console.log(`   - ${m}`));
    totalMissing += missing.length;
  } else {
    console.log(`✅ ${sc.name} - Passed!`);
  }
});

console.log('\n--------------------------------');
if (totalMissing > 0) {
  console.log(`Found ${totalMissing} documentation gaps to patch.`);
} else {
  console.log('All required endpoints and webhooks are documented!');
}
