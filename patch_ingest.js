const fs = require('fs');
const file = './api-reference/blink-api.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.paths['/meters/ingest'] = {
  "post": {
    "summary": "Ingest Meter Usage",
    "description": "Report usage for a specific meter to deduct credits from a customer's balance. You must provide `event_name` and `quantity`, along with one of `customer_id`, `customer_email`, or `subscription_id`.",
    "tags": ["Meters"],
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "required": ["event_name", "quantity"],
            "properties": {
              "event_name": { "type": "string", "description": "The name of the meter event to ingest." },
              "quantity": { "type": "integer", "description": "The amount of usage to record/deduct." },
              "customer_id": { "type": "string", "description": "The ID of the customer. Optional if email or subscription_id is provided." },
              "customer_email": { "type": "string", "description": "The email of the customer. Optional if customer_id or subscription_id is provided." },
              "subscription_id": { "type": "string", "description": "The ID of the subscription. Optional if customer_id or email is provided." },
              "action": { "type": "string", "default": "increment", "description": "The action to take." },
              "timestamp": { "type": "string", "format": "date-time", "description": "The time the usage occurred." },
              "idempotency_key": { "type": "string", "description": "A unique key to prevent duplicate usage ingestion." }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Usage successfully ingested.",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "success": { "type": "boolean" },
                "ingested": { "type": "integer" },
                "deducted_from_credits": { "type": "integer" },
                "overage": { "type": "integer" },
                "reported_to_stripe": { "type": "boolean" },
                "credits_remaining": { "type": "integer" }
              }
            }
          }
        }
      },
      "400": { "description": "Bad Request - Missing parameters or invalid quantity." },
      "401": { "description": "Unauthorized - Missing or invalid API Key." },
      "404": { "description": "Not Found - Meter or Customer not found." }
    }
  }
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Successfully injected /meters/ingest');
