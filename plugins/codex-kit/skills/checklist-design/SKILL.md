---
name: checklist-design
description: >-
  Сверяет экран/флоу с одним из 112 предметных чек-листов (Login, Paywall,
  Onboarding, Billing, 404, Settings и т.д. — Design system/Flows/Mobile
  app/Web app/Website) на функциональную полноту: что должно быть на
  странице этого типа, не про крафт/визуальный вкус. Два режима: audit
  (построчная сверка с чек-листом, 5 статусов на пункт) и critique (если
  чек-лист не подходит). Использовать при запросе «проверь эту страницу
  по чек-листу», «что должно быть на странице логина/пейволла/...»,
  «аудит этого экрана», или при генерации нового экрана с нуля — сверить,
  что не забыт стандартный элемент.
---

> Скилл Checklist Design (checklist.design, Figma Community, bundle v3.2.0).
> Порт дословно, лицензия явно не заявлена, приватный каталог. Каталог
> содержит 112 чек-листов, здесь заинлайнены самые просматриваемые — на
> остальные скилл сам укажет ссылку `checklist.design{path}`, без
> веб-фетча содержимого (правило источника: не выдумывать пункты по имени).

# Checklist Design

## What you're looking at

First, work out what you're actually assessing, and say so at the start of your response.

If the request references a Figma file, frame, or the current selection, look at it directly — you already have visual access to it as part of running inside Figma. If it instead references something outside Figma (a screenshot pasted into the conversation, a live URL, a local file), use that.

**Critique always needs to see the rendered design.** A page can look fine in the code and be broken on screen, or the other way round, so judging layout, spacing or type from markup isn't honest. If you can't actually see a rendered design — nothing selected, nothing referenced, no image — say so and ask, rather than guessing.

Say what you ended up looking at — "Reviewing the frame you've got selected," "Reviewing the screenshot you shared," or "I can't see this yet — could you select a frame or share a screenshot?"

## Finding the relevant checklist

The **Checklist catalog** section below lists every Checklist Design checklist by category, each with a short description and its live page path. Only the most-viewed subset have full items — those live in `references/*.md` by category (see the **Checklists** section below for which file), not all 112 fit in one installation.

1. Check the **Checklist catalog** section and find the checklist matching what you're looking at. If the person named one ("check this against Login"), find that one — note some names appear in more than one category, and a "Login" for Website, Web app and Mobile app have different items.
2. Look for that same name and category in the matching `references/*.md` file (see the **Checklists** table below for which file covers which category).
3. **If it's there**, read that file and use its full items.
4. **If it's not there**, say so plainly rather than guessing at items you don't have — "I don't have the full [Name] checklist loaded here, but you can see it at https://www.checklist.design{path}" using the path shown next to its name in the catalog. Then either critique instead, or offer to work from what the person tells you about the checklist if they'd rather not leave Figma.

**Don't fetch checklist content from the web, and don't web-search for it**, even for ones not inlined here — pointing to the real page is the right move, guessing at its content from the name is not.

## Choosing the mode

**If they named a mode** — `/checklist-design audit`, `/checklist-design critique`, or plain language like "audit this" or "just give me your thoughts" — use it. An explicit request always wins.

**If they didn't**, decide from what you're looking at:

- **A checklist clearly matches** → **audit**. Say which one, in one line: "Auditing this against the Settings checklist (Web app)."
- **Nothing matches well** → **critique**. Say so briefly: "No checklist covers a dashboard closely, so here's a general review." Never dead-end on a missing checklist — the catalogue doesn't cover everything, and a useful review is always possible.
- **They asked for something quick or narrow** ("quick thoughts", "just the layout") → **critique**, even if a checklist matches. Working through twelve items isn't what they asked for.

Always state the choice in that opening line so they can redirect in a word.

Then follow that mode's section below: **Audit mode** or **Critique mode**.

## Audit mode

