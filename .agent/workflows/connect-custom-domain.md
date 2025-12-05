---
description: Connect a custom domain to your Vercel deployment
---

# Connect Custom Domain on Vercel

To remove the `.vercel.app` suffix and use your own domain (like `luvo.health`), follow these steps:

## 1. Purchase a Domain
If you haven't already, purchase your desired domain (e.g., `luvo.health`) from a registrar like **Namecheap**, **GoDaddy**, **Google Domains**, or directly through **Vercel**.

## 2. Add Domain to Vercel Project
1.  Go to your **Vercel Dashboard**.
2.  Select your project (`luma-health`).
3.  Navigate to **Settings** > **Domains**.
4.  Enter your domain (e.g., `luvo.health`) in the input field and click **Add**.

## 3. Configure DNS Records
Vercel will provide you with the necessary DNS records to add to your domain registrar.

### Option A: Nameservers (Recommended)
If you want Vercel to manage your DNS (easiest):
1.  Vercel will show you two nameservers (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
2.  Log in to your **Domain Registrar** (where you bought the domain).
3.  Find the **Nameservers** setting for your domain.
4.  Replace the default nameservers with the Vercel ones.

### Option B: A Record & CNAME (If keeping DNS elsewhere)
1.  Vercel will show an **A Record** (IP address) and a **CNAME** record.
2.  Log in to your **Domain Registrar**.
3.  Go to **DNS Management** or **Advanced DNS**.
4.  Add the **A Record** pointing to Vercel's IP (usually `76.76.21.21`).
5.  Add the **CNAME** record for `www` pointing to `cname.vercel-dns.com`.

## 4. Verification
*   Go back to the Vercel Domains page.
*   It may take a few minutes (up to 24-48 hours in rare cases) for the changes to propagate.
*   Once the status turns **Valid** (green), your site is live at your custom domain!
