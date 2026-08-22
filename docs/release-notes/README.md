# Bconomy Official Release Notes Archive

> Extracted from the official Bconomy site: [https://blog.bconomy.net/category/updates/](https://blog.bconomy.net/category/updates/)

**Total Releases**: 480
**Date Range**: December 19, 2020 – August 22, 2026

## Yearly Archives

| Year | Releases | File Link |
| :--- | :--- | :--- |
| **2026** | 122 updates | [RELEASE_NOTES_2026.md](RELEASE_NOTES_2026.md) |
| **2025** | 32 updates | [RELEASE_NOTES_2025.md](RELEASE_NOTES_2025.md) |
| **2024** | 15 updates | [RELEASE_NOTES_2024.md](RELEASE_NOTES_2024.md) |
| **2023** | 14 updates | [RELEASE_NOTES_2023.md](RELEASE_NOTES_2023.md) |
| **2022** | 76 updates | [RELEASE_NOTES_2022.md](RELEASE_NOTES_2022.md) |
| **2021** | 218 updates | [RELEASE_NOTES_2021.md](RELEASE_NOTES_2021.md) |
| **2020** | 3 updates | [RELEASE_NOTES_2020.md](RELEASE_NOTES_2020.md) |
| **All Time** | **480 updates** | [ALL_RELEASE_NOTES.md](ALL_RELEASE_NOTES.md) |

## Recent Release Highlights (2026)

### [v2026.08.22](https://blog.bconomy.net/2026/08/22/release-v2026-08-22-09a1716ac/)
**Date:** 2026-08-22

A new update for Bconomy has been released.

## Improvements

- **Bulk item actions.** (TheCarriedOne)

You can **use, craft, (un)lock or pin a whole selection of items at once** from the Items page instead of doing them one-by-one.

- Each item will use the amount set in that item’s “**Value to use on item card**” preference (holding Shift still means max).

- The Pin button is now a dropdown showing **all your categories** so you can put the selection into any category, not just Pinned.

- Reminder: you can select multiple items by **clicking on the image on items page**.

- **Feed selected pets.** (TheCarriedOne)

In Manage Pets → Feed & Collect you can now **check individual pets and feed only those**, even if they’re not adventuring.

- If you leave the selection empty it still feeds all adventuring pets like before.

- **Pet find rate shown on pet items bar.** (TheCarriedOne)

The pet items bar now shows the pet’s current find rate.

- **Relay research tree rebuild.** (TheCarriedOne)

The Relay research tree now reads **left-to-right in tidy columns**.

- Research nodes are **colour-coded by the title they lead to** (nodes that feed several branches blend colours; the two core nodes stay neutral).

- You can **expand the tree to fill the page** with a new ⛶ button. Not available on mobile.

- **Several title prerequisites changed**, which means a few people will need to acquire the new prereq research before re-unlocking those lost.

Thermal Master now requires Thermal Routing;

- Economic Engineer now requires Mint Baseline Trickle and Mint Fuel Efficiency;

- Relay Architect no longer requires Mint Fuel Efficiency;

- Status Watchdog now requires Thermal Routing, Mint Faction Routing, Recovery Bank Control and Recovery Auto-Focus.

- The Refinery upgrade label is now “Base output buffer cap” for clarity.

- The research view has **Graph and List modes**, with search and filters. Search queries title, effect text and branches of each node.

- Hovering a node **lights up its whole chain** and dims the rest.

- A list view toggle **shows research as a sortable table** (state, name, branch) for quick scanning, and your view mode and filters are remembered between visits (search always starts empty).

## Bug Fixes

- **Rare Finds leaderboard and totals correction.** (ShadyBliss)

Finding a Museum collectible **no longer increases Rare Finds**.

- Existing Rare Finds totals and current/recent leaderboard windows **are corrected**.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.19](https://blog.bconomy.net/2026/08/19/release-v2026-08-19-11243bfa2/)
**Date:** 2026-08-18

A new update for Bconomy has been released.

## New Features

- **Relay Network Store.** (TheCarriedOne)

A **new Store page in the Relay Network** where you can spend Salvage on relay components and the raw materials from their recipes (no purchase limits beyond how much Salvage you have).

- **DX Coolant is available** for 250 Salvage each. There’s a daily purchase limit that grows with your total module levels (capped at 5,000 per day).

- Five catalog items **rotate on sale each day** at a discount.

## Improvements

- **Bay fuel consumption.** (TheCarriedOne)

Mint and Recovery bays now burn fuel twice as fast.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.18](https://blog.bconomy.net/2026/08/18/release-v2026-08-18-e39e945bd/)
**Date:** 2026-08-18

A new update for Bconomy has been released.

## New Features

- **Transmutation Queue.** (TheCarriedOne)

Refinery **transmutations can now be queued**: while one recipe is running you can line up more to run automatically, and they continue while you’re offline.

- Unlock the queue with the **new Transmutation Queue research**, then buy the **Transmutation Queue upgrade** (5 tiers) to increase how many recipes you can queue from 2 to 10.

- When you queue a step its required **items are reserved from your inventory** (and refunded if you cancel). A queued step’s “max” **assumes earlier queued steps finish**, so you can chain conversions (e.g. green→amber then amber→purple) even if you don’t yet have the intermediate item.

- You can **cancel a single queued step** (any steps that depended on it are dropped and refunded).

## Improvements

- **Mint Bay income and costs.** (TheCarriedOne)

Mint Bays now **generate BC in proportion to what they cost to build**, each module and level-up pays for itself in a predictable number of days. **Early modules repay fastest**; very deep module counts repay more slowly.

- Overall Mint **income is much higher** (*FOR REAL this time*) across the board (example: a 100-module max-level bay goes **from ~18B to ~300B per day**).

- Heat in overclocked mode **increased from 2.5× to 3.5×**.

- Mint modules beyond #100 no longer get ever more expensive: **craft cost levels off** instead of climbing indefinitely. Overpayment was **refunded automatically**.

- Mint modules beyond #350 have the **Salvage cost capped at 25M**.

- Module tooltips now **show each mint module’s actual BC/min contribution**.

- Pending (unclaimed) mint BC that accrued before this update is **preserved at the old rate**; the new rates apply from this update onward.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.17.3](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-62560b2a/)
**Date:** 2026-08-17