Go through the matched checklist item by item and report what's there, what isn't, and — for anything absent — whether that's actually a problem. Not a scorecard read aloud: a colleague who knows the checklist telling you plainly what they'd chase down before shipping.

Read the checklist file first (see "Finding the relevant checklist" above). If more than one checklist clearly applies — a settings screen with a permissions section, say — audit against each, kept clearly separate. Don't blend two checklists' items into one list.

### What you can work from

A screenshot, a live page, a source file, or any mix of them. Source plus a picture is strongest — the source shows the whole page including what sits below the fold, and the picture shows what actually renders.

**Before writing anything, work out what your input can actually answer.** Go through the checklist and sort the items:

- **What's on the page** — "is there an origin story", "is there a forgot-password link", "is there a team section". Source answers these well, often better than a screenshot, since a screenshot only shows one screenful and misses everything further down.
- **How it looks and behaves** — "is the contrast strong enough", "is the button easy to spot", "does the hover state read". Source can show a rule exists but not whether it works on screen. These need a picture.

If several items fall in the second group and all you have is source, say so above the table, on its own line, before anything else:

> ⚠️ Four of these seven are about how the page looks rather than what's on it. I can see the code is there, but not whether it works on screen — a screenshot would let me look properly and give you a straight answer on those.

Say it plainly, put it where they'll see it, and don't apologise for it. You're telling them what you can and can't see, which is useful information.

**If almost nothing can be answered** — a component checklist that's mostly about appearance, and all you have is a `.tsx` file — don't produce a table of question marks. Say that most of this checklist is about how the thing looks, and ask for a screenshot before going further. A table full of shrugs is worse than asking.

### Judging each item

Every item gets one of five markers (listed under "Output" below). Getting these right is most of the work:

- **Partially present** is usually the most useful thing you can say. Use it whenever "present" would overstate and "missing" would be unfair — an error message that fires but doesn't distinguish a wrong email from a wrong password, a password field with no reveal toggle. It points at a specific improvement rather than a pass or a fail.
- **Not needed here** needs a real reason, not just an absence you'd rather not flag. Either another item on the same checklist already covers the need through a different pattern (a magic-link item and a password-field item are often alternatives, not both required), or it genuinely doesn't apply to this product (not every login needs social sign-in). If you can't articulate why it doesn't matter, it's missing, not not-needed.
- **Can't tell** is an honest answer, not a cop-out — but say *why*, because there are two different reasons and only one of them is fixable. Either you couldn't see it from what you were given (a screenshot or the source file would settle it), or the design genuinely doesn't show it here (a static screenshot with no error showing can't tell you what the error state looks like, and another screenshot wouldn't help). Those need different wording.

Don't call something missing just because it isn't visible — check whether it's actually needed first. And don't invent presence: if you can't see it, you can't confirm it, however likely it is to exist somewhere.

### Output

Open with one line naming the checklist and linking to it. If the product takes a genuinely different approach to the whole category — a passwordless product against a password-oriented checklist — add a second line saying so, so the ⚪ rows below read as deliberate choices rather than as failures.

Then a table, one row per checklist item, in the checklist's own order:

| | Item | Why |
|---|---|---|
| 🟢 | **Item name** — its description | Short reason |

**Status markers:**

| Marker | Status | |
|---|---|---|
| 🟢 | Present | it's there, doing what the item describes |
| 🟡 | Partially present | there but incomplete or weakened |
| 🔴 | Missing | not there, and it should be |
| ⚪ | Not needed here | not there, and that's fine — deliberately not a failure colour |
| ❔ | Can't tell | what you were given doesn't show enough to know |

Rules that keep the table honest and readable:

