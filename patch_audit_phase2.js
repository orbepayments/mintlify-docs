const fs = require('fs');

// Patch webhooks-api.json
const whFile = './api-reference/webhooks-api.json';
const whData = JSON.parse(fs.readFileSync(whFile, 'utf8'));

const missingWebhooks = [
  'subscription.trial_ended', 'invoice.payment_failed', 'subscription.past_due',
  'subscription.canceled', 'subscription.expired', 'invoice.finalized'
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
      description: `Automatically added via Phase 2 API validation audit.`,
      tags: ["Miscellaneous"],
      responses: {
        "200": { description: "Success" }
      }
    };
  }
};

addEndpoint('/subscription-invoices/{id}', 'patch', 'Update Subscription Invoice');
addEndpoint('/subscription-invoices', 'patch', 'Update Subscription Invoices');

fs.writeFileSync(blinkFile, JSON.stringify(blinkData, null, 2));

console.log('Successfully patched all Phase 2 missing endpoints and webhooks!');