A new update for Bconomy has been released.

## New Features

- **Prestige bonus to Work.** (TheCarriedOne)

Every ascension (Prestige) now **permanently increases how much you earn from Work**, stacking on top of your rank bonus.

- Early Prestige tiers **give the biggest jump** and later tiers add progressively smaller amounts (example multipliers: about 1.5× at tier 10, 2.2× at tier 100, ~4× at tier 1000).

- This has a kill-switch that **I promise** I will use this time, not like first day of Recovery bay.

## Improvements

- **Miniboss loot broadcast listing.** (TheCarriedOne)

When a miniboss flees, the loot broadcast now **lists each player who received a Tiny Gem Bag** instead of folding low-damage contributors into a single summary line.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.17.2](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-95a9453/)
**Date:** 2026-08-17

A new update for Bconomy has been released.

## Improvements

- **Grouped module controls.** (TheCarriedOne)

You can now level up modules from the grouped module list even without Batch Operations research **if that group contains a single module**.

- “Lv +” buttons now dim **when you can’t afford the next level** (even after auto-crafting), so you can see at a glance which modules you can actually upgrade.

- **Mystical Ball profit/loss broadcast.** (TheCarriedOne)

Hardcore Mystical Ball broadcasts now say **whether the roll was a profit or a loss** compared to the 250M BC cost of the item.

- **Saved boost set bulk-use error message.** (TheCarriedOne)

Bulk-using a saved boost set now **tells you which item’s amount was too high** instead of showing a bare, confusing number comparison.

## Bug Fixes

- **Pinned Amplifiers and Pulsators fix.** (TheCarriedOne)

On hardcore and seasonal profiles, Amplifiers and Pulsators you own now **appear under the pinned category consistently**.

- **Coinflip loss-prevention message.** (TheCarriedOne)