- **One row per checklist item, in the checklist's order.** Never merge, split, reorder or skip items. If an item is composite ("Email and password fields") and the product has one part but not the other, that's exactly what 🟡 is for — say which part is missing in the Why column.
- **Keep item names and descriptions faithful to the checklist.** Don't paraphrase or trim them for width. Abbreviating hides what's actually being checked, which is the one thing an audit can't afford. If a description is long, it's long.
- **Every row needs a Why, including 🟢 ones** — a bare status is not useful. Keep it to a sentence; this column is where table width problems come from. Say what's weak and what would finish it (🟡), the specific reason it doesn't apply (⚪), or for 🔴 what it costs the user — "no forgot-password link" is a status, "anyone who's forgotten their password has no way back into their account from here" is the reason it matters.
- **❔ rows say whether more would help.** "I can't see this in the code — a screenshot would show me" is worth acting on. "There's no error showing here" isn't, and a screenshot wouldn't change it. Make clear which one it is.
- **Don't add a score, a count, or a percentage.** "4 of 7 present" invites treating ⚪ rows as failures and turns a design review into a grade.

If any rows came out ❔ only because of what you could see, close with one line naming them and what would settle it — "a screenshot of the hover state would sort the last two." Make the next step obvious rather than leaving them to work it out.

### Beyond the checklist

The checklist bounds what you're checking, not what you're allowed to notice. If something clearly matters and isn't on the list — a heading that doesn't say what happens next, a control that's easy to miss — add it briefly at the end, flagged as your own observation rather than a checklist item. Keep it to one or two things; the audit is the main event.

## Critique mode

Give a quick, honest peer review — like leaving a comment for a colleague whose work you respect. Not a design report. Not a checklist read aloud.

### What to consider

Not all of these apply to every screen. Use judgement on which are relevant:

- Purpose & task clarity
- Information architecture & structure
- Visual hierarchy
- Layout & spatial rhythm
- Typography & readability
- Colour usage & emphasis
- Accessibility considerations
- Interaction affordance & predictability
- Content quality
- Overall polish

### Using a checklist to sharpen it

If a checklist matched (see "Finding the relevant checklist" above), read it and use specific items to back up a point you were already going to raise. Don't invent a point just because a matching item exists.

When you cite one, name it in plain language — "the Permissions checklist calls this out" — and link to the page where it reads naturally. The URL is at the top of each checklist file.

Keep it light. One or two grounded references beat citing an item for every point. If the request narrows scope ("skip components," "just the layout"), respect that when picking what to reference.

If nothing matched, that's fine — critique normally, without citations. Don't mention that nothing matched beyond the one-line opener.

### Output

Open with the one-line statement of what you're assessing, then the strengths and considerations as plain prose. Not a table, not a scorecard.

Aim for at least two genuine strengths alongside the considerations — a critique that's all considerations reads as unbalanced, not thorough. Only include strengths you actually believe; padding is worse than a short answer.

Considerations should read as casual suggestions, not formal findings. Two strong ones beat five vague ones.

## Tone (both modes)

- Write how a designer talks, not how a design report reads. Short, direct sentences. An em dash or a casual connector like "though" or "that said" is fine.
- Avoid words like: *effectively, maintains, communicates, demonstrates, facilitates, leverages, optimises, robust, streamlined*.
- Say what you think plainly — "that's covered," "that one's actually missing," "a bit hard to read" — rather than hedging with "might," "could potentially," "it's possible that."
- Don't over-explain. If something is good, say so and move on.

## Accuracy (both modes)

- Only raise things you're confident about. One or two strong points beat four vague ones.
- If you can't point to a specific element that shows the issue, leave it out.
- Respect standard UI patterns — don't suggest changing conventions like payment fields, login flows, or standard form layouts.
- Only comment on what's actually visible. Don't invent context that isn't in the frame, and don't assume something exists elsewhere in the product.
- If this looks like a work-in-progress build — placeholder text, an obviously unstyled element — don't flag it as a design flaw. Note it as unfinished if it's worth mentioning at all.
- If the person already explained or made a deliberate call on something earlier in the conversation, factor that in rather than raising it again as new.
- Stay on visual and UX design — layout, hierarchy, typography, colour, accessibility, interaction, polish. Not code quality, performance, or SEO.

## Checklist catalog

### Design system

