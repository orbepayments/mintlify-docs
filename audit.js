const fs = require('fs');

const files = fs.readdirSync('./api-reference').filter(f => f.endsWith('.json'));

const allPaths = {};
const webhooks = new Set();

// Load all API endpoints
files.forEach(file => {
  const data = JSON.parse(fs.readFileSync('./api-reference/' + file, 'utf8'));
  if (data.paths) {
    for (const [path, methods] of Object.entries(data.paths)) {
      if (!allPaths[path]) allPaths[path] = Object.keys(methods).filter(m => m !== 'parameters');
      else allPaths[path].push(...Object.keys(methods).filter(m => m !== 'parameters'));
    }
  }
});

// For webhooks, we look at webhooks-api.json specifically
try {
  const whData = JSON.parse(fs.readFileSync('./api-reference/webhooks-api.json', 'utf8'));
  if (whData.webhooks) {
    Object.keys(whData.webhooks).forEach(w => webhooks.add(w));
  }
} catch(e) {}

const scenarios = [
  {
    name: '1. Digital Art Seller',
    endpoints: [{p:'/v1/products', m:'post'}, {p:'/files', m:'post'}, {p:'/files/{id}/download', m:'get'}, {p:'/checkouts', m:'post'}],
    webhooks: ['order.created']
  },
  {
    name: '2. SaaS Starter',
    endpoints: [{p:'/organizations', m:'post'}, {p:'/organizations/{id}/members', m:'post'}, {p:'/v1/subscriptions', m:'post'}, {p:'/v1/subscriptions/{id}', m:'get'}],
    webhooks: ['subscription.created', 'subscription.updated']
  },
  {
    name: '3. SaaS Advanced (Licenses)',
    endpoints: [{p:'/license-keys', m:'post'}, {p:'/license-keys/activate', m:'post'}, {p:'/license-keys/validate', m:'post'}, {p:'/license-keys/{id}/revoke', m:'post'}],
    webhooks: ['license_key.created']
  },
  {
    name: '4. AI Tool (Metered Billing)',
    endpoints: [{p:'/v1/meters', m:'post'}, {p:'/meters/ingest', m:'post'}, {p:'/customers/{id}/meter-balance', m:'get'}],
    webhooks: []
  },
  {
    name: '5. Marketplace Platform',
    endpoints: [{p:'/checkouts', m:'post'}, {p:'/balances', m:'get'}, {p:'/payouts', m:'get'}],
    webhooks: ['payout.paid', 'payout.created']
  },
  {
    name: '6. The Upseller',
    endpoints: [{p:'/subscriptions/{id}/preview-swap', m:'post'}, {p:'/v1/subscriptions/{id}', m:'patch'}],
    webhooks: ['invoice.created', 'invoice.paid']
  },
  {
    name: '7. The Refunder',
    endpoints: [{p:'/v1/orders/{id}/refund', m:'post'}, {p:'/v1/disputes', m:'get'}, {p:'/refunds', m:'get'}],
    webhooks: ['dispute.created', 'order.refunded']
  },
  {
    name: '8. Customer Self-Service',
    endpoints: [{p:'/v1/portal/sessions', m:'post'}, {p:'/customers/{id}/portal-session', m:'get'}, {p:'/customers/{id}/orders', m:'get'}],
    webhooks: ['customer.updated']
  },
  {
    name: '9. Multi-Variant E-commerce',
    endpoints: [{p:'/v1/products/{id}/variants', m:'post'}, {p:'/v1/products/{id}/variants/{variantId}', m:'patch'}, {p:'/checkout-links', m:'post'}],
    webhooks: ['product.updated', 'checkout.created']
  },
  {
    name: '10. The Growth Marketer',
    endpoints: [{p:'/v1/discounts', m:'post'}, {p:'/bumps', m:'post'}, {p:'/audience', m:'get'}, {p:'/audience/tags', m:'post'}],
    webhooks: ['coupon.created', 'audience.subscriber_added']
  },
  {
    name: '11. The Cart Abandoner',
    endpoints: [{p:'/abandoned-carts', m:'get'}, {p:'/abandoned-carts/trigger', m:'post'}, {p:'/abandoned-carts/{id}/recover', m:'post'}, {p:'/api/v1/emails/broadcast', m:'post'}],
    webhooks: ['checkout.expired', 'abandoned_cart.recovered']
  },
  {
    name: '12. The Viral Affiliate',
    endpoints: [{p:'/affiliates/invite', m:'post'}, {p:'/affiliates/links', m:'get'}, {p:'/affiliates/{id}/conversions', m:'get'}, {p:'/affiliates/{id}', m:'get'}],
    webhooks: ['affiliate.created', 'affiliate.conversion_tracked']
  },
  {
    name: '13. The Data Analyst',
    endpoints: [{p:'/v1/metrics', m:'get'}, {p:'/events', m:'get'}],
    webhooks: []
  }
];

let totalMissing = 0;

console.log('--- Blink Documentation Audit ---');
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