When your Auspicious Coin breaks, the message now also tells you **how many Auspicious Coins you have left** equipped and in inventory.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.17](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-0d63098/)
**Date:** 2026-08-16

A new update for Bconomy has been released.

## Changelog

- **Discord bot now only launches the game.** (TheCarriedOne)

The bot’s **slash commands** and their **in-chat buttons are retired**. You **won’t be able** to run game commands inside Discord anymore. Use `/bconomy` or Discord App picker to start the game from now on.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.16](https://blog.bconomy.net/2026/08/16/release-v2026-08-16-c2487088/)
**Date:** 2026-08-16

A new update for Bconomy has been released.

## New Features

- **Vault badge.** (TheCarriedOne)

A new **“Vault” badge appears on the Faction / Vault nav tab** and counts down while your FP boost is draining. As any other badge, **requires Bay Telemetry research** in Relay Network.

- The **badge hides** when nothing is draining.

- **Item lock.** (TheCarriedOne)

You can **lock a usable item** so it can’t be used by accident by **using 🔒 Lock button** in item modal.

- While locked **all controls** that use the item **are disabled**.

- Bulk sets that contain any locked item **won’t execute** until you unlock that item.

- **Coinflip: results, trophy, and leaderboards.** (TheCarriedOne)

**New Whiffed 💨 trophy**: earn it when an Auspicious Coin breaks **on its very first flip** after you equip a fresh one.

- Coinflip output now **shows extra lines**: win/loss streaks (🔥 for heads, 🧊 for tails), how many heads and tails your currently equipped Auspicious Coin has flipped, and when a coin breaks it shows how much BC it won you before breaking.

- **New Coinflip leaderboards** under Players → Coinflip for best win streak, best loss streak, and best single-coin Auspicious Coin heads/tails/winnings.

- The **Stats modal now shows a “Streak info”** on the coinflip stat row with your current streaks and links to each leaderboard.

## Improvements

- **Relay Network status bars.** (TheCarriedOne)

The Relay Network status box **is now a set of bars** to match the overall feel of the whole page.

- **Rank Up modal tweaks.** (TheCarriedOne)

Setting a target and turning on “Apply to progress bar” now **makes the header progress bar actually track that target**, and reopening the modal remembers your saved target.

- You can pick a new “None” targeting option to **clear a target** without losing your saved tier/rank/mode.

- The rank dropdown now **shows each rank’s number**.

- “Maximum you can reach” **shows more reliably** and won’t duplicate when targeting “Max affordable”.

- The Advance button will now **advance as far as you can currently afford within your tier** (not just one rank), and only appears when that is different from your main target.

## Bug Fixes

- **Amplifiers consumed in bulk sets.** (TheCarriedOne)

Amplifiers used through a bulk set are now **properly consumed from your account**. Previously they were not removed and could be reused indefinitely.

- **Vault balance layout.** (TheCarriedOne)

Fixed a **large, wrong-looking gap** in the Vault balance text (solo and faction vault) when “Compact numbers” is enabled.

- **Item popup buttons visible when collapsed.** (TheCarriedOne)

Collapsing the item details in an item’s info popup **no longer hides the Use / Equip / Sell buttons**.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.15](https://blog.bconomy.net/2026/08/15/release-v2026-08-15-105dc619/)
**Date:** 2026-08-14

A new update for Bconomy has been released.

## Improvements

- **Supply Depot rerolls.** (TheCarriedOne)

Your first Supply Depot reroll each day now **always costs the base price**.

- Only **extra rerolls** on the same day **cost more**; their price now ramps up more gently (1.3x instead of 1.5x).

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.14.2](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-ce1c7ed1/)
**Date:** 2026-08-14

A new update for Bconomy has been released.

## Improvements

- **Classic theme Relay and sidebar badges.** (ShadyBliss)

Classic theme Relay module rows use their **original lighter blue-purple background** again, so the old look is back.

- Sidebar count badges take up **less horizontal space**.

## Bug Fixes

- **Calibrated Amplifiers in bulk sets.** (TheCarriedOne)

Calibrated Amplifier rows now **show which action they target**.