- **Tokens** (/design-system/tokens) — The layer of a design system where defined variables are outlined across the platform to enable consistency, theming and alignment with code.
- **Drawer** (/design-system/drawer) — A drawer is a panel that slides in from the edge, overlaying content. It provides access to detailed information without completely navigating away from the current page.
- **Typography** (/design-system/typography) — The type layer of a design system that defines a scale, hierarchy, and set of text styles that is consistent, accessible, and expressive across the full range of product contexts
- **Accessibility** (/design-system/accessibility) — The accessibility foundation of a design system including the standards, tooling, and shared conventions that ensure every component and pattern is built inclusively from the start.
- **Date Picker** (/design-system/date-picker)
- **Spacing / Grid** (/design-system/spacing-and-grid) — The spatial layer of a design system, defining a consistent scale for spacing, a grid for layout, and the rules that make both feel deliberate and coherent across all surfaces.
- **Color System** (/design-system/color-system) — The color layer of a design system — defining a palette that is purposeful, accessible, themeable, and expressed as tokens rather than raw values.
- **Accordion** (/design-system/accordion) — An accordion is a vertically stacked list of items that reveal or hide associated content sections when clicked. They help organize information hierarchically and saves screen space by showing only relevant content.
- **Skeleton** (/design-system/skeleton) — A skeleton is a placeholder that mimics the structure of content while it loads. It provides visual feedback that content is coming and reduces perceived wait time.
- **Carousel** (/design-system/carousel) — A carousel is a slideshow component that displays content one slide at a time. Users can alternate content through manual navigation or waiting for automatic transition.
- **Banner** (/design-system/banner) — A banner is a prominent notification item that displays important messages to users. It communicates things like errors, success confirmations, warnings, or general information using distinct colors and placement to stand out from regular page content and grab attention.
- **Slider** (/design-system/slider) — A slider is an interactive control that allows users to select a value from a continuous range by dragging a handle along a track. It often provides intuitive visual feedback as it is interacted with.
- **Toast** (/design-system/toast) — A toast is a brief, non-disruptive message that appears temporarily at the edge of the screen to provide feedback about an action or system status.
- **Tabs** (/design-system/tabs) — Tabs are navigation elements that organize and separate content into different sections within the same view. They allow users to switch between related content, maintaining context while reducing clutter.
- **Checkbox** (/design-system/checkbox) — A checkbox is an interactive control that allows users to select or unselect items. They may be a single item to trigger other logic, or a list of multiple items to select amongst.
- **Radio** (/design-system/radio) — A radio button is an interactive control that allows users to select exactly one option from a predefined set of mutually exclusive choices. Unlike checkboxes, when one radio button is selected, all others in the same group are automatically deselected.
- **Searchbar** (/design-system/searchbar) — A search bar is an interactive input field that allows users to find specific content by entering keywords or phrases. It typically includes a text input area and a search icon/button, often enhanced with features like autocomplete suggestions to help users find information quickly.
- **Tooltip** (/design-system/tooltip) — A tooltip is a small informational popup that appears when users hover over or focus on an element, providing additional context or explanations. It disappears when the user moves away, making it ideal for offering brief, helpful hints without cluttering the interface.
- **Modal** (/design-system/modal) — A modal is a dialog box or popup window that appears on top of the main content, requiring user attention or interaction before returning to the main interface. It creates a focused experience by temporarily disabling the underlying page and dimming the background.
- **Loading** (/design-system/loading) — A loading indicator is a visual element that communicates to users that content or an action is being processed. It provides feedback through animations like spinning wheels, progress bars, or skeleton screens to maintain user engagement during wait times.
- **Toggle** (/design-system/toggle) — A toggle is a switch-like control that allows users to quickly alternate between two opposing states (on/off) with a single click or tap.
- **Input Field** (/design-system/input-field) — An input field is an interactive area where users can enter and edit text or data. It provides a clear visual container for user input, often accompanied by labels and validation feedback, making it essential for forms and data collection interfaces.
- **Icon** (/design-system/icon) — An icon is a small, symbolic visual element that represents an action, feature, or concept. It's purpose is to communicate meaning quickly, save space, and enhance visual navigation across an interface.
- **Table** (/design-system/table)
- **Card** (/design-system/card) — A card is a contained, modular component that groups related information and actions. It displays content like text, images, and interactive elements within a distinct container, often with shadows or borders to create visual hierarchy and organization in layouts.
- **Button** (/design-system/button) — A button is an interactive element that triggers an action when clicked or tapped. It clearly communicates its clickability through visual styling and provides feedback on user interaction, making it a fundamental component for enabling user actions in interfaces.
- **Badge** (/design-system/badge) — A badge is a small visual indicator that displays short, dynamic information like counts or status. It typically appears as a colored circle or pill shape, often overlaid on other elements.
- **Avatar** (/design-system/avatar) — An avatar is a visual representation of a user. It helps identify individuals across a digital interface, commonly used in user profiles, comment sections, and chat applications.
- **Dropdown Menu** (/design-system/dropdown-menu) — A dropdown triggered from a button or right-click target to reveal a menu of actions the user can proceed with

