> Часть скилла checklist-design (см. SKILL.md). Порт checklist.design (Figma Community, bundle v3.2.0), лицензия не заявлена, дословно.

### Billing — Web app

Payment methods, invoices, and everything related to the financial side of the account

Source: https://www.checklist.design/web-app/billing

#### Items

##### Payment method on file
The current card or payment method on the account, shown with masked details

_Tip: Last 4 digits of card are enough for the user to identify which card is in use without exposing sensitive information_

##### Add or update payment method action
A way to enter a new card or change the current one

##### Next billing date and amount
When the next payment will be taken and for how much

_Tip: Including the plan name alongside the amount if applicable_

##### Invoices and receipts
A list of past charges, each downloadable as a PDF invoice.

_Tip: Ensure invoices include company name, address, and VAT number — legally required in many countries and a frequent request from business users._

##### Tax and VAT (if applicable)
Applicable tax or VAT shown on invoices and billing history

##### Failed payment recovery
Clear messaging and recovery steps when a payment attempt fails

_Tip: Surface this issue prominently in the app as it can eventually restrict access if not resolve in time_

##### Billing contact email
The email address where invoices and billing notifications are sent

_Tip: For larger teams, this is often different from the account owner's email_

---

### Settings — Web app

A screen that gives users control over their account, preferences, and application behaviour

Source: https://www.checklist.design/web-app/settings

#### Items

##### Structure
Settings organised into logical categories — account, notifications, security, billing.

_Tip: Consider elevating the most commonly changed settings rather than the most important_

##### Account details
Fields to update name, email address, and profile photo

##### Security details
The ability to change password, two-factor authentication, and other security details

_Tip: These fields should require re-authentication to save changes_

##### Notification preferences
Which notifications the user receives and through which channel, grouped by type — updates, reminders, billing

_Tip: Grouping by type and/or platform helps reduce the chances of a user disabling all notifications rather than some_

##### Billing
Managing payment method, upgrading, or cancelling — or a preview of this with a link to the billing page if separate

##### Additional preferences (if applicable)
Language, timezone, date format, and appearance settings like dark mode

##### Danger zone
Destructive actions like account deletion, clearly separated from the rest

_Tip: Include a confirmation step for any destructive actions, with details on what will be lost if the user continues_

---

### Admin Panel — Web app

Where administrators manage users, configure the product, and oversee activity across the organisation

Source: https://www.checklist.design/web-app/admin-panel

#### Items

##### Role-based access
Visible and accessible only to users with appropriate permissions

##### User management
A view of all users, with the ability to invite, edit roles, and remove them

##### Organisation settings
Account-level configuration — name, logo, SSO, domains

##### Usage overview
High-level usage metrics across the organisation, exportable for reporting

##### Billing and plan management
Subscription details, seat counts, and invoices at the account level

##### Audit log
A record of account actions — logins, permission changes, deletions

##### Danger zone
Destructive account actions — deleting the workspace, transferring ownership

_Tip: Establish friction by visually separated this from other settings and having typed confirmation for irreversible actions_

---

### Empty State — Web app

The state of a screen or component when there is no data to display, whether it's because a user is new, has cleared their content, or a search returned no results.

Source: https://www.checklist.design/web-app/empty-state

#### Items

##### Illustration or icon
A visual signalling the empty state and giving the screen personality, rather than feeling broken

_Tip: Visual should be contextual e.g. empty inbox and a deleted account shouldn't be the same_

##### Clear heading
A short, plain-language title naming what's missing

##### Supporting description
A brief explanation of what belongs here, most useful for first-time users

##### Primary action
A CTA pointing toward the next step: creating, importing, connecting etc

_Tip: It should create the first item, not just link somewhere generic_

##### Zero state vs. no-results state
A distinction between nothing having been created yet and a search or filter returning no results

##### Error state variant
A separate variant for failed-to-load content, as opposed to genuinely empty

_Tip: Showing an empty state when the real issue is a loading error causes users to assume they have lost their data_

---

### Onboarding — Web app

A guided experience that introduces new users to the product and gets them to their first moment of value as quickly as possible

Source: https://www.checklist.design/web-app/onboarding

#### Items

##### Progress indicator
How many steps are involved, and where the user is in the sequence

_Tip: Every step beyond five is another opportunity to lose the user — 3 to 5 is the reliable range_

##### Welcome message
A brief message acknowledging the new experience and orienting the user to what the product does.

##### Account setup
Minimum information to personalise the experience, gathered at the start

_Tip: Delay any fields not genuinely needed to start using the product_

##### Product highlights
Key features introduced via short contextual tips or a visual walkthrough

_Tip: Offer a skip route for user who has seen content before or prefers to learn by doing_

##### First action prompt
A clear prompt directing the user to an action or feature

_Tip: This should be the quickest step towards a user understanding the value of the product_

##### Completion confirmation
A clear acknowledgement that setup is complete, moving the user into the main product

---

### 2FA — Web app

A screen that guides users through setting up or completing two-factor authentication to add a second layer of security to their account

Source: https://www.checklist.design/web-app/2-factor-authentication

#### Items

##### Method selection
Authenticator app, SMS, or email code

_Tip: Offer at least 2 methods as some users potentially don't have access to one or the other_

##### Setup instructions
Clear step-by-step guidance for setup, especially authenticator flows requiring a QR code scan

##### QR code or setup key
A scannable QR code or copyable key for linking an authenticator app

##### Verification step
A code entry step confirming setup succeeded before 2FA is enabled

_Tip: Enabling 2FA without this step risks a silent setup failure that locks the user out — a serious support burden_

##### Recovery codes
One-time backup codes for use if the user loses access to their 2FA method

_Tip: Make download or copying the code a required step before completing setup for the sake of the user_

##### Setup confirmation
A clear success state confirming 2FA is now active

##### Disable or reset option
A way to turn off or reconfigure 2FA, accessible from account security settings

_Tip: Re-authentication should be required before disabling 2FA_

---

