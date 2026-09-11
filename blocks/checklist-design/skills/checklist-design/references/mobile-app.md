> Часть скилла checklist-design (см. SKILL.md). Порт checklist.design (Figma Community, bundle v3.2.0), лицензия не заявлена, дословно.

### Paywall — Mobile app

A hard gate that blocks access to locked content and offers a path to subscribe.

Source: https://www.checklist.design/mobile/paywall

#### Items

##### Locked feature context and breakdown
A clear statement or short list of which feature(s) the user is blocked from

##### Upgrade CTA
The primary action to start a subscription or free trial, prominent on the paywall

_Tip: Be specific with what is unlocked e.g. "Unlock unlimited projects" or "Access full library"_

##### Free trial offer
A clear statement of any trial period before billing begins.

##### Dismiss action
A clear, neutral way to close the paywall and return to the free tier

##### Restore purchases
A way for subscribers to recover access after reinstalling or signing in on a new device

##### No guilt language
Dismiss and decline actions in neutral language, without shaming or pressuring the user

---

### Onboarding — Mobile app

The first-run experience that orients a new user, collects necessary setup information, and delivers an early sense of the app value

Source: https://www.checklist.design/mobile/onboarding

#### Items

##### Steps
The number of steps in onboarding, limited to what's genuinely required before the app can be used

_Tip: Steps that can be deferred without preventing the app from functioning on day one consistently belong later, not in onboarding_

##### Progress indicator
A clear indication of how many steps remain and where the user is in the sequence

_Tip: Users who can see the end of onboarding are significantly less likely to abandon it than those who feel they are in a tunnel_

##### Step navigation
A clear way to advance through steps — a 'next' button or a horizontal swipe

##### Contextual permissions
Permissions surfaced at their relevant moment, not grouped at the start

##### Skip option
A visible way to skip onboarding and explore the app, with setup completable later

_Tip: Users who skip and explore freely often complete setup voluntarily once they understand the value_

##### Personalisation step
One or two choices that make the app feel tailored from the start — name, interests, or another relevant detail

##### Keyboard handling
Views adjust for the keyboard, with the right type per field and Next advancing to the next input

---

### Gesture navigation — Mobile app

The touch-based interaction patterns that let users navigate and act without tapping buttons.

Source: https://www.checklist.design/mobile/gesture-navigation

#### Items

##### Swipe to go back
The standard gesture for going back without tapping a button

_Tip: This can be disabled on screens where a horizontal swipe exists to not be a conflict_

##### List item swipe actions
Revealing quick actions — delete, archive, mark as read — without opening the item

_Tip: Suitable only if there are 2-3 actions available on the item, any more may be too significant space was_

##### Pull to refresh
For scrollable lists, with a visible indicator and haptic confirmation when triggered

##### Long press menus
A long press reveals actions relevant to that specific item

_Tip: These are utilised for quick actions, and the action should exist elsewhere in a more accessible way in the app_

##### Pinch to zoom
Image and map content support standard pinch-to-zoom, resetting zoom on navigation away

##### Drag to reorder
Reorderable lists or cards support long-press-to-lift and drag, with clear visual feedback while dragging

##### Gesture hints
A subtle animation or tooltip hinting at a key gesture on first encounter

_Tip: If it's a significant value to learn the gesture, the hint could persist until the user tries the action, so they understand it better_

##### Haptic feedback
Useful for gestures where a finger covers the screen and engagement isn't visually clear — pull-to-refresh, long press, drag

---

### Splash Screen — Mobile app

The first screen a user sees when launching the mobile app and it initialises before transitioning to the home screen.

Source: https://www.checklist.design/mobile/splash-screen

#### Items

##### Logo or wordmark
The app brand mark centred on a clean background

##### Brand background
A solid or subtly branded background that makes the transition from the home screen clear

##### Launch duration
The splash shown only as long as the app genuinely needs to initialise, not as decorative padding

##### Transition to first screen
A smooth, intentional animation into the first real screen — not a hard cut or jarring flash

##### No interactive elements
No buttons, inputs, or tappable areas — purely for transition

##### Loading indicator
For any initialisation taking more than a second so the user knows something is happening

_Tip: This could be your logo, wordmark or illustration you use as the key visual in a looping animation_

---

### Action Sheet — Mobile app

The sheet that slides up from the bottom of the screen to present options or confirmations — the mobile equivalent of a dropdown menu or modal dialog.

Source: https://www.checklist.design/mobile/action-sheet

#### Items

##### Heading and actions
A clear heading stating the sheet's purpose, plus the relevant actions the user can select

##### Swipe or backdrop dismiss
Dismissible by dragging down, tapping the dimmed backdrop, or the expected close button

##### Destructive action styling
Destructive options — delete, remove, block — in red, positioned last, separate from safe actions.

_Tip: Users scan top-to-bottom and tap quickly — a destructive action buried at the bottom prevents accidental taps._

##### Cancel action
A clearly labelled cancel/close option that dismisses without action

_Tip: Typically the secondary action, similar to a desktop modal_

##### Snap points (if expandable)
Where the sheet expands or compresses to on resize, rather than free-form

_Tip: A drag handle at the top of the sheet indicates the action sheet can be expanded (or dismissed)_

##### Content scrollability
What sticks as you scroll so the sheet stays contextual, with the sheet itself fixed in position

##### Keyboard relation
Sheet size and responsiveness when the keyboard is triggered while it's active

##### Backdrop dimming
The screen behind is darkened to draw focus to the sheet

---

### Login — Mobile app

Everything a returning user needs to authenticate quickly and securely.

Source: https://www.checklist.design/mobile/login

#### Items

##### Social sign-in
Sign-in via an existing Apple or Google account, skipping manual credentials

##### Email field
The input for the account's email address.

##### Password field
A masked password input, with an option to reveal what's typed.

##### Biometric authentication
Face ID or fingerprint sign-in, available after one password authentication

_Tip: Encouraged to suggest after initial login so it’s a faster experience in the future_

##### Credential autofill
System-level support for pre-filling saved credentials from the password manager.

##### Forgot password link
The link into the reset flow, for users who can't recall their password.

##### Error states
Feedback on failed authentication, distinguishing an unrecognised email from an incorrect password.

##### Passwordless sign-in (magic link)
An alternative sign-in method: a one-time link sent to the user's email, no password required

_Tip: Useful for infrequent-use apps where remembering a password between sessions is difficult_

---

### Account — Mobile app

Private account settings like credentials, linked accounts, notifications, and destructive actions.

Source: https://www.checklist.design/mobile/account

#### Items

##### Email
Current email address, with an option to update it

_Tip: Verifying the new address before completing the change is standard practice, where notifying the old address too adds a useful security signal._

##### Password change
A way to update the account password.

_Tip: Requiring the current password before accepting a new one prevents unauthorised changes on an unlocked device_

##### Linked accounts
Third-party accounts connected for sign-in or data access, with an option to disconnect

##### Save confirmation
Clear feedback that changes saved — inline or as a toast

_Tip: Auto-save with a subtle confirmation is more pleasant than explicit save, but if you want an explicit save button, it should remain disabled until there are changes_

##### Delete or deactivate account
Deactivate and permanent-delete options, clearly separated from other settings

---