### Flows

- **Adding to cart** (/flows/adding-to-cart) — Shopping online means users need to easily add products they want to their cart. This fundamental action can make or break a sale, so getting it right is crucial.
- **Uploading media** (/flows/uploading-media)
- **Verifying account** (/flows/verifying-account) — Verification is a critical role to promise security for a user in the early phases of onboarding, which means it must be a smooth experience that feels helps rather than burdensome.
- **Canceling subscription** (/flows/canceling-subscription) — Similar to closing an account, a user can decide to end their experience and stop paying for your product. Just because they're leaving doesn't mean we can't give them a graceful exit. It's important to make a cancelation obvious to find and easy to travel through.
- **Filtering items** (/flows/filtering-items) — Filtering helps users find what they need in large collections by specifying specific values of properties the items contain.
- **Saving changes** (/flows/saving-changes) — Users are constantly updating their details. They might be changing an email address, fixing a typo in their name, or updating their payment details. That's why it's important to confirm that a change has been saved, in the clearest way. Here's a breakdown of how changes being saved should look and feel like.
- **Entering promo code** (/flows/entering-promo-code) — A reward for a user to earn a discount on their purchase, promo codes are a pre-requisite in any e-commerce website. ‍ To avoid a confused customer, make sure they understand what is happening with their code - whether it works, expired or isn't applicable.
- **Showing input error** (/flows/showing-input-error) — Users mistype all the time - whether it's a finger slipping or rushing through letters, errors happen. So for an everyday occurrence, solving an error should be obvious and seamless. The key parts of making that happen are strong visuals, clear communication, and state changes — which are all featured below.
- **Resetting password** (/flows/resetting-password) — Every now and then, a user can't remember their password to log back in. Luckily, it's a straightforward process to change it. It's important to make the experience feel straightforward, so the user feels like they've gotten back into their account as smooth as possible.
- **Deleting account** (/flows/deleting-account) — Sometimes it's just not meant to be, and that's okay. Users come and go, so it's important to recognise your solution is only for some and not for all. For those who want to leave, make it as simple as possible. You can try to understand why they're leaving, but don't get too in the way. ‍ There's no need to be passive aggressive or guilt tripping. They'll remember it, and likely share the experience with others who will reconsider your product.
- **Contacting support** (/flows/contacting-support) — If there's ever a problem, a user should know how to get help. Then when they try to get that help, they should know exactly what kind of communication they're receiving. Making support not only available but suitable to how users tackle a problem is important on being on the right track together. If you're explaining to a user in text where the interface elements are when a screenshot would tell a much clearer story, then that's the first problem to solve before you even get to theirs.
- **Making a card payment** (/flows/making-a-payment) — When paying for something online, two thoughts will come to mind for the user: is this safe, and is this clear? A well-designed payment experience covers these by communicating what's happening with a user's money, and that it's all happening securely. Below are the steps a user will take to submit a card payment, and what factors you'll need to consider.
- **Submitting a form** (/flows/submitting-a-form) — A form can help a user achieve anything from creating an account to subscribing to a newsletter. They are often the last step of a user's journey, so should be quick and easy to complete.