- This finally makes them **includable in bulk sets**!

- **Action buttons, Amnesiac.** (TheCarriedOne)

Action buttons **no longer get stuck red after a Amnesia-processed action** when clicking fast, you won’t have to refresh the page or wait it out to fix it.

- While an action is being sent, its **button now dims briefly instead of turning red**. For normal actions the red cooldown now appears **a moment after you click** rather than instantly.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.14](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-fc45634/)
**Date:** 2026-08-14

A new update for Bconomy has been released.

## Improvements

- **FP drain time display.** (TheCarriedOne)

Faction Vault, Faction Boosts, and your personal Vault modals now **show how long your current FP balance will last**.

- **UI layout, chat, and Rank Up improvements.** (ShadyBliss)

Controls and timer badges stay contained on smaller screens so **nothing overlaps or runs off the edge**.

- Chat media controls are **tucked behind a fixed tools menu**, and chat **timestamps are simplified** so they’re less noisy.

- Rank Up offers a one-step **Advance Once action** (targeting still optional), and rank reference pages are now accessible from the footer menu.

## Bug Fixes

- **Recovery Bay heat generation.** (TheCarriedOne)

Recovery Bay **no longer generates heat** when it has no fuel.

- **Farm boost harvest counts.** (TheCarriedOne)

Boost success messages now **show the real number of crops you harvested** in the “New Items” summary instead of placeholder text.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.13](https://blog.bconomy.net/2026/08/13/release-v2026-08-13-69f43d54/)
**Date:** 2026-08-13

A new update for Bconomy has been released.

## Improvements

- **Per-bay coolant settings.** (TheCarriedOne)

Each overclockable bay now **remembers its own coolant setting**. Picking 3x coolant on the Mint bay no longer changes what the Refinery or Recovery bay will use.

- Your current coolant setting is **carried over to every bay**, so nothing changes until you start setting them apart.

- **Rank Up modal balance and preview.** (TheCarriedOne)

The Rank Up modal footer now **shows your current BC balance**, same as most other modals in the game.

- When not using a targeted goal, if you have enough BC to ascend the modal now also **shows the maximum tier and rank** you can currently reach.

- **Bulk adjust action multipliers.** (TheCarriedOne)

Faction Boosts and Solo Vault modals now have an “All actions” section to **raise or lower every action’s multiplier at once**, instead of one at a time.

- **Separated timers on action buttons.** (TheCarriedOne)

Action buttons that have both a cooldown and an expiring boost now** show each timer on its own line** instead of inline.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.12.2](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-292653cb/)
**Date:** 2026-08-11

A new update for Bconomy has been released.

## New Features

- **Per-item lootbox popup setting.** (TheCarriedOne)

Lootbox reward popups (shards, trunks, bounties, gem bags) now have a “**Don’t show this again** for <item>” checkbox.

- If you check it, that item will open **without a popup** next time. You still get the confetti, sound, and a game-log line, just no popup.

- The setting is **per item**, so other lootboxes will keep showing their popups.

- You can undo everything with the **new “Reset Lootbox Popups” button** under Settings → Gameplay → Actions & Confirmations.

- **Craft Cryo Gel from Cooling Bay.** (TheCarriedOne)

You can now **craft Cryo Gel straight** from the Cooling Bay coolant popover using the new “Craft” link above Withdraw.

- **Custom pet food order.** (TheCarriedOne)

You can set a **custom order for which foods your pets eat first**, per profile.

- Use the **new “⇅ Feed order” link** in Feed section to drag foods into the order you want.

- The food-selection dropdown now lists items **in your chosen order**.

## Bug Fixes

- **Emoji in image captions.** (TheCarriedOne)

Custom emoji shortcodes typed into an image-upload caption now **render as real emoji** in web chat, the same as a normal message.

- **Profile tab persistence.** (TheCarriedOne)

Playing different profiles (main / ironman / hardcore) in separate tabs now stays put: a reconnect or page reload **keeps each tab on its own profile** instead of snapping to whichever profile you last switched into.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.12](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-6a739a58/)
**Date:** 2026-08-11

