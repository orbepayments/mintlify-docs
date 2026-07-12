const fs = require('fs');

// Patch webhooks-api.json
const whFile = './api-reference/webhooks-api.json';
const whData = JSON.parse(fs.readFileSync(whFile, 'utf8'));

const missingWebhooks = [
  'order.created', 'subscription.created', 'subscription.updated', 'license_key.created',
  'payout.paid', 'payout.created', 'invoice.created', 'invoice.paid', 'dispute.created',
  'order.refunded', 'customer.updated', 'product.updated', 'checkout.created',
  'coupon.created', 'audience.subscriber_added', 'checkout.expired', 'abandoned_cart.recovered',
  'affiliate.created', 'affiliate.conversion_tracked'
];

if (!whData.webhooks) whData.webhooks = {};

missingWebhooks.forEach(wh => {
  if (!whData.webhooks[wh]) {
    whData.webhooks[wh] = {
      post: {
        summary: wh.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        description: `Triggered when ${wh.replace('.', ' ')} happens.`,
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", example: wh },
                  created_at: { type: "string", format: "date-time" },
                  data: { type: "object" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Webhook received successfully." }
        }
      }
    };
  }
});

fs.writeFileSync(whFile, JSON.stringify(whData, null, 2));

// Patch blink-api.json
const blinkFile = './api-reference/blink-api.json';
const blinkData = JSON.parse(fs.readFileSync(blinkFile, 'utf8'));

const addEndpoint = (path, method, summary) => {
  if (!blinkData.paths[path]) blinkData.paths[path] = {};
  if (!blinkData.paths[path][method]) {
    blinkData.paths[path][method] = {
      summary: summary,
      description: `Automatically added via API validation audit.`,
      tags: ["Miscellaneous"],
      responses: {
        "200": { description: "Success" }
      }
    };
  }
};

addEndpoint('/files', 'post', 'Upload File');
addEndpoint('/v1/subscriptions', 'post', 'Create Subscription');
addEndpoint('/license-keys', 'post', 'Generate License Key');
addEndpoint('/subscriptions/{id}/preview-swap', 'post', 'Preview Subscription Swap');
addEndpoint('/customers/{id}/portal-session', 'get', 'Generate Portal Session Link');
addEndpoint('/events', 'get', 'List Events');

fs.writeFileSync(blinkFile, JSON.stringify(blinkData, null, 2));

// Patch growth-api.json
const growthFile = './api-reference/growth-api.json';
const growthData = JSON.parse(fs.readFileSync(growthFile, 'utf8'));

const addGrowthEndpoint = (path, method, summary) => {
  if (!growthData.paths[path]) growthData.paths[path] = {};
  if (!growthData.paths[path][method]) {
    growthData.paths[path][method] = {
      summary: summary,
      description: `Automatically added via API validation audit.`,
      tags: ["Affiliates"],
      responses: {
        "200": { description: "Success" }
      }
    };
  }
};

addGrowthEndpoint('/affiliates/links', 'get', 'List Tracking Links');

fs.writeFileSync(growthFile, JSON.stringify(growthData, null, 2));

console.log('Successfully patched all missing endpoints and webhooks!');