### Mobile app

- **In-App Notifications** (/mobile/in-app-notifications) — The in-app feed of alerts, updates, and messages the user has received — distinct from system push notifications.
- **Search** (/mobile/search) — The search experience on mobile where keyboard handling and filtering results are unique to web.
- **Billing** (/mobile/billing) — Payment history, receipts, and everything related to how the user is charged.
- **Camera** (/mobile/camera-media-capture) — Capturing photos, video, or documents as well as reviewing and customising the capture experience for accessing the phone camera within an app.
- **Map View** (/mobile/map-view) — The native map screen showing location-based content, user position, and contextual overlays
- **Onboarding Checklist** (/mobile/onboarding-checklist) — The in-app progress checklist that guides a new user through key setup steps to learn how the product works by completing actions.
- **Paywall** (/mobile/paywall) — A hard gate that blocks access to locked content and offers a path to subscribe.
- **Onboarding** (/mobile/onboarding) — The first-run experience that orients a new user, collects necessary setup information, and delivers an early sense of the app value
- **Chat** (/mobile/chat) — The one-to-one or group messaging screen, handling keyboard behaviour, message input, media sharing, and real-time updates in the constraints of a mobile screen.
- **Settings** (/mobile/settings) — The screen where users manage their account, preferences, notifications, and app behaviour.
- **In-App Browser** (/mobile/in-app-browser) — A browser experience inside a mobile app, which is handy for opening web links or accessing web data via API.
- **Gesture navigation** (/mobile/gesture-navigation) — The touch-based interaction patterns that let users navigate and act without tapping buttons.
- **Splash Screen** (/mobile/splash-screen) — The first screen a user sees when launching the mobile app and it initialises before transitioning to the home screen.
- **Checkout** (/mobile/checkout) — The payment flow on mobile optimised for native payment methods and the constraints of a small screen.
- **Action Sheet** (/mobile/action-sheet) — The sheet that slides up from the bottom of the screen to present options or confirmations — the mobile equivalent of a dropdown menu or modal dialog.
- **Tab Bar Navigation** (/mobile/tab-bar-navigation) — The persistent bottom navigation bar that gives users access to the top-level sections of the app
- **Cart** (/mobile/cart)
- **Login** (/mobile/login) — Everything a returning user needs to authenticate quickly and securely.
- **Account** (/mobile/account) — Private account settings like credentials, linked accounts, notifications, and destructive actions.
- **Invite** (/mobile/invite) — The flow for adding collaborators or members to a shared space with role assignment and pending invite management.

### Web app

