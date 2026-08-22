# Bconomy Release Notes — 2026

> Source: [Bconomy Updates Category](https://blog.bconomy.net/category/updates/)

**Total Updates in 2026**: 122

[Back to Release Notes Index](README.md) | [View All Releases](ALL_RELEASE_NOTES.md)

---

## [v2026.08.22](https://blog.bconomy.net/2026/08/22/release-v2026-08-22-09a1716ac/)
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

## [v2026.08.19](https://blog.bconomy.net/2026/08/19/release-v2026-08-19-11243bfa2/)
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

## [v2026.08.18](https://blog.bconomy.net/2026/08/18/release-v2026-08-18-e39e945bd/)
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

## [v2026.08.17.3](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-62560b2a/)
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

## [v2026.08.17.2](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-95a9453/)
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

## [v2026.08.17](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-0d63098/)
**Date:** 2026-08-16

A new update for Bconomy has been released.

## Changelog

- **Discord bot now only launches the game.** (TheCarriedOne)

The bot’s **slash commands** and their **in-chat buttons are retired**. You **won’t be able** to run game commands inside Discord anymore. Use `/bconomy` or Discord App picker to start the game from now on.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.16](https://blog.bconomy.net/2026/08/16/release-v2026-08-16-c2487088/)
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

## [v2026.08.15](https://blog.bconomy.net/2026/08/15/release-v2026-08-15-105dc619/)
**Date:** 2026-08-14

A new update for Bconomy has been released.

## Improvements

- **Supply Depot rerolls.** (TheCarriedOne)

Your first Supply Depot reroll each day now **always costs the base price**.

- Only **extra rerolls** on the same day **cost more**; their price now ramps up more gently (1.3x instead of 1.5x).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.14.2](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-ce1c7ed1/)
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

## [v2026.08.14](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-fc45634/)
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

## [v2026.08.13](https://blog.bconomy.net/2026/08/13/release-v2026-08-13-69f43d54/)
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

## [v2026.08.12.2](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-292653cb/)
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

## [v2026.08.12](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-6a739a58/)
**Date:** 2026-08-11

A new update for Bconomy has been released.

## New Features

- **Public chat image uploads.** (TheCarriedOne)

Upload screenshots and images **directly into public chat** by click the new image button or just pasting an image into the chat box.

- Available to supporters and to accounts that have 10+ ascensions on any profile.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.11](https://blog.bconomy.net/2026/08/11/release-v2026-08-11-6fa8dfb/)
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

## [v2026.08.10](https://blog.bconomy.net/2026/08/10/release-v2026-08-10-d2cdb3432/)
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

## [v2026.08.09](https://blog.bconomy.net/2026/08/09/release-v2026-08-09-a76d76b5/)
**Date:** 2026-08-08

A new update for Bconomy has been released.

## New Features

- **Relay refinery transmutations.** (TheCarriedOne)

**New transmutation recipes** at the Relay refinery unlocked by the existing Transmutation research.

- **Personal boosts (T4–T6)**: combine boosts + Pluperfect Gemeralds to make the **next tier**, or swap 3 boosts you don’t use **into 1 boost you do** (same tier).

- **Pet boosts**: combine 20 of a tier **into the next tier**; combine Legendary Aguaje + Pluperfect Gemeralds **into a Magic Token**.

- **Farm boosts**: combine 5 Enriching Fertilizer **into 1 Experimental**; combine an Experimental + Pluperfect Gemeralds **into Gilded Manure**.

- **Supply Depot rare rerolls.** (TheCarriedOne)

The Supply Depot’s Rare stock now has a **Reroll button** that swaps today’s rare item for a different random one.

- Pricing: your first reroll each day costs **1B BC**; each additional reroll within a week **costs 50% more** than the previous one. Prices drift back down as older rerolls age **past 7 days**.

- Once you buy the day’s rare item, **rerolling is disabled until it restocks**.

- New **Quartermaster 📦 perk** (restricted profiles only) gives +1 daily reroll per perk level, up to +4 (5 rerolls/day total).

## Improvements

- **Item usage info.** (TheCarriedOne)

Relay Network usages are now **shown in Used to Purchase / Upgrade / Research** item modal sections.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.08.2](https://blog.bconomy.net/2026/08/08/release-v2026-08-08-76fb698ce/)
**Date:** 2026-08-08

A new update for Bconomy has been released.

## New Features

- **Transmutation (Refinery Bay).** (TheCarriedOne)

Unlock a **Transmutation research** in the Relay tree to enable a new transmute system in your Refinery Bay.

- For now, two transmutations, **upscale and downscale gemeralds**:

4 green → amber,

- 3 amber → purple,

- 2 purple → red,

- or one of each → a Pluperfect.

- 2 Pluperfect → one of each,

- 3 red → 2 purple,

- 4 purple → 3 amber,

- 1 amber → 1 green.

- Conversions are **lossy by design**.

- Batches **cook over time** and each converted gem finishes independently.

- You can **claim finished gems** while the rest keep cooking. Click the transmute bar or use the popover to grab what’s ready.

- Cancel returns any gems that already finished and refunds the input gems for whatever hasn’t finished yet. **Any remaining progress is lost**.

- Transmutation speed scales with your Refinery module levels and a new 5-tier **Transmutation Speed upgrade**.

- **New profile stat: “Transmuted”**, tracks the BC worth of gems you’ve fed into transmutation.

## Improvements

- **Perk card max-level info.** (TheCarriedOne)

Perk cards on the Prestige page now **show their maximum level and the benefit **at that max level, so you can see the ceiling of a perk before spending runes.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.08](https://blog.bconomy.net/2026/08/08/release-v2026-08-08-307960a03/)
**Date:** 2026-08-07

A new update for Bconomy has been released.

## Improvements

- **Action sidebar timers and titles.** (TheCarriedOne)

Cooldown and boost-expiry **timers now appear together** on the right side of each action button instead of being split across two spots.

- The “Show Title” toggle in the Action Sidebar settings **has been removed**.

- **Profile Triumphs ranking.** (TheCarriedOne)

Triumphs on a profile now show your ranking **among your own profile type only** (for example, an Ironman profile will rank against other Ironman profiles, not the whole game).

## Breaking API changes

- `user/profile` responses **no longer include the `lbPositions` field**. Consumers reading `profile.lbPositions` must switch to the new endpoint.

- New data endpoint `user/lbPositions` — request `{ "type": "user/lbPositions", "id": <bcId> }`, response `{ lbPositions: Record<string, number> }`. Positions are now **scoped to the viewed profile’s own type**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.07.3](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-f13946cfa/)
**Date:** 2026-08-07

A new update for Bconomy has been released.

## New Features

- **Bulk boost sets.** (TheCarriedOne)

Save named groups of boosts (either boost items or amplifiers) and **use the whole set with one click** from the Items sidebar.

- Each set has its own emoji and name; boosts inside are **sorted automatically by tier and action**. Manage sets in the item-categories modal.

- Editor has a **Copy button that gives the chat command** for the set so you can bind it to a hotkey.

- Using a set consumes everything at once. Amplifiers that are capped or on cooldown **are skipped** and you’ll be shown a report; if anything in the set is on cooldown you’ll be **asked to confirm first**.

- To be clear: you configure the bulk sets **at the very bottom of Items -> Categories** modal. Add items or specials (**only one per section, can’t mix both**) and save. You will see your bulk boosts in sidebar then, which you can toggle visibility on/off using the same bullseye icon that you already had before.

## Bug Fixes

- **Noetic Pulsator preserved when Amnesiac triggers.** (TheCarriedOne)

If the Amnesiac perk triggers while a Noetic Pulsator is active, it is **no longer wasted** and the charge is preserved.

- **Crafting with shared sub-materials.** (TheCarriedOne)

Crafting items whose recipe reuses the **same sub-material on multiple branches now works** when you own some (but not all) of that sub-material.

- Previously using “max” or any recursive craft **could fail** with “You don’t have enough <material> for this” **even though the item modal said it was craftable**.

- **Gem bag winners named in miniboss broadcasts.** (TheCarriedOne)

Pluperfect Gemerald, Gem Bag, and Small Gem Bag winners now **always appear** in the miniboss kill broadcast, no matter how much damage they did.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.07.2](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-75b5cad2f/)
**Date:** 2026-08-06

A new update for Bconomy has been released.

## Improvements

- **Trophy visibility by profile.** (TheCarriedOne)

Item-collector trophy position changes in web chat now **only show to players on the matching profile type**.

## Bug Fixes

- **Miniboss weakpoint damage and kill reporting.** (TheCarriedOne)

Weakpoint weapons now actually deal double damage to minibosses, and non-weakpoint weapons deal half, so choosing the weakpoint changes how fast you kill it, **not just the reward tier**.

- The kill modal’s “kill” preset sends the correct number of weapons now, **based on the real, weakpoint-adjusted damage**.

- **Mobile chat, Faction page, and Discord Activity.** (TheCarriedOne)

On mobile, especially in Discord Activity, typing in chat **no longer leaves messages scrolled up behind the keyboard**.

- The Faction page **loads again** (it was erroring for factions with relay activity).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.07](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-56ce4d54e/)
**Date:** 2026-08-06

A new update for Bconomy has been released.

## Improvements

- **Mint bay Work rate and charge.** (TheCarriedOne)

Instead of letting Works be infinitely spammable at high ascension, higher ascension now makes **each Work land more charged**, so each one starts with a bigger payout head-start.

- After you do a Work, chat will show **up to two lines**: how much sooner the next Work will be ready, and how charged the next Work will start.

- Read more [here](https://blog.bconomy.net/?p=1076).

## Bug Fixes

- **Discord Activity fixes.** (TheCarriedOne)

Typing in chat inside the Activity on mobile (Android and iOS) **should no longer let the keyboard cover the chat** or push the view upward, the chat input should stay positioned just above the keyboard.

- Switching between your main / ironman / hardcore profiles **should now work inside the Discord Activity** instead of showing an error.

*[Credits](https://bconomy.net/credits/)*

---

## [Reworking the Mint Bay Work Cooldown](https://blog.bconomy.net/2026/08/07/reworking-the-mint-bays-work-cooldown/)
**Date:** 2026-08-06

The Mint bay’s **Cooldown Destroyer** has been one of the most powerful upgrades in the game for a short while. At high ascension it had drifted well past “powerful” and into “a little ridiculous”. So we’ve reworked (*khem… nerfed.. cough*) it. Here’s what it did before, what it does now, and what that means for you.

## How it worked before

The Cooldown Destroyer shaved time off your Work cooldown. Every Work rolled for a chance to cut the wait, and the further you’d ascended, the more of those chances you got. And they stacked on top of each other.

In practice this snowballed hard. Around 500 ascension it was already very strong; past 1,000 it could carve so much off the cooldown that Work became almost always instant. Players at that level could fire off Works quickly enough to trip the game’s own command rate limit. The root problem was simple: nothing stopped the cut from erasing the *entire* cooldown, so how often you could Work had no real ceiling.

## How it works now

We’ve split the Work cooldown into two parts, each with its own job:

- **Getting ready again**: how soon you can Work next. This now has a hard floor. No matter your ascension, your bay, or your luck, you can never Work more than once per minute. The rate-limit spam is gone for good.

- **Getting charged**: how “full” each Work is, which is what actually drives your payout. This is where the Mint’s real power now lives.

Every Work still rolls, and higher ascension still rolls more often. But now a lucky roll does two things at once: it trims a little off your wait *and* it banks a head-start on your next Work’s payout. Rolls that don’t hit big still shave a bit off the wait. You’re never left with *nothing*.

So instead of high ascension letting you Work faster and faster forever, it now makes each Work land bigger and better-charged.

## What this means for you

- No more machine-gun Working. The fastest you can Work is once a minute. Full stop.

- High ascension is still absolutely worth it. It just pays out through bigger, better-charged Works now rather than sheer speed.

- After a Work, chat will tell you when the Mint helped: how much sooner your next Work is ready, and how charged it will start.

- If you were leaning on spamming Work, lean into the payout side instead. A well-built, running Mint bay makes each Work count for a lot more.

These values are a starting point, and we’ll keep an eye on them as everyone settles in.

---

## [v2026.08.04.2](https://blog.bconomy.net/2026/08/04/release-v2026-08-04-90c5632eb/)
**Date:** 2026-08-04

A new update for Bconomy has been released.

## Improvements

- **Per-mode leaderboards and trophy picker.** (TheCarriedOne)

Item Collectors and Hoarder leaderboards now have **the same main/ironman/hardcore scope dropdown as other boards**. Pick your mode to see that mode’s top holders.

- Each mode now has its own top holder per item and its own hoarder ranking, so collector trophies are earned **within your own mode** instead of only by a single global top holder.

- Trophy names **no longer include “(Ironman)” or “(Hardcore)”**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.04](https://blog.bconomy.net/2026/08/04/release-v2026-08-04-f29e01ce/)
**Date:** 2026-08-04

A new update for Bconomy has been released.

## New Features

- **BC Earned from Work stat and milestone trophies.** (TheCarriedOne)

Added a new stat “*BC Earned from Work*” showing **how many BC you earned** from the Work action.

- Stat counts **only from this release onward** (past work earnings before this release are not retro-counted).

- **Four new lifetime-work trophies** were added:

🧑‍🏭 Hard Worker (1T BC),

- 🥱 Workaholic (10T BC),

- 🤑 Loaded (100T BC),

- 👴 Retired (1Q BC).

## Improvements

- **Mercantilist cap on ironman/hardcore profiles.** (TheCarriedOne)

On ironman and hardcore profiles the Mercantilist perk now **stops at the last level** that actually gives a Supply Depot item.

## Bug Fixes

- **Crash when selling selections that include items you don’t own.** (TheCarriedOne)

Selecting all items and pressing Sell **will no longer crash** if the selection contains items you don’t actually own.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.03.2](https://blog.bconomy.net/2026/08/03/release-v2026-08-03-65de08135/)
**Date:** 2026-08-03

A new update for Bconomy has been released.

## New Features

- **Personal Vault (Hardcore).** (TheCarriedOne)

Hardcore profiles get their **own personal Vault** they can deposit BC into to power boosts.

- Use deposits to add per-action boost steps for fishing, hunting, exploring, and mining (up to 16 steps each). Each step **adds +0.25× to loot and boss damage**.

- The Vault balance **drains over time** depending on how many boost steps you run; when it empties your boosts reset.

- You can increase Vault capacity by **upgrading with Grand Halls**.

- The “FP Contributed” stat and its leaderboard are renamed to “FP Deposited to Vault” and now **include personal Vault deposits**.

## Improvements

- **Supply Depot inventory change.** (TheCarriedOne)

The Supply Depot **no longer sells gems or their bags**.

- The Supply Depot also **no longer sells Burn rewards**.

## Bug Fixes

- **Faction vault display updates immediately.** (TheCarriedOne)

When you deposit BC to a faction vault the new total now **appears on the faction page right away**.

- **Mercantilist perk item list.** (TheCarriedOne)

The prestige page and manual now **show the correct items unlocked by the Mercantilist perk**: restricted profiles (hardcore/seasonal/ironman) see Supply Depot items, while main profiles see Market items.

- **Compact numbers animation fix.** (TheCarriedOne)

Whole-number stat counters (for example the crops-ready bar) **no longer flash decimal digits** while animating when Compact numbers is enabled.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.03](https://blog.bconomy.net/2026/08/03/release-v2026-08-03-51c656842/)
**Date:** 2026-08-02

A new update for Bconomy has been released.

## Improvements

- **Relay bay leaderboards show single-module owners.** (TheCarriedOne)

Mint, Cooling, Refinery and Recovery bay leaderboards now **include players who own just 1 module**.

## Bug Fixes

- **Leaderboard reset notification and reward fixes.** (TheCarriedOne)

**Duplicate “Trophy earned!” notifications** have been fixed.

- **Ghost “Special” rewards are fixed** so the Specials count matches what you actually receive.

- Both trophy notifications and item rewards are **no longer sent if the reset fails**.

- Leaderboard resets complete much faster and (should?) **no longer trigger errors**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.02](https://blog.bconomy.net/2026/08/02/release-v2026-08-02-38fa8e4c5/)
**Date:** 2026-08-01

A new update for Bconomy has been released.

## Improvements

- **Supply Depot improvements.** (ShadyBliss, TheCarriedOne)

New **Bulk purchase** button opens a cart filled with every stocked item at its full available amount.

- **Edit quantities or remove items**; Base cost, Tax, and Total update live as you change stuff.

- Each cart row shows its total cost; **hover to see** the base, tax, total, and how much of that line your BC covers.

- Rows are **tinted by affordability**: green = bought in full, yellow = partially bought, red = can’t afford. Buying is greedy from cheapest to priciest, so one click gets you the most items your BC can cover.

- Players **can now search** their unlocked Supply Depot supplies.

- Items you’ve **bought out for the day are greyed**, move to the bottom of the list, collapse, and read “Out of stock”.

- Supply Depot prices are **no longer rounded up to the next 100 BC**. You now pay the exact marked-up price (rounded to the nearest whole BC). Most items cost **slightly less than before**, for example, seaweed drops from 300 to 250 BC at base Insider.

- Long Supply Depot prices and stock counts **no longer spill off mobile screens**.

## Bug Fixes

- **Work action multiplier display.** (TheCarriedOne)

Active amplifiers or item work boosts **now show as a “🚀 N.NN× from Boosts” line** in both the action button’s multiplier tooltip and the console “Multipliers:” breakdown.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.01.3](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-c118e547c/)
**Date:** 2026-08-01

A new update for Bconomy has been released.

## Improvements

- **Mint Cooldown Destroyer odds.** (TheCarriedOne)

Higher ascension tiers now give **more chances per Work action** to cut the Work cooldown.

- This scaling **no longer stops at tier 100**, it continues all the way to ascension tier 1000, so very high-tier characters will see the increased chance/roll effect.

- You get **extra cut rolls** at 200, 350, 500 and 1000 ascension.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.01.2](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-d6a599f3/)
**Date:** 2026-08-01