A new update for Bconomy has been released.

## New Features

- **Public chat image uploads.** (TheCarriedOne)

Upload screenshots and images **directly into public chat** by click the new image button or just pasting an image into the chat box.

- Available to supporters and to accounts that have 10+ ascensions on any profile.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.11](https://blog.bconomy.net/2026/08/11/release-v2026-08-11-6fa8dfb/)
**Date:** 2026-08-11

A new update for Bconomy has been released.

## Changelog

- **Discord Activity open to everyone, text commands obsolete.** (TheCarriedOne)

**Anyone can now launch the Discord Activity**, you no longer need a special role to access it.

- Use `/bconomy` to open the game directly **as a Discord Activity**.

- Slash command replies now include a note **directing you to the Discord Activity or Web Client**, with buttons to access either directly from reply.

- **All other slash commands and buttons/dropdowns** **will stop working next Monday (Aug 17)**, at which point they will instruct to play via Web Client, Discord Activity or mobile app.

*[Credits](https://bconomy.net/credits/)*

---

### [v2026.08.10](https://blog.bconomy.net/2026/08/10/release-v2026-08-10-d2cdb3432/)
**Date:** 2026-08-10

A new update for Bconomy has been released.

## New Features

- **Supply Depot buying and daily sales.** (TheCarriedOne)

The Supply Depot now **buys items from players**: each day it posts **3 wanted items** and pays **above base value for them**.

- Each wanted item shows its own rate as a percentage above base value (most pay around double; **higher rates exist** but are rarer).

- The day’s wanted list is the **same for everyone and changes once per day**. You can **pay to reroll it** for a fresh set, but only before you’ve sold anything that day.

- You can sell items **above your Mercantilist perk**.

- Some Depot items **go on sale each day at a discount**; the sale changes daily and **cannot be rerolled**, and an item on sale **will never be on the day’s wanted list**.

- The Insider perk now **reduces the fee when selling** as well as when buying.

- The **in-game manual was updated** to document the wanted list, the rare stock reroll, and the Quartermaster perk.

## Improvements

- **Account-following settings and browser import.** (TheCarriedOne)

Many settings now **follow your account** across devices and Discord Activity.

- A new “**Import browser settings**” button (and a one-time banner) lets you copy settings that were only saved in this browser up to your account.

- There’s a new switch to **use a browser-specific theme** on one device if you want it different from your profile theme.

- The claim-all vs feed button now **defaults to claim-all**.

- **Rank Up window and targeted ranking.** (TheCarriedOne)

Clicking the rank bar at the top now opens a 🌟 **Rank Up window** instead of instantly ranking up.

- From that window you can rank up and **ascend all the way to a chosen tier and rank** (or as far as your BC allows) in one click.

- Leave “**Targeted rank up**” unchecked to keep the old behaviour: rank up as far as you can afford in your current tier, or ascend once if you’re already at God.

- Turn on “**Apply to progress bar**” to make the top bar **fill toward your chosen goal** instead of just the next rank.

- The bar **keeps its striped “you can do this now” look** whenever you can afford at least one step. This ***might* need a change later on** to only show when actual *rank* is higher than current rank, even in next tier.

- Big multi-tier jumps **only broadcast your final tier**.

## Bug Fixes

- **Obscure Sigil interaction on Hardcore.** (TheCarriedOne)

Obscure Sigil **no longer extends** the duration of self-only Calibrated/Arbitrary Amplifier boosts on hardcore profiles.

- **Ascension broadcasts, celebrations, and Ball Pit logs.** (TheCarriedOne)

Subscribers **see the ascension celebration** (sound, confetti, and console output) **again**, it had been silently doing nothing.

- Ascension **broadcasts now stick around in chat** after you reload, and ascending again always broadcasts fresh or updates the visible row.

- Broadcasts **stay within your own profile type** so main, ironman and hardcore each see their own ascension messages.

- On hardcore profiles, **every Mystical Balls roll is broadcasted** with its colour (these are live-only and do not fill chat history), and are now **visible in player logs**.

*[Credits](https://bconomy.net/credits/)*

---

