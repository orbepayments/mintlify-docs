const fs = require('fs');
const p = '/tmp/mintlify-docs/api-reference/blink-api.json';
const data = JSON.parse(fs.readFileSync(p));

const CheckoutDesignSchema = {
  type: 'object',
  description: 'Configuration for the visual layout, display options, and colors of a custom checkout.',
  properties: {
    layout: {
      type: 'string',
      enum: ['classic', 'overlay', 'inline', 'split', 'minimal'],
      description: 'The overall layout structure of the checkout page. `classic` is standard, `overlay` highlights product imagery, `inline` embeds the form, `split` divides into two columns, and `minimal` removes all distractions.'
    },
    display_options: {
      type: 'object',
      properties: {
        preview_button: { type: 'boolean', description: 'Show a preview button next to the product title.' },
        discount_code: { type: 'boolean', description: 'Show a discount input field at checkout.' },
        refund_policy: { type: 'boolean', description: 'Display a refund policy link in the footer.' }
      }
    },
    override_theme: {
      type: 'boolean',
      description: 'If true, ignores the global store theme and uses the custom colors defined below.'
    },
    colors: {
      type: 'object',
      properties: {
        button: { type: 'string', description: 'Primary button color.' },
        button_hover: { type: 'string', description: 'Button color when hovered.' },
        button_text: { type: 'string', description: 'Text color inside buttons.' },
        button_text_hover: { type: 'string', description: 'Text color when hovering over buttons.' },
        link: { type: 'string', description: 'Color for clickable links.' },
        checkbox: { type: 'string', description: 'Color of variants checkbox.' },
        selection_border: { type: 'string', description: 'Border color for selected variants/methods.' },
        selection_background: { type: 'string', description: 'Background color for selected states.' }
      }
    }
  }
};

data.components.schemas['CheckoutDesign'] = CheckoutDesignSchema;

// Attach to checkout links creation/update schemas if they exist, or just define it.
// The GPT generator probably named the checkout-links body something like CreateCheckoutLinkRequest.
// Let's just iterate through schemas and replace any property named "design" with a ref to this.
for (const key of Object.keys(data.components.schemas)) {
  const schema = data.components.schemas[key];
  if (schema.properties && schema.properties.design) {
    schema.properties.design = {
      $ref: '#/components/schemas/CheckoutDesign'
    };
  }
}

// Ensure the endpoints have a description mentioning these Layouts.
if (data.paths['/v1/checkout-links'] && data.paths['/v1/checkout-links'].post) {
  data.paths['/v1/checkout-links'].post.description += '\n\n### Checkout Customizations\nYou can completely customize the visual aesthetic of the checkout link by passing a `design` object. This includes choosing between five expert layouts (`classic`, `overlay`, `inline`, `split`, `minimal`), toggling UI elements like discount fields, and overriding store-level theme colors.';
}

fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log('Patched OpenAPI with CheckoutDesign schema!');
