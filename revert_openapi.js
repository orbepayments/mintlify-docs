const fs = require('fs');
const file = 'api-reference/blink-api.json';
let spec = JSON.parse(fs.readFileSync(file, 'utf8'));

function fixType(schemaPath, fields) {
    let obj = spec;
    const parts = schemaPath.split('/');
    for (const part of parts) {
        if (part === '#') continue;
        obj = obj[part];
        if (!obj) return;
    }
    for (const field of fields) {
        if (obj.properties && obj.properties[field]) {
            if (Array.isArray(obj.properties[field].type)) {
                obj.properties[field].type = obj.properties[field].type[0];
            }
            if (obj.properties[field].nullable === true) {
                delete obj.properties[field].nullable;
            }
        }
    }
}

fixType('#/components/schemas/Product', ['description', 'preview_link', 'subscription_interval', 'trial_days', 'customer_portal_visibility']);
fixType('#/components/schemas/LicenseKeyDetails', ['expires_at']);

fs.writeFileSync(file, JSON.stringify(spec, null, 2));
console.log("Reverted nullable types to single strings");
