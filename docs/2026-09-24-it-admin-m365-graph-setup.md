# Microsoft 365 setup — let the Iraje website send email as inquiry@iraje.com

**For:** the Iraje Microsoft 365 / Entra ID administrator
**Time needed:** about 30 minutes, plus up to 2 hours for Exchange to apply the permission
**Requested by:** the website team, 2026-09-24

---

## Why this is needed

The website sends these emails:
- certification-request notifications to contact@iraje.com
- "your request was approved" emails to applicants (login details)
- "your request was not approved" emails to applicants

Today it tries to sign in to Office 365 SMTP with a mailbox password. That is already being rejected. Microsoft is also switching off SMTP basic authentication by default after 31 December 2026, with final removal announced for the second half of 2027.

The replacement is **Microsoft Graph `sendMail`** with an app registration (client-credentials flow). The website signs in as an application, and no mailbox password is involved.

**The key security requirement:** the app must be able to send **only as `inquiry@iraje.com`**, not as any mailbox in the tenant. This is done with **Exchange Online RBAC for Applications**, *not* with an Entra ID API permission. Details are in Step 3.

---

## What we need back from you

| Item | Where you find it | Sensitive? |
|---|---|---|
| **Directory (tenant) ID** | App registration → Overview | No |
| **Application (client) ID** | App registration → Overview | No |
| **Client secret *Value*** | Created in Step 2 | **Yes.** Share through a secure channel, never plain email |
| **Client secret expiry date** | Created in Step 2 | No |

---

## Step 1 — Register the app in Entra ID

1. Go to **https://entra.microsoft.com** → **Identity** → **Applications** → **App registrations** → **New registration**.
2. **Name:** `Iraje Website Mailer`
3. **Supported account types:** *Accounts in this organizational directory only (Single tenant)*
4. **Redirect URI:** leave empty.
5. Click **Register**.
6. On the **Overview** page, note the **Application (client) ID** and **Directory (tenant) ID**.

## Step 2 — Create a client secret

1. In the app → **Certificates & secrets** → **Client secrets** → **New client secret**.
2. **Description:** `Cloud Run – iraje-website`. **Expires:** 12 months (or your policy's maximum).
3. Copy the secret's **Value** immediately; it is shown only once. (Not the "Secret ID", which is a different value.)
4. Put a calendar reminder about 2 weeks before the expiry date. When it expires, website email stops until a new secret is created and given to the website team.

## Step 3 — Do NOT grant Mail.Send in Entra ID

Under the app's **API permissions**, do **not** add *Microsoft Graph → Application permissions → Mail.Send*. The default delegated *User.Read* can be removed; the website doesn't use it.

**Why:** an Entra ID `Mail.Send` application permission lets the app send as **every** mailbox in the tenant. Exchange RBAC for Applications grants add to Entra consents rather than replacing them. If both exist, the tenant-wide Entra permission wins and the restriction in Step 4 achieves nothing.

If `Mail.Send` (Application) was already added and consented, remove it and click **Revoke admin consent**.

## Step 4 — Allow the app to send only as inquiry@iraje.com (Exchange Online PowerShell)

First get the **Object ID of the enterprise application** (service principal): Entra → **Enterprise applications** → **All applications** → search `Iraje Website Mailer` → **Overview** → **Object ID**.

> This is **not** the Object ID shown under *App registrations*. Using that one is the most common cause of this setup failing.

Then, in PowerShell:

```powershell
# One-time, if the module isn't installed
Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser

Connect-ExchangeOnline -UserPrincipalName <your admin account>

# Confirm the mailbox address (must be the PRIMARY SMTP address)
Get-Mailbox inquiry@iraje.com | Format-List DisplayName, PrimarySmtpAddress, RecipientTypeDetails

# 1. Make the app known to Exchange
New-ServicePrincipal -AppId <APPLICATION_CLIENT_ID> -ObjectId <ENTERPRISE_APP_OBJECT_ID> -DisplayName "Iraje Website Mailer"

# 2. A scope that matches only the inquiry mailbox
New-ManagementScope -Name "Iraje Website Mailer - inquiry only" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'inquiry@iraje.com'"

# 3. Grant "send mail" limited to that scope
New-ManagementRoleAssignment -App <APPLICATION_CLIENT_ID> -Role "Application Mail.Send" -CustomResourceScope "Iraje Website Mailer - inquiry only"
```

A shared mailbox is fine for inquiry@iraje.com and needs no licence.

## Step 5 — Test the restriction

```powershell
# Should show "Application Mail.Send" with InScope = True
Test-ServicePrincipalAuthorization -Identity <APPLICATION_CLIENT_ID> -Resource inquiry@iraje.com | Format-Table

# Should show InScope = False: the app must NOT be able to send as other mailboxes
Test-ServicePrincipalAuthorization -Identity <APPLICATION_CLIENT_ID> -Resource contact@iraje.com | Format-Table
```

`Test-ServicePrincipalAuthorization` shows the permission immediately. The real Graph calls can take **30 minutes to 2 hours** to start working while Exchange refreshes its cache. A `403 ErrorAccessDenied` during that window is expected.

## Step 6 — Hand over

Send the website team:
- the tenant ID
- the client ID
- the secret expiry date
- **the client secret Value, through a secure channel** (a one-time secret link, or a direct Teams message deleted after use)

The secret will be stored in Google Secret Manager and never in code.

---

## Notes

- **Nothing else changes.** SMTP AUTH can stay disabled for inquiry@iraje.com. No mailbox passwords are shared.
- **Sent Items:** emails the website sends will appear in inquiry@iraje.com's Sent Items.
- **Undo:** to cut the website off immediately, delete the client secret (or the whole app registration). To remove only the Exchange permission:
  ```powershell
  Get-ManagementRoleAssignment -RoleAssignee <APPLICATION_CLIENT_ID> | Remove-ManagementRoleAssignment
  ```
- **Microsoft reference:** "Role Based Access Control for Applications in Exchange Online" on Microsoft Learn.
