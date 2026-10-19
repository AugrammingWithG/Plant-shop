# Turning on email order requests

Until this is set up, customers send their orders by WhatsApp or SMS. Once it's on, the order sheet shows a **Send order request** button. The nursery gets the full order by email, and if the customer gives an email address, they get an automatic confirmation.

This uses [EmailJS](https://www.emailjs.com/). The free plan covers 200 emails a month, which is about 100 orders with confirmations, and allows the two templates you need.

## 1. Create the account and connect the inbox

1. Sign up at emailjs.com with the nursery's email address.
2. Go to **Email Services → Add New Service**, choose Gmail (or Outlook, etc.) and connect the nursery inbox.
3. Copy the **Service ID** (it looks like `service_xxxxxxx`).

## 2. Create the two templates

Go to **Email Templates → Create New Template** and make each of these.

### Template 1: New order (to the nursery)

- **To email:** the nursery's address
- **Reply to:** `{{customer_email}}`
- **Subject:** `New order request {{order_ref}} from {{customer_name}}`
- **Content:**

```
Order {{order_ref}}

{{order_lines}}

Total: {{order_total}} (confirm on invoice)

Name: {{customer_name}}
Phone: {{customer_phone}}
Suburb: {{customer_suburb}}
Email: {{customer_email}}
Notes: {{notes}}
```

### Template 2: Confirmation (to the customer)

- **To email:** `{{customer_email}}`
- **Reply to:** the nursery's address
- **Subject:** `We've got your order request {{order_ref}}`
- **Content:**

```
Hi {{customer_name}},

Thanks for your order request with Pot Plant Heaven Perth. Here's what you asked for:

{{order_lines}}

Total: {{order_total}}. We'll confirm stock, your delivery day and the final price,
then send you an invoice (credit card, PayPal or Alipay).

We'll call you on {{customer_phone}} soon. Questions? Call or message 0420 493 944.

Pot Plant Heaven Perth
```

Copy each template's **Template ID** (`template_xxxxxxx`).

## 3. Get the public key

Go to **Account → General** and copy the **Public Key**.

## 4. Add the keys to the site

Open `src/config.js` and fill in the four values:

```js
export const EMAILJS = {
  publicKey: "your public key",
  serviceId: "service_xxxxxxx",
  ownerTemplateId: "template_for_nursery",
  customerTemplateId: "template_for_customer",
};
```

Commit and push to `main`. The site redeploys on its own in about a minute.

These keys are meant to be public: EmailJS public keys are designed to sit in website code. In EmailJS, under **Account → Security**, add `augrammingwithg.github.io` (and the nursery's own domain later) to the allowed domains so nobody else can use them.