A new update for Bconomy has been released.

## Improvements

- **Account-wide Supporter.** (TheCarriedOne)

Supporting the game on any profile makes **every profile** on that account a Supporter.

- **Supply Depot daily restock.** (TheCarriedOne)

The Supply Depot now **refills to full** each day, as opposed to previous approach of slowly going to the max over the 5 day period.

- **Classic progress colors & readability warnings.** (ShadyBliss)

Classic generic progress tracks use the **original game colour** again.

- Clicking a readability warning now **opens the custom-theme colour picker** and selects the affected colour.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.08.01](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-5fa10f9dc/)
**Date:** 2026-07-31

A new update for Bconomy has been released.

## New Features

- **Discord Activity mode.** (TheCarriedOne)

Bconomy **can be launched as a Discord Activity**: an embedded game window you can play inside Discord.

- For now, only **select few Discord roles will be able to use it**. If you’re interested to test it out, ping `@Developer` role and ask if we can let you in. Later on, it will be enabled for everyone.

- Eventually, the text bot **will be phased out**, as the limitations are preventing good feature progress. Web client is already richer than Discord, and that will only grow further.

- At first, when Activity is available for everyone, fishing, hunting, exploring, mining, working, and the daily reward are available as slash commands; **other commands will stop executing**. After a while, even those will be removed.

- **Appearance: Classic, After Dark, and custom themes.** (ShadyBliss)

You can **choose between Bconomy Classic and Bconomy After Dark from Appearance**; your choice follows your account across devices.

- Active **Supporters can create, name, and save** two independent custom themes using clear colour roles and live in-game previews.

- A new **‘Guide me’ walkthrough** shows you the default themes, custom theme editing tools, previews, and save/reset actions; it adapts for non-Supporters so you see only what’s available to you.

## Improvements

- **Owned amount token.** (TheCarriedOne)

**You can type ‘*owned*‘** in any amount box to mean how many of that item you currently hold.

- For example ‘*100k-owned*‘ **will craft enough to top up** to exactly 100,000 without you doing the subtraction.