- **Notification Settings** (/web-app/notification-settings) — Where users configure exactly which notifications they receive, through which channels, and how frequently.
- **Help Center** (/web-app/help-center) — A self-serve documentation hub where users can find answers without contacting support.
- **Billing** (/web-app/billing) — Payment methods, invoices, and everything related to the financial side of the account
- **Settings** (/web-app/settings) — A screen that gives users control over their account, preferences, and application behaviour
- **User Management** (/web-app/user-management) — A screen that allows admins to view, invite, and manage the users who have access to a product or workspace.
- **Single Item Detail** (/web-app/single-item-detail) — A screen that displays the full details of a single record — a user, order, document, or any other entity — after selecting it from a list.
- **Admin Panel** (/web-app/admin-panel) — Where administrators manage users, configure the product, and oversee activity across the organisation
- **Analytics** (/web-app/analytics) — A live dashboard that surfaces key metrics and trends, helping users understand what is happening right now.
- **Empty State** (/web-app/empty-state) — The state of a screen or component when there is no data to display, whether it's because a user is new, has cleared their content, or a search returned no results.
- **Notifications** (/web-app/notifications) — An area that surfaces alerts, updates, and activity relevant to the user to help them stay informed
- **Onboarding** (/web-app/onboarding) — A guided experience that introduces new users to the product and gets them to their first moment of value as quickly as possible
- **Public Profile** (/web-app/public-profile) — The view of a user that other people in the product see, distinct from the account settings profile, which is private and editable.
- **Timeline / Gantt View** (/web-app/timeline-gantt-view) — A screen that displays tasks, milestones, or events along a horizontal time axis, commonly used in project management products to show schedules and dependencies.
- **Feed** (/web-app/feed) — A stream of content, activity, or updates that users scroll through to stay informed.
- **API Keys** (/web-app/api-keys) — A screen where users generate and manage API keys and other developer-facing credentials needed to integrate the product programmatically.
- **Search Results** (/web-app/search-results) — Displaying and navigating results matching a user's query from within the product.
- **Integrations** (/web-app/integrations) — A screen that shows the third-party tools and services a product can connect with, allowing users to link their existing workflows.
- **Version History** (/web-app/version-history) — A screen outlining different versions of an item or experience that you can navigate between.
- **Comments** (/web-app/comments)
- **Multi-step form** (/web-app/multi-step-form) — A form split across multiple steps or screens to reduce cognitive load when collecting a large amount of information from the user.
- **Kanban board** (/web-app/kanban-board-view) — A visual board that organises items into columns representing stages or statuses, allowing users to track and move work through a workflow.
- **Chat** (/web-app/chat) — A screen for real-time or asynchronous messaging between users, either one-on-one or in a group context.
- **Maintenance** (/web-app/maintenance) — A screen shown when the application is temporarily unavailable due to scheduled maintenance or an unexpected outage.
- **2FA** (/web-app/2-factor-authentication) — A screen that guides users through setting up or completing two-factor authentication to add a second layer of security to their account
- **Account** (/web-app/account) — Where users view and manage their personal information, preferences, and account-level details
- **Pricing** (/web-app/pricing) — A pricing page breaks down costs, features and options for paying to access the product itself or a version of it.
- **Login** (/web-app/login) — A login page is a critical component of many web applications, serving as the gateway for users to access personalized features, secure content, and their own data

### Website

- **Security** (/website/security)
- **About** (/website/about) — A page that tells the story of the company — who built it, why, and what they believe.
- **Privacy** (/website/legal-privacy) — Page covering the legal terms of using the product (privacy policy, terms of service, and cookie policy) written clearly and kept current.
- **Features** (/website/features) — A page that walks through the full capabilities of the product, helping prospects understand what it does in depth.
- **Testimonials** (/website/testimonials) — A page dedicated to social proof, collecting customer quotes, reviews, and success stories in one place.
- **Affiliate** (/website/affiliate) — A page that invites potential affiliates or partners to join a programme, explaining how it works and what they stand to earn.
- **Compare** (/website/compare-page) — A page that positions the product directly against a specific competitor, helping prospects who are evaluating alternatives to make a decision.
- **Status** (/website/status)
- **Press / Media** (/website/press-media) — A page providing journalists, analysts, and content creators with the resources they need to cover the company accurately.
- **Billing** (/website/billing) — A screen where users manage information regarding payment, subscription and billing.
- **Waitlist** (/website/waitlist)
- **Team** (/website/team) — A team page introduces an organization's staff members, leadership, or key personnel. It typically helps visitors understand the people behind the company while adding a human element to the brand's identity.
- **Cart** (/website/cart)
- **Search** (/website/search) — A search results page displays organized findings based on a user's search query. It presents relevant matches in a scannable view to help users quickly find and navigate to their desired destination.
- **Careers** (/website/careers) — A careers page typically displays job openings, company culture, and employment opportunities. It allows potential candidates to explore available positions, learn about the organization's values, and typically includes functionality to submit job applications or contact recruiters.
- **Blog Post** (/website/blog-post) — A blog post page displays a single article's content, including its title, author, publication date, and body text. It often includes related media (images, videos), social sharing options, and commenting functionality, allowing readers to engage with the content and navigate to other posts.
- **Contact Us** (/website/contact-us) — A contact us page provides visitors with methods to communicate with an organization. It typically includes a contact form, business address, phone numbers, email addresses, and sometimes a location.
- **Pricing** (/website/pricing) — A pricing page presents product or service costs, features, and plan comparisons in a clear, organized format. It helps users understand different pricing tiers, included features, and subscription options, enabling them to make informed purchasing decisions.
- **FAQ** (/website/faq) — A FAQ (frequently asked questions) page provides answers to common user queries in a structured, easy-to-scan format. It serves as a self-service resource to address typical customer concerns, reduce support inquiries, and help users find solutions quickly.
- **404** (/website/404) — A 404 page appears when users attempt to access a non-existent or moved webpage. It communicates the error in a friendly way and helps users navigate back to working pages through suggested links, search functionality, or a return to homepage option.
- **Login** (/website/login) — A login page is a critical component of many web applications and websites, serving as the gateway for users to access personalized features, secure content, and their own data.
- **Blog** (/website/blog) — A blog page aggregates and displays multiple articles or posts in a chronological order, typically showing previews, titles, publication dates, and categories. It provides easy navigation through pagination or infinite scroll, allowing users to browse and discover content.
- **Sign up** (/website/sign-up) — A sign up page enables new users to create an account by providing required information through a form. It guides users through the registration process, validates input data, and establishes their credentials for accessing restricted features or personalized content.