- It is also available as a saveable **quick-button in the amount presets**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.30.2](https://blog.bconomy.net/2026/07/30/release-v2026-07-30-f904ba43/)
**Date:** 2026-07-30

A new update for Bconomy has been released.

## New Features

- **Ball Pit pools & Mystical Balls.** (TheCarriedOne)

Main and Ironman players now play in **separate Ball Pits**. Your Balls only compete against players of your own profile type, and each pool’s prize is only ever won by someone in that pool.

- Hardcore and Seasonal players **can now use Mystical Balls**: rubbing one rolls a Ball Pit colour and instantly pays out BC scaled to that colour (rarer colours pay much more).

## Improvements

- **Miniboss kill/flee chat broadcasts.** (TheCarriedOne)

Low-damage contributors are **summarized into a single line** instead of many small lines.

- **Supply Depot stock limits tied to prestige.** (TheCarriedOne)

Per-item depot stock limits now depend **only on your prestige tier**, no longer rank in the tier.

- Ascending **never lowers depot limits**, each ascension increases how much of each item you can stock, up to the cap.

## Bug Fixes

- **Tool popup and recipe navigation fixes.** (TheCarriedOne)

The tool upgrade popup now **always opens when you click it**, even if another message (like a “still on cooldown” notice) was showing.

- Clicking an ingredient in a tool’s recipe list now **properly opens that item’s details** instead of creating a stuck double overlay that reopened the tool popup when dismissed.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.30](https://blog.bconomy.net/2026/07/30/release-v2026-07-30-256c4e030/)
**Date:** 2026-07-29

A new update for Bconomy has been released.

## Improvements

- **Targeted chat announcements.** (TheCarriedOne)

You’ll only see announcements that **matter to your profile**. Hardcore players won’t get giveaway, ball pit, or global-boost announcements they can’t act on.

- Giveaway announcements are now shown **only to main profiles**.

- Boost activations are announced only **to the group they affect**. Mains see main activations, ironmen see ironman activations.

- **Mode-specific boosts.** (TheCarriedOne)

Ironman global boosts (pulsator / amplifiers) now only affect ironman players, and main boosts only affect main players, they **no longer boost each other**.

- **Special Store visibility.** (TheCarriedOne)

Hardcore and seasonal profiles **no longer see **the Noetic Pulsator or Arbitrary Amplifier in the Special Store since they can’t use them.

- **Cleaner item names.** (TheCarriedOne)

The “(Self only)” tag **has been removed** from self-only amplifier/pulsator names.

- **Leaderboard winner summaries by mode.** (TheCarriedOne)

When leaderboards reset, the winner summary you see is **for your own mode** instead of showing winners from all modes.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.29.3](https://blog.bconomy.net/2026/07/29/release-v2026-07-29-e128855c/)
**Date:** 2026-07-29

A new update for Bconomy has been released.

## Improvements

- **Recursive craftability and readiness checks.** (TheCarriedOne)

Item cards will now show a Craft button and let you craft **when the Recursive setting makes an item craftable**.

- Craftable item lists, item modal labels, and upgrade readiness markers now follow the Recursive setting so **what’s shown matches what you can actually make**.

## Bug Fixes

- **Inventory discovery for self-only amplifiers and Pulsators.** (TheCarriedOne)

Self-only Calibrated Amplifiers, Arbitrary Amplifiers, and Noetic Pulsators **can now be found and added** to inventory categories without causing errors.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.29.2](https://blog.bconomy.net/2026/07/29/release-v2026-07-29-ca0e6b275/)
**Date:** 2026-07-28

A new update for Bconomy has been released.

## Improvements

- **Mode-specific leaderboards and rewards.** (TheCarriedOne)

Ironman and Hardcore now **get their own daily and weekly leaderboard rewards** and their own top-<stat> trophies, ranked only against other players in the same mode.

- Every stat **leaderboard is now split** into Main / Ironman / Hardcore. The old mixed “everyone” board has been removed.

- A one-time backfill **grants the most recent day’s missed Ironman/Hardcore rewards **so eligible players don’t lose out.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.29](https://blog.bconomy.net/2026/07/28/release-v2026-07-29-a91321a5c/)
**Date:** 2026-07-28

A new update for Bconomy has been released.

## Bug Fixes

- **Quest rewards and milestone compensation.** (TheCarriedOne)

Quest rewards now grant the **full number of Specials shown**. For example, levels 1000 and up that list two XenoServers will now actually give two XenoServers.

- If you already claimed milestones that were missing XenoServers, those missing XenoServers have been **granted to your account automatically**.

- Capped quest reward lists (the continuation summary) no longer repeat an earlier level, the list now **shows the next levels correctly**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.28.2](https://blog.bconomy.net/2026/07/28/release-v2026-07-28-0659096c/)
**Date:** 2026-07-28

A new update for Bconomy has been released.

## Improvements

- **Minigame menu controls.** (TheCarriedOne)

You can **show or hide Coinflip, Ballpit, and Burn individually **in the navigation menu.

- **Pet energy timer.** (TheCarriedOne)

Pet energy bars now **show how long** your stored pet energy will last while adventuring.

- **Faction eligibility and browser.** (TheCarriedOne)

Ironman profiles can only join, create, or receive ownership of **factions run by other ironman players**; main profiles stay in main-run factions.

- The faction browser now only shows factions you’re **eligible to join**.

- Players currently in a faction of a different profile type **have been removed** as a one-time cleanup.

- Hardcore and Seasonal profiles **no longer see** the Faction tab at all.

## Bug Fixes

- **Demigod rank display.** (TheCarriedOne)

Demigods now see **God listed as their next rank** instead of being told they’re already at max rank.

*[Credits](https://bconomy.net/credits/)*

---

## [Go it alone: Ironman mode is here](https://blog.bconomy.net/2026/07/27/ironman-mode/)
**Date:** 2026-07-27

Ever wanted to prove you could build it all yourself, with no market, no handouts, and no shortcuts? **Ironman mode** is here. Your account can now hold extra **profiles**, each playing under its own **mode** that decides what it is allowed to use, all sharing a single login.

In short, you can now:

- create **Ironman** and **Hardcore** profiles alongside your Main,

- compete on their own **solo leaderboards**,

- spend BC at the brand new **Supply Depot**,

- and wear each mode’s own **flair and colours**.

For the full rundown, **continue to the full post**.

## Profiles and modes

Every account still has exactly one **Main** profile: normal Bconomy, no restrictions, and it can never be deleted on its own. On top of that you can now create restricted profiles that share your account but keep their own rank, items, and progress. Only one profile is active at a time, and you switch between them from the **profile switcher in the footer** (or from Settings, Account, Profiles).

## Ironman and Hardcore

The idea behind a restricted profile is simple: everything it owns, it earned. An **Ironman** profile turns off the market and direct transfers, but keeps global boosts and faction benefits. A **Hardcore** profile is the full solo challenge, with boosts and factions switched off too, so nothing you gain ever comes from another player. Seasonal profiles are on their way, but not just yet.

## Your own leaderboards and identity

Solo effort deserves its own scoreboard. Ironman and Hardcore profiles compete on their **own leaderboards** as well as the global ones, so your grind is measured against other solo players and not against market wealth. Each mode also wears its own **flair**: a marker next to your name (🔨 for Ironman, 💀 for Hardcore) and a matching colour scheme you can adjust in customization.

## The Supply Depot

No market does not mean nowhere to spend. Restricted profiles get the **Supply Depot**, a game-stocked store that never touches other players’ goods. It stocks basic materials and consumables, restocked once a day, with the range of items on offer unlocked by your **Mercantilist** perk and the amounts growing with your rank and tier. Prices sit above the market floor, so it is a handy last resort rather than a shortcut. Each day it also features one rotating **rare item**, the same for every player. And the **Insider** perk, which lowers the market fee, now lowers the Depot fee too, so leveling it makes everything here a little cheaper.

## See your other profiles

Open any profile and you will find an **Other profiles** section listing the account’s other profiles and their trophy counts, each a tap away. Your solo achievements are there for everyone to see.

## In short

Spin up a profile, cut yourself off from the market, and see how far you can get on your own. Main players lose nothing, and the die-hards finally have a mountain to climb. Good luck going solo.

---

## [v2026.07.28](https://blog.bconomy.net/2026/07/27/release-v2026-07-28-a2972e89/)
**Date:** 2026-07-27

A new update for Bconomy has been released.

## New Features

- **Finish line for Recovery bay.** (TheCarriedOne)

New research: **Cross-System Recovery**. Once unlocked, looting occasionally shaves time off your **Farm watering** and **Buddy-swap** cooldowns.

- At highest Recovery Bay module investment, stacked cooldown **cuts** on the same loot action **are stronger**, the top of the bay is now worth pushing toward.

- Both of these effects **finish the previously empty gap** from levels 300 to 375. As with other levels in this bay, each level starting from 300 and ending at 375 increase the chance/power of the effect.

- **Inline GIF previews, link support and GIF picker.** (TheCarriedOne)

Klipy/Giphy/Tenor **GIFs finally work correctly** in web client.

- GIFs and images you send in chat can now unfurl automatically on Discord.

- Links in chat **are now clickable**.

- There is a GIF button that opens a **searchable GIF picker**. This picker is **off currently** since we have to deal with Klipy API keys, but it will be enabled the moment we have eligible access. So… **There is no such button**/picker yet (it was a lie at the start of the bullet point), but should soon be, as *it works on my machine*™ already!

## Improvements

- **Miniboss spawn, loot, and announcements.** (TheCarriedOne)

Miniboss spawns **now ping** the `@Boss Fights` role just like regular bosses.

- **Every player** who damages a miniboss on a kill now receives a bag (Small or Tiny) so nobody leaves empty-handed.

- Minibosses have a **50% chance** to also drop a bonus **Gem Bag**. That bonus bag is awarded to **one player** who qualified for a Small Gem Bag (weighted toward the top damager, but any qualifier can win).

- **Bulk boosting idle pets.** (TheCarriedOne)

You can now **bulk-boost pets that are idle**, they no longer have to be adventuring to be selected and boosted.

## Bug Fixes

- **Pet Familiarity display issue.** (TheCarriedOne)

Pet Familiarity (and an in-progress prospecting dig) **no longer reset to 0%** in the pets list after unrelated pet actions (rename, changing held items, buddy swap, attacking a boss). It never really did reset, it was only a UI issue, but now that issue is gone.

- **Amount shortcuts and presets.** (TheCarriedOne)

Amount preset buttons now accept **quantity shortcuts** like 10k, 1.5M, 2b, 500t when saving custom presets.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.25](https://blog.bconomy.net/2026/07/25/release-v2026-07-25-7026a8e0/)
**Date:** 2026-07-24

A new update for Bconomy has been released.

## New Features

- **Logs filter page.** (TheCarriedOne)

Logs get **their own page** with a filter bar.

- Filter by event type, player, faction, item, and date range, with ability to add **several of each**.

- Every filter is a chip you can flip to **invert (exclude)** or remove.

- On the player chip, the **arrow cycles** whether they were the sender, recipient, or either.

- By default the page shows **your own logs**.

- The old logs popup still shows a **single page** with a *View more* button that jumps to the full filterable page.

- Log lines show on one line (**scroll sideways** for long ones); timestamps show a short “how long ago” with the **exact date on hover**.

- It’s possible to **filter by a raw BcID** directly by entering it in either player or faction search fields.

## Improvements

- **Simplify cryo/salvage/basket deposit popovers.** (TheCarriedOne)

Cryo Gel / Salvage deposit popovers are **simpler**: fewer preset buttons, withdraw tucked behind a link, and the popover closes itself after a deposit.

- Refinery basket category picker is now a normal amount input instead of a row of percentage buttons, and re-topping-up a running basket **skips** the confirmation.

- **Show crop images in farm confetti.** (Wewert)

Non-native/custom-emoji Farm crops now pop their **crop image** when plots grow instead of the generic lettuce particle.

- Clicking Harvest on the Farm page now pops particles for the **crop types being harvested**.

- **Add pet claim flair.** (Wewert)

Collecting Items from Pets now spawns **adventure-themed flair** at the click location.

- Bulk pet item collection uses flair from the claimable Pets’ adventure types.

- **Explain feed failures.** (Wewert)

Feed Pet failures now **explain the issue**, such as reserved food, full pet energy, missing pet food, no adventuring pets, or cravings-only settings.

- **Auto-set buddy on first hatch.** (Wewert)

Hatching a first pet from an Egg now **selects that pet** as the player’s Buddy automatically.

## Bug Fixes

- **Fixed pet filters.** (TheCarriedOne)

“On adventure” (and other) filter toggles in the pet manager modal **no longer interfere** with the main pet screen’s filters when both are visible at once.

- **Let boost timer tap execute action on mobile.** (TheCarriedOne)

Tapping the boost countdown shown on an action button now **executes that action** on mobile, same as tapping anywhere else on the button.

- **Propagate Discord bulk deletes to web history.** (TheCarriedOne)

Spam/phishing messages that bots/moderators purge from Discord now **also disappear from the in-game chat**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.24.2](https://blog.bconomy.net/2026/07/24/release-v2026-07-24-354629058/)
**Date:** 2026-07-23

A new update for Bconomy has been released.

## Bug Fixes

- **Cooldown near-miss fixes (final-v2).** (TheCarriedOne)

Clicking an action (or watering a farm, claiming daily, using an item, etc.) right as its cooldown ends now just works™. If command is executed slightly too early for the server, client should automatically resend the same command soon after, when the real cooldown ends, basically invisible to the player.

- Action buttons no longer get stuck showing a full cooldown after that near-miss; they clear correctly without needing a refresh or another action.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.24](https://blog.bconomy.net/2026/07/24/release-v2026-07-24-61a460ee/)
**Date:** 2026-07-23

A new update for Bconomy has been released.

## Improvements

- **Pet familiarity sort.** (ShadyBliss)

You can **sort** your pets by Familiarity (highest first).

- **Farm tutorial updates.** (Wewert)

The farm tutorial now uses an expanded **multi-panel flow** and includes farm tutorial videos.

- **Clickable details for empty boost items.** (Wewert)

Clicking a greyed-out Pet or Farm Plot boost item when you don’t own any now **opens that item’s details modal** instead of doing nothing.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.20.2](https://blog.bconomy.net/2026/07/20/release-v2026-07-20-46764f94/)
**Date:** 2026-07-20

A new update for Bconomy has been released.

## Improvements

- **Action button boost indicator.** (TheCarriedOne)

Action buttons now show the **soonest-expiring boost** on the right when it has under a day left.

- New “**Boost Expiry**” setting lets you turn that indicator on or off.

- New “**Show Title**” setting hides the action name on buttons for a more compact (even if weird) look.

- **Relay sidebar.** (TheCarriedOne)

Adds a **Relay** section to the right-hand action sidebar with a compact card for each of your relay bays.

- Each card’s bar shows that bay’s **input** (fuel/items) level.

- Clicking a card **jumps** to the Relay page with that bay opened.

- Every card has a **refuel button** that opens the same deposit popover used on the Relay page.

- Overclockable cards also have an **overclock (🚀) button**.

- You can toggle the whole section under **Settings → Sidebar → 📡 Show Relay**, and reorder it like the other sidebar sections.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.20](https://blog.bconomy.net/2026/07/20/release-v2026-07-20-7f7ad3a3/)
**Date:** 2026-07-19

A new update for Bconomy has been released.

## New Features

- **Quest Bank Auto-focus.** (TheCarriedOne)

Unlockable new **Research** after you max the Recovery Focus Slots upgrade.

- Adds an **Auto-focus switch to the Focus popover**: when turned on, the bay automatically directs its extra cooldown cuts at loot actions that drop items your pending quests still need.

- Includes a **deselect threshold** (1–100%) so an action stops being targeted once its quests reach that completion level (100% keeps targeting until quests are **fully done**).

## Bug Fixes

- **Stable timers and cooldowns.** (TheCarriedOne)

Action cooldown bars should **no longer snap back** to full when a delayed action reply arrives during laggy connections.

- Timers **should stop drifting** or jumping around if your connection is slow.

- **Mobile UI fixes.** (Wewert, TheCarriedOne)

On iPhone, tutorial videos now **stay embedded inside** the modal instead of opening fullscreen when the modal appears.

- Nav sidebar badge icons (pets, farm, museum, ballpit, etc.) are **properly centered on mobile**.

*[Credits](https://bconomy.net/credits/)*

---

## [Want some gems?](https://blog.bconomy.net/2026/07/18/want-some-gems/)
**Date:** 2026-07-18

Gemeralds have been probably the rarest gems in Bconomy, and until now there was really only one way to find them: the rare loot table. That made them hard to stock up on, especially with the Recovery Bay hungry for them. This update adds **three brand new ways** to earn gemeralds, spread across your loot, your fights, and your pets.

In short, new **Gem Bags** can be:

- found in **Lunar Shards**,

- looted from **Minibosses**

- found by **Pets**.

For more juicy details, **continue to the full post**.

## Gem Bags from Lunar Shards

Green, Amber, Purple and Red gemeralds no longer drop straight out of rare loot. Instead, opening a **Lunar Shard** now has a chance to hand you a **Gem Bag**, which you open from your inventory to reveal a handful of gemeralds inside.

Bags come in three sizes, and the bigger ones are rarer:

- **Tiny Gem Bag** holds 1 gemerald.

- **Small Gem Bag** holds 2.

- **Gem Bag** holds 4.

The mix inside leans common to rare the same way demand does, so you will see plenty of Green and only the occasional Red. Pluperfect Gemeralds are unchanged and still drop directly from rare loot. Overall, a stack of shards now gives a little **more** gemeralds than before, just delivered in bags.

## Minibosses

A smaller, faster cousin of the Boss can now appear at any time, separate from the big Boss. There are four of them, one per loot action, and only one is ever active at once: **The Nibbler** (Fish), **Trash Bandit** (Hunt), **The Straggler** (Explore) and **Gloombat** (Mine).

These minibosses have only a few ways to spawn:

- **1%** chance to spawn every **5 minutes**,

- **30%** chance to spawn after **killing the big boy boss**.

Each Miniboss has its own health pool, a **visible weakpoint weapon**, and only **2 minutes** on the clock before it flees. You attack it with weapons just like the big Boss, but the weakpoint matters for your reward: damage dealt with the weakpoint weapon counts **double** toward your bag, and every other weapon counts half. Reach 5% of the Miniboss health in that weighted damage and you earn a Small bag instead of a Tiny one.

Take it down in time and the loot goes out like this:

- The **top 3** damage dealers win 3, 2 and 1 Gem Bags.

- A few more bags scatter to random attackers who joined in.

- One lucky attacker has a **75% chance** to find Pluperfect Gemeralds.

- Everyone who attacked walks away with a **3x loot boost**.

Let the timer run out and it flees instead: only a few Tiny bags go to random attackers, with no top 3 bonus, no Pluperfect and no boost. So it pays to pile on fast.

## Pet Vein Prospecting

Your pets can now dig up gemeralds all on their own, with nothing extra to click. A pet that adventures on its **specialization** (Mine, Explore or Hunt) slowly builds **Familiarity** with its patch, shown right on its items bar. Fish specialists sit this one out, we are not aware of fish which can dig so deep into the ocean floor.

Once Familiarity fills up, the pet **strikes a vein** and starts digging. Its items bar turns into a dig bar that fills as the pet keeps working, and when it finishes the pet brings back exactly one thing:

- Usually a **Tiny Gem Bag**.

- Sometimes a **Small** or a full **Gem Bag** if the pet is strong.

- Once in a while, something **far better**.

It is entirely passive, so a big stable of hard working pets becomes a slow, steady trickle of gemeralds over time. Busier fleets dig a touch slower, so the gems grow gently as your fleet grows rather than piling up without limit.

## In short

Between Gem Bags from your shards, Minibosses dropping in for a quick brawl, and pets quietly prospecting in the background, there are more gemeralds flowing into the game than ever. Go stock up.

---

## [v2026.07.16](https://blog.bconomy.net/2026/07/16/release-v2026-07-16-e2d4a5cd/)
**Date:** 2026-07-16

A new update for Bconomy has been released.

## New Features

## Improvements

- **Recovery Bay.** (TheCarriedOne)

The higher your Recovery Bay total level, the **lower the chance** to land in the small cut bracket.

- A small cut minimum is **no longer nearly zero**. It now removes **at least half** of an action’s minimum cooldown (e.g. for Fish action, minimum cut is 10 seconds – half of 20 seconds of the red bar) at low investment, and **scales up** toward the full minimum as the bay levels.

- A big cut **will never be smaller** than the guaranteed small-cut floor at low investment.

- The lockout after a cut is shorter: **now 30 to 60 seconds** (used to be up to 2 minutes), with high level bay shaving the time to **3 to 6 seconds**.

- The Recovery Bay lockout timer now **appears on mobile** in the Actions menu, matching desktop.

- **Loot system.** (TheCarriedOne)

Ocean Bounty can now drop **Blowfish**.

- Forest Bounty can now drop **Big Log**.

- Item modals for any lootbox-style item now **show the full loot table**, including odds.

- Every item-based loot source or drop link is now **clickable** so you can open those loot tables.

- **Tool cards and augment info.** (TheCarriedOne)

If you own a **Forbidden Modifier**, your tool card now shows a new row so you can **apply it directly** (no picker needed).

- Tool modal augment gemerald card content has been **reordered** to better match the game-wide cards. Hovering the time remaining shows the full time tooltip as majority other places.

- **Hovering an active augment** gem icon on the sidebar tool card also shows its exact time remaining.

- **Museum sidebar badge.** (TheCarriedOne)

The Museum badge now **always** shows how many collectibles are ready to hand in.

- The badge only turns green when handing in would **complete the collection**.

## Bug Fixes

- **Boss panel mobile layout.** (TheCarriedOne)

The boss panel on the home page now uses the **compact layout** on mobile instead of overlapping text.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.15](https://blog.bconomy.net/2026/07/15/release-v2026-07-15-23cf3ee8/)
**Date:** 2026-07-15

A new update for Bconomy has been released.

## New Features

- **Recovery Bay status indicator and stats.** (TheCarriedOne)

A small **Recovery Bay icon** now appears in the Actions panel header indicating the cooldown/fuel state of the bay.

- **Hover or click** that indicator to see a popover with the bay’s current status and exactly how much cooldown each action’s last Recovery Bay cut removed.

- Your Recovery Bay **module count is now visible** in your profile’s Facilities section and on the Players → Facilities leaderboard, just like Mint/Refinery/Cooling.

- The navbar overclock badge and the ‘Overclock timer bay’ setting **can now target** the Recovery Bay.

- A new stat, ‘**Recovery time saved**‘, shows the total cooldown time your Recovery Bay has cut off your loot actions.

## Improvements

- **Recovery Bay rebalancing.** (TheCarriedOne)

Yes. **Nerf**. **Sad**, but *true*.

- **Pet level-up controls and tidy-ups.** (TheCarriedOne)

Pet level-up now shows a **‘Level’ field** next to ‘Tier’ so you can pick a specific level in a pet’s final tier instead of always jumping to level 100.

- You can now **level tier 0 pets** without immediately being forced into a reincarnation to tier 1.

*[Credits](https://bconomy.net/credits/)*

---

## [The Recovery Bay](https://blog.bconomy.net/2026/07/14/the-recovery-bay/)
**Date:** 2026-07-14

The Relay Network has a **new bay** to build, and this one works for your adventurer directly. The Recovery Bay shortens the cooldowns on your loot actions (Fish, Hunt, Explore, and Mine) so you spend less time waiting and more time out gathering.

## What it does

Every time you perform a loot action, the Recovery Bay gets a chance to **trim a loot cooldown**. When it lands, it knocks time off one of your loot actions and lets you go again sooner. It might shorten the action you just did, **or a different one**. The action you take is only the trigger; the bay decides where the saved time goes.

You will not see a cut every time. At first, most of the time nothing happens and you carry on as normal. The more you upgrade, **the bigger the chance for a cut to land**, for a cooldown to jump forward, and for you to get an extra turn earlier than you would have. To be a bit more explicit, the very fresh bay with one level 1 module gives you a 1% chance to cut the cooldown. On the high end, the biggest cut is 40% in Normal mode, with Overclock going above, into the 50% territory.

## Feeding the bay

Like the Mint and the Refinery, the Recovery Bay runs hot and burns fuel.

- **Fuel is Salvage.** It draws from the same shared Salvage pool your other bays use, so a busy Recovery Bay is one more reason to keep the Refinery running.

- **It warms up.** A freshly fuelled bay starts weak and builds to full strength as it burns. Let it run dry and it does almost nothing; keep it topped up and it works at full power.

- **It makes heat.** The harder you run it, the hotter it gets, and an overheating bay quietly loses effectiveness until it cools.

You control how hard it pushes with its mode:

- **Off:** dormant. No cuts, no heat, no fuel burn.

- **Under-clock:** gentle. Smaller, rarer cuts, but it stays cool and sips fuel.

- **Normal:** the baseline.

- **Over-clock:** aggressive. Bigger, more frequent cuts, but it runs much hotter and burns much more Salvage.

## Aiming the cuts

The action you just performed always evaluates for a cut. As you invest in the bay’s modules, it starts making **extra attempts on top of that one**, and those extras are the ones you can aim.

Out of the box, those extra attempts have **nowhere else to go**, so they simply pile back onto the action you just performed. To send them at other loot actions, you unlock targeting and raise the bay’s Focus Slots.

Focus builds up in stages as you raise the **Focus Slots upgrade**. At the lower tiers the bay fills your focus automatically, adding **one action at a time** in the order Fish, then Hunt, then Explore, then Mine. When you reach the top tier the training wheels come off and you choose **exactly which loot actions** the extra cuts chase. If you want every cut concentrated on your slowest, most valuable cooldown, **that** is where you set it.

As a (*maybe?*) clearer example, if you fish, initially the bay only targets fish action for the cooldown. If you level up the bay enough, it will start evaluating actions for a second time, **up to 4 times** on the highest-level bay. The bay can target any action from the current pool. The more you level up the bay, the more actions are in this pool, with the top tier allowing to **select only the specific actions**.

## Banking loot toward your next quest

The Recovery Bay has a second job: **it helps with quests**.

Normally, when a loot find pushes a quest past what it needs, the extra is wasted. With Quest Storage, that **overflow is banked instead**. When you finish the quest and roll into the next one, the bank gives you a **head-start** on the new set for free.

A few things worth knowing:

- **It scales with your quests.** The bank holds a share of your current quest’s items, so the bigger your quests get, the more it can hold.

- **The storage upgrade sets that share.** Its tiers hold 5-80% of a quest’s worth of items as you climb them.

- **Mode changes the room.** Over-clock doubles how much the bank can hold and under-clock halves it. Anything you have already banked stays put even if you drop to a lower mode later, so a big over-clock haul is safe to keep.

- **A warm bay banks more.** The same warm-up that powers the cuts also drives how much overflow gets captured and how much of the head-start is handed over, so a fuelled bay makes the most of it.

Once you research the bank controls, you decide how it behaves at each rollover. Leave it on **hoard** to carry leftovers forward, or switch it to **flush** to wipe whatever is left after the head-start is applied and start each quest clean. There is also a **manual flush button** for when you want to clear the bank on the spot.

## Getting started

- **Build a Recovery Bay** in the Relay Network and feed it Salvage.

- Set it to Normal and take a few loot actions to watch the cuts start landing. **At first it may be rare**, but…

- Invest in its modules to get **bigger cut chance**, higher cut ceiling, earn extra cut attempts, then research targeting and raise **Focus Slots** to aim them.

- When you are ready to lean on it for quests, research **Quest Banking** and buy the **Quest Storage** upgrade.

That is the **Recovery Bay**: **less waiting** between loot actions, and a **steady head-start** on your quests for the finds you used to throw away.

---

## [v2026.07.11.2](https://blog.bconomy.net/2026/07/11/release-v2026-07-11-c2c6eee6/)
**Date:** 2026-07-11

A new update for Bconomy has been released.

## New Features

- **Facilities leaderboards and profile panel.** (TheCarriedOne)

New **Facilities** entry under the Players tab on the Leaderboard for Farms, Stables and Cooling, Mint, or Refinery modules.

- There’s an **Extras switch** (on by default) that lets you include or exclude bonus facilities/modules (extra farm plots, extra stables, and free relay module slots from XenoServer). Turn it off to count only the ones you paid for.

- You can flip a **Cost switch** to show how much was paid to build those (base cost only; extras are free).

- Boards only list players who own **more than one** of the selected facility/module.

- Your player profile now has a **Facilities section** that lists the current counts you own for Farms, Stables, Cooling, Mint, and Refinery modules. Each row jumps to that facility’s leaderboard.

## Improvements

- **Item Collector leaderboard quick-jump.** (TheCarriedOne)

On the Item Collectors leaderboard, clicking the amount next to a top holder now jumps straight to that item’s full leaderboard.

- **Stat leaderboard movement arrows and Custom period.** (TheCarriedOne)

Stat leaderboards (every window except All-time) now show a **position-change** arrow after each rank.

- Hover an arrow to see **how many positions a player moved** and the value change versus the previous period.

- There’s a new Custom option in the stat dropdown so you can **rank a specific day** (within the last 70 days) **or a specific week** (Mon–Sun). The arrow compares that chosen period to the one right before it.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.11](https://blog.bconomy.net/2026/07/11/release-v2026-07-11-14ec69da/)
**Date:** 2026-07-10

A new update for Bconomy has been released.

## Improvements

- **Home and navigation UI.** (TheCarriedOne)

Home boosts list shows “**Personal**” instead of “Item” for personal item boosts.

- Clicking a quest card on Home now **opens that quest item**‘s info modal.

- On mobile, the navigation/action menus open with a **shorter swipe**.

- **Item modal, card and equip controls.** (TheCarriedOne)

Item modals now show a green “**Active for <time left>**” line while a boost item or Gemerald augment is running.

- Typing an amount into an item modal’s Craft input updates the recipe to show the total resources needed **for that amount**.

- Equippable items now have a full **Equip amount input** instead of a single Equip button.

- The old “Max Inventory Buttons” setting **has been removed**. In its place each item’s Use / Craft / Equip preset config has a new “**Value to use on item card**” field that decides what a card button click sends by default (leave blank for 1). Holding Shift still sends max.

- **Buy specials from modal.** (TheCarriedOne)

You can buy purchasable specials **directly** from that special’s own modal.

- The special Buy input now supports buying **multiple** at once.

- **Collapse/expand sections.** (TheCarriedOne)

Items page and sidebar items get new options to collapse or expand **all sections at once**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.10](https://blog.bconomy.net/2026/07/10/release-v2026-07-10-ffde30fb/)
**Date:** 2026-07-10

A new update for Bconomy has been released.

## New Features

- **Custom amount presets.** (TheCarriedOne)

You can **customise the quick-amount buttons** on every amount input.

- Click the ⚙️ next to the buttons to **edit presets**.

- The **Max button** now fills the amount box by default instead of submitting straight away; you can switch it back to send-on-click in the preset settings.

- Presets can be set per, for the lack of a better term, **area (Default)** or overridden for a **specific item (This item)**. Deleting an override reverts that item to the area default.

- **Boss attack buttons** (Bounties / Kill / Max) are now editable presets like the rest.

## Improvements

- **Quest season leaderboards.** (TheCarriedOne)

When a quest season ends, its **final standings are saved** and can be viewed later.

- The quest leaderboard no longer lists level-1 players.

- **Boosts panel revamp.** (TheCarriedOne)

Active **Gemerald augments** now appear in the Home Boosts.

- The Boosts panel is now a **collapsible tree**. Each level shows a combined multiplier and the soonest expiry; you can collapse or expand levels.

- A **view button by Help** switches between the tree and a plain list and offers Expand all / Collapse all.

- When a boost row has more icons than fit, the strip **scrolls horizontally**.

## Bug Fixes

- **UI fixes.** (TheCarriedOne)

Chat send button no longer jumps in width while on cooldown; if you try to send too early a **chat badge shows** instead of error modal.

- Arbitrary Amplifier action picker **buttons stop resizing** as cooldowns tick down.

- On mobile, a slight sideways drift while scrolling **no longer pops the sidebar** open.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.09.2](https://blog.bconomy.net/2026/07/09/release-v2026-07-09-59b207b6/)
**Date:** 2026-07-09

A new update for Bconomy has been released.

## New Features

- **All items view and Compact mode.** (TheCarriedOne)

A new button next to the item search switches between the normal grouped category view and a **single flat “All items” list**.

- New **Compact option shrinks item rows** and section titles so more fits on screen.

- The **Salvage box has been removed** from the items page. Utterly useless!

- **Boss attack preview and quick-fill.** (TheCarriedOne)

Boss damage breakdown now shows a **separate Buddy row** for your pet’s held-weapon damage (it’s folded into the total so the total matches what you actually do).

- A live preview under the attack input shows base, bonus (**hover to see faction vs weakpoint**), buddy, total, the boss HP% left after the hit, and how many standard-loot bounties that damage earns.

- **Type “kill”** to auto-fill exactly how many of the selected weapon finish the boss, **or “bounties”** to fill up to the standard-loot cap. One-tap Kill / Bounties buttons appear under the input.

- If you don’t own enough weapons the shortfall is shown and **you can craft them**; Attack stays disabled until you can fulfil the request.

- The weapon-input toggle is now labelled **Basic / Presets**.

## Improvements

- **Boost multiplier display.** (TheCarriedOne)

Combined boost multipliers on the Home page **drop trailing decimals** (e.g. “6×” instead of “6.00×”) and now follow your compact numbers setting.

- **Hotkey defaults and legacy bindings.** (TheCarriedOne)

Very old symbol-based hotkey bindings (from before the physical-key system) have been removed and **will no longer work**.

- If your default hotkeys (like 1–4, G) disappear, open Hotkey Settings → ♻️ **Restore default hotkeys** to fill in unassigned defaults without changing hotkeys you’ve set elsewhere.

- Tick “**Replace overrides**” to force defaults back onto their keys (this will unbind whatever was using them). Use “**Reset all hotkeys**” to wipe everything back to defaults.

## Bug Fixes

- **Relay overclock badge tap.** (TheCarriedOne)

Tapping the relay overclock ⚡ badge **no longer shifts the sidebar** or hides menu actions on mobile.

- **Market live activity feed.** (TheCarriedOne)

The **Market live activity feed** now shows current activity after you leave and come back instead of staying frozen.

- **Long stacked durations.** (TheCarriedOne)

Very large stacked boost durations now show their true length (for example a ~150‑year reads as 150 years instead of an incorrect shorter value of 6 years or so).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.09](https://blog.bconomy.net/2026/07/08/release-v2026-07-09-6df50df9/)
**Date:** 2026-07-08

A new update for Bconomy has been released.

## New Features

- **Market leaderboards.** (TheCarriedOne)

Three new leaderboards and stats: **Items Bought, Market Spent, and Market Profit**.

- These new boards show history immediately, past market activity is backfilled so they don’t start from zero.

- **Boss attack overhaul.** (TheCarriedOne)

The Attack area now has **Basic and Advanced modes**.

- Advanced mode lets you **attack with several weapons at once**: pick weapons, type how many of each, and see total base and boosted damage before you attack.

- **Save weapon loadouts** as presets and reopen them in one click; the last preset you used opens automatically. Presets show their weapons and total base damage.

- A Craft button **will make exactly what you’re short** across all selected weapons at once, shows how much it can make vs how much you need.

- After you attack a boss an **‘Attacked’ badge** appears on the boss card (home and sidebar) and in the boss modal; hover it to see each weapons you used and your total damage so far.

- The **weapon you picked is remembered** when you close and reopen the boss modal.

- **Market fees & Insider cap.** (TheCarriedOne)

Selling on the Market now always costs **at least a 2.5% fee**, this applies even if you have the Insider perk fully maxed.

- The Insider perk now **maxes at level 45** (was 50), runes automatically refunded so you can reallocate them.

- When you create a Market listing you’ll see a **live breakdown** of the fee, what you receive per item, and the total after fee before you confirm.

## Improvements

- **Sidebar item list options.** (TheCarriedOne)

New **Compact** option for the sidebar item list to show much denser item cards.

- New **Only owned** filter to show just the items you own.

- **Equipped** is now a category you can show or hide in the sidebar (it’s off by default).

- Category ‘Stop’ is renamed to ‘Stop in’ and now includes **‘Next categories’ and ‘Loot sources’** so you can pick exactly where pinned items stop showing.

- **Emoji picker.** (TheCarriedOne)

The emoji picker now shows **regular emojis** alongside custom ones.

- **Inactivity reload prompt.** (ShadyBliss)

After a long period of inactivity the game **will ask you to reload** instead of quietly reconnecting in the background.

## Bug Fixes

- **Special usable on work.** (TheCarriedOne)

The Arbitrary Amplifier special **can be used on Work** again.

- **Sidebar category picker bug.** (TheCarriedOne)

Deselecting all sidebar item categories **no longer removes** the whole list.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.08](https://blog.bconomy.net/2026/07/07/release-v2026-07-08-b8c08138/)
**Date:** 2026-07-07

A new update for Bconomy has been released.

## New Features

- **Custom item categories.** (TheCarriedOne)

Create your **own item categories**: give them a name, emoji, set items and order. 

- Pinned items become the reserved “Pinned” category. You may or may not continue using it.

- **Reorder and hide** any Items section (built-in ones too).

- Museum, Specials, and My Listings are now **reorderable and sortable** too.

- Sidebar quick-items: pick which categories appear there.

- Search now **filters inside the categorized view** (it no longer drops you to a flat list), auto-expands any collapsed sections the search matches, and has a clear button.

- Duplicate Relay Network section is now **removed**.

- Specials can be added to **any category, any position**. Pick a specific special (e.g. Calibrated Amplifier for Fish) or use (Any) to add all variants at once.

- The old per-device “pinned specials” list is replaced by category membership, so you’ll **need to re-add any specials** you had pinned.

## Improvements

- **Museum bad luck mitigation.** (ShadyBliss)

Collectible finds now try to reduce repeated duplicates by **helping missing collectibles catch up** across your saved up sets.

- Expanded Museum collection cards now show how many of each collectible you currently have in stock.

- **Boss faction bonus behavior.** (ShadyBliss, TheCarriedOne)

Boss faction damage bonuses now increase when **faction members are online** while the boss is active, they no longer have to attack first.

- Faction members who were online for a boss keep contributing to that boss’s faction bonus even if they later go offline.

- The boss multiplier text now describes online faction members instead of calling them co-attackers.

## Bug Fixes

- **Item counts and crafting preview.** (TheCarriedOne)

When your phone or tab wakes from sleep and reconnects, **item counts refresh immediately** instead of showing stale numbers.

- Crafting preview **no longer suggests** you can craft amounts you don’t actually have materials for.

- If a craft can’t be paid for you now get a clear “not enough materials” message instead of a server error.

- **Work hotkey cooldown exploit fix.** (TheCarriedOne)

Fixed an exploit where spamming the Work hotkey right after a global cooldown reset (with the Mint bay’s Cooldown Destroyer upgrade) let players repeatedly work with no cooldown for small BC payouts.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.07](https://blog.bconomy.net/2026/07/06/release-v2026-07-07-d21a0aa4/)
**Date:** 2026-07-06

A new update for Bconomy has been released.

## New Features

- **Special Store egg rotation.** (Wewert)

The Special Store **no longer sells Snowman Genesis Eggs,** it’s now offering Dragon, Phoenix, Visitor, and Invader Genesis Eggs instead.

- **Autosell when opening crates.** (TheCarriedOne)

When you open loot crates, items that exceed your configured autosell limits are **automatically sold** instead of landing in your inventory.

- **Relay tab badge.** (TheCarriedOne)

The Relay tab (with Bay Telemetry researched) now **shows a status badge**: warnings for stalled/short-for-cooling bays, a countdown to the next overclock window, or a ⚡ when a bay is ready for it.

- **Museum hand-in badge.** (TheCarriedOne)

The Museum nav tab **shows a badge** counting how many collectibles you can hand in for your currently active collection (it hides when there’s nothing to hand in).

## Improvements

- **Augments layout on phones.** (Shadox97)

The gem/augment rows in a tool’s Augments section stay tidy on phones.

- **Timers and tooltip wording.** (TheCarriedOne)

**Timers are shorter and rounded** to a sensible unit by default (**Compact Timers** is on by default). You can switch between a single rounded unit (like “2h”) or two parts (“1h 30m”).

- New “**Max time part in tooltip**” setting lets you choose whether long timers show years/months or only days in the hover detail.

- **Compact boosts.** (TheCarriedOne)

Collapsed boost categories now **show their active boost icons** and a countdown for anything ending within a day without expanding, hover/click an icon for the full bar.

- **Quest progress on Quests button.** (TheCarriedOne)

When you have a quest level to claim, the green Quests button bar now shows how far you are toward the next level.

- **Profile presence.** (ShadyBliss, TheCarriedOne)

**Profiles show a presence badge** in the footer (Online, Idle, Offline, Active: Discord, or Idle: Discord) when the player has public profile presence enabled; staff can always see it.

- Faction Lieutenants and Leaders see “**Active N ago**” alongside “Joined” on their own faction member cards. Member actions are now in an **Actions menu** on each member card, and the faction member list has a refresh button to update activity on demand.

- **Settings reorganized and searchable.** (TheCarriedOne)

Settings are **split into three tabs** (Gameplay, Appearance, Account) with collapsible groups instead of one long list.

- There’s a **search box** at the top that filters settings as you type, dimming non-matches.

- Nested options (audio, animations, inventory-max, market data, sidebar badges, etc.) are **tucked behind a small chevron** instead of always showing.

- Notification popups can now be placed in **any of the six positions** (top/bottom × left/center/right); for mobile the horizontal position makes no difference as it’s full-width.

## Bug Fixes

- **Manage Pets: breeding selection.** (TheCarriedOne)

In **Manage Pets → Breed**, once a pair goes on breeding cooldown it automatically clears from the selection so you can pick a new pair without closing and reopening the menu.

- **Use modal and amplifier/modifier errors.** (TheCarriedOne)

Using an Arbitrary Amplifier or Forbidden Modifier repeatedly from the same open modal **no longer fails on the second use**.

- **Pet energy timer accuracy.** (TheCarriedOne)

The pet energy timer in the nav menu now **counts down at the correct rate** while an adventure boost is active (it previously counted down too fast).

- **BC routed to faction stat accuracy.** (TheCarriedOne)

The “BC routed to faction from minting” stat now **shows the actual amount routed** going forward instead of a tiny number that only counted mint ticks. Existing totals aren’t changed retroactively.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.07.02](https://blog.bconomy.net/2026/07/02/release-v2026-07-02-1a256a22/)
**Date:** 2026-07-01

A new update for Bconomy has been released.

## Improvements

- **Gem Augment UI.** (Shadox97)

Putting a Gemerald on a tool is now faster: open a tool, expand Augments, and hit Use on the gem you want.

- The augment bar always shows all four gem types and how many of each you own.

- If a gem is already active on the tool it shows Extend plus its remaining time so you can top it up quickly.

- **Quest Overview groups.** (Shadox97)

The Quests section on the Overview page now splits quest items into collapsible groups by the action that drops them.

- Each group can be collapsed or expanded independently and remembers your preference between sessions.

- Items that drop from more than one action will appear in every relevant group so you can find them where you expect.

## Bug Fixes

- **Mint fuel Salvage cap enforcement.** (TheCarriedOne)

Withdrawing mint fuel no longer lets your Salvage go over the 25M cap.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.28.2](https://blog.bconomy.net/2026/06/28/release-v2026-06-28-b7448781/)
**Date:** 2026-06-27

A new update for Bconomy has been released.

## Improvements

- **Persistent pet settings.** (TheCarriedOne)

Manage Pets now remembers your last-used filters, sorting, search text, selected bulk action, and related inputs like breeding properties

- The main Pets page also remembers your pet list filters, sorting and search between visits.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.28](https://blog.bconomy.net/2026/06/27/release-v2026-06-28-d861985d/)
**Date:** 2026-06-27

A new update for Bconomy has been released.

## Improvements

- **Breeding panel.** (TheCarriedOne)

Breeding now lives inside **Manage Pets** → Breed so you can filter, search and sort your pets and pick parents the same way as other bulk actions.

- Pick a Boost for each parent right in the breed panel; choosing one for a parent **auto-applies it to the other parent** if that one is empty.

- New times field lets you breed the same pair **multiple times** in one go (limited by breeding cooldown, egg/pet space, balance and boost items).

- Hatch toggle can **auto-hatch each egg** as it’s made.

- Live cost preview shows the total BC, boost items used, and the cooldown you’ll incur before you commit.

- When hatching, special pets now tell you their aura and skin immediately.

- **Chat emoji copying and tooltip.** (TheCarriedOne)

Copying text that contains emojis now puts :emojiname: in the clipboard instead of ChatEmoji.

- Hovering a chat emoji shows its name as a tooltip.

- **Boost category multipliers.** (TheCarriedOne)

Each boost category heading now shows the combined multiplier total (for example Fish (4×)) before the collapse chevron so you can see totals at a glance.

## Bug Fixes

- **Menagerie refresh.** (ShadyBliss)

The Menagerie now **updates immediately** after you unlock a new skin or aura — no manual page refresh needed.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.27](https://blog.bconomy.net/2026/06/27/release-v2026-06-27-f7c9d6ca/)
**Date:** 2026-06-27

A new update for Bconomy has been released.

## New Features

- **Museum collectibles via Relay.** (TheCarriedOne)

You **can now find museum collectibles** while playing through the Relay: when you claim a bay output, level a module, buy an upgrade, unlock a bay, or unlock research.

## Improvements

- **Collapsible sections in modals and item pages.** (TheCarriedOne)

Section headers inside modals (and on some pages/sidebars) now have a chevron, click the heading to **collapse or expand** that section.

- Your collapsed/expanded **choices are remembered** in your browser, separately per modal/page and per section.

## Bug Fixes

- **Market sale notification formatting.** (TheCarriedOne)

The “**X sold!**” notification you get when someone buys your market listing now **shows the item count normally** (e.g. “1,234× Weeds sold!”) instead of the broken “{{n0}}× Weeds sold!” text.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.27](https://blog.bconomy.net/2026/06/26/release-v2026-06-27-0c2ab74c/)
**Date:** 2026-06-26

A new update for Bconomy has been released.

## New Features

- **Compact numbers setting.** (TheCarriedOne)

New toggle in Settings → Interface that shortens big numbers (1.2M) instead of showing the full number (1,234,567) across the web client.

- Hover any number to see the other format in a tooltip.

- Market price/volume charts have their own Auto / On / Off compact-numbers override.

- On mobile, leaderboard values stay compact (long-press shows the full number).

- More granular control on what numbers are compacted or not is probably going to come later.

## Improvements

- **Pet list sorting options.** (TheCarriedOne)

New pet sorts options added: Adventure type, Aura rarity, ID, Level, Lifetime items found, Name, Skin rarity, and Tier.

- **Buddy activity emojis.** (TheCarriedOne)

Each buddy in the sidebar now shows a small emoji for what it’s doing (fishing, hunting, exploring, mining) placed before the species emoji.

- **Boost item tiers shown.** (TheCarriedOne)

Boost item names show their tier (for example: Nautical Compass (T1), Massive Driftnet (T4)) in the item modal, inventory, bulk-boost dropdowns, item lists, and market listings.

- The active Boosts panel on Overview now shows tiers for personal and boss boosts (for example: Elvish Spirit (T1 Low); a maxed boss boost reads (T2 High)).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.25](https://blog.bconomy.net/2026/06/25/release-v2026-06-25-04ba35f2/)
**Date:** 2026-06-25

A new update for Bconomy has been released.

## Changelog

- **Pet modal prev/next nav follows pinned+XP sort order.** (TheCarriedOne)

Prev/next buttons in the pet modal now cycle through pets in the same order as the pets list (pinned pets first, then by XP)

- **Multiple trophy related fixes.** (TheCarriedOne)

*Raccoon now has a collector trophy.* Raccoon had no `trophy. Whoops.

- *Trophy picker grouping fixes*. **Gem** and **Ancient** now appear under Museum, **risteal** under Achievements, and **Stellar Ascendant** under Relay Network (previously they fell into the catch-all Special group).

- **Reworked Manage Pets modal.** (TheCarriedOne)

The Manage Pets window is now one streamlined view. Pick an action from the dropdown: Boost, Edit Pins, Feed & Collect, Level Up, Release, Rename, Set adventure.

- New pet filter: filter by Boosted (Yes/No) or by boosts **Expiring within a time** you set (e.g. 1h, 30m). Works on the Pets page and in the manage window.

- **Rework Edit Pins (draft-save, selection moves, auto-sort).** (TheCarriedOne)

Editing pinned pets **no longer saves** on every click. Reorder freely, then hit *Save pins* (or *Reset* to undo).

- Select multiple pinned pets and **move them together**, one slot up/down, or jump a whole page at a time. One caveat: **only one page** can be selected at a time.

- A new *Sort automatically* tool sorts your pins by multiple rules at once (e.g. species, then tier), including by skin/aura rarity, with an option to pin all your pets in that order.

- While editing pins, filtering **dims non-matching pets** instead of hiding them, so pin positions stay put.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.24.3](https://blog.bconomy.net/2026/06/24/release-v2026-06-24-10da7201/)
**Date:** 2026-06-24

A new update for Bconomy has been released.

## New Features

- **Modal back/forward history + pet prev/next nav.** (TheCarriedOne)

Modals now have back and forward buttons next to the close button, think browser history but for popups. If you opened an item’s detail from another modal, you can step back to where you came from instead of repeatedly closing and re-opening things.

- The Pet modal gained previous/next arrows so you can flip through your owned pets in-place without closing and reopening the modal.

- **Apply Auralyzer / Skinulator from the pet window.** (TheCarriedOne)

You can now open a pet, click the 🎨 **Customize** button and apply an **Auralyzer** or **Skinulator** directly to that pet.

- The Customize button and dropdowns only show when you actually own those specials. The pet picker also shows each pet’s current *skin · aura* so you see what you’re changing.

- **Persistent 🔔 Notifications chat channel.** (TheCarriedOne)

There’s a new **Notifications** channel in chat that keeps your game notifications for up to a week so they survive reloads and device switches (unlike the Console which clears on reconnect).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.24.2](https://blog.bconomy.net/2026/06/24/release-v2026-06-24-5b882b80/)
**Date:** 2026-06-24

A new update for Bconomy has been released.

## New Features

- **Release notes accordion modal.** (TheCarriedOne)

**What’s New** now opens a scrollable list of recent release notes instead of only the latest one.

- Posts you haven’t seen are badged **New**, and the newest unseen release opens automatically.

- **🐈 risteal trophy.** (TheCarriedOne)

New trophy awarded you know for what and when!

## Improvements

- **Museum timed sunsets and countdowns.** (TheCarriedOne)

Two collections (Easter and Delayed Development Relics) are **open again** and will remain live until **2 July 2026, 00:00 UTC**.

- When the countdown hits zero the collection sunsets: **drops stop, but hand‑ins remain possible**. A single Hand in all after sunset will drain the collection for you, claiming trophies and paying stray payouts (**1B BC per leftover stray**) and emptying the collection.

- Players keep any collectibles they had hoarded, the amounts removed by the earlier premature sunset have been **restored** so reopening starts from the correct state. Trophies were also reset back.

## Bug Fixes

- **Stop a failed trophy notification from crashing the instance.** (TheCarriedOne)

Fixed a server crash where one player’s trophy unlock (or a transient database error during connect/command) could disconnect everyone on that game instance.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.23.2](https://blog.bconomy.net/2026/06/23/release-v2026-06-23-0ebfc46c/)
**Date:** 2026-06-23

A new update for Bconomy has been released.

## New Features

- **New museum collections.** (ShadyBliss)

The **Gemstone Collection** and **Fossil Collection** have been added to the Museum.

- **Hand-in from collection cards.** (ShadyBliss)

From an opened collection card you can now hand in glowing collectibles directly, no need to leave the card. There’s also a new **Hand in all** option to submit every item in that card at once.

- **Sunset collections and conversion.** (SHADYblisssssssssnake)

Easter and Delayed Development Relics are now grouped under a new **Sunset Collections** area so they’re easier to find.

- If the sunset migration runs and you still own leftover sunset collectibles, those leftovers will be converted into **1 billion BC** per item.

## Improvements

- **Museum UI refresh: inline expansion and remembered state.** (ShadyyyyBliss)

Collection cards now expand inline so you can browse without opening a modal, and the open/closed state of a card is remembered when you return to the Museum.

## Bug Fixes

- **Collectible names no longer break card layout.** (ShadyBLIIIIIISSS)

Very long collectible names now truncate cleanly inside Museum cards instead of shifting tiles around. The full name is still available on hover.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.23](https://blog.bconomy.net/2026/06/23/release-v2026-06-23-e0d8f42a/)
**Date:** 2026-06-23

A new update for Bconomy has been released.

## New Features

- **Bulk “Set adventure” for pets.** (TheCarriedOne)

You can now pick multiple pets in the **Pet Bulk actions** modal and apply a single action to all of them with the new bulk **Set adventure** flow.

- The bulk action offers `None`, `Specialization` (sets each pet to its species’ loot type), `Fish`, `Hunt`, `Explore`, and `Mine`.

- Switching between bulk actions no longer clears your whole selection, only buddy pets are deselected when needed.

## Bug Fixes

- **Fewer “An error occurred” errors.** (TheCarriedOne)

Various rare command failures that could interrupt actions are much less likely now. The server detects and safely retries a handful of transient issues so you should see fewer errors in normal play.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.22](https://blog.bconomy.net/2026/06/22/release-v2026-06-22-4ec50185/)
**Date:** 2026-06-22

A new update for Bconomy has been released.

## New Features

- **Stellar Ascendant apex research node.** (TheCarriedOne)

New top-tier Relay Network node: **Stellar Ascendant** (🌌). It’s the completionist apex above Network Sovereign (or Government, as some call it).

- Unlock requirements: Network Sovereign plus every bay’s module slots full and maxed (the Mint counts as full at 25 modules), plus a big salvage + materials cost. The node grants the **Stellar Ascendant** title when unlocked.

- Unlocking gives new cosmetics: an animated shooting‑stars profile background, a shimmering cosmic name effect, and a tinted chat name/message color so your chat text gets a subtle new tint.

- If the requirements ever change and the node re-locks, you’ll be refunded any materials no longer needed; re-unlocking only charges the difference if the cost rises.

- **Menagerie main-track leaderboard and collection polish.** (ShadyBliss)

The Menagerie leaderboard now counts **main-track unlocks only** (bonus unlocks no longer mix in).

- Collection browsing gained a new sort: **Least obtained**, and main-species entries show missing relay launch bonus auras (e.g. White, Deepskyblue, Magenta).

- Bonus progress badges now correctly count unlocked bonus auras.

- **Pest Control trophy.** (TheCarriedOne)

New trophy: 🐛 **Pest Control**. It is granted for players who report game‑breaking bugs.

## Improvements

- **Refinery basket & runtime display alignment.** (TheCarriedOne)

The Refinery’s committed item list and runtime estimate now match the server’s model: different item categories **burn at different rates** (raw items burn much faster than crafted ones), so raw-heavy baskets finish sooner.

- Committed items now shrink together as the run burns (you won’t see cheap items vanish and then reappear when re-committing), and the deposit bar tooltip shows per-item BC/min burn so runtime estimates are more accurate.

## Bug Fixes

- **Discord emoji tokens render in profile names.** (TheCarriedOne)

Discord emoji tokens like `<:name:id>` and `<a:name:id>` now show as inline images in the **Profile** modal header instead of raw token text.

- **Auto-craft preview now accounts for shared ingredients.** (TheCarriedOne)

The Craft button in upgrade/craft UIs will no longer lie. If multiple needed items share the same raw material (for example, diamonds used by two parts), the button will be disabled correctly instead of server telling you “you’re missing materials”.

- “Craft automatically on purchase” now actually works when buying a relay bay.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.18.2](https://blog.bconomy.net/2026/06/18/release-v2026-06-18-bfe75673/)
**Date:** 2026-06-18

A new update for Bconomy has been released.

## Improvements

- **Charge meter on Mint bays.** (TheCarriedOne)

A new **Charge** bar now appears on the Mint bay card, shown beside the existing **Fuel** bar when you have the **Work Amplifier** upgrade.

- Charge builds gradually as salvage is actually burned by the bay. Simply depositing salvage right before pressing **Work** no longer gives instant benefit.

- The bar shows how much “Charge” the bay has built toward the cap (full charge now requires burning 300 salvage).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.18](https://blog.bconomy.net/2026/06/18/release-v2026-06-18-c7ae98de/)
**Date:** 2026-06-18

A new update for Bconomy has been released.

## Improvements

- **Overclock + coolant in one command.** (TheCarriedOne)

`/relay/setmode` command now supports passing optional coolant amount as the last argument.

## Bug Fixes

- **Over-supply fixes.** (TheCarriedOne)

It is no longer possible to commit huge amounts of items to refinery committed basket that would go above your maximum.

- Adjusting any bay configuration that impacts the maximum amounts of added items (Refinery basket, Cooling bay Cryo Gel storage) automatically adjusts the current maximum and refunds over-supply if necessary.

- **Support for numeric shorthand in inputs.** (TheCarriedOne)

You can now use `k`/`m`/`b`/`t` shorthand when setting an item reserve amount, an autosell limit, and an auto-confirm threshold, matching other amount fields in the UI. For real this time!

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.17](https://blog.bconomy.net/2026/06/17/release-v2026-06-17-dca21f1/)
**Date:** 2026-06-17

A new update for Bconomy has been released.

## New Features

- **Refinery Overdrive & burn-economy changes.** (TheCarriedOne)

The Refinery now burns much more BC to produce Salvage. Salvage rates were retuned so salvage/min feels consistent, and Salvage values are now shown as whole numbers (no trailing decimals).

- **Overdrive** is a new research-gated upgrade (up to **8 tiers**). Once researched and bought you get a slider in the refinery UI to pick an active Overdrive tier. Higher tiers multiply BC burn a lot while giving slight Salvage gains, it’s an intentional BC sink for faster output.

- Overdrive also **raises active heat** per tier (higher tiers run hotter). The refinery UI now shows Overdrive’s heat contribution separately in the heat tooltip so you can see the trade-off.

- A refinery’s **committed-basket duration** now scales with how much you’ve invested in that bay (module levels): small/early bays complete much sooner (~12h), fully-built bays can hold **up to ~96h** before they complete.

- Quest and leaderboard **Salvage rewards** were rescaled upward. Players have been **back-paid the difference** for quest milestones already earned so your quest progress/rewards reflect the new scale.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.16.2](https://blog.bconomy.net/2026/06/16/release-v2026-06-16-8d327e2d/)
**Date:** 2026-06-16

A new update for Bconomy has been released.

## New Features

- **Item Collector trophies.** (TheCarriedOne)

Every game item now has its own “***<Item> Collector***” trophy. Hold the most of an item to own that item’s Collector trophy.

- Trophies are assigned at the daily reset: the current top holder is **granted the trophy**, anyone who no longer qualifies **is revoked**, and any equipped title tied to a revoked Collector is automatically removed.

- Collector trophies can be equipped as titles.

- There is an “**Item Collectors**” leaderboard that shows top holders of each item.

- **Hoarder tier trophies and Hoarder leaderboard.** (TheCarriedOne)

New tier trophies reward players who hold many Collector trophies at once: **Magpie** (1+), **Stockpiler** (5+), **Hoarder** (10+). You always hold the highest tier you qualify for.

- The tier trophy shows how many Collector trophies you currently have.

- Tier trophies can be equipped as titles and an equipped title will follow your tier automatically (it clears if you drop to zero).

- There is a combined “**Hoarder**” leaderboard that ranks players by how many Collector trophies they hold.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.16](https://blog.bconomy.net/2026/06/16/release-v2026-06-16-d8bc63f1/)
**Date:** 2026-06-16

A new update for Bconomy has been released.

## Improvements

- **New bosses: Sharkfather & Magma Drake.** (TheCarriedOne)

Two new bosses have been added: **Sharkfather** (Fish) and **Magma Drake** (Mine).

## Bug Fixes

- **Emoji picker search finds partial matches.** (TheCarriedOne)

The **emoji picker** now matches substrings. Typing any part of an emoji’s name will find it, not just exact or prefix matches.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.14](https://blog.bconomy.net/2026/06/14/release-v2026-06-14-258857f5/)
**Date:** 2026-06-14

A new update for Bconomy has been released.

## New Features

- **Relay Network apex node cosmetic presets.** (TheCarriedOne)

When you unlock a Relay Network apex node you now get a themed cosmetic preset you can apply: a name colour, a chat-message background, and an emoji — quick to apply, unlocked by research.

- The Network Sovereign completionist node also unlocks an exclusive animated name effect and a special profile background.

- You can apply these presets from the apex node in the research view or from the profile customization menu.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.14](https://blog.bconomy.net/2026/06/14/release-v2026-06-14-d917fdac/)
**Date:** 2026-06-14

A new update for Bconomy has been released.

## Improvements

- **Leaderboard page (replaces the old modal).** (TheCarriedOne)

The Leaderboard is now a full page instead of a small popup. It shows all categories in one place: Players, Stats, Items, Trophies, Collectibles, Factions, and Pets.

- **Periodic stats: Today / This Week / This Month / Last‑period views.** (TheCarriedOne)

You can now pick a period for every stat in the **Stats** panel or **Leaderboards** page: **Today**, **This Week**, **This Month**, **Last Day**, **Last Week**, **Last Month**, or **All‑time**.

- The old triplet rows (Day / Week / All Time) are collapsed into a single stat row with a period selector.

- *Note: monthly leaderboards are display-only now (no monthly trophies yet). Last‑week/last‑month fill in once the full period has closed.*

- **Arbory perk cap increased.** (TheCarriedOne)

The Arbory prestige perk can be upgraded higher: max level is now **37**. That means you can plant up to **40 of the same crop** at once (up to **480 plots** total).

## Bug Fixes

- **Toasts now render Discord emojis correctly.** (TheCarriedOne)

Rare item and special item found toast notifications now show the item/special emoji instead of raw <:name:id> text. Much prettier!

*[Credits](https://bconomy.net/credits/)*

---

## [Mint Update](https://blog.bconomy.net/2026/06/13/v2026-06-13-5959bbcd/)
**Date:** 2026-06-12

A new update for **Mint Bay** has been released.

## Improvements

- **Better passive generation.**

Instead of flat value per module or level, it uses a more rewarding formula for growing big. Each module and level awards more.

- **Work action boosts.**

A new research node (**Work Coupling**) unlocks two new upgrades for the bay:

**Work Amplifier**: boosts your **Work** action based on bay setup and **Ascension tier**.

- **Cooldown Destroyer**: cuts your **Work** action cooldown based on upgrade and some luck.

- Both effects need **Fuel** actively burning in the bay.

- **Faction deposit.**

A new research node (**Faction Routing**) allows rerouting a portion of your Mint generated income to your faction instead.

- **Fuel** boosts the transfered BC by 15%.

## Bug fixes

- **Fixed income stats.**

Mint-generated BC now counts towards the income stats.

Read [here](https://blog.bconomy.net/2026/06/13/mint-overhaul/) for more details.

---

## [v2026.06.12.2](https://blog.bconomy.net/2026/06/12/release-v2026-06-12-651f1c3b/)
**Date:** 2026-06-12

A new update for Bconomy has been released.

## Improvements

- **Action-based bulk pets modal with rename.** (TheCarriedOne)

The old single-purpose **Bulk Release** is now **Bulk actions**.

- Inside **Bulk actions** pick an action: **Release** (works like before) or the new **Rename**.

- **Bulk Rename** lets you rename many pets at once using a template, e.g. `{{species}} {{generation}}`. A field picker shows the available fields so you don’t have to guess.

- Two special template tokens:

`{{randomName}}`: each pet gets its own random name.

- `{{staticRandomName}}`: every pet in the batch gets the same single random name.

- **Pinned filter for pets list.** (TheCarriedOne)

There’s a new **Pinned** filter in the Pets list and the **Manage Pets** modal filter panel. Use it to show only pinned pets or only non-pinned pets.

## Bug Fixes

- **Stop showing a modal after hatching an egg.** (TheCarriedOne)

Hatching an egg no longer opens a follow-up modal. You’ll see the usual toast/output and confetti like before, no extra popup.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.12](https://blog.bconomy.net/2026/06/12/release-v2026-06-12-52372571/)
**Date:** 2026-06-11

A new update for Bconomy has been released.

## New Features

- **Menagerie — pet collection hub.** (Shadybliss)

New **Menagerie** page where you can see your pet collection progress and browse leaderboards.

- Hatching pets and using collection-related special items now count toward your Menagerie progress, you’ll see unlocks update as you gain pets.

- New collection-related trophies and events tied to the Menagerie (watch for new goals on your profile/achievements).

- **Quest claim button on the action sidebar.** (TheCarriedOne)

A new toggle **Show Quest Claim Button** appears at **Settings → Sidebar Settings → Action Sidebar**.

- When enabled, a 🛎️ **Quests** button shows below your action buttons.

- Claiming the Quests now opens a confirmation showing a preview of the rewards before you claim them.

- Colorblind mode is respected for the action bar state so disabled/red states use the consistent orange color for better visibility.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.09.2](https://blog.bconomy.net/2026/06/09/release-v2026-06-09-ff93f2ca/)
**Date:** 2026-06-09

A new update for Bconomy has been released.

## Bug Fixes

- **Surge capacitor / overclock cooling behavior corrected.** (TheCarriedOne)

Overclock surge now acts as extra cooling on top of whatever cooling your setup is already providing, no longer deficit based.

- Surge stops exactly when the bay’s heat hits 50%. That means reserve energy is no longer silently wasted while the bay sits cold.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.09](https://blog.bconomy.net/2026/06/09/release-v2026-06-09-6d1dca97/)
**Date:** 2026-06-09

A new update for Bconomy has been released.

## Improvements

- **Relay bay UI rework.** (TheCarriedOne)

The “**Use N coolant when overclocking**” choice is remembered.

- The action buttons for a bay (**Mode, Coolant, Deposit, Craft, Allocation**) now sit next to the bar they affect instead of all being at the top.

- There’s no separate “effectiveness” bar anymore. Each output bar’s tooltip shows a clear breakdown: **Base** / bonus / heat taper / **Net rate**.

- The heat tooltip now lists DX Coolant and overclock drift as their own lines for better transparency.

- If **Grid Resonance** is enabled, the fuel and refinery basket bars will turn yellow once they drop below 50% threshold.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.08.2](https://blog.bconomy.net/2026/06/08/release-v2026-06-08-d34a5f43/)
**Date:** 2026-06-08

A new update for Bconomy has been released.

## New Features

- **Bulk pet release.** (TheCarriedOne)

Open **Manage Pets → Bulk Release** to pick many pets at once. Tick per-row checkboxes, select across pages, or use **Select Page** / **Select All Filtered** / **Clear Selected** and say goodbye to your beloved pets.

## Improvements

- **Persist coolant selection + opt-in auto-apply on overclock.** (TheCarriedOne)

The **Coolant** popover now remembers your last-selected multiplier (1x–5x).

- The **Mode** popover has a new checkbox that will automatically apply that many coolant units immediately when you set a bay to Overclocked.

- **Lightweight number animations and a new animation setting.** (TheCarriedOne)

Numbers (BC, inventory counts, pet bars, etc.) no longer count up from zero every time you open a tab or reveal a panel – they only animate when the value actually changes.

- New setting: **Settings → Play Animations → Number animation smoothness** with options Auto / 60 / 30 / 15 FPS so you can tune how smooth or light the number animations are.

## Bug Fixes

- **Killing blow now removes consumed weapons from your inventory immediately.** (TheCarriedOne)

Weapons used to land the killing blow on a boss will disappear from your inventory right away instead of lingering until you refresh.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.08](https://blog.bconomy.net/2026/06/08/release-v2026-06-08-fdd2360f/)
**Date:** 2026-06-07

A new update for Bconomy has been released.

## New Features

- **Live updates to all of a player’s sockets.** (TheCarriedOne)

Take an action on one tab or device and your other open tabs/devices update instantly: actions, inventory, balances, and relay accrual will no longer sit stale until you reconnect.

- After leaderboard calculations (including relay, which handles auto-deposit), all changes (including **Refinery** committed basket) are reflected immediately.

## Bug Fixes

- **Relay heat and projection readouts no longer jump or snap.** (TheCarriedOne)

Fixed a timing bug where relay heat numbers could jump to a different value the moment you make any action, or snap to a corrected number when you next acted. Heat now reads consistently whether the game was active or backgrounded.

- This fixes both the Interlock Harmony asymmetry issue and cooling allocation timing so projected heat and output estimates stay stable and accurate even if an overclock or coolant changes while you were away.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.06](https://blog.bconomy.net/2026/06/06/release-v2026-06-06-71429e18/)
**Date:** 2026-06-05

A new update for Bconomy has been released.

## Bug Fixes

- **Refinery re-commit now carries leftover correctly.** (TheCarriedOne)

If you add items to the Refinery while a run is already in progress, the Refinery now carries the previous run’s unconsumed leftover into a fresh run together with your new items.

- That means the refinery bonus window (the **Grid Resonance** boost) restarts and applies to the whole new run instead of only the newly-added portion.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.05.2](https://blog.bconomy.net/2026/06/05/release-v2026-06-05-2/)
**Date:** 2026-06-05

A new update for Bconomy has been released.

## New Features

- **Sidebar settings — configurable action & menu sidebars.** (TheDepartedOne)

You’ll find a new **Sidebar Settings** area split into **Action Sidebar** and **Menu Sidebar**.

- **Show, hide and reorder** the sections on your action sidebar (Actions, Items, Buddies, Boss, Tools) using the new reorder modal. Make the sidebar look the way you want.

- Mark pets as buddies from the pet modal and pin one buddy per adventure type. Buddies get an orange tint, a quick-swap button on the sidebar, and are protected from accidental release.

- Action quest badges can now show percentage completion (toggle **Show Percentage** in settings) instead of a raw count.

- New compact boss card for the sidebar: small HP bar, boss icon and a minimal co-attacker/weakpoint row so you can keep boss info visible without the full panel.

- Menu tab badges are configurable – enable/disable badges per tab and (when allowed) make them clickable. A new Home nav badge shows a countdown to your next daily reward.

- Settings now let you keep animations but disable confetti (**Play Animations → Show Confetti**), and split audio into separate **Sound Effects** and **Music** toggles so you can mute music while keeping SFX.

- **Pet collector trophy broadcasts.** (Shadox977, TheDepartedOne)

When you complete a pet species collection (collect all base skins), a message appears in global chat announcing it – e.g. “**Alyra completed the 🐕 Dog pet collection!**” — each species uses the correct emoji and name.

## Improvements

- **Action button tooltips reworked.** (TheDepartedOne)

The quest tooltip is richer: it lists each active item’s icon, name, remaining count and a thin progress bar in the same order as the Quests page.

## Bug Fixes

- **Discord action command aliases now work again.** (TheDepartedOne)

Slash shortcuts like `/fish`, `/f`, `/hunt`, `/h`, `/explore`, `/e`, `/mine`, `/m` and `/work` now execute actions from Discord as expected. Previously those aliases would silently do nothing and only the embed buttons worked.

- **Pets: pin and release bugs fixed.** (TheDepartedOne)

Pinning a very large pet collection no longer throws an error – pins are now capped to your actual pet capacity so setpins won’t break when you have extra pet space.

- Releasing a pet now removes it from your pinned list automatically.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.05](https://blog.bconomy.net/2026/06/04/release-v2026-06-05/)
**Date:** 2026-06-04

A new update for Bconomy has been released.

## New Features

- **Research effect toggles.** (TheDepartedOne)

You can now turn a purchased research node’s passive effect off and back on without losing the node or its prerequisites.

## Improvements

- **Clearer, tighter effect previews.** (TheDepartedOne)

Effects of research is now easier to read.

- Research cost is visible before unlocking prerequisites and after purchasing.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.04](https://blog.bconomy.net/2026/06/04/release-v2026-06-04/)
**Date:** 2026-06-04

A new update for Bconomy has been released.

## Changelog

- **Nav menu badges (Pets / Farm / Ball Pit).** (TheDepartedOne)

If you have the **Bay Telemetry** research, small badges now appear on the main nav entries for **Pets**, **Farm**, and **Ball Pit**.

- **Pets** badge shows time until the soonest adventuring pet runs out of energy.

- **Farm** badge shows watering status (countdown or “Ready”).

- **Ball Pit** badge shows the current ball type at a glance.

- **Mystical Balls shortcut in Ball Pit menu.** (TheDepartedOne)

The **Ball Pit** menu now shows how many **Mystical Balls** you own and a compact “Use” button so you can spend one without leaving the menu.

- **Equip shortcuts for Auspicious Coin and Rainmaking Amulet.** (TheDepartedOne)

The **Coinflip** menu now shows your Auspicious Coin count and an **Equip max** button so you can equip as many coins as your slots allow in one click.

- The **Farm** view now displays a Rainmaking Amulet bar (equipped / cap + owned count) below the status bars; click it to equip up to your cap.

- If your equip slots are full, equipping via the shortcut now automatically unequips enough other equipped items (they return to inventory) to make room instead of failing.

- **Relay bay state feedback: badges, bars, and per-bay coolant.** (TheDepartedOne)

Relay bay cards now show clear timing and state info: remaining overclock time, cooldown end, and how long active DX Coolant will last on that bay.

- A single clear **Stalled** badge replaces the older mix (hover it to see the reason), and new bars show mint fuel remaining and refinery deposit remaining.

- DX Coolant can be active per bay (you can run coolant on mint and refinery at the same time), and the heat readout is now next to the bay name consistently on desktop and mobile.

- **Ball Pit draw no longer blocks post-win buys.** (TheDepartedOne)

After a Ball Pit draw finishes and the winner is broadcast, players can now buy balls immediately. Previously some players saw the error `"Pit was drawn recently!"` for a few seconds after the announcement; that no longer happens.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.06.01](https://blog.bconomy.net/2026/06/01/release-v2026-06-01/)
**Date:** 2026-05-31

A new update for Bconomy has been released.

## Bug Fixes

- **Cooling Bay only burns Cryo Gel when cooling is in demand.** (TheCarriedOne)

The **Cooling Bay** no longer wastes Cryo Gel when nothing actually needs cooling. If every Mint/Refinery is cool or idle, the bay will stop consuming coolant.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.31](https://blog.bconomy.net/2026/05/31/release-v2026-05-31/)
**Date:** 2026-05-31

A new update for Bconomy has been released.

## New Features

- **Cooling Bay.** (TheCarriedOne)

Once you own a Mint and a Refinery bay, you can build a Cooling Bay as your 3rd bay.

- Cooling Bays don’t produce BC or Salvage – their job is to provide cooling for your hot bays so they can hold full speed when covered.

- The network panel shows total cooling output and how much is in use; each hot bay shows what it needs vs what it’s getting and a throughput effectiveness %.

- Cooling is consumed from a per-bay coolant store. Use the Cooling Bay’s **Coolant** popover to **Deposit** Cryo Gel. If the store runs dry, cooling falls to a 10% cap and covered bays slowly heat up.

- New items: **Frostsac** (Hunt loot) and **Cryo Gel** (crafted from 50 Frostsac + 30 Insulating Resin).

- **Thermal Routing & per-bay allocation.** (TheCarriedOne)

New research node **Thermal Routing** unlocks a per-bay cooling allocation control. When unlocked, the Cooling Bay card shows an **Allocation** split-bar popover so you can route more cooling to specific heat bays instead of splitting evenly.

- **Thermal Master** now requires Thermal Routing first (so you may need the new node before you can re-unlock the node/title).

- **Cooling Output Efficiency & Surge Capacitor.** (TheCarriedOne)

**Cooling Output Efficiency** upgrade: +3% cooling output per tier (up to +30%). You will see the real +X.XX% effect text in the upgrade rows and purchase views.

- **Surge Capacitor** upgrade: banks spare cooling into a reserve and spends it to cool bays faster right after an overclock burst. The reserve bar shows the live projected reserve and a subtitle with the net throughput rate.

- **Coolant Buffer Expansion** and Module Capacity Expansion now apply to Cooling Bays as well.

- **Module list grouping & module-count bar on bay cards.** (TheCarriedOne)

The “Modules N / Y” line is now a toggle: collapse/expand the module list. There’s also a new ⚙️ module-count bar that switches the list between per-module rows and a grouped-by-level view.

- Grouped view shows one row per level (e.g. “3 x Level 5”) with an aggregate stat tooltip and group actions (bulk level, bulk Pause/Run).

- **SysOp trophy/title.** (Wewert)

New trophy/title added: 🧑‍🔧 **Bconomy System Operator**.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.27](https://blog.bconomy.net/2026/05/27/release-v2026-05-27/)
**Date:** 2026-05-27

A new update for Bconomy has been released.

## Changelog

- **Ballpit buys and amount parsing.** (TheDepartedOne)

- If you use `/ballpit/buy` and ask for more balls than the pit can hold, the command will now buy as many as fit instead of erroring. No more failed buys when you overshoot, it just fills the pit.

Remaining commands that take amounts now understand formatted numbers like `1k` and `123,456`. That parsing is used consistently for reserve/autosell limits, market max price, and bulk boost amounts, so typed amounts behave the way you expect.

- **Refinery heat display when a bay goes idle.** (TheDepartedOne)

The Refinery heat bar will now show the bay cooling once its basket runs out or its output buffer fills.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.25](https://blog.bconomy.net/2026/05/25/release-v2026-05-25/)
**Date:** 2026-05-25

A new update for Bconomy has been released.

## New Features

- **Relay heat redesign.** (TheDepartedOne)

Bays no longer shut down or sit in a forced recovery. A hot bay just runs slower and keeps ticking the whole time. For more details, [read the related blog post](https://blog.bconomy.net/2026/05/25/relay-heat-got-a-rework/).

## Improvements

- **Relay bay panel state persistence.** (Shadybliss)

Relay bay panels now remember whether they were open or closed when you leave and return to the page.

- If a Refinery output is full, deposit is empty or fully consumed, that’s now called out directly in the bay header so you can spot it at a glance.

- **Action button improvements.** (Shadybliss)

New settings for action buttons:

**Action Quest Counts:** adds a number to the button showing how many quest items are related with the particular action

- **Compact Multipliers:** compacts multipliers to show the shorthand version (1,000 -> 1K)

- Both settings default to enabled. If you want to opt-out, you can do that in **Settings.**

- **Modifier-aware hotkeys.** (TheDepartedOne)

Hotkeys can now use modifier combos like **Ctrl+Shift+B** in addition to single-key binds.

- Existing symbol-based hotkeys you already set continue to work without any changes at least **until 2026-07-01**. We suggest remapping the old keys if you used symbols, such as **$/%/#**, as the keybinds. If you never used them, nothing changes.

- **XenoServer waivers full Salvage cost for Mint.** (TheDepartedOne)

Using a XenoServer on the Mint bay now waives the full Salvage cost (previously half was still charged).

- On any other bay it continues to charge half the Salvage cost as before.

## Bug Fixes

- **Confirmation dialog Enter key.** (Shadox97)

Pressing **Enter** on a confirmation dialog now always confirms the action.

- **Confirmation rules not showing on first open.**
    (TheDepartedOne)

Opening **Manage Confirmations** no longer incorrectly shows “No confirmation rules configured.”.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.23](https://blog.bconomy.net/2026/05/23/release-v2026-05-23/)
**Date:** 2026-05-23

A new update for Bconomy has been released.

## Changelog

- **Relay UI overhaul.** (Shadybliss)

The Relay Network screens got a visual refresh: more consistent game-themed colors across status panels, bay cards, module rows, and action buttons so things read cleaner at a glance.

- Clicking a prerequisite link in research graph moves it to that prerequisite.

- **Heat changes.** (TheReturnedOne)

A full bay now cools from full pool to zero in about **15 minutes** when switched off, and forced recovery finishes in about **30 minutes**.

- You can now apply **DX Coolant** to a bay that is in forced recovery to shave time off its recovery pool.

- **Interlock Harmony** fraction was increased (roughly a +4%/min cooling effect).

- **Overflow Cutoff** now correctly works as if the bay is off, dissipating heat as well.

- Committed basket “time remaining” estimates are now realistic.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.22.2](https://blog.bconomy.net/2026/05/22/release-v2026-05-22-2/)
**Date:** 2026-05-21

A new update for Bconomy has been released.

## Changelog

- **XenoServer changes.** (TheDepartedOne)

You can again use XenoServers directly via special item modal.

- You can no longer use XenoServers to push a refinery bay past its module slot cap.

- If you already had a refinery bay with more modules than the current cap, the excess modules were removed and you were refunded what you spent.

- **Refinery changes.** (TheDepartedOne)

The refinery’s per-minute Salvage output now depends only on your bay’s throughput, not on the specific item you commit. A single L1 module at normal speed produces about 1 Salvage per minute while running.

- What changes by item is how fast the bay’s committed “basket” drains. Categories now affect drain speed: **Crafted** items drain at 1×, **Consumable** items drain at 3x, **Raw** items at 5x. This affects the maximum committed basket duration.

- The refinery yield research nodes now reduce the category’s drain by 20% (so your basket lasts longer and you get ~25% more Salvage per committed BC of that category).

- Lowered the diminishing returns for each module installed, meaning crafting new modules is less punishing.

- The explicit **Gear** refinery category and its special research node were removed from the refinery UI and catalog. Weapons were kept refinable and are considered either **Raw** or **Crafted**.

*[Credits](https://bconomy.net/credits/)*

---

## [Relay Network](https://blog.bconomy.net/2026/05/21/relay-network/)
**Date:** 2026-05-21

A new update for Bconomy has been released.

## New Features

- 
    **Relay Network.** (TheDepartedOne)
    
  

The Relay Network replaces Generators with a full system of bays, modules, heat, Salvage, and an account-wide research tree. [Read the full launch post](https://blog.bconomy.net/welcome-to-the-relay-network/) for the deep dive.

- **Relay Network Prep** season results:

**1. straightpipes55** (Lv. 6231)

- **2. Gottlieb** (Lv. 2259)

- **3. risty** (Lv. 1722)

- **4. kpiefan** (Lv. 1629)

- **5. hanzoxx** (Lv. 1544)

- **6. JustConquest** (Lv. 1260)

- **7. Ravenleft** (Lv. 1211)

- **8. .bepolite** (Lv. 1182)

- **9. KryptCeeper** (Lv. 1085)

- **10. Camf** (Lv. 1077)

## Improvements

- **Museum broadcast updates.** (TheDepartedOne)

Repeated completions of the same museum collection now update the existing global chat and Discord broadcast instead of spamming duplicate rows.

- 
    **Command flags now save with hotkeys and recent commands.**
    (TheDepartedOne)
    
  

        Hotkeys and recent commands now preserve boolean command options such as
        recursive crafting, auto crafting, max-level upgrades, auto-upgrade
        purchases, and stop-on-incomplete pet leveling.
      

- You can now type command flags directly using bare boolean opt-ins like `recursive` and `craftAuto`.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.08](https://blog.bconomy.net/2026/05/08/release-v2026-05-08/)
**Date:** 2026-05-07

A new update for Bconomy has been released.

## New Features

- **Faction co-attacker count & boss damage multiplier.** (Shadox97)

Left side shows your faction support and boost, for example: `👥 4 faction attackers — 3.00x`.

- Right side keeps a live countdown to the overkill window ending or the next weakpoint reveal – it’s now shown together with the attacker info.

- **Pets: new sort options, direction toggle, and per-pet sort badge.** (TheDepartedOne)

On the **Pets** page you can now sort by `Aura`, `Generation`, or `Breed Count`.

- When a non-default sort is active, a small badge appears in the top-right of each pet’s image showing that pet’s sort value so you can quickly see why pets are ordered that way.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.07](https://blog.bconomy.net/2026/05/07/release-v2026-05-07/)
**Date:** 2026-05-06

A new update for Bconomy has been released.

## New Features

- **Pets filter & sort bar.** (TheDepartedOne)

There’s a new **Sort** dropdown and a **Filters** panel above your pet list on the **Pets** page – you can change how your pets are ordered and narrow the list by species, skin, aura, or whether a pet is on an adventure.

- Filter and search behavior is consistent between the Pets page and the Manage Pets modal, and filter state stays per session.

## Bug Fixes

- **Chat channel names no longer act like channel toggles.** (Shadybliss)

Clicking a channel name in the chat dropdown now simply switches you to that channel like normal.

- Adding or removing a second (split) chat panel only happens when you click the switch next to a channel.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.06](https://blog.bconomy.net/2026/05/06/release-v2026-05-06/)
**Date:** 2026-05-06

A new update for Bconomy has been released.

## New Features

- **Split chat.** (TheDepartedOne)

Chat can now show multiple channels at once in stacked, vertical panels – each panel has its own header, scrollable history, and its own input box (only one input for an active chat – click anywhere on another chat to reveal the input for it).

- Turn channels on or off from the channel selector dropdown (hover the channel header to open it) – each channel gets its own panel when enabled.

- Drag the divider between panels to resize them. Sizes will reset if you toggle panels on/off or refresh the page.

- Use the ▲/▼ buttons on a panel header to reorder panels.

- **Optional message timestamps.** (TheDepartedOne)

Toggle message times on or off with the **🕐 Timestamps** option in the channel dropdown or in **Settings**. When on, each chat message shows message time at the start. Timestamps are intentionally hidden in the **Console** channel.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.05.05](https://blog.bconomy.net/2026/05/05/release-v2026-05-05/)
**Date:** 2026-05-05

A new update for Bconomy has been released.

## New Features

- **Specials management UX overhaul.** (TheDepartedOne)

The **Use** button for Calibrated Amplifiers (and similar Specials) now respects the real server cooldown – it stays disabled for the full cooldown even after the boost effect ends, so what you see matches what the server enforces.

- Countdowns and “Expires in…” labels now respect clock skew between your client and the server, so timers won’t jump or disagree if your clock is a bit off.

- Inventory grouping: in the Specials section you can toggle **Group** (defaults on). When grouped, multiple variants of the same Special collapse into one row showing total count and the nearest expiry. Click the “N types” / secondary button to view all variants.

- Type-group modal: clicking a grouped row (or using certain text commands) opens a modal showing every variant of that Special type so you can pick which exact copy to use.

- New text command: you can now use Specials by type name with `/special/use <type> [action]`. Examples: If you call `/special/use` with no args you get a clickable list in chat that fills your chat box when clicked – handy!

- Arbitrary Amplifier picker now disables action buttons when that action already has the server-side max active boosts, and shows a countdown to the nearest expiry so you know when you can add another.

- **Combinable bulk boost filters.** (TheDepartedOne)

The Bulk Pet / Bulk Farm Boost dialog replaced the single dropdown with independent toggles (Pinned, Boosted, Expiring). Turn any toggle on and choose Yes/No – toggles combine together so you can do things like “pinned + unboosted” in one go.

- Text command support: compound filters work in commands, e.g. `/bulkpetboost <item> 1 pinned,unboosted` or `/bulkpetboost <item> 1 unboosted,expiring:1h`.

- **Timers: two-unit precision and duration tooltips.** (TheDepartedOne)

Short timers now show two parts for better clarity – e.g. **4h 30m**, **2m 15s** instead of a single unit. Longer times use months/years where appropriate.

- Hover any of the updated timers (boss modal weakpoints/overkill, pet & farm boost remaining, home-page boosts) to see a tooltip with the full breakdown (like `1y 2mo 3d 4h 7m 12s`) and the exact local end time.

## Bug Fixes

- **Killing blow console now shows weapons used.** (TheDepartedOne)

When you land the killing blow on a boss the console message now lists which weapons you used and how many of each, matching the detail you already see for non-lethal attacks. Nice for bragging rights and logs!

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.28](https://blog.bconomy.net/2026/04/28/release-v2026-04-28/)
**Date:** 2026-04-27

A new update for Bconomy has been released.

## Bug Fixes

- **Amount inputs now keep percent and math expressions.** (TheDepartedOne)

Typing expressions like `50%`, `max`, `all`, `2k*2`, or `1k+500` into amount boxes now works across modals you already know – sell, use, craft, market buy, ball pit buy, feed, boost, burn, coinflip, bulk boost, vault upgrade, giveaway, and similar screens. No more losing the % or math when you submit.

- The action button on each amount input now shows a live preview of the exact number it will send (for example it will read something like **💰 Sell (10)** after you type `10%` when you own 100). If your expression doesn’t resolve to a valid positive number, the button will be disabled so you can’t accidentally submit nonsense.

- Chat commands keep the percent token too – e.g. `/item sell <item> 10%` will now send the percent expression to be resolved correctly instead of dropping the `%`.

- **Shared default avatar for players without a Discord avatar.** (Wewert)

Players who don’t have a public Discord avatar will now see a single shared default avatar image (served from our CDN) instead of a generated, BcID-specific avatar. The default picture is the same for everyone in that situation, so no more uniquely generated fallbacks.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.25](https://blog.bconomy.net/2026/04/25/release-v2026-04-25/)
**Date:** 2026-04-24

A new update for Bconomy has been released.

## New Features

- **Museum collection updates.** (Shadybliss)

New **Delayed Development Relics** collection – five new collectibles to find.

- On the **Museum** page you can now choose which collection future collectible drops target. Pick where you want new items to go!

- Items are now grouped by collection in the **Items** tab, so it’s easier to see progress for each collection.

- The **Museum** page now shows a gold glow when a player has a hand in available.

## Improvements

- **Museum reward progression.** (Shadybliss)

BC rewards for completing museum collections now scale with repeat completions – you’ll earn more for repeats, up to a cap set by your **Provenance** (new perk).

- Collections that require more collectibles now pay higher BC. Example ranges: **Delayed Development Relics** pays from 25m up to 25b, while **Easter** pays from 45m up to 45b.

- **Provenance** can now reach level 19, unlocking access to up to Tier 20 Museum Rewards.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.24.3](https://blog.bconomy.net/2026/04/24/release-v2026-04-24-3/)
**Date:** 2026-04-24

A new update for Bconomy has been released.

## New Features

- **Per-collectible leaderboards.** (TheDepartedOne)

Open a collectible’s detail modal and click the 🌎 **Leaderboard** button to see who has found the most of that specific collectible (total acquired across all time).

## Bug Fixes

- **Museum Collectibles Found stat backfilled and corrected.** (TheDepartedOne)

If you had collectibles before the stat existed, a backfill has corrected your displayed number so it now matches your actual finds (including finds recovered from completed cycles).

- This should fix cases where your collectible count looked lower than expected after the stat was added.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.24](https://blog.bconomy.net/2026/04/24/release-v2026-04-24/)
**Date:** 2026-04-23

A new update for Bconomy has been released.

## New Features

- **Batch egg parent-name lookups.** (TheDepartedOne)

When you scroll the eggs list, parent names now load together in one go instead of each egg asking the server separately. Scrolling the egg list feels smoother and is much less likely to trip request limits.

- The egg detail modal still shows both parent names correctly when you open an egg – no change to modal behavior there, just faster list loading.

## Bug Fixes

- **Amount inputs now understand shorthand and commas.** (TheDepartedOne)

Typing things like `1k`, `2m` or numbers with commas like `1,000` into quantity fields now correctly becomes the intended number (e.g. 1000) instead of being mis-read as 1.

- **Tool modal augments restored.** (TheDepartedOne)

You can again apply augments from the **Tool status modal**. Extending an existing augment also works even when the tool’s augment slots are full – you won’t get incorrectly blocked from extending.

- **Commands and hotkeys show and accept item:amount pairs.** (TheDepartedOne)

Commands that include item prizes or item lists (for example, a giveaway) now show those items in the **Hotkeys** modal’s recently-used list.

- You can type item arguments as `itemId:amount` in text commands and they’ll be recognised. Example: `/giveaway/start 24 1 rock:100` will parse the `rock:100` prize correctly.

- **/help now shows canonical command names and alternate syntax.** (TheDepartedOne)

The **/help** popup now displays commands in the standard `/category/name` form (for example `/item/sell` or `/action/fish`), and it shows the alternate bulk argument style (like the `item:amount...` form) so the two call styles are clearer.

- **Friendly message when attacking with no boss active.** (TheDepartedOne)

If you try to **/boss/attack** after the boss is dead, you’ll get the clear message “There is no boss currently active.” instead of a confusing error.

- **Percent quick-buttons (25%/50%/75%/100%) fixed.** (TheDepartedOne)

Percent quick-buttons in amount inputs (like Burn modal, Coinflip, etc.) now submit the actual percentage of the available amount instead of always sending the full amount.

- The **Faction Vault** deposit buttons (25%/50%/75%/100%) were also fixed so they no longer error when your client-side vault number is out of sync – the vault modal sends the percent to the server to be resolved against the server’s current max.

- **Faction join request actions fixed.** (TheDepartedOne)

Accepting or declining faction join requests works again (previously those actions failed after a refactor).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.23](https://blog.bconomy.net/2026/04/23/release-v2026-04-23/)
**Date:** 2026-04-23

A new update for Bconomy has been released.

## Bug Fixes

- **Discord market prices fixed.** (TheDepartedOne)

Market preview messages and item embeds sent to Discord now show the actual BC price instead of displaying `[object Object]`. You’ll see real numbers again when browsing listings from Discord.

- **Account link mismatch now resolves correctly.** (TheDepartedOne)

If the Discord/Google/email you’re trying to link already belongs to another Bconomy account, the mismatch screen’s choices now work correctly. Picking to move the sign-in will actually transfer the login method instead of getting stuck, and the buttons now clearly say whether you’re keeping your current account or switching to the conflicting one.

## Other

- **All `dataFetch` API types have been renamed.** (TheDepartedOne)

To adhere to the correct standards, all `type` properties in `dataFetch` endpoint have been renamed. Old values are still supported, but are now obsolete and should be adjusted by the callers, they will be removed in the future without further notice.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.20.2](https://blog.bconomy.net/2026/04/20/release-v2026-04-20-3/)
**Date:** 2026-04-20

A new update for Bconomy has been released.

## New Features

- **Toggle to opt out of extended market data.** (TheDepartedOne)

The new **Settings → Interface** section includes a “📊 Extended Market Data” group with three sub-toggles: **Live Activity**, **Pricing Delta**, and **Charts**.

## Bug Fixes

- **Price chart hover shows the correct year across year boundaries.** (TheDepartedOne)

When you hover the price history chart near a year boundary, the tooltip now points to the correct data point and shows the right date.

- **Item logs and market activity ordering fixed (newest-first).** (TheDepartedOne)

The item-logs modal now reliably shows the newest entries first. The same ordering fix was applied to the market activity feed so recent events appear at the top.

- **Scheduled jobs are more reliable across DST changes.** (TheDepartedOne)

Background scheduled tasks (ball pits, giveaways, bosses, etc.) have been made DST-safe so they won’t silently stop running after daylight-saving clock changes. This should prevent the kind of missed ticks that caused timed event outages before (leaderboard resets, same ballpit for a day, etc).

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.20](https://blog.bconomy.net/2026/04/20/release-v2026-04-20/)
**Date:** 2026-04-19

A new update for Bconomy has been released.

## New Features

- **Price change indicators & history chart.** (TheDepartedOne)

You’ll now see coloured percent changes next to an item’s price on the Market list and in the item modal – e.g. “1d +5% | 7d +12%” – so trends are obvious at a glance.

- Open any item’s listings and expand the **Price History** accordion to see a line chart. Pick 1d / 7d / 30d / All or a custom date range to inspect recent moves.

- **Volume stats & Volume History chart.** (TheDepartedOne)

Item listings now show a 24-hour volume line (units sold and BC) near the “last updated” area so you can quickly see how active an item is.

- There’s a new **Volume History** accordion with a bar chart you can view in 1d / 7d / 30d / 6m / 1y ranges; hover bars to see revenue and units sold.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.19](https://blog.bconomy.net/2026/04/19/release-v2026-04-19/)
**Date:** 2026-04-18

A new update for Bconomy has been released.

## New Features

- **Live market activity feed.** (TheDepartedOne)

You’ll see recent listing and purchase activity live: item modals load the last 5 events and new events prepend in real time (keeps up to 10).

- The Market page has a collapsed activity accordion at the top (shows up to 20 entries). When new events arrive while it’s closed you get an “N new” badge – click to open.

- Delisted listings appear in the feed with a clear **delist** label so you can tell when someone pulled an item.

- **Market sort controls and pagination.** (TheDepartedOne)

There’s now a sort dropdown next to the search bar that remembers your preference. Default is `priceAsc`.

- The market list is paginated with pages of 20 items. Pinned items always stay on page 1 so they don’t get lost as you flip pages.

- **Supply depth bars for listings.** (TheDepartedOne)

The supply tiers for an item now show all price tiers (no more hidden tiers) inside a scrollable container so you can scan everything without the UI growing huge.

- Each tier has a progress bar: green portion = your listings at that price, muted = other players. The bar width reflects how many are listed at that tier.

## Bug Fixes

- **Restore reconnect delivery of sale notifications and boss broadcasts.** (TheDepartedOne)

If you were offline or the app was backgrounded and missed a market sale or boss broadcast, those notifications will now show up when you reconnect – they no longer disappear silently.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.18](https://blog.bconomy.net/2026/04/18/release-v2026-04-18/)
**Date:** 2026-04-18

A new update for Bconomy has been released.

## Changelog

- **Damned Intent burn reward and Burn UI updates.** (Wewert)

You can now earn a new burn reward item called **Damned Intent**.

- The **Burn Modal** now has a dedicated **Burn Items** section that lists all burn reward items and their drop chances, and the **Item Modal** shows whether an item can be obtained from burning.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.17](https://blog.bconomy.net/2026/04/17/release-v2026-04-17/)
**Date:** 2026-04-16

A new update for Bconomy has been released.

## Improvements

- **Discord name sync and settings fixes.** (TheDepartedOne)

Your Bconomy name can now be kept in sync with your Discord server nickname. The server will prefer your Bconomy-guild nickname first, then your global name, then your username – each cleaned up to fit our name rules.

- This release fixes a previous lockout: if your Discord token had expired you could not change your Bconomy username or flip the sync toggle. That should no longer happen – you can edit your name and use the Settings toggle or the disable link as needed.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.16](https://blog.bconomy.net/2026/04/16/release-v2026-04-16/)
**Date:** 2026-04-15

A new update for Bconomy has been released.

## New Features

- **Add burn item drops.** (Wewert)

If you use the `burn` command, there’s now a small chance to get some items back…

- Pyrology Prestige Perk increases this chance.

## Bug Fixes

- **Prevent iOS zoom when searching in the emoji picker.** (Wewert)

The search input no longer forces a zoom; emoji searching should feel normal again.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.14](https://blog.bconomy.net/2026/04/14/release-v2026-04-14/)
**Date:** 2026-04-13

A new update for Bconomy has been released.

## New Features

- **Quick-open slash commands.** (Wewert)

Type `/user`, `/profile`, `/logs`, `/trophies`, `/stats`, `/pets`, `/items` and a few others to jump straight to those pages from chat.

- If you leave the `BcID` argument off, commands like `/profile` and `/pets` open your own page. `/items` with no argument opens your inventory.

## Improvements

- **Abbreviated faction FP numbers in member lists.** (Wewert)

Faction member contribution totals now use a compact formatter (e.g. 1200 → 1.2k) in the member list so large numbers are easier to scan.

## Bug Fixes

- **Stop iOS from auto-zooming the search modal.** (Wewert)

iOS devices no longer zoom unexpectedly when you tap a search field.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.13.2](https://blog.bconomy.net/2026/04/13/release-v2026-04-13-2/)
**Date:** 2026-04-13

A new update for Bconomy has been released.

## Bug Fixes

- **Market fixes.** (TheDepartedOne)

Auto-confirm rules work correctly now. Using shortcuts like `max`, `all`, `%` or typing an exact amount will obey your auto-confirm rules and won’t show the spurious “Invalid confirmation” error anymore.

- If you set a price tolerance (using a command `marketbuy <itemid> <amount> <maxPricePerItem>`, no UI equivalent today), confirmation prompt will not appear as it is treated as intentional action.

- The buy confirmation message is cleaner when every listing is the same price (compact single-price format), and overall confirmation text was tightened up so prompts are clearer.

- Items marked as excluded from market (for example, Relay Frame) are now hidden from the **Market** page and search results so you won’t see them.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.13](https://blog.bconomy.net/2026/04/12/release-v2026-04-13/)
**Date:** 2026-04-12

A new update for Bconomy has been released.

## New Features

- **Premium profile backgrounds on user entries.** (Wewert)

Users now show their animated background behind their entry in search results and in faction member lists.

- Search result cards also get tuned text colors so names remain readable against bright backgrounds.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.12](https://blog.bconomy.net/2026/04/11/release-v2026-04-12/)
**Date:** 2026-04-11

A new update for Bconomy has been released.

## Improvements

- **Ability to buy from multiple market listings.** (TheDepartedOne)

It’s now possible to buy an item on the market from multiple listings at the same time. Players no longer need to navigate market multiple times just to buy enough items, granted they have the enough BC to buy them all at once.

- Max/all/% in the amount input for buy now works based on the BC in wallet, no longer as item amounts. All the other numbers and formulas still use item amounts.

- **Market listings work in queue principle.** (TheDepartedOne)

Instead of a single person replenishing the single stock of items on the market leaving no room for others to actually trade items, now the trades are queued.

- This opens the market ever so slightly for all the players, not just those that have near-infinite amount of items to sell.

- Beware: from now on you will see multiple listings in your own inventory/market tabs if you list same item multiple times at the same price.

## Bug Fixes

- **Boss HP decrement delay fixed.** (Krisibelle)

Fixed a rare issue so the HP and damage numbers in the chat match the actual boss state. This should reduce confusing mismatches between what the chat shows and the true boss HP/damage during bosses.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.10](https://blog.bconomy.net/2026/04/10/release-v2026-04-10/)
**Date:** 2026-04-10

A new update for Bconomy has been released.

## New Features

- **Pet levelup command and UI.** (TheDepartedOne)

New command: `petslevelup` – automatically feeds a pet to level 100, reincarnates it, and repeats up to a configurable max tier so you can level pets multiple times in one go.

- You can level a single pet from the pet modal (new levelup button) or do bulk levelups from Manage modal.

- There’s a new levelup manual page reachable from Help that explains settings and behavior.

## Improvements

- **Cooldown system rework.** (TheDepartedOne)

Single-pet feed and claim actions now have no cooldown at all – you can feed or claim one pet repeatedly without waiting.

- Bulk operations (bulk feed, bulk claim, bulk levelup) now share a short, server-backed cooldown: a 5-second cooldown that the buttons will show after use.

- Museum evaluations that run during feed/levelup are gated behind a 5-minute internal cooldown; if the cooldown is active you’ll see a message explaining you must wait for the museum roll to be available.

*[Credits](https://bconomy.net/credits/)*

---

## [Relay Preparation season](https://blog.bconomy.net/2026/04/08/release-v2026-04-08/)
**Date:** 2026-04-07

A new update for Bconomy has been released.

## New Features

- **Relay Preparation season.** (TheDepartedOne)

New season: **Relay Preparation** (📡) replaces Cold Front and runs through 2026-05-11. Top 10 players in the last season:

[straightpipes55](https://bconomy.net/play/?profileBcId=136948) — Level 13,109

- [Lightman](https://bconomy.net/play/?profileBcId=163373) — Level 12,012

- [JustConquest](https://bconomy.net/play/?profileBcId=174834)— Level 5,645

- [spartanhacker](https://bconomy.net/play/?profileBcId=178926) — Level 5,530

- [KryptCeeper](https://bconomy.net/play/?profileBcId=184443) — Level 5,007

- [hanzoxx](https://bconomy.net/play/?profileBcId=144034) — Level 5,003

- [Ravenleft](https://bconomy.net/play/?profileBcId=130814) — Level 3,146

- [marieslife](https://bconomy.net/play/?profileBcId=150703) — Level 3,095

- [Zilenz](https://bconomy.net/play/?profileBcId=169489) — Level 2,941

- [Camf](https://bconomy.net/play/?profileBcId=125289) — Level 2,834

- New item: **Relay Frame**. It’s intentionally non-tradable and cannot be listed on the market, so you’ll keep it in your inventory if you earn one. Will be useful soon.

- **XenoServer** will soon get a new use, therefore we suggest not using it for a while. Or use it, it’s yours after all! And no, **DX Coolant** is **not** getting removed, as it **will** get a use pretty soon!

- The cockroach pet is now breedable.

- No trophies for this short season, except **Trailblazer** as usual.

- **Track global boost usage.** (Wewert)

The game now counts how many times global boosts are used (this covers the global boost commands you already know).

- Historical uses have been backfilled from past logs, so overall stats/leaderboards that show boost usage will include past activity too.

## Improvements

- **Loot crate open limits removed.** (Wewert)

Per-command caps for several loot-open items are gone. You can open Ocean Bounty, Fancy Crate, Forest Bounty, Hillside Bounty, Cavern Bounty, Lunar Shard, and Exquisite Trunk without the old per-command limits – behavior otherwise stays the same.

## Bug Fixes

- **Leaderboard paginator no longer wraps.** (Wewert)

The pagination controls in the **Leaderboards** modal/footer will stay on a single row instead of breaking into multiple lines. The number input and ellipsis jump still work, just without the awkward wrapping.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.06](https://blog.bconomy.net/2026/04/06/release-v2026-04-06/)
**Date:** 2026-04-05

A new update for Bconomy has been released.

## New Features

- **Track museum collectible finds in stats.** (Wewert)

There’s a new lifetime stat that counts every museum collectible you find.

## Improvements

- **Make leaderboard self row jump to its page.** (Wewert)

If your row in the user leaderboard is shown as an off-page “find me” entry, it now is clickable.

- Clicking that row will jump you straight to the leaderboard page where your actual rank appears: no more hunting through pages!

- **Rename inventory leaderboard label to ‘Inventory’.** (Wewert)

The leaderboard entry that used to say `Inventory Worth` now displays as `Inventory`, so the picker and label match.

- **Use storage box icon for museum collections.** (Wewert)

The Museum → Collections section now uses a distinct storage-box icon so it doesn’t repeat the main Museum emoji.

## Bug Fixes

- **Show chat send cooldown countdown.** (Wewert)

When you’re on a local send-message cooldown, the Send button now shows a small passive countdown so you can see how much time is left.

- **Stop confetti from replaying after tab restore.** (Wewert)

Confetti from ambient generators (like farm or generator effects) won’t fire while your browser tab is hidden.

- When you return to the tab, hidden-tab particles won’t suddenly replay as a burst.

- “Ghost particles” should no longer appear onscreen.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.05](https://blog.bconomy.net/2026/04/05/release-v2026-04-05-2/)
**Date:** 2026-04-05

A new update for Bconomy has been released.

## New Features

- **Museum collectibles.** (ShadyBliss)

A brand-new **Museum** entry in the sidebar with its own page: overview, collection cards, and per-collectible detail screens.

- Collectibles are stored in a dedicated Museum area, you can hand them in to complete repeatable collections.

- Collectibles can drop from normal gameplay actions (actions, work, feed, water, generator claim). When you find one you’ll get a notification.

- There are special seasonal sets – Easter collectibles are included. The first time someone completes the Easter collection they unlock the Eggstravagant title.

- **Ball Pit broadcast details.** (TheDepartedOne)

The global ball pit broadcast now shows the winner’s ball count and what percentage of the pot they won – so you can immediately see how big the win was.

- There’s a second line in the broadcast that tells you the next ball pit’s balls-per-user limit and type.

- **Wallet and Inventory Worth leaderboards.** (TheDepartedOne)

Two new leaderboard types: **Wallet** (💰) and **Inventory Worth** (🎒). They appear as the first two options in the web leaderboard dropdown and the Discord select menu.

- The Inventory Worth leaderboard computes the value of what players hold, and both new options should load without errors. You can also call them from Discord, e.g. `/leaderboard global wallet` or `/leaderboard global inventoryWorth`.

- **Emoji picker search.** (TheDepartedOne)

The emoji picker modal now includes a search field so you can find the emoji you want much faster instead of scrolling.**

## Improvements

- Longer chat commands (removed character limit).** (TheDepartedOne)

We’ve removed the old chat character limit for commands — you can now type longer command messages without them being cut off.

- **Emoji picker search.** (TheDepartedOne)

The emoji picker modal now includes a search field so you can find the emoji you want much faster instead of scrolling.

## Bug Fixes

- **Pet feed “craving” loop cap removed.** (TheDepartedOne)

High-tier pets that needed long chains of valid food to finish a craving will now complete in a single **feed** command. The previous 100-iteration cap could leave pets still hungry and require you to feed them again – that won’t happen anymore.

- **Market seller stats fixed.** (TheDepartedOne)

Selling on the market now correctly increments your seller stats (Listings Sold and Market Revenue), so your profile and **/stats** show the right totals after a sale.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.04](https://blog.bconomy.net/2026/04/04/release-v2026-04-04/)
**Date:** 2026-04-04

A new update for Bconomy has been released.

## New Features

- **Auto-upgrade after purchase.** (TheDepartedOne)

New **Auto-upgrade** toggle in purchase modals for farm plots and generators. Turn it on and the server will attempt to upgrade the new facility immediately after you buy it (as far as your materials allow).

- **gameState dataFetch type.** (TheDepartedOne)

Third-party tools and API users can now request live game state without joining a session. A POST to `/api/data` with `{ "type": "gameState" }` (and a valid API key) returns the live fields: global action boosts, last global cooldown reset time, active boss status, ball pit status, and active giveaways (sorry – too lazy at this point to craft the response schema).

## Bug Fixes

- **Pet feeding now recalculates energy capacity during feed loops.** (TheDepartedOne)

If feeding food causes your pet to level up mid-feed, the code now notices the higher capacity and keeps feeding up to the new maximum. So if one big click would have leveled your pet and let it hold more energy, it will now accept that extra food instead of stopping early.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.04.01](https://blog.bconomy.net/2026/04/01/release-v2026-04-01/)
**Date:** 2026-04-01

A new update for Bconomy has been released.

## New Features

- **Building upgrade & purchase toggles.** (TheDepartedOne)

All building modals (generators, farm plots, tools, stables) now have three new toggles: **Recursive**, **Craft automatically**, and **Craft to max level**. You’ll see them when you open an upgrade or purchase modal.

- Flip **Recursive** to make crafting use recipe trees (craft intermediates automatically). Turn it off to craft only the exact item you click.

- **Craft automatically** lets the upgrade/purchase button attempt to craft missing components for you before buying/upgrading.

- **Craft to max level** sums the materials for all remaining levels and will try to upgrade as many levels as possible in one click.

## Improvements

- **Inline craft buttons at every recipe level**. (TheDepartedOne)

Recipe tree nodes now show a small “Craft N×” button at any depth. You can craft a required intermediate right from the tree.

- When you only have some of what’s needed, the craft button shows a yellow partial-coverage style so it’s clearer what will be partially vs fully auto-crafted.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.30](https://blog.bconomy.net/2026/03/30/release-v2026-03-30/)
**Date:** 2026-03-30

A new update for Bconomy has been released.

## Changelog

- **Recursive item crafting.** (TheDepartedOne)

The `craft` command can now automatically craft required sub-components for an item. Craft a complex item (looking at you, *Little Brother*) and game will automatically craft the pieces it needs instead of failing because one ingredient is missing.

- Stable / Farm / Generator purchase or upgrade dialogs automatically fallback to crafting recursively. We will see what we can do with them regarding purchasing or upgrading multiple at a later date.

- **Equip button in item modal respects your Equip Max setting.** (TheDepartedOne)

- **Market button always visible in item modal; shows ‘No listings’ when none exist.** (TheDepartedOne)

- **Hotkeys no longer block browser shortcut combos.** (Wewert)

Game hotkeys won’t swallow common browser shortcuts anymore – things like `Ctrl/Cmd+F` (find) or other browser combos should work as expected while you’re in the client.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.29](https://blog.bconomy.net/2026/03/29/release-v2026-03-29/)
**Date:** 2026-03-28

A new update for Bconomy has been released.

## Changelog

- **Pinned/Unpinned filters in Bulk Pet Boost dialog.** (TheDepartedOne)

When you open the bulk pet boost window you’ll see new filters to show **Pinned** or **Unpinned** pets.

- **Max inventory button settings and redundant button cleanup.** (TheDepartedOne)**
There’s a new setting to control the Use/Equip/Craft** button behavior in inventory — you can configure them based on how you’d like the buttons to act.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.28](https://blog.bconomy.net/2026/03/28/release-v2026-03-28/)
**Date:** 2026-03-28

A new update for Bconomy has been released.

## Changelog

- Logs now adjust how many items show per page based on available height and use pagination for quicker navigation. (TheDepartedOne)

- The leaderboard follows the same functionality as logs above, but you can also see your own position regardless of the page you are on. (TheDepartedOne)

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.27](https://blog.bconomy.net/2026/03/27/release-v2026-03-27/)
**Date:** 2026-03-27

A new update for Bconomy has been released.

## New Features

- **Mass pet & farm boosting.*** *(TheDepartedOne)

You can now boost all your pets or farm plots in a single operation instead of boosting each one individually.

- In the pet management modal, click **Bulk Boost** to open the boosting UI. Same for farming – click **Manage Farm** and use the **Bulk Boost** button there.

- You can filter targets by: all active, unboosted only, or expiring within a custom duration. A preview panel shows how many items you’ll spend and what existing boosts would be replaced.

- There’s also a **Replace existing boosts** toggle if you want to overwrite lower-tier boosts with better ones.

- **Aggregate bulk output.*** *(TheDepartedOne)

Tired of walls of text when feeding or claiming all your pets? There’s now a setting to collapse that into a single compact summary.

- Toggle it in **Settings -> Notification Settings -> 📦 Aggregate Bulk Output** (on by default). Single-pet operations always show the full detail regardless.

## Improvements

- **Updated game manual.** (TheDepartedOne)

The prestige perks page now lists all perks in full, with expandable sections for each one. Ever wondered which **Mercantilist** level you need to sell your stack of floppy disks? Now you can see exactly that – item tier requirements are broken down per perk level.

- New pages added: **Ranks**, **Daily Rewards**, and **Giveaways**.

- All boost-related pages are now grouped under a dedicated **Boosts** section, including a new **Mass Boosting** page explaining the new bulk boost features above.

- **Granular confirmation management.** (TheDepartedOne)

Confirmation rules are no longer all-or-nothing. You can now set per-item rules with amount thresholds – for example, “auto-confirm selling this item only when selling 10 or fewer.”

- When a confirmation dialog appears, you can set the rule right there inline: choose **All items** or **Only [this item]**, then pick an amount condition using `<`, `<=`, `=`, `>=`, or `>`.

- Inputs like `max` and `all` work too – the server resolves the actual number and checks it against your threshold before deciding whether to prompt.

- To manage all your rules at once, go to **Settings -> Manage Confirmations**. You can edit, remove, or reset everything there.

- If you had any confirmations set previously, they will need to be manually converted in the Manage Confirmations dialog.

- **Breeding modal overhaul.** (ShadyBliss)

The old two-dropdown parent selector is gone. There’s now a single unified parent picker that stays open while you select both parents.

- You can search by pet name and filter with a **Prioritize charm/sludge holders** toggle to bring pets carrying breeding modifiers to the top.

- Selected parents are shown as numbered slots (1. / 2.) and highlighted in the list with their **Parent A** / **Parent B** labels. Click a selected pet again to deselect it.

- Held breeding items (Mutagenic Sludge, Cursed Charm) are now shown directly in the picker as bracketed labels so you can see them without digging through inventory.

- **Profile modal: copy BcID & share your profile.** (Wewert)

Click your **BcID#** row in the Profile modal to copy your raw numeric BcID to clipboard.

- Click the link icon next to it to copy a direct profile URL you can share with others.

- **Bulk pet feed & claim are dramatically faster.** (TheDepartedOne)

If you’ve got a lot of pets, you may have noticed `feed all` or `claim all` locking up for a very long time. That’s been fixed – operations that previously took 10-30 seconds now complete in under a second.

## Bug Fixes

- **Pet collector trophy not awarded when using a genesis egg.*** *(Wewert)

If hatching a genesis egg completed your base skin collection for a species, the collector trophy was never granted. It will now correctly award when the egg completes your collection.

- **Boss weakpoints now automatically reveal when the timer runs out.** (ShadyBliss)

Previously, once a weakpoint timer expired, no new weakpoint would be revealed until a player attacked the boss. This meant the weakpoint could stay in limbo indefinitely if nobody was actively hitting it. Now the new weakpoint reveals itself automatically when the timer ends, regardless of whether anyone is attacking.

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.23.3](https://blog.bconomy.net/2026/03/23/release-v2026-03-23-3/)
**Date:** 2026-03-23

A new update for Bconomy has been released.

## Changelog

- Introduce a new profile direct link that opens the player’s profile on click to Credits page (Wewert)

- Save players’ bcId in Discord role cache so role synchronization matches accounts more reliably (Wewert)

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.23](https://blog.bconomy.net/2026/03/23/release-v2026-03-23/)
**Date:** 2026-03-23

A new update for Bconomy has been released.

## Changelog

- Added “the” to ball pit winner messages so logs read more naturally (Shadybliss, Krisibelle)

- Fixed webhook responding 200 OK before verifying signatures (Krisibelle)

- Track BCS role Discord user data and expose it via /api/bcsdata (Wewert)

*[Credits](https://bconomy.net/credits/)*

---

## [v2026.03.19.2](https://blog.bconomy.net/2026/03/20/release-v2026-03-19-2-3/)
**Date:** 2026-03-20

A new update for Bconomy has been released.

## Changelog

- Gameplay commands no longer require solving hCaptcha mid-game

- Removed the Discord captcha button and the “chat verify” toggle from the interface for a cleaner UI

- Fixed client updates so the game UI shows partial updates correctly after certain actions

---