_Bundled content: v3.2.0, 2026-08-14._

## Checklists

Только каталог выше грузится всегда (112 названий с описанием и путём).
Сами пункты чек-листов вынесены в `references/` по категории — читай
только нужный файл под конкретный запрос, не все пять:

| Категория | Файл | Чек-листы внутри |
|---|---|---|
| Design system | [references/design-system.md](references/design-system.md) | Tokens, Typography, Color System, Button |
| Flows | [references/flows.md](references/flows.md) | Adding to cart |
| Mobile app | [references/mobile-app.md](references/mobile-app.md) | Paywall, Onboarding, Gesture navigation, Splash Screen, Action Sheet, Login, Account |
| Web app | [references/web-app.md](references/web-app.md) | Billing, Settings, Admin Panel, Empty State, Onboarding, 2FA |
| Website | [references/website.md](references/website.md) | Security, Features, Pricing, 404 |

Название в каталоге совпадает с секцией внутри нужного файла — открой
файл категории и найди `### <Name> — <Category>`. Каталог покрывает
все 112 чек-листов по названию/пути; из них построчно вынесены в
`references/` только 26 самых просматриваемых (те же, что раньше были
инлайн в этом файле) — на остальные каталог сам укажет ссылку на
`checklist.design{path}`, без веб-фетча содержимого (см. правило
источника выше: не выдумывать пункты по имени).
---

## Проверяемый результат (для /loop-build)

Audit-режим уже выдаёт таблицу со статусами по каждому пункту. Готово —
когда в сохранённом отчёте (`docs/audit-<checklist>.md` или как назвал
пользователь) нет ни одной строки 🔴 (Missing) и нет ❔ без объяснения,
что именно её решит. Реальная команда: `grep -c '🔴' docs/audit-*.md`
должна вернуть `0`. ⚪/🟡 не блокируют — это осознанные решения, не долги.

## Несколько чек-листов сразу — распараллелить

Просят прогнать несколько разных экранов по своим чек-листам за один
заход (например весь флоу онбординга — Login + 2FA + Onboarding) —
раздай по subagent на экран/чек-лист, каждый со своим отчётом и своей
таблицей. Экраны независимы, общего состояния нет, коллизий не будет.
Один экран под несколько чек-листов сразу (settings-страница с секцией
permissions) — не разносить по агентам, это уже описано в самом файле
как «audit against each, kept clearly separate», делает одна сессия.

