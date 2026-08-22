# Bconomy Complete Release Notes Archive (2020 – 2026)

> Source: [https://blog.bconomy.net/category/updates/](https://blog.bconomy.net/category/updates/)

**Total Releases:** 480

[Back to Index](README.md)

---

# 2026 (122 releases)

## [v2026.08.22](https://blog.bconomy.net/2026/08/22/release-v2026-08-22-09a1716ac/) — *2026-08-22*

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

## [v2026.08.19](https://blog.bconomy.net/2026/08/19/release-v2026-08-19-11243bfa2/) — *2026-08-18*

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

## [v2026.08.18](https://blog.bconomy.net/2026/08/18/release-v2026-08-18-e39e945bd/) — *2026-08-18*

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

## [v2026.08.17.3](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-62560b2a/) — *2026-08-17*

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

## [v2026.08.17.2](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-95a9453/) — *2026-08-17*

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

## [v2026.08.17](https://blog.bconomy.net/2026/08/17/release-v2026-08-17-0d63098/) — *2026-08-16*

A new update for Bconomy has been released.

## Changelog

- **Discord bot now only launches the game.** (TheCarriedOne)

The bot’s **slash commands** and their **in-chat buttons are retired**. You **won’t be able** to run game commands inside Discord anymore. Use `/bconomy` or Discord App picker to start the game from now on.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.16](https://blog.bconomy.net/2026/08/16/release-v2026-08-16-c2487088/) — *2026-08-16*

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

## [v2026.08.15](https://blog.bconomy.net/2026/08/15/release-v2026-08-15-105dc619/) — *2026-08-14*

A new update for Bconomy has been released.

## Improvements

- **Supply Depot rerolls.** (TheCarriedOne)

Your first Supply Depot reroll each day now **always costs the base price**.

- Only **extra rerolls** on the same day **cost more**; their price now ramps up more gently (1.3x instead of 1.5x).

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.14.2](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-ce1c7ed1/) — *2026-08-14*

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

## [v2026.08.14](https://blog.bconomy.net/2026/08/14/release-v2026-08-14-fc45634/) — *2026-08-14*

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

## [v2026.08.13](https://blog.bconomy.net/2026/08/13/release-v2026-08-13-69f43d54/) — *2026-08-13*

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

## [v2026.08.12.2](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-292653cb/) — *2026-08-11*

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

## [v2026.08.12](https://blog.bconomy.net/2026/08/12/release-v2026-08-12-6a739a58/) — *2026-08-11*

A new update for Bconomy has been released.

## New Features

- **Public chat image uploads.** (TheCarriedOne)

Upload screenshots and images **directly into public chat** by click the new image button or just pasting an image into the chat box.

- Available to supporters and to accounts that have 10+ ascensions on any profile.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.11](https://blog.bconomy.net/2026/08/11/release-v2026-08-11-6fa8dfb/) — *2026-08-11*

A new update for Bconomy has been released.

## Changelog

- **Discord Activity open to everyone, text commands obsolete.** (TheCarriedOne)

**Anyone can now launch the Discord Activity**, you no longer need a special role to access it.

- Use `/bconomy` to open the game directly **as a Discord Activity**.

- Slash command replies now include a note **directing you to the Discord Activity or Web Client**, with buttons to access either directly from reply.

- **All other slash commands and buttons/dropdowns** **will stop working next Monday (Aug 17)**, at which point they will instruct to play via Web Client, Discord Activity or mobile app.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.10](https://blog.bconomy.net/2026/08/10/release-v2026-08-10-d2cdb3432/) — *2026-08-10*

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

## [v2026.08.09](https://blog.bconomy.net/2026/08/09/release-v2026-08-09-a76d76b5/) — *2026-08-08*

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

## [v2026.08.08.2](https://blog.bconomy.net/2026/08/08/release-v2026-08-08-76fb698ce/) — *2026-08-08*

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

## [v2026.08.08](https://blog.bconomy.net/2026/08/08/release-v2026-08-08-307960a03/) — *2026-08-07*

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

## [v2026.08.07.3](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-f13946cfa/) — *2026-08-07*

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

## [v2026.08.07.2](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-75b5cad2f/) — *2026-08-06*

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

## [v2026.08.07](https://blog.bconomy.net/2026/08/07/release-v2026-08-07-56ce4d54e/) — *2026-08-06*

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

## [Reworking the Mint Bay Work Cooldown](https://blog.bconomy.net/2026/08/07/reworking-the-mint-bays-work-cooldown/) — *2026-08-06*

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

## [v2026.08.04.2](https://blog.bconomy.net/2026/08/04/release-v2026-08-04-90c5632eb/) — *2026-08-04*

A new update for Bconomy has been released.

## Improvements

- **Per-mode leaderboards and trophy picker.** (TheCarriedOne)

Item Collectors and Hoarder leaderboards now have **the same main/ironman/hardcore scope dropdown as other boards**. Pick your mode to see that mode’s top holders.

- Each mode now has its own top holder per item and its own hoarder ranking, so collector trophies are earned **within your own mode** instead of only by a single global top holder.

- Trophy names **no longer include “(Ironman)” or “(Hardcore)”**.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.04](https://blog.bconomy.net/2026/08/04/release-v2026-08-04-f29e01ce/) — *2026-08-04*

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

## [v2026.08.03.2](https://blog.bconomy.net/2026/08/03/release-v2026-08-03-65de08135/) — *2026-08-03*

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

## [v2026.08.03](https://blog.bconomy.net/2026/08/03/release-v2026-08-03-51c656842/) — *2026-08-02*

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

## [v2026.08.02](https://blog.bconomy.net/2026/08/02/release-v2026-08-02-38fa8e4c5/) — *2026-08-01*

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

## [v2026.08.01.3](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-c118e547c/) — *2026-08-01*

A new update for Bconomy has been released.

## Improvements

- **Mint Cooldown Destroyer odds.** (TheCarriedOne)

Higher ascension tiers now give **more chances per Work action** to cut the Work cooldown.

- This scaling **no longer stops at tier 100**, it continues all the way to ascension tier 1000, so very high-tier characters will see the increased chance/roll effect.

- You get **extra cut rolls** at 200, 350, 500 and 1000 ascension.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.08.01.2](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-d6a599f3/) — *2026-08-01*

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

## [v2026.08.01](https://blog.bconomy.net/2026/08/01/release-v2026-08-01-5fa10f9dc/) — *2026-07-31*

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

## [v2026.07.30.2](https://blog.bconomy.net/2026/07/30/release-v2026-07-30-f904ba43/) — *2026-07-30*

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

## [v2026.07.30](https://blog.bconomy.net/2026/07/30/release-v2026-07-30-256c4e030/) — *2026-07-29*

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

## [v2026.07.29.3](https://blog.bconomy.net/2026/07/29/release-v2026-07-29-e128855c/) — *2026-07-29*

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

## [v2026.07.29.2](https://blog.bconomy.net/2026/07/29/release-v2026-07-29-ca0e6b275/) — *2026-07-28*

A new update for Bconomy has been released.

## Improvements

- **Mode-specific leaderboards and rewards.** (TheCarriedOne)

Ironman and Hardcore now **get their own daily and weekly leaderboard rewards** and their own top-<stat> trophies, ranked only against other players in the same mode.

- Every stat **leaderboard is now split** into Main / Ironman / Hardcore. The old mixed “everyone” board has been removed.

- A one-time backfill **grants the most recent day’s missed Ironman/Hardcore rewards **so eligible players don’t lose out.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.07.29](https://blog.bconomy.net/2026/07/28/release-v2026-07-29-a91321a5c/) — *2026-07-28*

A new update for Bconomy has been released.

## Bug Fixes

- **Quest rewards and milestone compensation.** (TheCarriedOne)

Quest rewards now grant the **full number of Specials shown**. For example, levels 1000 and up that list two XenoServers will now actually give two XenoServers.

- If you already claimed milestones that were missing XenoServers, those missing XenoServers have been **granted to your account automatically**.

- Capped quest reward lists (the continuation summary) no longer repeat an earlier level, the list now **shows the next levels correctly**.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.07.28.2](https://blog.bconomy.net/2026/07/28/release-v2026-07-28-0659096c/) — *2026-07-28*

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

## [Go it alone: Ironman mode is here](https://blog.bconomy.net/2026/07/27/ironman-mode/) — *2026-07-27*

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

## [v2026.07.28](https://blog.bconomy.net/2026/07/27/release-v2026-07-28-a2972e89/) — *2026-07-27*

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

## [v2026.07.25](https://blog.bconomy.net/2026/07/25/release-v2026-07-25-7026a8e0/) — *2026-07-24*

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

## [v2026.07.24.2](https://blog.bconomy.net/2026/07/24/release-v2026-07-24-354629058/) — *2026-07-23*

A new update for Bconomy has been released.

## Bug Fixes

- **Cooldown near-miss fixes (final-v2).** (TheCarriedOne)

Clicking an action (or watering a farm, claiming daily, using an item, etc.) right as its cooldown ends now just works™. If command is executed slightly too early for the server, client should automatically resend the same command soon after, when the real cooldown ends, basically invisible to the player.

- Action buttons no longer get stuck showing a full cooldown after that near-miss; they clear correctly without needing a refresh or another action.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.07.24](https://blog.bconomy.net/2026/07/24/release-v2026-07-24-61a460ee/) — *2026-07-23*

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

## [v2026.07.20.2](https://blog.bconomy.net/2026/07/20/release-v2026-07-20-46764f94/) — *2026-07-20*

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

## [v2026.07.20](https://blog.bconomy.net/2026/07/20/release-v2026-07-20-7f7ad3a3/) — *2026-07-19*

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

## [Want some gems?](https://blog.bconomy.net/2026/07/18/want-some-gems/) — *2026-07-18*

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

## [v2026.07.16](https://blog.bconomy.net/2026/07/16/release-v2026-07-16-e2d4a5cd/) — *2026-07-16*

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

## [v2026.07.15](https://blog.bconomy.net/2026/07/15/release-v2026-07-15-23cf3ee8/) — *2026-07-15*

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

## [The Recovery Bay](https://blog.bconomy.net/2026/07/14/the-recovery-bay/) — *2026-07-14*

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

## [v2026.07.11.2](https://blog.bconomy.net/2026/07/11/release-v2026-07-11-c2c6eee6/) — *2026-07-11*

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

## [v2026.07.11](https://blog.bconomy.net/2026/07/11/release-v2026-07-11-14ec69da/) — *2026-07-10*

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

## [v2026.07.10](https://blog.bconomy.net/2026/07/10/release-v2026-07-10-ffde30fb/) — *2026-07-10*

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

## [v2026.07.09.2](https://blog.bconomy.net/2026/07/09/release-v2026-07-09-59b207b6/) — *2026-07-09*

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

## [v2026.07.09](https://blog.bconomy.net/2026/07/08/release-v2026-07-09-6df50df9/) — *2026-07-08*

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

## [v2026.07.08](https://blog.bconomy.net/2026/07/07/release-v2026-07-08-b8c08138/) — *2026-07-07*

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

## [v2026.07.07](https://blog.bconomy.net/2026/07/06/release-v2026-07-07-d21a0aa4/) — *2026-07-06*

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

## [v2026.07.02](https://blog.bconomy.net/2026/07/02/release-v2026-07-02-1a256a22/) — *2026-07-01*

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

## [v2026.06.28.2](https://blog.bconomy.net/2026/06/28/release-v2026-06-28-b7448781/) — *2026-06-27*

A new update for Bconomy has been released.

## Improvements

- **Persistent pet settings.** (TheCarriedOne)

Manage Pets now remembers your last-used filters, sorting, search text, selected bulk action, and related inputs like breeding properties

- The main Pets page also remembers your pet list filters, sorting and search between visits.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.28](https://blog.bconomy.net/2026/06/27/release-v2026-06-28-d861985d/) — *2026-06-27*

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

## [v2026.06.27](https://blog.bconomy.net/2026/06/27/release-v2026-06-27-f7c9d6ca/) — *2026-06-27*

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

## [v2026.06.27](https://blog.bconomy.net/2026/06/26/release-v2026-06-27-0c2ab74c/) — *2026-06-26*

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

## [v2026.06.25](https://blog.bconomy.net/2026/06/25/release-v2026-06-25-04ba35f2/) — *2026-06-25*

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

## [v2026.06.24.3](https://blog.bconomy.net/2026/06/24/release-v2026-06-24-10da7201/) — *2026-06-24*

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

## [v2026.06.24.2](https://blog.bconomy.net/2026/06/24/release-v2026-06-24-5b882b80/) — *2026-06-24*

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

## [v2026.06.23.2](https://blog.bconomy.net/2026/06/23/release-v2026-06-23-0ebfc46c/) — *2026-06-23*

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

## [v2026.06.23](https://blog.bconomy.net/2026/06/23/release-v2026-06-23-e0d8f42a/) — *2026-06-23*

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

## [v2026.06.22](https://blog.bconomy.net/2026/06/22/release-v2026-06-22-4ec50185/) — *2026-06-22*

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

## [v2026.06.18.2](https://blog.bconomy.net/2026/06/18/release-v2026-06-18-bfe75673/) — *2026-06-18*

A new update for Bconomy has been released.

## Improvements

- **Charge meter on Mint bays.** (TheCarriedOne)

A new **Charge** bar now appears on the Mint bay card, shown beside the existing **Fuel** bar when you have the **Work Amplifier** upgrade.

- Charge builds gradually as salvage is actually burned by the bay. Simply depositing salvage right before pressing **Work** no longer gives instant benefit.

- The bar shows how much “Charge” the bay has built toward the cap (full charge now requires burning 300 salvage).

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.18](https://blog.bconomy.net/2026/06/18/release-v2026-06-18-c7ae98de/) — *2026-06-18*

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

## [v2026.06.17](https://blog.bconomy.net/2026/06/17/release-v2026-06-17-dca21f1/) — *2026-06-17*

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

## [v2026.06.16.2](https://blog.bconomy.net/2026/06/16/release-v2026-06-16-8d327e2d/) — *2026-06-16*

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

## [v2026.06.16](https://blog.bconomy.net/2026/06/16/release-v2026-06-16-d8bc63f1/) — *2026-06-16*

A new update for Bconomy has been released.

## Improvements

- **New bosses: Sharkfather & Magma Drake.** (TheCarriedOne)

Two new bosses have been added: **Sharkfather** (Fish) and **Magma Drake** (Mine).

## Bug Fixes

- **Emoji picker search finds partial matches.** (TheCarriedOne)

The **emoji picker** now matches substrings. Typing any part of an emoji’s name will find it, not just exact or prefix matches.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.14](https://blog.bconomy.net/2026/06/14/release-v2026-06-14-258857f5/) — *2026-06-14*

A new update for Bconomy has been released.

## New Features

- **Relay Network apex node cosmetic presets.** (TheCarriedOne)

When you unlock a Relay Network apex node you now get a themed cosmetic preset you can apply: a name colour, a chat-message background, and an emoji — quick to apply, unlocked by research.

- The Network Sovereign completionist node also unlocks an exclusive animated name effect and a special profile background.

- You can apply these presets from the apex node in the research view or from the profile customization menu.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.14](https://blog.bconomy.net/2026/06/14/release-v2026-06-14-d917fdac/) — *2026-06-14*

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

## [Mint Update](https://blog.bconomy.net/2026/06/13/v2026-06-13-5959bbcd/) — *2026-06-12*

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

## [v2026.06.12.2](https://blog.bconomy.net/2026/06/12/release-v2026-06-12-651f1c3b/) — *2026-06-12*

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

## [v2026.06.12](https://blog.bconomy.net/2026/06/12/release-v2026-06-12-52372571/) — *2026-06-11*

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

## [v2026.06.09.2](https://blog.bconomy.net/2026/06/09/release-v2026-06-09-ff93f2ca/) — *2026-06-09*

A new update for Bconomy has been released.

## Bug Fixes

- **Surge capacitor / overclock cooling behavior corrected.** (TheCarriedOne)

Overclock surge now acts as extra cooling on top of whatever cooling your setup is already providing, no longer deficit based.

- Surge stops exactly when the bay’s heat hits 50%. That means reserve energy is no longer silently wasted while the bay sits cold.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.09](https://blog.bconomy.net/2026/06/09/release-v2026-06-09-6d1dca97/) — *2026-06-09*

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

## [v2026.06.08.2](https://blog.bconomy.net/2026/06/08/release-v2026-06-08-d34a5f43/) — *2026-06-08*

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

## [v2026.06.08](https://blog.bconomy.net/2026/06/08/release-v2026-06-08-fdd2360f/) — *2026-06-07*

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

## [v2026.06.06](https://blog.bconomy.net/2026/06/06/release-v2026-06-06-71429e18/) — *2026-06-05*

A new update for Bconomy has been released.

## Bug Fixes

- **Refinery re-commit now carries leftover correctly.** (TheCarriedOne)

If you add items to the Refinery while a run is already in progress, the Refinery now carries the previous run’s unconsumed leftover into a fresh run together with your new items.

- That means the refinery bonus window (the **Grid Resonance** boost) restarts and applies to the whole new run instead of only the newly-added portion.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.06.05.2](https://blog.bconomy.net/2026/06/05/release-v2026-06-05-2/) — *2026-06-05*

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

## [v2026.06.05](https://blog.bconomy.net/2026/06/04/release-v2026-06-05/) — *2026-06-04*

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

## [v2026.06.04](https://blog.bconomy.net/2026/06/04/release-v2026-06-04/) — *2026-06-04*

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

## [v2026.06.01](https://blog.bconomy.net/2026/06/01/release-v2026-06-01/) — *2026-05-31*

A new update for Bconomy has been released.

## Bug Fixes

- **Cooling Bay only burns Cryo Gel when cooling is in demand.** (TheCarriedOne)

The **Cooling Bay** no longer wastes Cryo Gel when nothing actually needs cooling. If every Mint/Refinery is cool or idle, the bay will stop consuming coolant.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.05.31](https://blog.bconomy.net/2026/05/31/release-v2026-05-31/) — *2026-05-31*

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

## [v2026.05.27](https://blog.bconomy.net/2026/05/27/release-v2026-05-27/) — *2026-05-27*

A new update for Bconomy has been released.

## Changelog

- **Ballpit buys and amount parsing.** (TheDepartedOne)

- If you use `/ballpit/buy` and ask for more balls than the pit can hold, the command will now buy as many as fit instead of erroring. No more failed buys when you overshoot, it just fills the pit.

Remaining commands that take amounts now understand formatted numbers like `1k` and `123,456`. That parsing is used consistently for reserve/autosell limits, market max price, and bulk boost amounts, so typed amounts behave the way you expect.

- **Refinery heat display when a bay goes idle.** (TheDepartedOne)

The Refinery heat bar will now show the bay cooling once its basket runs out or its output buffer fills.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.05.25](https://blog.bconomy.net/2026/05/25/release-v2026-05-25/) — *2026-05-25*

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

## [v2026.05.23](https://blog.bconomy.net/2026/05/23/release-v2026-05-23/) — *2026-05-23*

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

## [v2026.05.22.2](https://blog.bconomy.net/2026/05/22/release-v2026-05-22-2/) — *2026-05-21*

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

## [Relay Network](https://blog.bconomy.net/2026/05/21/relay-network/) — *2026-05-21*

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

## [v2026.05.08](https://blog.bconomy.net/2026/05/08/release-v2026-05-08/) — *2026-05-07*

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

## [v2026.05.07](https://blog.bconomy.net/2026/05/07/release-v2026-05-07/) — *2026-05-06*

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

## [v2026.05.06](https://blog.bconomy.net/2026/05/06/release-v2026-05-06/) — *2026-05-06*

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

## [v2026.05.05](https://blog.bconomy.net/2026/05/05/release-v2026-05-05/) — *2026-05-05*

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

## [v2026.04.28](https://blog.bconomy.net/2026/04/28/release-v2026-04-28/) — *2026-04-27*

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

## [v2026.04.25](https://blog.bconomy.net/2026/04/25/release-v2026-04-25/) — *2026-04-24*

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

## [v2026.04.24.3](https://blog.bconomy.net/2026/04/24/release-v2026-04-24-3/) — *2026-04-24*

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

## [v2026.04.24](https://blog.bconomy.net/2026/04/24/release-v2026-04-24/) — *2026-04-23*

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

## [v2026.04.23](https://blog.bconomy.net/2026/04/23/release-v2026-04-23/) — *2026-04-23*

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

## [v2026.04.20.2](https://blog.bconomy.net/2026/04/20/release-v2026-04-20-3/) — *2026-04-20*

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

## [v2026.04.20](https://blog.bconomy.net/2026/04/20/release-v2026-04-20/) — *2026-04-19*

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

## [v2026.04.19](https://blog.bconomy.net/2026/04/19/release-v2026-04-19/) — *2026-04-18*

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

## [v2026.04.18](https://blog.bconomy.net/2026/04/18/release-v2026-04-18/) — *2026-04-18*

A new update for Bconomy has been released.

## Changelog

- **Damned Intent burn reward and Burn UI updates.** (Wewert)

You can now earn a new burn reward item called **Damned Intent**.

- The **Burn Modal** now has a dedicated **Burn Items** section that lists all burn reward items and their drop chances, and the **Item Modal** shows whether an item can be obtained from burning.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.04.17](https://blog.bconomy.net/2026/04/17/release-v2026-04-17/) — *2026-04-16*

A new update for Bconomy has been released.

## Improvements

- **Discord name sync and settings fixes.** (TheDepartedOne)

Your Bconomy name can now be kept in sync with your Discord server nickname. The server will prefer your Bconomy-guild nickname first, then your global name, then your username – each cleaned up to fit our name rules.

- This release fixes a previous lockout: if your Discord token had expired you could not change your Bconomy username or flip the sync toggle. That should no longer happen – you can edit your name and use the Settings toggle or the disable link as needed.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.04.16](https://blog.bconomy.net/2026/04/16/release-v2026-04-16/) — *2026-04-15*

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

## [v2026.04.14](https://blog.bconomy.net/2026/04/14/release-v2026-04-14/) — *2026-04-13*

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

## [v2026.04.13.2](https://blog.bconomy.net/2026/04/13/release-v2026-04-13-2/) — *2026-04-13*

A new update for Bconomy has been released.

## Bug Fixes

- **Market fixes.** (TheDepartedOne)

Auto-confirm rules work correctly now. Using shortcuts like `max`, `all`, `%` or typing an exact amount will obey your auto-confirm rules and won’t show the spurious “Invalid confirmation” error anymore.

- If you set a price tolerance (using a command `marketbuy <itemid> <amount> <maxPricePerItem>`, no UI equivalent today), confirmation prompt will not appear as it is treated as intentional action.

- The buy confirmation message is cleaner when every listing is the same price (compact single-price format), and overall confirmation text was tightened up so prompts are clearer.

- Items marked as excluded from market (for example, Relay Frame) are now hidden from the **Market** page and search results so you won’t see them.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.04.13](https://blog.bconomy.net/2026/04/12/release-v2026-04-13/) — *2026-04-12*

A new update for Bconomy has been released.

## New Features

- **Premium profile backgrounds on user entries.** (Wewert)

Users now show their animated background behind their entry in search results and in faction member lists.

- Search result cards also get tuned text colors so names remain readable against bright backgrounds.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.04.12](https://blog.bconomy.net/2026/04/11/release-v2026-04-12/) — *2026-04-11*

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

## [v2026.04.10](https://blog.bconomy.net/2026/04/10/release-v2026-04-10/) — *2026-04-10*

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

## [Relay Preparation season](https://blog.bconomy.net/2026/04/08/release-v2026-04-08/) — *2026-04-07*

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

## [v2026.04.06](https://blog.bconomy.net/2026/04/06/release-v2026-04-06/) — *2026-04-05*

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

## [v2026.04.05](https://blog.bconomy.net/2026/04/05/release-v2026-04-05-2/) — *2026-04-05*

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

## [v2026.04.04](https://blog.bconomy.net/2026/04/04/release-v2026-04-04/) — *2026-04-04*

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

## [v2026.04.01](https://blog.bconomy.net/2026/04/01/release-v2026-04-01/) — *2026-04-01*

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

## [v2026.03.30](https://blog.bconomy.net/2026/03/30/release-v2026-03-30/) — *2026-03-30*

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

## [v2026.03.29](https://blog.bconomy.net/2026/03/29/release-v2026-03-29/) — *2026-03-28*

A new update for Bconomy has been released.

## Changelog

- **Pinned/Unpinned filters in Bulk Pet Boost dialog.** (TheDepartedOne)

When you open the bulk pet boost window you’ll see new filters to show **Pinned** or **Unpinned** pets.

- **Max inventory button settings and redundant button cleanup.** (TheDepartedOne)**
There’s a new setting to control the Use/Equip/Craft** button behavior in inventory — you can configure them based on how you’d like the buttons to act.

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.03.28](https://blog.bconomy.net/2026/03/28/release-v2026-03-28/) — *2026-03-28*

A new update for Bconomy has been released.

## Changelog

- Logs now adjust how many items show per page based on available height and use pagination for quicker navigation. (TheDepartedOne)

- The leaderboard follows the same functionality as logs above, but you can also see your own position regardless of the page you are on. (TheDepartedOne)

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.03.27](https://blog.bconomy.net/2026/03/27/release-v2026-03-27/) — *2026-03-27*

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

## [v2026.03.23.3](https://blog.bconomy.net/2026/03/23/release-v2026-03-23-3/) — *2026-03-23*

A new update for Bconomy has been released.

## Changelog

- Introduce a new profile direct link that opens the player’s profile on click to Credits page (Wewert)

- Save players’ bcId in Discord role cache so role synchronization matches accounts more reliably (Wewert)

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.03.23](https://blog.bconomy.net/2026/03/23/release-v2026-03-23/) — *2026-03-23*

A new update for Bconomy has been released.

## Changelog

- Added “the” to ball pit winner messages so logs read more naturally (Shadybliss, Krisibelle)

- Fixed webhook responding 200 OK before verifying signatures (Krisibelle)

- Track BCS role Discord user data and expose it via /api/bcsdata (Wewert)

*[Credits](https://bconomy.net/credits/)*


---

## [v2026.03.19.2](https://blog.bconomy.net/2026/03/20/release-v2026-03-19-2-3/) — *2026-03-20*

A new update for Bconomy has been released.

## Changelog

- Gameplay commands no longer require solving hCaptcha mid-game

- Removed the Discord captcha button and the “chat verify” toggle from the interface for a cleaner UI

- Fixed client updates so the game UI shows partial updates correctly after certain actions


---

# 2025 (32 releases)

## [Cold Front](https://blog.bconomy.net/2025/12/12/cold-front/) — *2025-12-11*

Hey folks! **Cold Front**, the **Winter 2025 Season** of Bconomy, has arrived! Quest Level has been reset and Rewards are available to earn once again.

I apologize for the delay in getting this released. A lot of dev time was put into QoL improvements and a new tutorial, but unfortunately they did not make it into this update. I’ve pushed the season reset without these changes for now. Hopefully these changes will find their way into the game soon. Thank you for understanding and sticking with Bconomy despite everything. It really does mean the world to me.

## Changelog

### Quests

- A new Season, “Cold Front”, is now available in-game

Trophies for the previous Season have been distributed

Congrats to **straightpipes55#136948** for winning the Trailblazer Trophy!

### Pets

- New Supporter Pets have been rotated into the Special Store (Snowman)

- Cockroach Pets are this Season’s exclusive Pet species, and can be earned from quest rewards as a Genesis Egg

- Owl Pets are now breedable and can be obtained from the wild

- Whiteout Aura is this Season’s exclusive Pet Aura, and can be earned from quest rewards as an Auralyzer


---

## [Spooky Sights](https://blog.bconomy.net/2025/09/02/spooky-sights/) — *2025-09-02*

It’s here! **Spooky Sights** is the **Fall 2025 Season** for Bconomy, and… It’s Alive! IT’S ALIVE! MWAHAHAHA! Log into Bconomy and get to work on those all-new quest rewards!

This update also adds some gameplay features. I’m still working on finalizing the next major expansion, which adds an all-new resource collection system (Starships) and ecosystem of Items. Progress is being made, I promise! I hope this new update gives some new content to play with in the meantime.

## Changelog

### Quests

- A new Season, “Spooky Sights”, is now available in-game

Trophies for the previous Season have been distributed

Congrats to **craigwards#130785** for winning the Trailblazer Trophy!

### Augments

- Augment Items (Green, Amber, Purple, Red Gemerald) can now be applied to Tools to increase that Tool’s Action Multiplier

Only one of each type of Augment can be applied to each type of Tool

- Augments stack multiplicatively with each other

- Multiple of one Augment Item can be applied to a Tool to extend the effect’s duration

### Pets

- New Supporter Pets have been rotated into the Special Store (Sauropod, T-Rex, Jack, Ghost)

- Owl Pets are this Season’s exclusive Pet species, and can be earned from quest rewards as a Genesis Egg

- Scorpion Pets are now breedable and can be obtained from the wild

- Grayscale Aura is this Season’s exclusive Pet Aura, and can be earned from quest rewards as an Auralyzer

## Mod Applications

Thank you to all players who applied to join Bconomy’s modteam! We’ve received a lot of submissions over the past two weeks, and our current team is internally going through the selection process right now. We’ll be reaching out to the finalists, and an announcement will be made once the new modteam members have been selected. We look forward to welcoming a new group of players who will help keep our community awesome!


---

## [Game Update](https://blog.bconomy.net/2025/07/31/game-update-20/) — *2025-07-31*

A game update for Bconomy has been released.

## Changelog

### Leaderboard

- Trophy: Leaderboards are now tracked for all Trophies in-game, and can be accessed through a user’s Trophies on their Profile

Trophy Leaderboards are ordered first by # of Trophy owned (descending), then date first achieved (ascending)

- Daily Streak: Leaderboard added, tracking players by highest active Daily Streak

- Leaderboards now show compact number representations on small screens for visual clarity

### Daily Rewards

- Base daily reward amounts have been increased

### Interface

- “Verification Available” must now be enabled as an Interface Setting (default off)

- Latest game update changelog is now accessible on mobile devices through sidebar menu

- Trophies are now ordered on Profile display first by # of Trophy owned (descending), then date first achieved (ascending)

- Quests are now sorted in ascending completion order

- Misc. usability improvements and bug fixes


---

## [Game Update](https://blog.bconomy.net/2025/07/30/game-update-19/) — *2025-07-30*

A game update for Bconomy has been released.

## Changelog

### Daily Rewards

- Voting has been removed from the game, and a Discord account is no longer required to maximize Daily Rewards

- Daily Rewards now distribute Fancy Crates, Exquisite Trunks and Lunar Shards on every claim

- Each Streak now increases each earned Item by one, capped at a certain maximum value

This value can be increased by up to 25 with a new Prestige Perk (see below)

### Market

- Base market transaction fee increased to 25% (from 5%)

This value can be decreased to 0% with a new Prestige Perk (see below)

### Prestige Perks

- Loyalist: Increases maximum of each Item earned from Daily Rewards (+1/Lv, Max Lv. 25)

- Insider: Decreases Market transaction fees (-0.05%/Lv, Max Lv. 50)

- Prestige Perk Reset cooldown has been cleared for all players

This will occur during all updates that significantly change Prestige Perks going forward

### Bosses

- Genesis Egg and Auralyzer have been replaced by Arbitrary Amplifier and Noetic Pulsator in the Boss Special reward pool

### Trophies

- Pet Collector Trophies: A trophy is now earned on egg hatch if you own at least one Pet of each Base Skin variant for that Species

- A notification is now sent to the game client whenever a Trophy is earned

- Fixed data inconsistency where some players’ Trophies were apparently earned 50+ years ago

- Added the first of many “hidden” trophies. These probably won’t be announced in the future…

### Verification

- Users are now presented with the opportunity to optionally “pre-verify” if they’d like to earn rewards or prevent unexpected interruptions

A notification is displayed on the bottom left corner of the user interface when this becomes available

### Interface

- Added a setting to reset ignored confirm prompts, restoring original behavior for game inputs where confirmation prompts were suppressed via “Don’t ask again” checkbox

- Item sale buttons are now colored red instead of green for visual clarity


---

## [Game Patch](https://blog.bconomy.net/2025/07/29/game-patch-9/) — *2025-07-29*

- Prestige Perks can now be reset (with Runes refunded) every 7 days


---

## [Game Patch](https://blog.bconomy.net/2025/07/25/game-patch-8/) — *2025-07-25*

- Mercantilist now only applies to listing on Item Markets, not buying


---

## [Game Update](https://blog.bconomy.net/2025/07/25/game-update-18/) — *2025-07-25*

A game update for Bconomy has been released.

## Changelog

### Market

- By default, the Market is now restricted to all players, and must be gradually unlocked through the Mercantilist Prestige Perk (see below)

- Market minimum listing price is now at least 5x the original Item’s base worth

- /marketbuy now accepts a third argument for max buy price, where, if specified, will only allow listings priced at or below that value to be purchased

This argument is internally included in confirmation prompts, resolving a design flaw where confirming market purchases could allow them to execute on higher-priced listings if the original listing was purchased by another player before the original action was confirmed

### Prestige

- Mercantilist: Unlock buying and listing for additional Item Markets, ordered by base Item worth ascending

Each Level unlocks an additional three Item Markets

### Interface

- Specific Item Markets can now be pinned and rearranged, much like Items

- Confirmation prompts for actions of a certain type can now be suppressed

- Some elements with Roman Numerals now show standard numbers when hovered over

### Other

- Fixed a bug causing exceptionally high values for the “Boss Damage” statistic to error when parsed


---

## [Game Update](https://blog.bconomy.net/2025/07/22/game-update-17/) — *2025-07-22*

A game update for Bconomy has been released.

## Changelog

### Items

- Chestnut: New Food Item

- Big Log, Chestnut added to Hunt loot pool

- Rainmaking Amulet added to Rare Item (& Lunar Shard) loot pool

- Rainmaking Amulet base worth increased to 10M (from 7.5M)

- Eternal Snowflake cooldown decreased to 5 minutes (from 15)

### Bosses

- Boss active action multiplier increased to 0.9x (from 0.75x)

- Boss total HP increased to 125T (from 50T)

- Weakpoint damage multiplier increased to 2x (from 1.75x)

- Boss defeat personal boost minimum duration increased to 30m (from 15m)


---

## [Game Update](https://blog.bconomy.net/2025/07/22/game-update-16/) — *2025-07-22*

A game update for Bconomy has been released.

## Changelog

### Bosses

- “Overkill” period: Bosses now cannot be slain within 5 minutes of being initially spawned

- Weakpoints are now time-based instead of damage-based

Every 5 minutes the Boss is alive, a new Weakpoint is added (max 10)

- Weakpoint damage multiplier increased to 1.75x (from 1.5x)

- Personal Boosts applied as a result of the Boss’s defeat no longer override existing boost durations

- The minimum Personal Boost applied from defeating a Boss is now 15 minutes (from 30 minutes)

- A limit of 10,000,000 Bounties are now in place per attacker per boss

- Arbitrary Amplifier has been removed from the Special reward pool

- Genesis Egg, Auralyzer has been added to the Special reward pool

- Lunar Shards are no longer distributed to attackers

- A cooldown of 5 minutes for Boss spawns is now incurred after each Boss is defeated

- Potential race condition fix to resolve inconsistencies between damage output and reward results has been implemented

- These changes will be continually evaluated and tweaked for balance and gameplay quality

### Interface

- Pet Sidebar Pins interface setting has been removed due to performance issues


---

## [Game Update](https://blog.bconomy.net/2025/07/12/game-update-15/) — *2025-07-12*

A game update for Bconomy has been released. This release is light on gameplay changes, but upgrades have been made to the game’s infrastructure in preparation for future updates.

## Changelog

- Mystical Balls can now be used to enter the active Ball Pit with 5x the normal limit if no other balls have been purchased yet

- Black Ball Pit limit has been decreased to 2.5M Balls (from Infinity)

- Significant infrastructure changes

Game input and API request processing speed has been improved

- Web Client loading has been optimized, especially for mobile devices

- You may be occasionally prompted to complete verification during gameplay

1x Lunar Shard is granted upon successful verification

- This feature will be refined over time to maintain a good user experience

## Up Next

Both **Space Exploration** and **Generators Overhaul** tied in the poll for Bconomy’s next major gameplay update! So, why not both? Maybe these systems can interact with each other in interesting ways…

Today’s update a lot of the groundwork for future updates, and also works to maintain the game’s health and longevity. I’m hoping to release another update soon with much-needed balance changes and QoL improvements, and then we can look towards adding some new major features.

As always, thanks for playing, and have a good night everyone!

Wewert


---

## [Game Patch, Wiki and API](https://blog.bconomy.net/2025/07/06/game-patch-wiki-and-api/) — *2025-07-06*

Hey folks! I’ve been making improvements to keep Bconomy awesome (mostly outside of gameplay updates). Here are some announcements:

## Changelog

A small game patch was released today.

- Skinulator and Auralyzer Specials are now functional

- Quests that require finding Items worth over 500,000 BC will no longer generate

- Ascension broadcasts no longer persist in Global chat logs

- Beginner’s Guide and Game Wiki are now linked in UI (see below)

- Performance improvements

## Official Wiki

I’m excited to announce the launch of the [**Bconomy Official Wiki**](https://bconomy.wiki.gg/)! It’s going to be our resource for documenting the game hosted on wiki.gg, a user-first wiki platform. Some community members and I have made some contributions to start, which includes several guides and community resources. I look forward to building upon the Wiki, and hope it will serve as a central knowledgebase for everything Bconomy players can rely on.

## Data API

Following community requests, I’ve released the **[Data API](https://bconomy.wiki.gg/wiki/Data_API)**, an official method of retrieving live game data from Bconomy. This resource can be used by third party tools that respect the Game Rules to fetch machine-readable game metadata, user profiles, market prices and more in real time. Check out [the documentation](https://bconomy.wiki.gg/wiki/Data_API) to get started, and let me know in [our Discord server](https://discord.gg/hcST6V7Eqn) if there’s any feedback or feature requests.

## The Future

Soon after this post goes up, I’ll be running a poll in [our Discord server](https://discord.gg/hcST6V7Eqn) to determine what the next major game update to Bconomy should be. All of the listed concepts will get implemented at some point, but the winning choice will get prioritized! Make sure to get your vote in before the poll closes in a few days.

Hope everyone’s enjoying the game otherwise. As always, thanks for playing!

-Wewert


---

## [Summer Stargazing](https://blog.bconomy.net/2025/06/11/summer-stargazing/) — *2025-06-11*

Summer Stargazing, the Summer 2025 Season, has finally arrived! This event’s Quest Rewards are Bconomy’s most epic yet, packed with Lunar Shards, rare items and all-new loot. The race is on for the elusive Trailblazer Trophy… so grab your boosts and get clicking!

I wasn’t able to add *everything* planned for this update unfortunately, but released it anyway to avoid further delays. Expect new gameplay features to drop throughout the coming weeks.

Well, go ahead and enjoy, and, as always, thanks for playing – and good luck out there!

## Changelog

### Quests

- A new Season, “Summer Stargazing”, is now available in-game

Trophies for the previous Season have been distributed

Congrats to **camf#125289** for winning the Trailblazer Trophy!

### Faction

- Active boost FP drain per second increased to 15M FP/s (from 1.5M FP/s)

This is a significant but necessary increase due to how powerful Faction boosts have remained since their introduction

- This change allows maximum boosts to still be achieved, but now requires meaningful contributions from multiple Faction members to sustain

### Pets

- New Pet Species: Scorpion (Hunt)

Scorpion Genesis Eggs are now obtainable through this Season’s Quest Rewards

- This Pet will remain unbreedable until the next Season begins

- New Pet Skin: Sunkissed

This Skin is only obtainable through this Season’s Quest Rewards (as a Skinulator)

### Specials

- Skinulator: Applies its specified Skin to an owned Pet of your choosing

This Special’s functionality will be implemented in a coming patch

- Auralyzer: Changes an owned Pet’s Aura to a different base one at random

This Special’s functionality will be implemented in a coming patch

### Other

- Significant game logic optimizations, moderation tool improvements and security measures have been implemented throughout the past few weeks


---

## [Mobile Apps and More](https://blog.bconomy.net/2025/05/30/mobile-apps-and-more/) — *2025-05-30*

Hey folks! I’ve got a couple of major announcements to share today.

## Bconomy for iOS & Android

Bconomy is now available on the [App Store](https://apps.apple.com/us/app/bconomy/id6746172667) and [Google Play](https://play.google.com/store/apps/details?id=net.bconomy.mobile) for mobile devices and tablets! Add the game to your home screen and enjoy faster load times, improved performance and better gesture support. You can now also support the game with in-app purchases (available internationally). If you have a spare moment, I’d appreciate a review on the newly launched app – it helps out!

You’re able to link the app to your existing Bconomy account and sync your progress. *There are some issues with Google/Discord login I’m working to resolve. If those fail, try linking an email.*

Porting the game to mobile platforms was no easy task. A huge thanks to the game’s Supporters for helping cover the license fees, and also to everyone else who enjoys the game for giving me the motivation to do this. You guys rock!

## Profile Customization

Introducing Profile Customization, a new feature available to all Supporters! Upgrade your Profile card with 10 high-quality custom backgrounds. Each one features handmade animations I’ve designed to make your Bconomy presence stand out. More will be added over time (…when I come up with new design ideas), but for now, give them a try and let me know what you think!

## Home Page Revamp

The Bconomy home page has received a long-overdue makeover. It now includes an updated overview of the game, along with high-quality screenshots and app store links.

It also includes the Live Feed, an interactive element that displays current game activity in real time! It’ll be added in-game at a later date. Supporters currently have priority in showing up on the Live Feed.

## New Season

Summer is upon us already, huh? Make sure to finish up those quests – there’s just 2 days left before the current season wraps up!

Getting the mobile app launched was a bit tedious, but I’m still on track to release the Summer Season in the next few days. Look forward to tons of Lunar Shards and other rewards to earn! Additional gameplay features will be arriving in the coming weeks as well.

It’s shaping up to be quite a big summer for Bconomy… buckle up everyone.

-Wewert


---

## [Another Pets Update](https://blog.bconomy.net/2025/05/16/another-pets-update/) — *2025-05-16*

An update for Bconomy has been released, again with more features in preparation for the upcoming Summer Season. This one focuses on Pet-related features and enhancements, as well as additional quality-of-life improvements. Enjoy the update, and have a great weekend!

## Supporter Pets

Supporter Pets are here! SP can now be used for Genesis Eggs that birth exotic Pet species. Following requests from some users, this has been added as a way to support the game outside of temporary boosts. Supporter Pets can’t be bred, and are purely cosmetic in nature (functioning identically to standard Pets).

**Dragon (Fish), Phoenix (Hunt), Visitor (Explore) and Invader (Mine)** are the Pets now available in the Special Store. Buyable Supporter Pets follow the current Season’s theme, and will rotate with each new Season (current set will remain until the end of the upcoming Season, “Summer Stargazing”). Get ’em while they’re still around!

## Changelog

### Pets

- As previously announced, transferring pet ownership between users has been disabled

- Pet breeding costs now reset daily (from weekly)

BC cost to breed Pets will remain, as it encourages collaboration with other players in collecting rare variants, as well as usage of Skin/Aura-boosting held items

- Lineage: Interactively trace a Pet’s ancestry all the way back to its origins

You can now generate a sleek lineage tree for a Pet that traces its parentage all the way back to its ancestors

- Trees are truncated initially for performance and readability if a Pet’s lineage is too complex, but can be expanded fully by hovering over unloaded nodes

- Pets listings on other users’ Profiles now follows that user’s Pet pin ordering

- Pet display cards (in search, Profile and Offspring listings) have been revamped, and now display the Pet’s Skin and Aura attributes

Pets now consistently display their Skin and Aura coloration across most game elements

- Fixed an error where Dolphin pets were not always visible

- Base chances for each Skin on egg hatch are now listed in the Game Manual

### Search

- New and improved “Search Bconomy” menu for locating users and factions by both Name and ID#

- Pet Lookup: Find Pets across Bconomy by their Skin, Aura, Species, Name, and/or ID

### Specials

- Auralyzer: On use, replaces a Pet’s aura to be a random base color variant

This Special will be also earnable through Quests next season, and/or the KR Store when it is published

### Other

- Additional quality of life improvements and enhancements

- Players using the Safari browser now have more consistent visuals

- An infrastructure update to the game servers has been deployed


---

## [Game Update](https://blog.bconomy.net/2025/05/10/game-update-14/) — *2025-05-10*

Hello everyone! A fairly significant game update has been released. A number of new features have been added, as well as several changes to continue improving the gameplay experience. These lay some of the groundwork for the upcoming Summer Season update, which I can’t wait to drop! Enjoy, and thanks for playing.

## Upcoming Changes

**In 1 week from the time this update releases (on 5/17/2025), Pets will no longer be transferable between users.** Eggs will still be transferable as they currently are. This is in preparation for changes to Pet breeding balance. Please take advantage of this 1-week grace period to transfer your Pets before the functionality is removed.

## Changelog

### Pets

- Introducing new Pet base skins: Delta, Epsilon, Zeta and Eta (least to most rare)

These new skins have extremely striking colors and are now some of the most difficult to obtain in-game!

- Gamma base chance has been slightly increased to account for these additions

Eta skin base chance is equal to that of Gamma pre-update

- All existing Pet skins have been retouched to appear more vibrant

### Equip

- A new mechanic allowing certain Items can be Equipped, where they can then be consumed by certain game actions (see below)

Number of Equip slots available can be increased by the Hammerspace Perk

### Farm

- Watering variance has been removed

Instead of 10-50 minutes, a flat 30 minute reduction is now applied each time

- Same applies for farm watering byproducts

- Plant Menu: An improved interface for managing Farm Plots

- Last used Boost item is now remembered between individual plot menus

- More uproot options (All of same type, All plots) added on planted plot menus

### Specials

- Genesis Egg: A new special that, upon use, creates a Generation I pet

Genesis Eggs have an elevated base skin probability (5x)

- These Specials are now findable from Actions, and are also a Weekly Burn Reward

- More methods to obtain these will be released in the future (e.g. KR Store)

- Forged Banknote has been removed

Any players who owned one have received a Genesis Egg as a replacement

- Specials that share common properties now stack on the interface

You can still view individual Specials owned by clicking on the stack

- Specials can now be pinned like Items for quick access

This does not currently sync between clients due to technical limitations

### Items

- Reaper’s Scythe has been renamed to Sialogogue

On use, this item will massively increase the amount of a Pet’s current craving (by 1b)

- Rainmaking Amulet: Is now equippable

If this item is equipped, and an additional water could have occurred since the Farm was last tended to, it is consumed, and water’s time reduction will be increased

- This effect stacks if multiple are equipped at once

- Auspicious Coin: Is now equippable

If this item is equipped and a Coinflip is lost, the loss is nullified, and any amount that would have been deducted is saved

- There’s a 10% chance this item is consumed each time its effect is triggered

- Atlantic Obol, Hunter’s Blind, Daoic Seal, Subterran Crest: New rare items that apply a 2x Boost (8h) for their respective action on use

- Pluperfect Gemerald, Mystical Balls: New Rare items (no current use)

- Weeds, Clover are no longer classified as Food items

All Pet cravings have been reset to account for this change

- Spiny Shell has been renamed to Clamshell

- Farm Plot and Pet Adventure Boosts can now be overridden at any time

Must confirm before this can be performed

### Prestige Perks

- Overgrowth (New Perk): Increase byproducts gained from farm watering (Weeds, Mushrooms)

- Arbory Perk max level increased to 22 (from 17)

### Daily

- Maximum crates gained from streak is now uncapped (from 75)

### Other

- Calculator: Evaluate advanced math expressions (ex. 1+1, 2k2, 5^3) with commands /calc or /c

Most in-game commands and input boxes now also accept math expressions

- A personal notification is now always shown when a Rare Item or Special is found

- Misc. other bugfixes, optimizations and improvements


---

## [Game Update](https://blog.bconomy.net/2025/04/29/game-update-13/) — *2025-04-29*

Hey everyone! A game update for Bconomy has been released. It mostly focuses on improving the gameplay experience and performance optimizations. There has been a lot of backend work done as well to prepare for future feature expansions. As always, thanks for playing!

## Changelog

### Items

- Reserve: Set an amount of an Item to always retain during bulk actions

Currently only applies to Pet Feed and Boss Attack operations

### Pets

- Feeding Improvements: Items found by a Pet’s Adventure are now calculated prior to the feed operation

Enabling “Feed Found Items” during bulk feeding will use eligible Items located from that Pet’s Adventure in addition to those from your Inventory

This option is enabled by default and recommended to simplify management

- There is no longer an artificial cooldown incurred following bulk feed operations

- Breeding two pets now costs BC

BC cost scales based on number of pets already bred during the week

### Prestige

- Virility: Max perk level increased to 100 (from 32)

- Zootechny (New Perk): Lower cost of breeding Pets

### Interface

- Infinite scrolling display is now used for more gameplay elements

- Usability improvements (improved searching, additional interactivity, etc.)

- Holding SHIFT reveals “Use Max” shortcut on Item displays

- Visual consistency and theming improvements

### Other

- Performance optimizations for frontend client, backend server and Discord game client


---

## [Game Update](https://blog.bconomy.net/2025/04/18/game-update-12/) — *2025-04-18*

Hey folks, a game update for Bconomy has been released. This update aims to address some of the game balance issues with the previous update. Some backend code refactoring and UI optimizations have been made as well to improve the user experience.

Thanks to community members for providing feedback on our Discord community’s Suggestions channel. I always read those, even if it takes me a while when I’m having a busy week. I tried to resolve issues with the cravings system that have been raised with this update… but please continue to provide feedback if there could be further improvements 🙂

## Changelog

### Pets

- All pets now have a craving assigned at all times

- Existing cravings for all pets have been reset

- Cravings now reset upon reincarnation, and are once always level dependent regardless of tier

- Item sets for cravings dependent on pet level have been rearranged (ex. harder to obtain items are now only craved at higher levels)

- Amount of item craved per set has been reduced significantly, and now scales roughly linearly with pet’s level

- Fixed issue with craving generation not scaling with pet level within a feed operation

- Cravings are no longer prioritized by feed operations if the pet is at max level

- Pets now remember their active adventure type post-reincarnation (but still, no energy or items are retained from prior)

- Transferring a Pet now resets its active Adventure Boost as well

- Manage Pets menu is now infinite scrolling instead of paginated

Reincarnate button now replaces Feed Craving button if pet is at max level

### Prestige

- Gourmand Perk: Max level increased to 25 (from 15)

- Gluttony Perk (New): Increase all pet’s base energy capacity

### Other

- Significant optimizations have been applied to Farm Page, hopefully reducing lag for some users


---

## [Game Update](https://blog.bconomy.net/2025/04/13/game-update-11/) — *2025-04-13*

A fairly heavy update for Bconomy has been released, with a focus on improvements to existing features. These changes aim to resolve some long-standing issues with certain systems (Pets), and make gameplay overall more enjoyable. Please let me know what you think, and if there are any further improvements that can be made. Thanks, and enjoy!

## Changelog

### Pets

- Auto-Leveling: Pets now automatically increase their level as they gain XP

- Feeding: The Feed command has been reworked, and now does an immense amount of behind-the-scenes processing to simplify pet management

Feed operations now attempt to fulfill the Pet’s craving first. If it’s successful, the next craving(s) are generated and fulfilled repeatedly until no longer possible

- The command will otherwise try to feed your pet in the most efficient way

- Bulk Feeding: Mass-feed your Pets with a single click

Options to feed “Adventuring”, “Pinned” or “All” Pets are available

- The same optimized behavior of the Feed command is applied to every eligible Pet

- Because bulk feeding can be a heavy command, it can only be performed once per minute, and is capped at 100 Pets per operation

- Pins: Set specific Pets to always be sorted at the top of your list

Pet pin order can be customized to your liking, much like Item pins

- Pin ordering applies to backend game operations as well. Commands like bulk feed will always prioritize pinned pets in the order specified

- Craving adjustments: Pets at higher levels now have a chance to crave any Food item. Pets at lower levels will still crave a limited pool of items

Cravings are no longer reset upon reincarnation. Once a pet has reached Tier I+, it will continue to have a chance to crave any Food item

- Sorting adjustments: Tier now takes precedence over Level/XP in default Pet sort order

- Reincarnation now resets a Pet’s active Adventure Boost

- Manage Pets menu now has proper pagination, and is navigable with keyboard controls (Left/Right Arrow)

- Pets are now searchable by name, in addition to their other attributes (species, adventure type, preferred adventure, skin, aura, ID#)

### Items

- New Food Items: Hearty Burger (replaces Woven Basket), Seafood Salad (replaces Activewear), Stone Soup (replaces Big Backpack), Warm Broth (replaces Toilet Plunger)

Survival Kit, Massive Driftnet have had crafting recipes altered to account for the aforementioned item replacements

- Manure has replaced Woven Basket for buying and upgrading Farm plots

- Weeds, Clover are now classified as Food Items

- Eternal Snowflake is now classified as a Rare Item

- Pinned Items are now displayed below your Actions for quick access

- Item Info card no longer forces a loading screen when first viewing an Item

- Item Info card now displays drop rate for each source an Item can be obtained from

- Items and Specials with cooldowns now show time until they can be used again, and use is prevented until cooldown elapses

- Items are now searchable by attribute in addition to name (for ex. searching “rare”, “food”, “weapon” will return relevant Items)

### Prestige

- Virility (New Perk): Skip wait time before a Pet can be bred again

Cooldown reduction is per-user: it does NOT apply to the pet itself

- Nepotism, Anointment

Perk benefit decreased to 2.5% per level (from 5%)

- Maximum perk level increased to 20 (from 10)

- Hypervisor, Vitality

Perk benefit decreased to 4hr per level (from 6hr)

- Maximum perk level increased to 21 (from 10)

### Interface

- Hotkeys can now be bound to game menus, including Profile, Stats, Trophies, Logs, Leaderboards, etc.

- Keyboard controls (Left/Right Arrow) can now be used to move through pages in menus (for Leaderboards, Logs, etc)

- Fixed a bug where the Amnesia perk would not update interface button progress

- New setting to disable Global Broadcasts (purple messages) from showing up in chat

- New setting to hide Minigames (Coinflip, Ball Pit, Burn) from navigation menu

### Other

- Rare Item finds are now only broadcasted if the Item’s worth exceeds 50,000,000 BC

- Coinflip results screen now provides an option to repeat the last flip

- Ball Pit results message has been shortened to reduce chat history clutter


---

## [Prestige Perks Revamp](https://blog.bconomy.net/2025/04/05/prestige-perks-revamp/) — *2025-04-05*

Hey folks. Today’s the day: the Prestige Perks revamp has been released! This update seeks to revitalize Bconomy’s longterm progression by reintroducing meaningful upgrades to the Ascension system. 17 Prestige Perks now exist in total, each having a strong impact on the gameplay aspect it affects. Improvements to the interface have been released as well. Enjoy!

## Changelog

### Prestige

- 17 Prestige Perks are now in the game:

Nepotism: Decreases the cost of ranking up

- Anointment: Decreases the cost of ascension

- Fortuity: Increases your base Rare Item discovery multiplier

- Favoritism: Increases the chance for a Work Bonus to occur

- Asterism: Increases the maximum Tier a Pet can reincarnate into

- Deluge: Lower cooldown between watering your farm

- Arbory: Increases max number of one type of crop that can be planted at once

- Menager: Increases Pet and Egg space (does NOT increase adventure slots)

- Playboy: Lower cooldown between swapping your Buddy

- Numismatist: Increases your BC per Coinflip limit

- Hammerspace: Increases number of items that can be equipped at once

- Hypervisor: Increases time Generators can run for before they idle

- Vitality: Increases time Farm can survive between watering

- Gourmand: Increases XP multiplier from satisfying a Pet’s craving

- Amnesiac: Increases chance of an action’s cooldown being ignored when run

- Fecality: Increases Manure output from feeding a Pet

- Fecundity: Increases rare crop output from Farm

- 5 Runes are now earned per Ascension

Although each Tier now grants the same # of Runes, each buyable Perk has been rebalanced to be far more impactful in comparison to the previous system

- Each Ascension Tier no longer provides an innate Rare Item multiplier

This has been functionally replaced by the “Fortuity” perk

- Some existing mechanics have been adjusted to account for new Perks:

Base buddy swap cooldown is now 1 hour (from 2)

- Base pet craving multiplier is now 5x (from 8)

- Base pet max tier is now 5 (from 10)

- Pet item find speed scaling per tier has been adjusted

- Base farm survival time between waters is now 12 hours (from 30)

- Base maximum same type crop planted in farm is now 3 (from 5)

- Base maximum coinflip wager is now 1b (from 100m)

- Note: Decreases are not intended as nerfs – rather, they’re slight adjustments for gameplay pacing; the new Perks allow those previous values to be exceeded by quite a bit

### Other

- Maximum list price for the market is now 100b (from 10b)

- Work earnings have been massively increased across the board

- Eternal Snowflake is no longer classified as a Rare Item

- UI scaling for larger screen dimensions has been improved

- Title typeface in header now changes as you rise through the ranks

- Menus should feel more responsive on mobile devices

- Coinflip results popup now include an input box to flip again


---

## [Game Patch](https://blog.bconomy.net/2025/03/27/game-patch-7/) — *2025-03-27*

A game patch for Bconomy has been released, introducing gesture-based menu navigation for mobile devices.

## Changelog

- Gesture-based navigation: Quickly access game menus on mobile devices

Swipe left to reveal the navigation menu

- Swipe right to reveal available game actions & tools

- Thanks kelllll#30675 for suggesting this!

- “Start Giveaway” has been added to navigation menu

- Additional bugfixes and improvements to game interface


---

## [Game Update](https://blog.bconomy.net/2025/03/27/game-update-10/) — *2025-03-26*

A game update for Bconomy has been released, with a major refresh to the game’s interface! This UI upgrade serves to address longstanding issues with accessibility and navigation on different devices, as well as improve organization and communication of in-game elements. Please give it a try and let me know what you think! Some changes to streamline game mechanics in preparation of future major updates have been pushed as well.

Special thanks to never#128407 for providing an initial mockup that inspired this redesign.

## Changelog

- Prestige Points (PP) and associated Perks have been removed from the game

First added ~4 years ago, PP was introduced as an “endgame currency” in a vastly different iteration of Bconomy. Over time, BC has taken over what PP initially served to accomplish. PP now serves very little use, and, to streamline the gameplay experience, it’s been removed.

- This is also in preparation for the next major update (Prestige Perks overhaul) as several perks were directly dependent on this system. More impactful perks will replace those that were removed. Runes spent to buy PP perks have been refunded, and can be reallocated.

- Any users with a PP balance prior to the removal have had it rolled into their BC balance.

- The Bank and associated Perks have been removed from the game

Like PP, the Bank is a legacy feature, and its existence makes very little sense in the current version of the game. As I’d like to invest into other, more interesting passive earning methods (Generator, etc), it’s been removed.

- Any users with a Bank balance prior to the remove has had it rolled into their BC balance.

- Game tutorial has been removed due to interface bugs


---

## [A Farm Update](https://blog.bconomy.net/2025/03/17/a-farm-update/) — *2025-03-17*

Hey folks! An update for Bconomy has been released with new features focusing on both the Farm and your Pets. These gameplay systems now have greater depth in how they complement and interact with each other. General improvements have been made to both as well.

## Changelog

### Pets

- Manure is now potentially gained when any item is fed to a Pet

This item can be used to craft Fertilizers, which grant a multiplier boost to Farm Plots (see below)

- Adventure Speed boosting items can now be directly used on any Pet from its info card (no longer restricted to just your Buddy)

### Farm

- Plots are no longer reset when crops perish, and any that grew before the expiry can be collected

- Fragrant Dogrose, Mystical Rowan, and Legendary Aguaje (Pet Adventure Speed boosting items) are all now potentially gained when any crop is harvested from your Farm

These Items have had their effect duration doubled

- The base worth of each of these Items have been changed to account for these balance changes

- Fertilizer items can now be used to boost a Farm Plot, applying a temporary multiplier to any items harvested in that period (see below)

### Items

- Enriching Fertilizer and Experimental Fertilizer are now craftable, and each provides a multiplier boost to a Farm Plot when used

- Gilded Manure is now classified as a Rare Item, has had its base worth increased to 1,000,000,000 BC, and applies a 1,250x boost to a Farm Plot for 24h when used

- Eternal Snowflake is now classified as a Rare Item, and its base worth has been increased to 10,000,000 BC (from 5,000,000)

- Basic Fertilizer has been renamed to Toilet Plunger (currently no use)

- New graphics added for Green/Amber/Purple/Red Gemerald, Rainmaking Amulet and Gilded Manure

- Auspicious Coin: a new Rare Item with a base worth of 1,000,000,000 BC (currently no use)

### Misc

- Blocking functionality: Block a player to hide their chat messages & giveaways, and prevent them from directly interacting with you

Blocked players can be managed from your Settings page

- Maximum winners for a giveaway has been increased to 10 (from 5)


---

## [Spring Fling (Spring 2025)](https://blog.bconomy.net/2025/03/05/spring-fling-spring-2025/) — *2025-03-05*

A new Season has arrived in Bconomy: Spring Fling, the Spring 2025 Event! The snow’s melting, plants are peeking out of the soil, quests have been reset and progression for the new Season has been enabled. With this update comes a slew of new Items and game balance adjustments.

Revamps to the Farm, additional functionality for both new and old Items, a UI refresh, and more exciting features will be arriving over the next couple weeks. I’d hoped that these would have been ready for release by today, but they’re not polished to a level I’m satisfied with yet. Some Items added in this update don’t have uses as a result, but their place in the game will make more sense soon. In the meantime, enjoy the new Season and, as always, thanks for playing!

## Changelog

### Quests

- The Spring 2025 Season has begun! Quests have been unlocked, progression has been reset for all players, and new Rewards are available to earn.

Trophies have been distributed to the top 10 players of last Season by Quest Level (Congrats to the #1 player, REDRUM#21267)

### Pets

- Active buddy loot action multiplier increase per level decreased to 0.001x (from ~0.002x)

### Faction

- Maximum FP drain per second increased to 1,500,000 FP/s (from 1,200,000)

### Items

- New Items:

Exquisite Trunk: On use, yields very rare items including Diamonds, Oysters, Platinum and Lucky Charms

- Magic Conch, Untamed Spirit, Seraphic Clasp and Condemned Skull: Rare items that provide 2x boosts to their respective Loot Actions for 4 hours

- Fragrant Dogrose, Mystical Rowan, Legendary Aguaje: Items that provide temporary boosts to a Pet’s Adventure Speed and Energy Capacity

These Items will be rarely yielded from harvested crops in a future update

- Reaper’s Scythe, Green/Amber/Purple/Red Gemerald: Rare items that will have uses in coming updates

- Rainmaking Amulet, Gilded Manure, Industrial Fertilizer, Experimental Fertilizer: Standard items that will have uses in coming updates

### Giveaways

- Karmic Reputation (KR): A new currency gained by hosting Giveaways

One KR is gained for every 1,000,000 BC worth of Items given away

Rare Items given away have a 10x KR Bonus on top of their base worth

- Loosely inspired by the community’s Reputation system, KR is a way to incentivize high-level players to “give back” to the playerbase by running Giveaways

- KR will be usable to buy permanent cosmetics like exclusive Pet modifiers, UI/Profile themes, special Trophies, and more

Cosmetics available to purchase will be time-limited and rotate based on the current Season but, once bought, will be owned permanently


---

## [(Re) Introducing Giveaways](https://blog.bconomy.net/2025/03/04/re-introducing-giveaways/) — *2025-03-04*

A game update for Bconomy has been released.

## Giveaways

Players who’ve been around for a while know that Bconomy’s community was built on giveaways. Giveaways run by the developer (me) were a previous feature of our Discord server that drew in new players. Later, player-run giveaways emerged as a central feature of our community, and had their own unique metagame and culture around hosting and participating in them. I’m hoping to bring some of that back with this update.

Giveaways are now integrated in Bconomy, fully automated so community members don’t have to devote hours of their time to running them. Supporters are now able to host Giveaways and broadcast a global message when starting one. The system is a bit limited to test the waters but I hope to add more features (like Faction-only giveaways, shorter durations) if things work out.

This highly requested feature has been in the works for a LONG time. While the game is a bit less hectic I thought it’d be a good time to release it. Don’t worry, the new Season is up next. It’ll release today? Tomorrow? The day after? The suspense is mounting…

## Changelog

### Giveaways

- Giveaways have been released

New “Given Away” statistic tracks BC worth given away

### Misc

- Wait required to buy balls after pit is drawn reduced to 5 seconds (from 2 minutes)

- Chat box now limits characters entered to prevent being cut off after being sent

- Pet-related pages now have pagination in an attempt to address performance issues


---

## [Game Patch](https://blog.bconomy.net/2025/03/02/game-patch-6/) — *2025-03-02*

A game patch for Bconomy has been released.

## New Season

Hey folks! Hope everyone’s had a great weekend. Just wanted to provide an update regarding the upcoming Season, originally scheduled to launch yesterday:

If you’ve been actively playing the past week, you may have noticed some… “balance issues” that need to be addressed. The rewards for this new Season weren’t designed with the game’s current faster pacing in mind and I’ll need some additional time to ensure that progress for this Season feels rewarding before release. I’ve also been much busier with infrastructure updates and behind-the-scenes work than expected, which means I haven’t finished implementing every features planned yet.

I’m hoping to release the new Season’s quests and rewards in the next 2-3 days. Some of the planned game mechanic updates may be coming a little bit later. I apologize for this delay, but I want to make sure the game feels good to play first and foremost before anything else. Thank you for your patience and understanding 🙂

## Changelog

### Items

- Magic Token now grants a 10x multiplier to your Buddy’s Energy Capacity and Adventure Speed for 24 hours on use

### Specials

- Amplifier boost multiplier effect reduced to 2x (from 3x)

### Pets

- Manage Pets interface now segregates level/craving related actions into two button slots and displays Tier alongside Level

### Other

- Significantly reduced amount of “You’re doing that too fast!” popups when attempting to run actions

- Fixed a bug where multi-levelups of a Pet caused Items Found to “time travel” forward

- Fixed “Feed All” button causing error when Pet feeding would surpass Energy Capacity

- Fixed web client crashing when attempting to fetch Pet data from server


---

## [Game Update](https://blog.bconomy.net/2025/02/27/game-update-9/) — *2025-02-27*

A game update for Bconomy has been released.

## Server Upgrades

Over the past week, I’ve been busy deploying major infrastructure changes to the game’s backend, made possible by contributions from our Supporters! It hasn’t been the smoothest process, but I’m happy to report that most issues have been ironed out and things have stabilized. The game should now feel more responsive. Be sure to thank a Supporter next time your boosted Actions run without any lag!

## Upcoming Changes

- Amplifiers (Calibrated, Arbitrary) will have their multiplier decreased to 2x (from 3x)

This change will take effect on March 1st

## Changelog

### Loot Actions

- All Specials currently in-game are now discoverable through Loot Actions

Finding one earns you a Trophy, gets logged, and broadcasts a message to all players

### Pets

- Manage Pets: A new interface for pets, with quick actions for Feed (All/Craving), Levelup, Reincarnate and Adventure Type

A “feedall” command was initially planned, but I faced difficulty while designing it (how to customize which pets to feed? which to prioritize? which foods to feed first?) so this menu has been implemented as an alternative

- It should make managing pet logistics more intuitive, with a concise overview shown to the player – diving into sub-menus is no longer needed for routine tasks

- Level up operation now increases Pet’s levels by maximum possible

- Pets no longer have a chance to reroll their craved food when levelling up

- Craving Bonus multiplier decreased to 8x (from 12x)

- Opening a Pet’s info card is now instant (no longer triggers a load)

- Eggs dropped from Loot Action are now always of the type of that Action

For ex. getting an egg from Mine always yields a Mine Egg

- A player’s first egg will now always be of Fish type

### Items

- Bconomy Sourcecode can now be used to duplicate any item (except Lunar Shard), granting you an additional 1 billion BC worth of that item

- Obscure Sigil can now be used to extend all non-global active Loot Action multipliers (namely Item and Personal Boosts), each by a random duration between 1-2 hours

### Other

- Ball Pit now draws every 20 minutes (from 15)

- PP gained from transmutation now rounds down from BC value


---

## [Game Patch](https://blog.bconomy.net/2025/02/22/game-patch-5/) — *2025-02-22*

A game patch for Bconomy has been released. There aren’t any new features in this patch, but issues that needed immediate resolution have been fixed. Once again, a major game update will be dropping March 1st with a new Season, new Specials and new Items. Let’s get hyped!

And… THANK YOU SUPPORTERS! With your financial support, a huge server upgrade is now in the works, which should resolve our lag issues for a LONG time. Much larger than I originally planned thanks to your generosity. I’ll also be able to add mechanics that require heavier computations (reintroducing higher multipliers, more realtime features). I’ll announce planned downtime for when this upgrade is happening. The future is looking bright because of you guys! Love you. Seriously. 🥺

## Changelog

### Specials

- Noetic Pulsator cooldown increased to 5 minutes (from 2 minutes)

### Pets

- Eggs from the wild now drop each type (Fish, Hunt, Explore, Mine) in equal proportions

### Leaderboard

- Entries per page increased to 15 (from 10)

- Name and leaderboard value are now formatted side-by-side, in the same row

- Pets Leaderboard is now ordered by Lifetime Items Found stat

### Supporter Perks

- Message Background Colors: Set custom colors for the background of each chat message you send

- New Name Style: Radiant

- Supporters can now set customizations for an owned Faction, including Tag Color, Name Color, Name Style and Emblem

These customizations will be disabled if the owner’s perks expire

- Improved preview on Customization menu

- Name customizations are now displayed on Profiles, Leaderboard, Faction Members, and several other UI elements

### Other

- Improvements to data fetching logic, hopefully decreasing lag

- Fixed bug allowing 3 Amplifiers to be active at once

- Fixed bug preventing faction tag reset


---

## [Supporter Perks](https://blog.bconomy.net/2025/02/20/supporter-perks/) — *2025-02-20*

Hey folks! This update introduces ways for players to support Bconomy financially. We’ve seen an increase in new players recently, and, along with that, server issues! That’s great! (sarcasm) Adding monetization features isn’t my favorite use of dev time, but it’s clearly necessary now for the long-term growth and survival of the game.

I’ve introduced some minor perks for those who generously support Bconomy with a few dollars each month. I will add more and more benefits to the subscription over time, and promise to keep them non-P2W for as long as possible. If Bconomy has brought you any enjoyment, I hope you’ll consider sparing a few bucks each month to keep the game alive.

This update is a bit sparse in terms of actual content. A ton of exciting features are planned for the next one, dropping March 1st! A huge expansion to the Farm, a new Season (with new Items, Global Events, and Quest Rewards to earn), and naturally dropping Specials are just on the horizon. Good things are worth waiting for!

## Changelog

### Ball Pit

- Ball Pit is now drawn more often, every 15 minutes (from 1 hour)

### Specials

- Noetic Pulsator global cooldown reduced to 2 minutes (from 5 minutes)

### Other

- Potential fixes for lag issues caused by Faction recruitment system


---

## [Game Update](https://blog.bconomy.net/2025/01/16/game-update-8/) — *2025-01-16*

A game update for Bconomy has been released.

## Changelog

### Farm

- An unlimited amount of Farm Plots are now able to be purchased, limited only by whether you can afford the Item cost requirement

The new infinite upgrade scaling mechanic introduced in this update is used here: each purchase will increase the Item requirement amount and complexity required for the next one

### Generators

- An unlimited amount of Generators are now able to be purchased, limited only by whether you can afford the Item cost requirement

The new infinite upgrade scaling mechanic introduced in this update is used here: each purchase will increase the Item requirement amount and complexity required for the next one

### Pets

- An unlimited amount of Stables are now able to be purchased, limited only by whether you can afford the Item cost requirement

The new infinite upgrade scaling mechanic introduced in this update is used here: each purchase will increase the Item requirement amount and complexity required for the next one

### Quests

- Newly generated quests no longer include non-item-finding entries (most notable Ball Pit)

### Bosses

- Each Boss now has a 100% chance of dropping a Special when defeated (from 50%)

- Each Boss now drops 10 Lunar Shards when defeated (from 5)

### Specials

- Specials that add additional plots, stables, generators etc. now unlock an additional unit for free without impacting future unlock costs

- XenoServer, Golden Lariat Specials are now usable

### UI

- New “Used to Purchase” section added to item info page

- Tutorial can now be started at any time from Game Manual

- Additions to some Game Manual pages (WIP)


---

## [Game Update](https://blog.bconomy.net/2025/01/12/game-update-7/) — *2025-01-12*

A game update for Bconomy has been released.

## Changelog

### Ball Pit

- Introducing Ball Pit Types: Each ball pit now has a limitation for how many balls can be purchased by each user

Ball pit types are indicated by the color of ball during that pit

- Ball pits with higher ball limits per user are rarer, while those with lower limits are more common

- Web Client now receives (almost) immediate Ball Pit status updates

- A message is now broadcast to Global chat 5 minutes before a ball pit is drawn with the current prize included


---

## [Game Update](https://blog.bconomy.net/2025/01/12/game-update-6/) — *2025-01-11*

A game update for Bconomy has been released.

## Changelog

### Web Client

- Introducing Hotkeys! Configure Bconomy to run any game command or navigate to a UI element when a specific key is pressed

Recently run commands can be mapped in the Hotkey menu in Settings (you can also define your own custom commands)

- The default hotkey mappings can now be changed or even unset

- This new functionality, combined with Bconomy’s existing command-driven infrastructure design, will enable power users to elevate their efficiency with near-total customization of ingame keyboard shortcuts!

- Updated new user intro “tutorial” to be more interactive & comprehensive

- Fixed issue with main navbar dropdown acting finicky when mouse is going in/out of its area

- Fixed issues where custom emojis sometimes wouldn’t render correctly

- Toggle for enabling sound added to Settings page

- Major internal webapp restructuring, hopefully providing performance improvements


---

## [Sights and Sounds](https://blog.bconomy.net/2025/01/06/sights-sounds/) — *2025-01-05*

A game update for Bconomy has been released.

## Changelog

### Radio

- Introducing the Bconomy Radio – a proper soundtrack for our game is finally here!

The Web Client now streams 70+ curated background tracks, including 2 contributed by our very own KyFer! (“Pixel Dreams”, “Tranquil Vibes”)

- Just like a radio station, every player logged into the Web Client hears the exact same music stream

- Soundtrack info is now displayed in Web Client’s footer when advancing to next track (Desktop only)

- It’s so exciting to finally release the Bconomy Radio after planning its implementation for so long! As long as music streaming proves to be stable, this opens up future possibilities like song requests, seasonal soundtracks, event-based themes, and more!

### Items

- New graphics have been introduced for some Items, replacing previous placeholder icons

### Specials

- New graphics have been introduced for all Specials, replacing previous placeholder icons

### Web Client

- Setting to enable streaming HQ audio from the Bconomy server has been added

This improves the quality of music played, but consumes more bandwidth (so it’s turned off by default)

- Currently active chat channel is now preserved when web client is reloaded

- Fine-grained volume controls for each sound category (Music, SFX) have been introduced

- Fixed an issue where some emojis would not display properly in popup modals

- Fixed an issue where toast notification positioning was off on mobile displays

- Fixed an issue where some players with linked Discord accounts could not send messages in web chat


---

# 2024 (15 releases)

## [Game Update](https://blog.bconomy.net/2024/12/27/game-update-5/) — *2024-12-27*

A game update for Bconomy has been released.

## Changelog

### Items

- New method for calculating loot item drops has been implemented, resulting in a **9x+ speedup (!)** measured for item drop calculations on benchmarks!

An unoptimized algorithm for calculating random item drops that I wrote way back when Items were first introduced (~3 years ago) has been used for Loot Action and Fancy Crate calculations before this point

You might notice that Loot Actions, claiming Pet items and opening Crates feels more responsive

The new algorithm should resolve situations where players with extremely high multipliers could lock up the entire game for periods of time when they attempted to use Loot Actions

- I can now look toward re-introducing higher multipliers or adding more Boost sources if this new item drop calculation method proves to be fast enough to support them

- Item drop distribution for every Action has been altered with the new algorithm (due to changes in how calculations are performed, along some manual adjustments for consistency)

Some Items have had their base worth changed slightly

- Some Items now drop from different Loot Action sources

- Generated item fetch Quests have been updated to reflect this new item drop distribution (and should be more “accurate to reality” than the previous iteration)

- Bounty items (obtained from attacking Bosses) are now useable

### Pets

- Energy required to find an Item decreased to 75 (from 100)

### Bosses

- Boss random spawn chance has been increased


---

## [Game Update](https://blog.bconomy.net/2024/12/25/game-update-4/) — *2024-12-25*

Merry Christmas! A game update for Bconomy has been released.

## Changelog

### Pets

- Number of pets owned and allowed to adventure is now primarily determined by your Stable level

- Your Stable can be upgraded with a set of certain Items (similar to Farm Plots and Generators)

Stable can be upgraded to Level 15 max (15 pets owned and on adventure)

- Energy capacity for each Pet has been increased

### Prestige Perks

- Raiding Party perk has been removed

- Stable Renovation perk has been renamed to Ethereal Stables

### Other

- Item info page now shows upgrade usage in Farm Plot, Generator and Stable levels


---

## [Game Update](https://blog.bconomy.net/2024/12/24/game-update-3/) — *2024-12-24*

Happy Holidays everyone! A game update for Bconomy has been released.

## Changelog

### Bosses

- Bosses now spawn at semi-rarely at random! A message is broadcast when one appears

- Improvements to Boss attack damage calculations to prevent “overkilling” (dealing excessive damage to Boss with weapon usage)

### Farm

- Upgrades now cost sets of Items, rather than BC

The Items required for each level change as you upgrade your Farm plot

- Maximum level for each Farm plot is now Level 15, allowing a max grow time reduction of -75%

- Improvements and fixes to planting crops command processing – crops are now planted correctly on specified plot, and unplanted plots are intelligently filled in if more than one crop plant is requested

- Farm reset no longer prompts confirm if crops have died

- Fairy Ring Special is now usable

### Generators

- Max of 20 Generators can be owned (from 10)

- Base earn rate for each Generator increased to 5,000 BC/min (from 3,000)

- Earn rate increase per level increased to 1,500 BC/min (from 200)

- Upgrades now cost sets of Items, rather than BC

The Items required for each level change as you upgrade your Generator

- Maximum level for each Generator is now Level 15

### Tools

- Adjusted upgrade item cost scaling

### Items

- Forbidden Knowledge is now usable

On use, summons a Boss at 50% health. 50% of total (not base) damage is credited to the item’s user

- Big Log can no longer be grown in Farm plots

### Misc

- Improvements to Farm, Generators, and Tools UI elements and status displays on Web Client and Discord Bot


---

## [The Boss Fight Update](https://blog.bconomy.net/2024/12/16/the-boss-fight-update/) — *2024-12-16*

A major game update for Bconomy has been released.

## Changelog

### Bosses

- Introducing BOSS FIGHTS! A global event that spawns semi-rarely, Boss Fights allow every online player to participate in taking down a Boss that drops epic loot when someone delivers the killing blow.

Read all about what Boss Fights have to offer in the newly added Bosses section of the Game Manual! I’m going to avoid repeating myself in this changelog because I’ve already documented everything there in detail…

- New Stat tracked for lifetime Boss Damage dealt

### Items

- Introducing Weapons, a new class of item!

Like Bosses, this new feature is documented in the updated Game Manual and you can go ahead and read about it in there

- Bounties, rewards from killing a Boss, have also been added

These items will drop rare loot for their associated Loot Action on use (this hasn’t been implemented yet. Soon…)

- Removed Items: Sprinkler, Anvil, Bacon Snack, Dark Chocolate, Chocolate Pastry, Meaty Nuggets, White Rice, Sushi, Cheddar Cheese, Hamburger, Fishwich, Butter, Buttered Waffle, Magic Hoe

### Game Manual

- Game Manual is now viewable on Discord Bot using /gamemanual (or /manual, /bhelp, /help, /gm)

- New Game Manual organization method: Categories have been replaced with parent pages and sub-pages

- Added more Game Manual pages about new and existing content

### Specials

- New Specials: Fairy Ring, XenoServer, Golden Lariat, Forged Banknote

These are currently only obtainable as a Boss drop

- These Specials are earnable in-game, but can’t be used yet…

### UI/UX

- Several display and QoL improvements to both Web Client and Discord Bot

- Web Client Items view now segregates Boosts and Weapons for easy organization

### Other

- Backend update to handle Bulk Inputs, a QoL feature for Pets and Bosses

Multi-select Items to use them in bulk for an action, or select “Use Everything”, and Bconomy will attempt to intelligently use your Items in the most beneficial way

- Finding a Rare Item will now broadcast a message to Global chat and grant you the “Lucky” Trophy.

- Internal code improvements

- Removed /about command


---

## [Game Patch](https://blog.bconomy.net/2024/12/06/game-patch-4/) — *2024-12-06*

A game patch for Bconomy has been released.

## Changelog

### Quests

- Quest Levels now increment automatically once you complete a set

- Quest Rewards are now claimed independently of Quest Level

- Reduced amount of Misc. Quests generated per set

### Actions

- Low Personal Boost now ranges from 2-3x (from 2-4x)

- High Personal Boost now ranges from 4-7x (from 5-10x)

- Readjusted Personal Boost hit rates for game pacing

- Amplifiers now initiate a 3x Global Action Boost (from 5x)

- Calibrated Amplifier use now incurs a global 1 hour cooldown before another Calibrated Amplifier of that Action type can be used

### Items

- Eternal Snowflake cooldown increased to 15min (from 10min)

### Factions

- Max FP/s drain for Boost increased to 1.2M/s (from 1M/s)

### Burn

- Tweaks to Burn reward distribution

### Game Manual

- New “Actions” section of Game Manual explaining Action mechanics has been added


---

## [The Quests Update: A Cold Start](https://blog.bconomy.net/2024/12/05/a-cold-start-quests-update/) — *2024-12-05*

A major game update for Bconomy has been released.

## Changelog

### Quests

- Another long-awaited Bconomy feature revamp has arrived with the Quests rework and (re-) introduction of Seasons!

Seasons are in-game events that persist for several months, accompanied by themed limited-time loot, event-related gameplay changes and UI decor

- The Winter 2024 Season – “A Cold Start” – has begun as soon as this update changelog is published! Log in and check it out!

- Quests now come in sets – each Quest in a set must be fully completed before rewards can be claimed

Quests no longer require a cooldown for rerolling, and more quests are available to complete immediately once you claim rewards for a set

- Progress through each Season by successfully completing Quests to increase your Quest Level!

- Higher Quest Levels improve the Item, Special and Trophy rewards you receive for submitting each set of quests, but Quest difficulty will increase with Quest Level as well

- Quest Level is now displayed on your Profile and is tracked on the Quest leaderboard

- Quest rewards for each Level are displayed on the in-game interface

- Veteran players will remember Campaigns, a similar, previous gameplay element that Seasons aims to serve as the spiritual successor to. I hope Seasons brings back the excitement of a limited time in-game event while building on that system with improvements!

### Titles

- Each player can now set a fixed Title independent of their current Rank

Players can use any Rank Title they have previously achieved

- Trophies have been reworked so that each in-game Trophy now has a Title associated with it

Once a Trophy has been achieved, you can use that Trophy as your in-game Title for bragging rights!

- Trophies can no longer be displayed on the “Triumphs” section of your profile

- Some Legacy trophies were not migrated to the new system and have been removed

- Several Rank Title names have been changed to be more gender-neutral

“Prefer Feminine Title” setting has been removed in favor of unified, gender-neutral Rank titles

### Pets

- Buddy contribution to current Action multiplier decreased to +0.01x per 5 levels (from 4 levels)

- Significant improvements to Pets overview on Web Client

### Items

- New: Eternal Snowflake

A seasonal Item that, on use, resets all Action cooldowns fully! 10 minutes must pass before this item can be used again

- New: DX Coolant

A seasonal Item that prevents Generator overheat when applied! As Generator overclocking is still in development, this item can’t actually be used for now

- Removed: Hearty Loaf, Seasoned Potato

### Actions

- Each Tool level now grants +0.10x multiplier (from +0.15x)

- Random Personal Boost durations are now 5min for low, 15min for high boosts

- Random Personal Boost hit rates have been increased significantly

### Specials

- New: Forbidden Modifier

A cursed Special that allow you to permanently add a Level to a Tool of your choice, even if it would surpass that Tool’s normal leveling limit

- All Global Action Boost-bearing Amplifiers now grant a 5x Action Boost on use (from 3x)

- Only 1 Calibrated Amplifier or 2 Calibrated or Arbitrary Amplifiers can be active at once for an action

- Removed: Mercurial Amplifier

### Burn

- Burn rewards have been adjusted for better gameplay pacing

- Weekly Burn rewards have been implemented in addition to Daily rewards

### Faction

- Faction maximum Boost drain per second increased to 1,000,000 FP/s (from 800,000 FP/s)

### Game Manual

- The Game Manual is a new resource players can reference directly from within the Web Client (and coming soon to Discord Bot)

As a successor to the classic “bhelp” menu, it aims to provide detailed explanations for Bconomy game mechanics, straight from the developer’s mouth

This should serve as a helpful quick start guide for new players, while also including verified, more detailed information even veterans will appreciate

- The actual content within the Game Manual is pretty sparse at the moment but I will be writing more entries between updates

Feedback and revision suggestions are appreciated!

### Other

- Ball Pit is now drawn at 00:30 of every hour to prevent issues with not being drawn due to database operation conflicts

Some leaderboard resets may be staggered to prevent similar issues as well


---

## [Game Update](https://blog.bconomy.net/2024/11/25/game-update-2/) — *2024-11-25*

A game update for Bconomy has been released.

## Changelog

### Specials

- Specials are a brand new asset class in the world of Bconomy!

Unlike Items, each Special is represented as an individual entity internally

- As a result, Specials are unstackable, as each can contain unique attributes

- The introduction of the Specials system will play a big role in the uniqueness of Bconomy gameplay in future updates – for ex. being able to add enchants to gear & weapons, finding truly unique loot, and getting seasonal Special rewards that can’t be obtained once an event ends

- Specials currently can’t be sold or transferred to other users

- Calibrated, Arbitrary, and Mercurial Amplifiers

These Specials broadcast a global Action Boost for all online players!

- Each Amplifier type has specific properties that affect the way it functions in-game

- Amplifier multipliers can stack if more than one is active at once for a certain Action

- Can be obtained from daily Burn leaderboard rewards (see below)

- Noetic Pulsator

A Special that resets all Action cooldowns fully for all players when activated!

- A global cooldown of 5 minutes is incurred before another Pulsator can be used

- Can be obtained from daily Burn leaderboard rewards (see below)

### Items

- Lunar Shard can now be used to unlock a Rare Item, consuming the Shard in the process

Rare Item roll probabilities are weighted by the rare item’s base cost

### Burn

- Burn Rewards: Earn Rare Loot and Specials by burning the most BC per day!

Eligibility for who wins each Burn reward is displayed on both Web Client and Discord Bot

Some rewards are guaranteed for those in certain leaderboard positions, while some are distributed randomly!

- Specials earned through daily Burn rewards have an expiration time of 7 days

### Actions

- Action Boosts (Global Random Events) have been removed

Functionally replaced by Amplifier specials

- High Personal Boost activation probability has been decreased

### Prestige Perks

- Total Recall prestige perk has been removed

Functionally replaced by Noetic Pulsator special

### Pets

- Each Pet now tracks items found over its entire lifetime

### Web Client

- Active Boosts are now organized on the Home page, color coded by origin and sorted by multiplier for easier comprehension

- Link to view your Profile is now included on Misc page

- Use button next to eligible Items in Inventory now directly trigger relevant command

- Game Log popup modal is now larger (if screen size allows) for easier readability

- Redesigned mini status display elements to be more concise and readable

- Possible fix for rendering error occurring on some devices (namely older devices and “non-traditional” browsers like TVs and smart fridges)

### Other

- Game Log now tracks Burn Reward distribution, Egg create/abandon/transfer/locate/hatch, Pet transfer/release, and Special use

- Faction Members view sorts deposits by ascending, not descending

- Leaderboards on Web Client and Discord Bot now use monospace fonts when applicable for readability


---

## [Game Update](https://blog.bconomy.net/2024/11/09/game-update/) — *2024-11-09*

A game update for Bconomy has been released.

## Changelog

### Pets

- Introducing Pet Reincarnation – Increase your Pet’s Tier if it reaches Lv. 100

Reincarnated Pets find items faster for each Level based on their Tier, but also require more XP to level up as well

- Reincarnated Pets also increase their Buddy action multiplier based on Tier

- Reincarnation resets a Pet to Lv. 1 and causes it to lose all XP gained

- Energy consumed per item found reduced to 100 (from 175)

- XP Bonus for satisfying a Craving raised to 12x (from 8x)

- Species item find speed bonus reduced to 1.5x (from 2x)

- Time taken for Pet to find an item slashed across the board

New scaling function introduced for time reduction based on Tier

- Pet Set Buddy cooldown reduced to 2 hours (from 4h)

- Leveling up a Pet now has a small chance of resetting its Craving

- Pets can now be transferred between different users

Transferring a Pet will cause its Level, Tier, XP, Energy and Adventure to be reset

### Prestige Perks

- “Playboy” Perk implemented: Lower the cooldown required before your Buddy can be set to a different pet

Each level reduces swap time by 15 minutes

- “Total Recall” Perk cooldown scaling changes

Base perk benefit allows activation every 1 hour (from 2.5h)

- Each level now reduces activation cooldown by 10 minutes

Minimum cooldown for perk is now 10 minutes (from 30m)

- “Raiding Party” Perk maximum level is now 9 (10 Pets on adventure)

- “Bcoin Specialist” Perk levels now increase Coinflip max wager by 50M (from 25M)

### Ball Pit & Coinflip

- Ball Pit is now drawn every 2 hours (from 4h)

- Coinflip base max wager raised to 100M (from 5M)

### Web UI/UX

- Chat and messaging features have been overhauled!

Attachments, linked images, stickers and GIFs sent from Discord are now embedded in Web chat view

Click on embedded media to expand view while staying in-app

- User pings: Mention a user across platforms when sending messages from the Web Client by prefixing their Username, BcID# or Discord ID# with @

Pings will be highlighted to the recipient

- Pings are autopopulated when replying to a message on Discord

- Pings are clickable to view a user’s Profile

- Additional improvements to message formatting

- Chat improvements in this update are a stepping stone in expanding cross-platform rich chat features to additional channels (New global channels, Faction channels, etc)


---

## [Game Patch](https://blog.bconomy.net/2024/11/07/game-patch-3/) — *2024-11-07*

A game patch for Bconomy has been released.

## Changelog

### Pets

- Energy consumed per item found reduced to 175 (from 500)

- Time taken to for Pet to find an item reduced by 3x

- XP Bonus for satisfying a Craving raised to 8x (from 4x)

Item roll probabilities for choosing next Cravings have been adjusted

- New Pet-related Prestige Perks have been added (see below)

- Top Pets leaderboard by Tier and Level has been added

### Prestige

- New Pet-related Prestige Perks have been added

“Stable Renovation” – Increase the number of Pets that can be owned (up to 50)

- “Superheated Incubators” – Increase the number of Eggs that can be owned (up to 10)

### Actions

- Chance to roll a personal boost raised noticeably for all loot-bearing actions

- Fixed rolling a new personal boost of same type overriding existing boosts

- Rolling a personal boost for an action now also fully resets that action’s cooldown

- Multiple of one booster item can now be activated, stacking effect duration

Ex. Using 4 Fossils will activate the boost for 1 hour (15min X 4)

- Drop rate for Wild Eggs from loot-bearing actions increased

### Web UI/UX

- Latest major update changelog is now displayed when starting up the web client

- New font configuration to ensure that text and emojis display consistently across most different browsers/platforms

- Fixed an issue where disabling animations would cause popup notifications to get stuck and stack infinitely

- Attempting to send a chat message during cooldown no longer clears your input

- Emoji picker now displays animated emojis properly (if animations are enabled)


---

## [A Pets Update](https://blog.bconomy.net/2024/11/05/a-pets-update/) — *2024-11-05*

A major game update for Bconomy has been released.

## Changelog

### Pets

- After almost two years of absence, Pets make their triumphant return to Bconomy!

And for the first time, they’re part of the core experience – Pets now have a defined role in gameplay, although their mechanics will be familiar to veteran players

- If you owned any pets in-game prior to their removal in previous updates, they’ve been safely migrated, and are waiting for you to log in

For consistency, some pets have had their species reassigned, but other data values are retained

- Send Pets on Adventures to passively gain Items

Pets now have an Energy meter, which is filled by feeding the Pet food items

Feeding a Pet a food item will grant it XP, which helps to increase its Level (and thereby its item-finding efficiency and buddy action multiplier)

Pets can develop Cravings, where satisfying them by feeding specific food items will grant a 4x XP gain bonus when fed

- Set a Pet to go on a Fish, Hunt, Explore or Mine adventure, where it will find items of that type for you as long as it has enough Energy

Each Pet species has a specialization for what kind of Adventure it excels at, and sending the Pet on that type of Adventure increases the speed at which it can find items

- While a Pet is actively adventuring and is set as your Buddy, you’ll gain a multiplier for the action its species specializes in

+0.01x for each 4 Levels

- Ex: a Level 50 Pet will grant +1.125x, a Level 100 Pet will grant +1.25x, a Level 1 (Tier 3) Pet will grant +1.75x

- A new system has been introduced for Pet breeding, heritage and genetics

Pet breeding cooldowns now follow an exponential backoff pattern

First time breeding induces an 8 day cooldown, second induces a 16 day cooldown, third 32 day, so on and so forth

- Pets now keep track of their Generation

A newly hatched Pet will inherit the highest Generation of its parents plus one

- All Pets owned prior to this update have had their Generation set to I, and their parentage information has been cleared due to incompatibility between the old and new systems

- Pets with lower Generation counts will be significantly rarer by virtue of the heritage system, increasing their perceived value and uniqueness

- A Pet’s Generation does not affect any gameplay functionality

- Pets can now have two unique cosmetic properties, Skin and Aura

Base Skins can range between Alpha, Beta and Gamma classifications (least to most rare)

- Base Auras can range between Green, Purple, Orange, Cyan, Red, Pink, Blue, Yellow and Black classifications (all share same rarity)

- When hatched, a Pet may acquire a Skin or Aura through inheritance if one or more parent possessed the quality (more likely) or through spontaneous mutation (very rare)

- If one or more Pets holds Mutagenic Sludge (formerly Neurotoxic Chemicals) or a Cursed Charm during breeding, the chance for a Skin or Aura mutation can be artificially increased significantly (but the item is consumed in the process)

- Skins and Auras can’t be changed for a Pet once it has hatched

- Skins and Auras are cosmetic and do not affect any gameplay functionality

- Eggs are now considered separate entities from Pets in-game

An Egg’s inherited properties are determined when it is hatched, not when it is produced

- Eggs can be freely transferred to other players before they are hatched

- Wild Eggs can be found as a rare drop from loot-bearing actions, provided you have space available for one

- New Pet-related stats are now tracked (Pet Items Found, Pet Items Fed, Pets Bred)

### Factions

- Faction Boosts are now completely reset if the Vault FP falls to 0

It was previously possible to set high Faction Boost multipliers and deposit small amounts of FP needed only for the duration to run commands to maximize command efficiency – unfortunately, this was not intended behavior and has been patched out

### Autosell

- The Autosell feature has been redesigned to better fit modern Bconomy gameplay

- Set a limit for the max amount of an item owned, if that limit is exceeded through finding or harvesting that item, the excess will be converted to BC

Rather than an outdated “all-or-nothing” approach from a time when most Bconomy items had no use other than to sell, this new system lets users efficiently manage their inventory and while always having a certain amount of each item on-hand

### Market

- Transaction fee is no longer charged when listing an item, rather deducted from seller proceeds when item is purchased

It’s now free to list an item on the market, but the transaction fee is deducted from the sale (for ex. a listed item sold for 100 BC, but seller receives 95 BC if there is a 5% fee active)

- This change should make listing and managing items on the market smoother for sellers, and improve price discovery for buyers

- Maximum listing price is now 10 billion

### Ball Pit

- Ball Pit base prize increased to 1 billion (from 50 million)

### Actions

- Minimum cooldowns for some actions have been adjusted for consistency (all actions minimum cooldown is now always 1/10 of the maximum cooldown)

- Personal Boosts are now not dependent on how many times an action is run, but rather the amount of charge an action has reached

Spamming actions now no longer provides an overwhelming advantage – running any action at maximum charge will provide the same item output and personal boost roll chances as spamming at minimum charge for the same duration

This change seeks to more evenly distribute Personal Boosts, as the previous system granted action spammers chain boosts, while more casual players almost never encountered more than 1-2 boosts in a session

- A “pity” boost is not longer given to players who have not run an action in several hours

### Prestige

- New Pet-related Prestige Perks have been added

“Stable Renovation” – Increase the maximum number of pets owned (up to 25)

- “Raiding Party” – Increase the number of Pets that can Adventure simultaneously (up to 8)

### Web UI/UX

- Active Market listings are now included in the Items and Market view with quick action buttons to centralize location of listed and inventory items, rather than hiding them in a modal

- Broadcasts associated with specific users (Ascension broadcasts, Ball Pit wins, Faction promotions) can now be clicked on to show the user’s profile

- Scrolling on Journey Log and Chat Box now occurs immediately on data updates

- Progress bar animations now move smoothly instead of abruptly updating every tick

- Action button particle effects now trigger even if keyboard shortcut was used instead of a click interaction

- Setting “Play Animations” to Off now actually disables all in-app CSS animations and transitions

This will hopefully provide performance improvements to those with low-power devices or want to minimize browser resource use by turning off animations

- “Play Animations” is now forced Off if prefers-reduced-motion is set via browser or at the OS level

- Faction per-member FP contribution ticker now uses monospace font for improved visibility with sorting

- Text input boxes for setting in-game names are now prepopulated with existing values

- Numerical keyboard shortcuts for pages have been reassigned to accommodate for new Pets page

- Increased rate of data refresh for item market

- Optimizations to decrease data transfer bandwidth for game updates

- Misc. bug fixes and improvements

## Developer Notes

Throughout Bconomy’s existence, *The Pets Update* has remained a symbolic, unachievable milestone that’s never actually materialized. For years I’d charted it out extensively in notebooks and word documents, planning out the intricate details that would open the game up to a new world of complexity and depth. But the amount of development effort to fully realize that perfect update has always proved itself to be unrealistic. In previous attempts, adding all those features meant constant  rewrites to try and retrofit an already unmaintainable codebase with complex new mechanics. Hours of effort would melt away with no tangible progress. Without fail I’d always burn out on making *The Pets Update* happen after a solid few weeks of development. An impending “Pets Update” has always led to the downfall of past iterations of Bconomy, causing it to lose any momentum and community goodwill it gathered. Periods of update drought, unpatched balance issues and stale gameplay resulting from trying to deliver *The Pets Update* had more than once caused the game to “die” in the eyes of many devoted players.

But, today, I’m releasing an update that finally returns Pets to the world of Bconomy. They finally have a role beyond sitting on your profile and having cool (read: useless) stats! But, is it ***The*** *Pets Update*? Not quite. This update makes up only a tiny fraction of my vision for what an ideal *The Pets Update* would’ve looked like. But I could feel myself reliving what caused the game to fail in past times as development progressed… so *lots* of features didn’t make the cut. Pet Ascensions, Active/Passive Abilities, Random Encounters and Combat would have been so awesome to ship. But if I wanted this update to see the light of day, and for this game to survive, they had to get shortlisted. As long as this project is still kicking (and so am I), those features will be implemented someday. But probably more gradually, in a way that’s more sustainable for the development of the game and my sanity.

So this is “A” Pets Update, not “The” Pets Update. In fact, “The” Pets Update may not ever end up existing in the way I originally envisioned it. And you know what? That might be a good thing.

Anyways… at least we got that boring dev commentary out of the way. Hope this update didn’t screw the game balance too hard! I’ll be doing spot adjustments and hotfixes as needed throughout the week. Bug reports and feedback are appreciated. Enjoy the new content, and – as always – thanks for playing.

Wewert


---

## [Game Patch](https://blog.bconomy.net/2024/08/21/game-patch-2/) — *2024-08-21*

- Random effect base occurance rates increased

Users who have been inactive for several hours also have a significantly elevated chance to get a random effect

- Item requirements for Tool upgrades have been decreased

- Lucky Charm crafting recipe has been changed

- Lucky Charm now provides 60min of effect on use (from 20m)

- Ascension PP cost scaling has been changed

- Global Event Boost frequency has been increased

- Global Event Boost multiplier now *always* ranges between 5x-20x

- Numerous bug fixes and improvements

Including a fix for the infamous Web Client rendering bug, finally (!!)


---

## [The Fearsome Factions Update](https://blog.bconomy.net/2024/08/19/the-freaky-factions-update/) — *2024-08-19*

A game update for Bconomy has been released.

## Additions

- Significant changes to Faction functionality

Deposited Bcoins are now converted to Faction Points (“FP” in-game)

- Faction Level has been removed from the game

“Total FP Deposited” and “Monthly FP Deposited” are the metric for measuring a faction’s power and activity level

- Existing factions have had BC spent on leveling added to their Total FP Deposited counter

- Boosts: FP can be consumed to trigger faction-wide loot action boost multipliers

Faction Boosts increment by steps of 0.25x, up to a total of 5x

- Increasing the Faction Boost level also increases FP consumption per second

- Faction Boosts can be active forever, depending solely on whether there is FP available to consume

- Changing any Faction Boost will incur a 20 minute cooldown on further changes to that action’s Faction Boost

- Faction Customization: Factions can set tags, which are identifiers that display in front of members’ names (like “[EPIC] Wewert”)

Faction owners can set a “Message of the Day” (shown to members) and an “About” description (shown to the public)

- Ability to transfer faction ownership re-enabled

- Number of pending join requests are shown to faction members with adequate permissions directly on faction info page

- Faction changes (Receiving a join request, promotions/demotions, changing a boost) are now logged to the Faction’s chat channel

- Random Effects: Buffs can randomly trigger whenever an Action is performed

Effects provide multipliers to a random loot-bearing action

- Rarer effects last longer and provide more significant multipliers

- Random Effects have an equal chance of occurring when an action is run, regardless of charge %

- Rare Items: A new class of Item that may very rarely drop from loot-bearing actions

Standard multipliers don’t affect Rare Item drop rates

- Each Ascendant Tier increases Rare Item base drop rate by 25%

- Existing Rare Items have been renamed, their base worth modified, and/or had their use in crafting recipes changed depending on historical difficulty to obtain

- Rare Items with higher base worth are more elusive and drop less frequently compared to those with relatively lower base worth

- Stats: FP Contributed (Lifetime, All Factions) and Rare Items Found now tracked

Display Stat: Track a live-updating statistic on your Balance card (visible to both you and all others)

- Leaderboards: All Stats, Factions and Items are now tracked on leaderboards

Stat and Item leaderboards are available both globally and per Discord server

- Pin Sorting: Control the order which pins appear in your Inventory

Due to platform limitations pin management is only available on Web Client at the moment, but changes will instantly sync to Discord client as well

## Changes

- Grand Hall crafting recipe difficulty increased (to ~300k base worth)

Each Hall now grants +1M vault capacity (from +100k)

This increase applies retroactively to already used Halls

- Crafting recipes for some items were slightly modified for balance reasons

- Exotic Bean, Soybean, Wheat, Potato are now harvestable from farm

Big Log & Clover grow time and base worth have been changed

- Highest tier of action boost items now require at least one Rare Item to craft

- Faction Ranks now grant different sets of permissions

This is visible through an in-game reference menu

- Number of Grand Halls applied to Faction is now uncapped

- Watering changes: Watering your plots will yield both Weeds and Red Mushrooms each time

Number of Weeds/Mushrooms increases by number of active plots

- Watering cooldown increased to 30m (from 20m)

- Watering now decreases crop grow time by 10m-30m

- Ascension Cost scaling has been changed to move in tandem with rank costs

- “Instant Replay” Prestige Perk removed due to unexpected behavior

- “Hype Train” Prestige Perk temporarily removed while game balance is evaluated

This Perk is likely to return in a later update

- Some faction changes by other members now immediately live update for all users logged into the Web Client (instead of requiring an app reload)

- Market logs now show price per item at time of purchase

- Base work earning increased by ~2x

- Fancy Crate loot table has been modified to drop immediately usable action items rather than their crafting ingredients

- Random Action Boosts (global) frequency significantly reduced

- Major backend changes to data storage & structure

## Developer Notes

Hey folks! This update introduces a lot of significant changes that will most definitely shift the game balance in an unexpected direction. The introduction of Faction Boosts and Random Effects aims to reward players for doing beneficial actions in-game and reduce the reliance on the Random Action Boosts which are entirely out of anyone’s control. Multipliers that are comparable to the previous meta should still be achievable, but will require collaboration and more planning. I will be monitoring the game balance very closely over the next week and making rapid adjustments, so don’t expect the actual numbers for boosts/costs/etc to stay the same for an extended period.

As always, thanks for playing!
-Wewert


---

## [Game Patch](https://blog.bconomy.net/2024/08/09/game-patch/) — *2024-08-09*

- Fancy new graphics for added and renamed items from previous update

- Renamed some items changed in previous update

- Fixed a critical bug with Discord UI display


---

## [Game Update – Laying the Groundwork](https://blog.bconomy.net/2024/08/09/game-update-laying-the-groundwork/) — *2024-08-08*

A game update for Bconomy has been released.

## Additions

- Item Overhaul: Significant changes have been made to Bconomy’s items

Many unused items have been given new names and crafting recipes and uses

Players who owned these old items before the update will still have the same amount of these items, just under the new name

- Some existing crafting recipes have been tweaked to account for changes/new items

- Boost Items: Several items have been added or changed to grant action boosts on use

These items grant temporary boosts to a specific type of loot-bearing action (Fish, Hunt, Explore, Mine)

- Boost items exist in different “tiers” by crafting difficulty – those that are more difficult to craft grant a longer lasting boost

- Only one of each item may be active at once, but boosts stack multiplicatively with Tools, Events, Perks and other active boost items

- Trophies: Special memorials given to those with exceptional achievements!

A player’s earned trophies are now viewable

- Trophies that are earned more than once will stack (for ex: a user who achieves top Burn for five days will see a 5x next to the respective trophy)

- Legacy Trophies have been migrated to the new Trophy system and are viewable

- Triumphs: View a user’s crowning achievements on their Profile card

Highest leaderboard standing for Rank, Balance, Burn and Coinflip are displayed for players who are ranked within the top 1,000

- Users can also select a favorite Trophy to display on their Triumphs section

- UI Improvements: Pins, sorting and more

Pinning (favoriting) items for fast access is now available on Discord and syncs with Web

- New sorting and display options for Web inventory

- Farm: Clover and Big Log are now growable in plots

## Changes

- Work: Earning rate changes

Slightly lowered maximum bonus (base earn is unchanged)

- Each Faction level now grants 0.5% earning bonus (down from 1%)

- Misc: Bug fixes, UX improvements, and more

- Backend changes and optimizations


---

## [Bconomy is Back (2024 Relaunch)](https://blog.bconomy.net/2024/08/06/bconomy-is-back-2024-relaunch/) — *2024-08-06*

After 10 months of development, I’m so proud to announce that the **Bconomy 2024 (Soft) Relaunch is online!** I wrote a lengthy post detailing my personal journey in our Discord’s Alerts channel. In short, I’ve reignited my passion after overcoming some personal circumstances. I spent the last year taking on the insane task of rewriting every line of the Bconomy codebase and reorganizing the project to be far more maintainable, bug-free and performant. After pouring literally hundreds of hours into this rewrite, it’s finally at a point where I feel like the game is fun to play again. I’d like to invite players both new and old to give Bconomy another shot. Here’s a brief rundown of what’s changed:

- Rebalanced & distilled core gameplay for a return to “classic” era of the game

- Streamlined Generator, Farm and Action Tools game mechanic updates

- Discord Bot & Web Client UI redesign with focus on polished visuals and ease of use

- Proper Faction recruitment and invite system

Bconomy veterans will recognize a lot of returning features, but keep in mind that the initial Relaunch state is far from my eventual vision for this project. Stocks, Pets, Minigames, Giveaways and Faction Expeditions are coming back in the next updates with entirely revamped mechanics. And there’s plenty more that I hope to add that you’ll just have to wait to see. I hope for the relaunch to serve as a solid foundation for the future of the game and that it is able to recapture some of that classic Bcoins magic.

**TL;DR Bconomy is fun to play again. Give it a shot and let me know what you think!**

As always, thanks for reading, and thanks for playing 🙂
-Wewert


---

# 2023 (14 releases)

## [Bconomy v8.2.0](https://blog.bconomy.net/2023/11/07/bconomy-v8-2-0/) — *2023-11-07*

A **major** update for Bconomy has been released.

## Gameplay Updates

**Action Tools** Amount of items earned from performing an action are now determined by *Action* *Tools*, instead of being Rank dependent. Tools are upgradeable with specific inventory items, and each new level adds a permanent multiplier to an Action.

Action Tools replace the old “Equip” system, and although are more expensive to upgrade, they allow players to reach multipliers higher than ever before. Rather than focusing on temporary equips, Action Tools allow players to build up lasting power in a tangible manner. Tool boosts multiplicatively stack with Event boosts.

Current Action Tool upgrade costs are temporary, and will likely change to require more cost/complexity/crafting in future updates. Additional Action Tool levels will also be added for higher Ascension tiers to keep up with rank and tier costs.

**Prestige Perks** The perks system has been improved and reimplemented, and is now fully accessible for users who have Ascended. Although only a limited selection of Prestige Perks are currently enabled, more will be added in future updates.

Users who used “Dormant Runes” in previous iterations of the Prestige Perks system have had the Runes automatically returned to their inventory. Dormant Runes are no longer usable for purchasing extra Prestige Perks.

**Bank Space** Bank space has been significantly increased to reach 25M at max Rank (in contrast to 10M) to keep up with the shifting game balance. This is further upgradeable to 125M with Prestige Perks. Interest rate remains the same at 15%.**
Item Changes** Bconomy’s item storage and crafting logic have been completely reimplemented in the backend. The old system had chronic issues, limiting what we could do with items and their interaction with in-game mechanics. This change should be mostly invisible to users aside from some items temporarily losing their crafting recipes, renaming certain loot items, and slight base worth adjustments. Some items have received new icons on the Web Client.

**PP Changes** PP is once again used first (instead of BC) whenever ranking up or ascending.

**Market Changes** Placement of bid orders on the Market has been disabled.

## Platform Updates

**Web Client Overhaul** This update represents the largest overhaul to the Bconomy Web Client since its release. Nearly all major aspects of the Web Client have received a massive facelift, which includes consistent styling changes, functionality improvements, and new fancy animated UI elements.

**Inventory Management** A long-awaited feature, the Web Client now includes drastic improvements to game item management. Items are now sorted by category (Craftable, Material, Loot, etc) and include clear at-a-glance indications to current usage and status. Items are now multi-selectable by tapping on the item’s icon, and can be bulk managed. Keyboard shortcuts like shift-clicking and Ctrl-A are functional.

**Misc Changes** Optimizations have been made to client-server reconnect logic, greatly lowering latency in re-establishing server connection with game data caching. Bank balance live update now smoothly increases. Default text command prefix is now “/” instead of “b”. Farm and Gen status now dynamically update. Improvements to Discord client downtime reporting (Discord client may be offline for a few days before stabilizing). Various misc. improvements and bug fixes.

## Dev Notes

Hey folks! This update to Bconomy is one of the most significant we’ve had in a while. Although there isn’t much in strictly new content, the aim of this update is to allow the game to better exist as a standalone experience with improvements (both gameplay and otherwise).

Although Bconomy has featured 100+ items and a robust crafting system for much of its lifespan, there hasn’t been much of a reason to *do* anything with most of those items for the longest time. I’m hoping to nudge the game in a direction where items are ingrained in the main game loop, and players are rewarded for intelligently managing them rather than instantly converting to cash. Not much of this design philosophy is currently present, but the Action Tools system is a small peek at what can be expected in the future (goals that have lasting effects and require a diversity of actions to achieve).

Like the previous update, the majority of this update’s work was put into backend changes. Although these are usually invisible from a gameplay standpoint, they will make adding new content in a sustainable manner significantly easier in future updates.

As always, thanks for playing!

-Wewert


---

## [Minor Update (10/16/23)](https://blog.bconomy.net/2023/10/16/minor-update-10-16-23/) — *2023-10-16*

-Leftover bug fixes and improvements to Discord client

-Slight adjustment to farm crop harvest rewards


---

## [Bconomy v8.1.0](https://blog.bconomy.net/2023/10/16/bconomy-v8-1-0/) — *2023-10-15*

A **major** update for Bconomy has been released.

## Changelog

- **Web Client** Improvements have been made to the web client.

- **Optimizations** Significant performance improvements (especially on mobile and low-power devices) and reduced visual lag.

- **Layout Changes** Chat window, tab navigation, and console layout have been changed for improved access and visibility.

- **Particle FX** Fancy HD particle effects for completing certain actions have been added! This can be disabled in settings.

- **Command Improvements** Fixed issues with text commands and enabled custom command prefix in settings. Upgraded “bhelp” menu with improved formatting.

- **Faction Browser** Browse factions directly from the web client. Searching by name and sending join requests will be added in a later update.

- **Market Improvements** Market view now has a dedicated tab with Ask, Bid and Base price available at a glance. Market logs are now visible as well. Listings popup has been improved with a capacity usage bar.

- **Searchable Items** Items on the Inventory and Market view can be looked up with a search bar.

- **PWA** You can now add Bconomy to your mobile device’s home screen and let it behave like a native app. Notifications will be added at a later date.

- **Misc** Other general web client improvements. Improved functionality for Burning/RPS and added ability to look up users by BCID.

- **Chat Events** Chat events have returned, with changes to prevent clogging up message history.

- **Open Trade** Restrictions on “Legendary Item” transfers have been removed, and all items are now freely tradeable on the Market. Moving items between users outside of the market has been temporarily disabled.

- **Bank Changes** Ability to draw specific amounts from the bank has been removed (as a balance change and preparation for new Prestige Perks).

-  **Local Accounts** Ability to play on the web client without registering has been re-enabled.

- **Backend Improvements** Significant changes have been made to the Bconomy backend including optimizations, data storage changes, code modernization, etc. These changes should be invisible to most users.

- **Bug Fixes** Large amount of miscellaneous bug fixes on web client, Discord client, and backend.

## Developer Note

Hey folks! This update is mostly improvements to Bconomy’s “foundation” rather than new additions. Many of the major changes aren’t visible to players since they involved significant alterations to the Bconomy backend codebase. Although I know we’ve all been eagerly anticipating new features, this update was sorely needed to make developing new content sustainable.

Coming updates can be expected to restore core functionality (ex. faction invites, prestige perks, stocks) and add further QoL improvements (tutorial, graphics upgrade, UI improvements) before I will return to adding new content. Hopefully I can sneak a minor Winter/Holiday seasonal event in there as well. I know it’s not as exciting as a full-fledged Pets update, but good things come to those who wait!

As always, thanks for playing!


---

## [Bconomy v8.0.1](https://blog.bconomy.net/2023/08/27/bconomy-v8-0-1/) — *2023-08-26*

Bconomy v8.0.1 has been released.

## Changelog

- Temporarily disabled chat events.

- Backend updates, uptime reporting, and stability improvements.

## Pets Update Sneak Peek

Please forgive the radio silence! I’ve been chipping away at a real Pets Update/Overhaul over the last few weeks. Here are a some planned features (many of which are already added to the dev build):

- 

**Special Abilities** Based on its species, each Pet has a special Ability that grants it powerful buffs to either you, or itself, actively and/or passively. Although these Abilities do not directly increase in power with level, they can provide stackable boosts to items discovered or stats (which DO increase by level).

- **Revamped Leveling** Pets now reach Level 100 max, and are able to Ascend. Each Ascension resets the Pet’s level, but unlocks an additional Ability for it.

- **Pet Adventures** Send your Pets on Adventures to gain items. Based on its species, each Pet will be able to target specific items on an Adventure. Pets will interact with other Pets users have dispatched on their own journeys, so look out for new friends… or pack a weapon for defense!

- You’ll be able to view items collected by a pet mid-adventure, and recall them back to you without penalty to maximize efficiency.

- **Shinies!** Pets will have a small chance of having a special coloration (<5%), and a VERY VERY small chance of being Shiny (<<<1%). These visual upgrades will apply retroactively to already existing Pets!

- And more???

Unfortunately I can’t provide an ETA for this update but I am really having fun making it, despite somewhat slowed progress, and can’t wait to drop it. Stay tuned for further updates, and thanks for playing!


---

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/14/bconomy-zero/) — *2023-07-13*

-Renamed Fertilizer to "Manure" and it is no longer craftable, instead it's Hunt loot. Re-enabled for use on crops (-30M for all).

-Fixed Hard Drives not being able to be used multiple times in one command, and not updating Web UI when used.

-Fixed Tractor autoharvest added # being inaccurate on send message.


---

## [Bconomy “Zero” – Update 4](https://blog.bconomy.net/2023/07/12/bconomy-zero-update-4/) — *2023-07-11*

–**Giving Money and Items Re-Enabled!**

To use: Visit the *#marketplace* channel in the Bcommunity Discord Server and use the command `bgivemoney` or `bgiveitem`. Currently this command only works in the Community server **and requires both sender and recipient to have Prestige 1 or higher**. These restrictions will be lifted or modified as I monitor the commands.

–**Large Bug and UI Fixes**

*Discord Client:*

Fixed crashes on viewing cooldowns from Discord.

Farm view now shows autoharvested crops since last check and Generators now shows earnings from last claim, OR time until next claim – thanks @stackrstarve1500 for reporting!

Autosell fixed (for real this time) – ty @stackrstarve1500 for report

You can now confirm Bcommands executed on Discord.

Other general fixes and improvements also implemented.


---

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/11/bconomy-zero-2/) — *2023-07-11*

-Updates to random events and action boosts to be slightly less common, slightly lower rewards/multipliers, and add more funny messages

-Fix numerous bugs:

Autosell not toggleable from Discord client (Thanks @stackrstarve1500)

Long-term Bank bugs (losing money on withdraw, not useable from Discord client)**
NOTE: If you lost money from this please open a support request** if you have not already

-Temporarily disabled Prestige view from Discord client to prevent confusion

-Misc improvements


---

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/11/bconomy-zero-3/) — *2023-07-10*

-Fixed certain items not displaying properly on Discord client

-Fixed certain button interacts causing errors (in Market All view and Item Info view)

Thank you @henpod__5 for reporting!


---

## [Bconomy “Zero” – Update 3](https://blog.bconomy.net/2023/07/11/bconomy-zero-update-3/) — *2023-07-10*

-New Events: **Random Events** and **Action Boosts**

**Random Events** spawn randomly in chat and last for 15 minutes. Anyone who sends a message in chat from Discord or the Web Client in the meantime receives the rewards.

**Action Boosts** replace the Finger Snaps and will cause for boosts from 3x (more common) to 20x (rarer). Like Finger Snaps, these stack with item boosts (for ex. 10x Mine Boost + 4x Diamond Pick = 40x Boost)

-Web UI has been updated with improvements, and a live display of active boosts, and total boost multiplier on top of action buttons. Actions no longer log into the General channel (Console only).


---

## [Bconomy “Zero” – Update 2](https://blog.bconomy.net/2023/07/09/bconomy-zero-update-2/) — *2023-07-09*

-Web Client chat history now shows a log of previous messages sent on first load. This syncs with deleted and edited messages on the Discord side.


---

## [Bconomy “Zero” – Update 1](https://blog.bconomy.net/2023/07/09/bconomy-zero-update-1/) — *2023-07-08*

-Server migration has finished and both web and Discord client are stable. Thanks for your patience!

-Major facelift and redesign was applied to [https://bcono.my/](https://bcono.my/) to show registered user count, showcase of Bconomy on web and Discord, provide links to Community server.

-Web Client received multiple changes to improve gameplay and user experience (these were coded months ago, but never made it to Live until today)

-Addressed multiple crippling bugs preventing proper gameplay in the Discord and Web Client. Both should be fully functional once again.

-Re-enabled chat relay between Web Client and Community Server with fixes to prevent ping abuse.

-Misc. performance improvements, fixes, etc…


---

## [Bconomy Announcement](https://blog.bconomy.net/2023/07/08/bconomy-announcement/) — *2023-07-07*

-I will be migrating the main server the Bconomy services are hosted on over the next few days. Expect some downtime for the web interface and Discord app.

-In the coming month, I hope to iron out any remaining bugs in the base game that are present on the Discord and Web client, as well as finish up any missing features that were dropped in the core game rewrite (faction invites, etc).

-Classic features (giving items and money, Community server GW, Faction warchest) will be returning in their original state, with no caps, restrictions, etc in place.

-"Automated" seasonal content will be added (custom Web themes, special boxes, etc) to keep the game fresh, even in long periods of decreased development.

**It's fairly obvious that Bconomy has been left in a state of disrepair over the last few months. It would be an absolute shame for this project to fade away – the least I can do is patch up core functionality and apply a fresh coat of paint so that it's still enjoyable. These fixes won't happen overnight but I'll be doing my best to shore up the core gameplay in my free time or if I need a break from other endeavors.** Many of these fixes may be implemented in small increments and won't be publicly announced to prevent spam.

Thanks as always.

-Wewert


---

## [Q&A Session – Feb/March 2023](https://blog.bconomy.net/2023/02/24/qa-session-feb-march-2023/) — *2023-02-24*

Hey folks – I'm currently holding a casual Q&A session for the next 24 hours on the Bcommunity server about the game, its future, and everything in between. Hopefully this will become a monthly or bi-monthly event. Drop by if you have the time!

[https://discord.gg/kq8ERdxF](https://discord.gg/kq8ERdxF)


---

## [February Community Update](https://blog.bconomy.net/2023/02/01/february-community-update/) — *2023-02-01*

Hey folks! Just wanted to provide a quick update. Unfortunately I've been recently busy as of late but be on the lookout for (hopefully) multiple updates coming out soon.

-Finger Snap rework: Becomes an innate ability at **Tier I** and only affects yourself**
-Finger Snap perk: Boosts finger snap power and lowers cooldown rate

-Random Events comeback: Now *stack* with finger snap! Rarer but more meaningful

-Web Client fixes, revamp, notifications

-Return of trading/giving/market improvements

-Balance changes, especially for higher Prestige lvs

Additional note: Campaign ends on February 15th** and rewards will be distributed. Be sure to squeeze out those last few quests before then!

Best,

-Wewert


---

# 2022 (76 releases)

## [Happy Holidays 2022! – Quick Note](https://blog.bconomy.net/2022/12/26/happy-holidays-2022-quick-note/) — *2022-12-25*

Happy holidays everyone! Today's update will be rather short but just a heads up that **all patrons who subscribed after the Oct 1, 2022 billing cycle have been refunded** due to imbalances in the ecosystem. I was personally dissatisfied with the state of the game at that time and decided to refund all who subscribed on Patreon after that time because I felt issues in balance and quality were not addressed. You may keep any items or rewards you received from subscribing. **Please do not resubscribe at this time** – you will not be able to claim any rewards! We are working to reopen our Patreon page after more content is reinstated and you can resubscribe any time after. More news and updates are right around the corner, including the return of Boost Events and a complete rework/buff for Finger Snap – so stay tuned!

Another reminder that **Bconomy Official Hub** (linked through our website, [https://bcono.my/](https://bcono.my/)) is the **ONLY OFFICIAL DISCORD SERVER for Bconomy! Don't get scammed!** We will **NEVER** attempt to contact you through DMs or request irrelevant information. If you need account or donation support **please only open a ticket through our official server** and **only accept Bconomy support through our ticket system!** Community server staff are not officially affiliated and as such cannot help with account issues or bug reports.

Again, a rather brief update but there's a lot coming up! Happy holidays and 2023 is looking brighter than ever 🙂

-Wewert


---

## [Bconomy v7.0.0! – Winter Event, Web Client, Game Balances and More!](https://blog.bconomy.net/2022/12/18/bconomy-v7-0-0-winter-event-web-client-game-balances-and-more/) — *2022-12-18*

It's here! The **Version 7** update of Bconomy has gone live after months of frontend and backend work and extensive testing by our awesome Preview gang. With this update many difficult but necessary game balancing changes were made (refer to the December 2022 Changelog for more info) and we transition to a hybrid browser game with our **NEW Web Client!**

  **Head over to [https://bcono.my/](https://bcono.my/) to check out the new Web Client!****
I've always wanted to make a browser experience, and as Bconomy has grown from a simple economy game to feature crafting, farming, pets and more, this upgrade made perfect sense. Check out music, SFX, animations, graphics, convenient shortcuts, text commands, and more** along with in-game chat linked to our Community Discord server. Let me know if there are any suggestions or feature requests! It's only a start and we plan to add MUCH more as time goes on.

❄️ **Winter 2022 Event****
We're a bit late to the party but our Winter 2022 Event** kicks off NOW! Grab quest rewards, refreshed Crate loot, and XP to collect   **Stockings**, ❄️ **Snowflakes** and tons more loot! Celebrate with **snowfall animations** and **holiday music** on the Web Client! This event will run though January and February and more quests and quest rewards will be announced as time goes on.**
⬆️ Bconomy v7.0.0 (continued)**

☯️ **Game Balance Changes****
Significant game balance changes have been made to rank and Ascend costs, item uses, crafting, farming/generators, and more. These changes serve to compress progression as well as make day-to-day gameplay more dynamic and exciting with more items to collect. The primary purpose is to reel back many unbalanced elements that were introduced throughout our two-year history. Pacing (rank costs, etc) may be a bit slow but we plan to adjust as needed. Thank you so much for your patience and understanding through these significant changes.

☹️ Where are my Pets/Perks/Stocks/Trades/etc…?****
Due to the massive scope of a rewrite of the backend game code, changes in data storage, and learning of how to code a front end UI (by one person!) unfortunately not all features were able to make it into v7. But don't worry! They'll come back as soon as possible** and rebalanced to play a more significant goal in the overall game ecosystem. I don't have a hard ETA for these unfortunately but understand that reintroducing these features is my top priority for development after ensuring game stability. But don't fret, you haven't lost anything!

  **Closing Thoughts**

This launch represents months of learning, coding, and testing and I hope you enjoy the new client and gameplay changes! There's so much to look forward to, with the Pet Expansion on the horizon, mobile apps for the game, and interactive gameplay online. Thanks for sticking around – and stay warm out there! 🙂

-Wewert


---

## [Bconomy v7 Updates – Coming 12/18](https://blog.bconomy.net/2022/12/16/bconomy-v7-updates-coming-12-18/) — *2022-12-15*

⏱️ Due to personal scheduling reasons the v7 update will be pushed a bit earlier to **12/18**

  The web client preview has been updated to a near-final state! You can check it at [https://bconomy.net/](https://bconomy.net/) (report any bugs in chat!)

 ️ Long-awaited **bCommands are returning! (bw, be, bf, etc)** – due to Discord limitations they will only be available in the Community server upon the v7 release.

❄️ The **2022 Winter Event** is just around the corner! Sit by the fire and relax with a new campaign, more items, and Web Client theming/music!

✨ Due to game balance changes many Prestige Perks will be **temporarily disabled** as the new ecosystem settles.

  Pet features will be **temporarily disabled** as well (I will work to get these back ASAP once v7 is stable)

 ️ Voting has been replaced by **Daily Rewards** which grant Quest Rewards and Shards in addition to crates. These will be claimable from the Web Client (no ad-viewing required!)

This update has been in the works for months and I've spent hours creating the Web Client and rebalancing the game, and I'm so excited to finally release it! Looking forward to the launch date 🙂

-Wewert


---

## [Public Web Client Preview](https://blog.bconomy.net/2022/12/12/public-web-client-preview/) — *2022-12-11*

It's finally here! As previously announced, **the Bconomy Web Client will be open for ALL USERS** to play with **for the next ~48 hours.** This is a PREVIEW DEVELOPMENT build and **ALL DATA CAN AND WILL BE ERASED**, it is only intended to gather community feedback and test for bugs. Do you have a spare moment and want to check out what's in store? Take a peek and let me know what you think! Available for Desktop and Mobile.

  **Web Client: [https://bconomy.net/](https://bconomy.net/)**

-Wewert


---

## [Dev QnA](https://blog.bconomy.net/2022/12/11/dev-qna/) — *2022-12-10*

Hey folks! I'll be hanging around the Community Server soon for the Live Developer Q&A where you can ask me any questions about the game, where it's headed, and anything else in between. If you're not already there, you can join at: discord.gg/bconomy**
I am SO excited to reveal more details about the Web Client** in the coming days and there have been many new feature and UI additions! If you're available and want to find out more about the game's future or have a few minutes to spare and want to chill, join us!

-Wewert 🙂

Hello everyone! I'll be online and answering questions in (Discord channel) via text chat for the next few hours. Possibly voice chat if there is enough interest but I would like answers to be viewable afterwards so most likely mainly via text. Stop by if you can!


---

## [Live Developer Q&A and Public Web Client Preview – Saturday 12/10!](https://blog.bconomy.net/2022/12/04/live-developer-qa-and-public-web-client-preview-saturday-12-10/) — *2022-12-04*

Hey folks! I'll be active for a few hours on the Bcommunity server for a **LIVE Q&A session on December 10 around 8PM EST!** You'll be able to ask questions during the event about the game, plans for the future, upcoming content updates, and ask about suggestions. I'll be answering questions in chat as well as possibly in a voice channel (if there is enough interest!), if you're available please stop by and hang out with us! I'll also look to set up a way to send questions before the event if you aren't able to make it.

 ️ During Saturday and Sunday I will also be opening up the **initial version of the Web Client** for public testing! As our Preview Testers have found out it's a bit barebones, but you'll be able to catch a glimpse of what's coming to the game as well as help make sure multiplayer features work properly. All users will be able to access the pre-release of the Bconomy Web Client for Mobile and Desktop, from right after the Q&A session ends until Monday.

Join our Bcommunity at discord.gg/bconomy – I hope to see a lot of new and old faces there!

-Wewert


---

## [Web Client Update!](https://blog.bconomy.net/2022/11/19/web-client-update/) — *2022-11-19*

Hey all, this update is here to provide some progress info on web client development. Most of the main gameplay has been ported already so I have been spending a huge amount of time on polish and UI. You are now able to view **real-time leaderboards, stats, quests, and trophies** for all users, and **push notifications and in-app notifications** have been added and can be enabled! The client is now fully optimized for mobile as well as desktop which means that **you will be able to install it as an app or shortcut on Android and iOS devices (!!!)** at some point – most likely Android first since Apple has a very strict app policy and I will need access to a Mac PC to build the app.

In addition, for the 12/20 update **the Forge (melting items)** will be disabled and replaced with a new system sometime in the future. In addition **pet breeding will be disabled** and is likely to significantly change in the near future after the update so please be aware of these. These changes will also be updated on our webpage.

Thanks all and have a great Thanksgiving

-Wewert


---

## [Bconomy v6.3.1](https://blog.bconomy.net/2022/11/17/bconomy-v6-3-1/) — *2022-11-17*

-Bug fix for faction promotion not working

-Bug fix for farm crops not being harvestable

-Added alert for upcoming changes

-Stability fixes


---

## [IMPORTANT UPDATE ANNOUNCEMENT – 12/20 Balance Changes](https://blog.bconomy.net/2022/11/16/important-update-announcement-12-20-balance-changes/) — *2022-11-15*

**Please carefully read the following update changelog, especially if you are Prestiged! It is being announced early as it greatly shakes up the ecosystem and affects all users in one way or another.**

**Changes include:

-Disabled giving and exchanging of money and items

-Balance and inventory cap enforcement

-Prestige and Pet Level caps/scaling

-Disabling of certain items

-Faction Upkeep and Vault/Warchest Changes**

**These changes will also be announced in-game soon. You can read the full changelog at [https://bcono.my/2022update](https://bcono.my/2022update) (it's long!) to fully prepare for this update.**

Thanks for playing!

-Wewert


---

## [Major Announcement: Bconomy for the Web](https://blog.bconomy.net/2022/11/08/major-announcement-bconomy-for-the-web/) — *2022-11-08*

Pet expansion. Turn-based PvE & PvP. Faction wars. Interactive gameplay.

These are all features that have been teased throughout Bconomy's lifespan but have never seen the light of day. And they almost have, with prototypes being coded for each. But I've never felt comfortable with releasing these features and developing them in full because of limitations that we haven't been able to overcome… *Until now.*

Bconomy as a game has long outgrown the simple economy simulation it began as. Crafting, hundreds of in-game items, a multitude of mechanics, player-based organizations, and incredible community efforts have found their way to this ecosystem, and over the years it has crept closer and closer to territory held by MMORPGs and multi-user dungeons. Yet I feel that it has never been able to evolve to that stage, limited by its static embeds and simple buttons. With this upcoming launch, we are able to break past the limitations of the Discord UI and offer more dynamic experiences.

To finally break the radio silence, I've been building a new client for Bconomy from scratch over the last 6 months and learning frontend development, and I can confidently report that most of the core gameplay has been fully ported and plays very smoothly. The client is fully compatible with mobile devices, and is fully themed with animations and custom color schemes. Previously removed features like **text-based bcommands** will see their full return (and new keyboard shortcuts), along with **immersive SFX**, **unintrusive CAPTCHA** and **interactive market and inventory management** that make you wonder how you even played the game without them! **I am hoping to release the Web client before the end of 2022, and open up a preview version for @Preview Tester members before the end of November.**

  **What about the Discord client?**

The new Web client is 100% compatible with the current Discord bot (which will retain its name as "Bcoins") and all progress is shared between them. The Web client also comes with direct integration with Discord text channels and profiles, meaning you will be able to receive and send messages fluidly between Discord channels and the Web client (for both public channels, and private channels users can create for their communities and factions).

**We will be continually supporting the Discord client fully** – if you have no interest in playing with the Web client then you have nothing to worry about, since our bot isn't going anywhere! You will see benefits, however, as it enables faster, active development for both platforms since the two will share a backend that is easier to maintain than our current system. But there may eventually be new experiences on the Web client that are not directly accessible from Discord.

⚖️ **Addressing Balancing Issues**

This is something I do not admit lightly, but it is my personal belief that the current gameplay of Bconomy is fundamentally broken in some aspects. Prior to the Web client launch there will be some very sweeping balance adjustments, including changes to reel in the core gameplay loop and reduce the power of some mechanics. To minimize the impact of such changes, they will be announced transparently at least a month in advance so users can prepare accordingly. I expect these changes to be controversial and for negative feedback from users, but I believe these changes are necessary for the longevity of the game. As so many more users than I originally anticipated have joined us on this journey, the game has evolved to a much more defined vision and its ecosystem has progressed – as such many aspects will need to be entirely changed to match where we are now.

As always, if you're still reading, thank you so much for playing. There is so much to look forward to!  

-Wewert


---

## [Bconomy v6.3.0](https://blog.bconomy.net/2022/10/30/bconomy-v6-3-0/) — *2022-10-30*

**-Heavy backend changes: Migrating to brand new host and upgrade to latest Discord API version****
-Internal database changes for better scalability and decreasing bot response time, and to prepare for v7**

-Stock market prices have been frozen and buying stocks is disabled for the moment

-Achievements have been disabled and will be merged into Quests in a coming update

-Voting has been disabled while we sort out backend changes. Your streaks will not be lost!

-Bet and Lottery gameplay features are no longer present

-Partner/Patreon rewards have been disabled for now

Balance changes for the next update will be revealed in 1-2 weeks hopefully. Have a spooky halloween!


---

## [Removal of Betting and Lottery](https://blog.bconomy.net/2022/10/18/removal-of-betting-and-lottery/) — *2022-10-17*

Today I was informed by Discord Inc. that Bcoins/Bconomy is in violation of App Discovery guidelines due to the inclusion of "features related to gambling". Unfortunately, this means that **all gameplay and features related to the "bet" and "lottery" minigames will be removed effective next update** so that we will be in compliance with Discord's requirements and can continue to fully operate on this platform.

I will be appealing and asking for clarification on this decision since we have *never* advocated for any true "gambling" or risking items of real-world value. Unfortunately, this ruling is otherwise entirely out of my control at the moment, and I will have to remove these features until further notice to stay 100% compliant. There is not much else I can say regarding this but I just wanted to post a notice so that the community is aware of the situation. Thanks for playing.

Best,

-Wewert


---

## [The following changes will go live on 10/30/2022](https://blog.bconomy.net/2022/10/16/the-following-changes-will-go-live-on-10-30-2022/) — *2022-10-16*

-Stock market prices will freeze and you will no longer be able to purchase stocks as the system is being completely redesigned. **Please sell your stocks before the end of the year as current holdings will be removed in 2023.****
-Achievements will be removed and no longer earnable since they will be merged into the Quests system. You have until 10/30/2022** to earn any rewards or Completionist trophies, since they will become legacy after – you'll never be able to get them again!**
-Patreon and Partner rewards will no longer be claimable after 10/30/2022** since we are resetting the donor system. Please ensure that you claim all outstanding rewards with `/patron verify` before then.

-God's Plan prestige perk will be disabled as item boosts are being replaced by the upcoming Pet system. You will be able to refund the perk any time before or after the update.

-Some backend rewrites – unlikely to impact gameplay but expect features like activity log to temporarily break.

These changes are in preparation of a coming update where we aim to focus on making core features more enjoyable and rebalance the game in the context of the current meta and state of the in-game economy. More details will be released leading up to the year end so stay tuned.

The Sept. 2022 balance changes will not be pushed to live for the foreseeable future. Due to community feedback I am re-evaluating many of them and will notify once they have been finalized and are ready to enter the live game. Thanks all!


---

## [October Update](https://blog.bconomy.net/2022/10/12/october-update/) — *2022-10-12*

Brief update today but I just want to let everyone know about the status of the bot. Due to extensive community feedback I have decided to delay the balance patch for at least 1-2 months and will make an announcement once the changes are finalized. I apologize for the lack of communication regarding the update. In addition I have a huge surprise to share with everyone regarding the game before the end of 2022 so stay tuned!

In addition because there are significant changes coming to the donation system **the Patreon will be paused meaning we will no longer be accepting donors for some time** because we are possibly changing payment providers due to increased flexibility (not requiring monthly subs) and because there are potentially game changing updates coming and we would like to re-evaluate the role of the donor system in the overall ecosystem. Donors can continue to enjoy their perks (thanks for supporing us!) but re-subscribing will be disabled until further notice.

Best,

Wewert


---

## [Upcoming Balance Changes](https://blog.bconomy.net/2022/09/07/upcoming-balance-changes/) — *2022-09-07*

These balance changes are expected to reach the bot on **9/30/2022 or later**. They are being announced now so users can make gameplay decisions in advance. Within 7-14 days of the update release, an announcement will be sent in the game system-wide. Changes are subject to minor adjustments. **Only changes that do not positively impact current players are noted in this announcement for fairness.**

(Discord emoji) **Uranium** base price from 800k to 250k

(Discord emoji) **Platinum** base price from 600k to 500k

  **Melting** recipes will be decreased across the board for all metals

  **Faction Commission** will no longer affect items and be replaced by a new mechanic

  **New Captcha System** with intelligent detection will require less captcha overall but Patrons will no longer be exempt

  **Stock Market Decay** – Stock market balance is **hard capped at 7.5B** and you will lose shares at random if you surpass this limit. If you have a stock balance of over 7.5B please lower your balance to under 7.5B before 9/30/2022

  **Top 20 Item** trophies will become Top 5 Item trophies

  **Increased Drop Rate** for less rare items, **Lowered Drop Rate** for rarer items and **Legendary Items** will be discoverable through all action commands


---

## [Bconomy v6.2.3](https://blog.bconomy.net/2022/09/04/bconomy-v6-2-3/) — *2022-09-04*

**-Bug fixes and QoL changes**

*Captcha now also provides a direct link to the image in case it does not render

No limit to number of crates that can be opened at once (reverted)

*`/inventory sellall` has returned as a command

*Fixed invalid hex codes being accepted as custom colors

*Fixed market buying not working for certain items

*Sell orders can now be listed at increments of 25 instead of 50

*Buy orders can now be listed at any (valid) price

*Fixed `/toggleping` command always causing an error

*Additional backend optimizations and fixes


---

## [Bconomy v6.2.2](https://blog.bconomy.net/2022/08/31/bconomy-v6-2-2/) — *2022-08-30*

**-Summer Campaign Ended – Thanks for playing!****
*Due to the Fishing Boost ending earlier than intended it has been extended for a week. Enjoy the end of Summer!*

 ️ Sigils have been distributed to all eligible users and Campaign Rewards can be claimed before the next Campaign kicks off. You can no longer earn Quest XP but quests are still available.

 ‍☠️ Treasure Chests are now openable! Unlock them to find pirate's booty, as well as the elusive Lunar Shard…

-Large number of bug fixes****
-Fixed equipped items being infinite

-Fixed lottery not triggering

-Fixed some timers not counting accurately

-Misc bug fixes and tweaks

*Known Issues***

-Levels being "lost" for perks that were heavily changed

-Certain listings are not purchaseable

I am aware of the many bugs currently in the bot and am trying my best to get them resolved ASAP. If you have opened a ticket I am working through the ticket queue – unfortunately it is well over 100 tickets, and I am trying to resolve a good amount per day. If you are still awaiting an answer I appreciate the patience and apologies for the slow response.

Additionally there will be some drastic balance changes coming to the bot. These will be announced at least 2 weeks in advance so that all users can prepare as needed before they are finalized, as well as to collect feedback and suggestions.

Best,

-Wewert


---

## [Bconomy v6.2.1](https://blog.bconomy.net/2022/08/28/bconomy-v6-2-1/) — *2022-08-27*

**-Weekly burn events have begun****
  At the end of each week, the users with the most amount burned will earn shards and more! Check the `/burn` command for more info.

-Resolve bugs with ranking up and bank**

If you lost any items or currency as a result of this glitch please open a ticket in the Support Server.


---

## [Bconomy v6.2.0](https://blog.bconomy.net/2022/08/27/bconomy-v6-2-0/) — *2022-08-27*

**-Complete migration to new database system****
 ‍  Although this update does not bring as many drastic front end changes, the backend handling system has been *near-completely* rewritten. This was a change long overdue, and allows us to support:

‼️ Quest reset and userdata no longer resets on bot restart****
‼️ Stock updates and events now trigger on the hour****
*Support for real-time gameplay. One step closer to faction wars, pet battles, and hopefully less rate-locking

*Additional security against item duplication glitches

*Higher data operation rates and allowing new features like the overhauled item market

-Real-time item market****
  `/sell` has been overhauled! All item sells (except for autosells) go through the Market now, meaning users can place buy orders and outbid the bot for desired items. This allows for better item price discovery and opens up new opportunities for advanced features to come.

-/burn command****
  `/burn` is a new command that allows you to… burn money. You aren't guaranteed to gain anything by burning money. Weekly burn events will allow you to earn prizes by competing for most money burned. More uses are planned for this feature.

-Prestige perk changes****
☁️ Cloud Storage – unlock up to 6 additional generator slots!

Nepotism, Holy Discount, and Green Thumb have been changed to allow for higher max upgrades at the cost of items.

-Weekly stats and stat leaderboards for Burn and Gamble****
-New trophies for item collection, pets, etc****
-Various bug fixes and improvements****
-More undocumented changes I probably forgot**


---

## [Summer Campaign Update](https://blog.bconomy.net/2022/08/19/summer-campaign-update/) — *2022-08-18*

Hi folks! The Summer Campaign has been extended to August 30th since I am performing a total rewrite of the bot's data storage backend which has been planned for a while, but the recent errors made it a higher priority. After this the campaign ends, Treasure Chests will become useable and unobtainable for a long time, so take advantage of this extension while you still can!

After the Summer Campaign ends you will no longer earn Quest XP until the next Campaign begins. Instead of a Fall campaign we are setting sights on a Winter campaign which will allow players to take advantage of the longer seasonal availability and more dev time for better quests and new features. There will still be seasonal bonuses for the Fall, and Quests will still be able to be completed as normal while there is no active Campaign.

Thanks for reading!

-Wewert


---

## [Hotfix Update](https://blog.bconomy.net/2022/08/18/hotfix-update/) — *2022-08-17*

The hotfix was successfully implemented and the bot appears to be running stable but will continue to be monitored. Unfortunately, due to how widespread the issue was and the sheer number of players affected, we were forced to rollback to the most recent snapshot of the data store (10h ago). All player data has been reset to the last snapshot – I understand this is not at all an optimal solution, but unfortunately it is the only one that is fair for all players due to the nature of this data loss.

I will be taking steps and implementing failsafes so that these kinds of issues will not happen again. If you have any questions or concerns please open a ticket in the Support Server.

Best,

Wewert


---

## [8/17/2022 Incident Report](https://blog.bconomy.net/2022/08/17/8-17-2022-incident-report/) — *2022-08-17*

Hi folks, found out there was a database error causing data loss. If you were affected by this bug please open a ticket in the Official Server with Activity logs if possible. A hotfix will be deployed in an hour or so as I reboot the database and fix the issue. Sorry about that everyone!


---

## [Quick PSA!](https://blog.bconomy.net/2022/08/17/quick-psa/) — *2022-08-17*

Some users have reported **issues** with **selling stocks, crops, and items** directly to the bot.

**Please be careful!**  This is a pretty bad bug, and you may loose a lot of items!

Updates from Bconomy Development may come around soon, keep your eyes peeled for any updates regarding this situation before selling to the bot!


---

## [Bconomy v6.1.6](https://blog.bconomy.net/2022/08/16/bconomy-v6-1-6/) — *2022-08-15*

**-New collectable trophies****
  Trophies are now automatically granted for users at the top of the leaderboards when they update. These include Collector trophies for the users who own the most of any item, Top 20 trophies for rank/money, and more! See if you can find them all!

-New trophy leaderboard for users with most trophies****
 ️ You may need to check your trophies for your number of trophies to be updated so you can rank on the leaderboard.

-Efficiency and charge percent now shown on commands****
⏱️ This provides an effective visualizer and explains to users why they may be receiving less loot than expected.

-Finger Snap rework****
  The Prestige Perk for Finger Snap has been changed to add a personal boost on top of the currently active one, rather than affect boost rates beyond 10x. This will help to balance out absurd trigger costs, as well as provide power users a way to level up their earning efficiency without skewing the economy.

-Warehouse now upgradeable to 15B****
  Items are now required for high level Warehouse upgrades! Pick wisely, as only runes won't suffice for some of these high levels anymore.

-Misc changes**

  Fixed captcha counting users idling as being active

Decreased item cost of some prestige perks

Additional bug fixes and optimizations


---

## [Bconomy v6.1.5.1](https://blog.bconomy.net/2022/08/14/bconomy-v6-1-5-1/) — *2022-08-13*

**-Captcha****
 ️ Another long-requested feature is here! The bot will occasionally ask you to solve a challenge in order to prove you're a human actively playing the game to keep it fair for everyone. We are testing the rate of these challenges and they will grow more sophisticated as we gather input so please let us know how it goes.

-Fixes and changes**

☢️ Reactors now take up 0 inventory space, and Lucky Charms are no longer classified as Legendary items.

Adjusted some prestige perk item costs

Misc bug fixes.


---

## [Item Adjustments](https://blog.bconomy.net/2022/08/13/item-adjustments/) — *2022-08-13*

Hello players! Upcoming changes include changing Lucky Charms to be non-legendary while Reactors will no longer take up inventory space. If you have any reactors you would like to exchange to 30M BC each please open a ticket in the support server – this offer will be valid for 7 days, until 8/20. Do note that legendary items will be given powerful uses soon with the Summon expansion so it is at your choice whether you would like to perform the refund. Thanks!


---

## [Lunar Shard Update](https://blog.bconomy.net/2022/08/13/lunar-shard-update/) — *2022-08-13*

Making a separate announcement for visibility – all Lunar Shards opened from 7-22-2022 to the v6.1.5 release were fully refunded to user inventories. The items you obtained from opening the shards *were not removed* and you can keep both the Shards and the previously dropped items. You can verify that you received your Shards by checking your Activity!


---

## [Bconomy v6.1.5](https://blog.bconomy.net/2022/08/13/bconomy-v6-1-5/) — *2022-08-12*

**-Prestige Perk changes****
  Some Prestige Perks now require items to upgrade as well. This serves as a way to balance out higher Perk levels to come and give them a place in the game, as well as provide more utility for items. Only 2 perks have this change for now so we can test for balance.

-Finger Snap changes****
  Finger Snap multiplier is now further upgradeable by spending Runes. Users have 5x-10x multipler by default, and each level can now increase the minimum or maximum multiplier.

-Lunar Shard changes****
(Discord emoji) Lunar Shard drop rates have once again been changed to be more fair for all users

*All shards opened from 7-22-2022 to the time of this update have been automatically refunded to all users, please check activity for receipt. Any items dropped were not removed and you can keep everything. Enjoy!*

-Item balance changes****
☢️ Reactor has been set as a Legendary item once again, and its crafting price has been raised.

(Discord emoji) Source Code now drops 1-50 of every non-Legendary item.

-Prestige changes****
Increase to higher Prestige costs to account for upcoming new mechanics and balancing

-Leaderboard changes****
  Added per-item leaderboards, a longtime request – now you can view the users who hold the most of any single item in the game!

  Leaderboard menus now come with a convenient drop-down menu for navigation.

-Trophy changes****
  Trophies command can now be used to look up other users, and has been added as a shortcut on others' pages.

-Additional fixes and optimizations**


---

## [Bconomy v6.1.4 (backport)](https://blog.bconomy.net/2022/08/09/bconomy-v6-1-4-backport/) — *2022-08-08*

Please see update history for changelog

*Lunar shard offer has yet again been extended to the time of this update. If you opened any lunar shard July 22nd – August 8th 2022 and would like it to be refunded please open a ticket in the Support Server.*


---

## [v6.1.4 Incident Report](https://blog.bconomy.net/2022/08/06/v6-1-4-incident-report/) — *2022-08-05*

Hey folks,**
If you've played the bot anytime in the last 2 days, then you're most likely very aware of the massive instability that occurred. I screwed up – the Bconomy core code did not play well with the new API, and unfortunately this was something I couldn't test in the dev stage because it only appears with high player counts. I've been debugging and implementing speculative fixes for this issue for every spare moment since the update launched but unfortunately nothing was able to alleviate the constant restarts.

What now?**

The bot has been reset to the last known stable version in the meantime. Over the weekend I will work on backporting the new features from the latest update to the previous API version, which will take a while, but it seems that it's the only option until I'm able to track down exactly what's causing the instability issues on the latest API version. This also means support requests and possibly the Fall Campaign will be delayed as well but I'm hoping this won't be the case.

I apologize if the bot's issues impacted your enjoyability in any way and we'll try our best to make sure future incidents aren't repeated. Thank you for bearing with us, and, as always, thank you for playing!

-Wewert


---

## [Instability Update](https://blog.bconomy.net/2022/08/05/instability-update/) — *2022-08-05*

Hey folks, I am well aware of the high instability present recently. I have been working for hours whenever possible since the update to resolve the issue and attempt to fix it, unfortunately nothing has seemed to work and life has gotten in the way so regrettably the update will have to be rolled back to a prior version. This will hopefully be temporary and no user data should be lost. I apologize for the unexpected change and will try to resolve this issue ASAP by the weekend. Thanks all.


---

## [Bconomy v6.1.4](https://blog.bconomy.net/2022/08/04/bconomy-v6-1-4/) — *2022-08-03*

**-Large backend update to latest Discord API version****
‼️ Please report any instability or unexpected behavior!

-Rob standardization: Robbery chances have been adjusted for fairness****
  New rules are self-explanatory on the Balance page – instant robbing and rob-locking will no longer be possible for high balance users, and gives a brief grace period to allow for high balances to be sorted out.

-New interface buttons for viewing other users' balance pages.****
-Faction fleets have been disabled****
 ️ In preparation for the upcoming Faction Fleet overhaul, current fleets have been disabled and you can refund units for their purchase price. Please refund your fleet before August 20th, after which the refund option will be removed.

-Finger Snap changes****
  Finger Snap events now range from 10x-20x and pricing has been increased. Hopefully this change allow the events to have more of an impact and feel special, while still being balanced and allowing for coordination in starting events and higher gameplay efficiency in shorter periods. This is a change that will likely be adjusted and possibly reverted.

-Lunar Shard and Rune changes****
(Discord emoji) Lunar Shards no longer drop Lucky Charms or Rankup Tokens and item drop rates have been modified. To prevent confusion the Celestial Rune item has been named to "Dormant Rune" to distinguish between the prestige currency and item.

*The Lunar Shard refund offer has been extended to any time between July 22 to the time of this update. Please open a ticket and we will refund any lunar shards used in this time frame upon request provided the dropped item(s) are still in your inventory.*

-Other fixes and optimizations**

✅ Fixed an issue with external emojis not displaying (due to a change on Discord's end)


---

## [Summer 2022 Status Update](https://blog.bconomy.net/2022/07/23/summer-2022-status-update/) — *2022-07-23*

Hello folks! Hope everyone is enjoying their summer (or any other season!). Life has been keeping me busy unfortunately but I want to provide some updates with the bot and things to look forward to.**
 ️ Summer Campaign****
The Summer Campaign will end on August 20th** and Quest XP will be locked. Treasure Chests will be usable and Sigils will be distributed to all eligible players, and your Campaign Level will be archived as a displayable trophy. The next campaign, **Fall Harvest 2022** begins early September with completely new quests, rewards, and much more!**
  Faction Update****
A Faction Update has been in the works which will completely overhaul the way fleets work. The details are still under wraps for the time being, but will allow factions to earn Items/BC as well as wage war against NPC enemies and other factions. Additional upgrades like Alliances and Faction Perks are also planned!

  Pet Expansion****
Though this is a long-term goal, a Pet Expansion is being planned which would add a huge amount of depth to Pets. Again, this is a very long-term goal which most likely will not become an addition for at the very least many months, but there are indeed plans to add more gameplay use to Pets. All current Pet stats and progress will be transferred over if/when this expansion goes live.

  Backend Changes**

Discord has updated their API recently which means that Bconomy will need to undergo some changes to future-proof the game and make sure there aren't any hiccups as more Discord features are added. This means there the next update might be delayed to ensure stability.

As always, thanks for reading!

-Wewert


---

## [Bconomy v6.1.3.3](https://blog.bconomy.net/2022/07/11/bconomy-v6-1-3-3/) — *2022-07-10*

**-Trading is back with `/exchange`****
♻️ Make off-market trades safely and without the risk of scamming with the long-awaited return of `/exchange`! You are able to specify items to send and receive, and the bot will verify that you and your recipient will be able to make the exchange successfully and also act as a middleman.

-Play against your friends in Rock Paper Scissors with `/rps`****
✂️ Another long-awaited command, `/rps` is back and better than ever with buttons. You no longer have to go into DMs to play against your friends. Like the exchange command the bot will also ensure fair matches and validate that both you and your opponent have the amount required.

-Daily transfer limits have been fully removed****
  Due to advances with our logging and auto-detection systems the daily transfer limit has been lifted and no longer affects faction deposit/withdrawal, as well as giving items.

-Finger Snap event pricing tweaks, now always 5x-10x****
  This change should help balance out the finger snap perk to a good place.

-Button usability fixes and improvements****
-"Community Booster" status now auto-managed by bot****
-Extreme Difficulty quests rebalanced to account for Commission, new Perk and Boosts****
-Additional undocumented improvements, bug fixes, and more!**


---

## [Bconomy v6.1.2.3](https://blog.bconomy.net/2022/07/04/bconomy-v6-1-2-3/) — *2022-07-03*

**-New `/createalert` command – Get alerts whenever the stock market updates or there are new events****
Allows users to set a role to ping as well. This command is limited to Patrons for now unfortunately because it is more resource intensive than just sending bot messages. Thanks Good Boy#0001** for the suggestion and feedback!**
-Quests are now backed up periodically by the bot and will no longer reset on update or restart****
-The `/activity` command now shows your maximum transfer and time until reset****
-Rare items located and autosold, as well as working income, are now displayed on the Activity page****
-Activity page tracked actions are now shown in hours instead of days****
-Users with non-ASCII (foreign characters, emoji, etc) usernames now display properly****
-Prestige Perks now have a "View Perk" menu that shows current level, more info about perk, and amt to max****
-Finger Snap changes: PP cost now depends on events of that type ran within 24h and is event-dependent to encourage more event diversity. Event boosts now also range from 2x-8x.****
-Harvest boost events are temporarily disabled until end of Summer Event for balance reasons****
-Large number of additional bug fixes and tweaks**


---

## [Bconomy v6.1.2.2](https://blog.bconomy.net/2022/06/30/bconomy-v6-1-2-2/) — *2022-06-29*

**-User logs are can now be looked up for any user****
Logs can be filtered for transactions only or all activity. Previous log data has been archived due to a change in log storing format making them now incompatible. Also fixed some buggy logging and log formatting. Market logs and rob logs show all users involved in the interaction.

-Fixed Active Prestige Perks having no cooldown at all times when maxed out****
Thanks Rutvik_Raut#2194** for letting me know about this!**
-Trophies are now visible to all users, footer trophy slot now also displays User ID****
-Finger Snap cost when attempting to start concurrent events increased****
-Party Mode giveaways now show User Avatars****
-Additional formatting, bug and stability fixes**


---

## [Bconomy v6.1.2.1](https://blog.bconomy.net/2022/06/28/bconomy-v6-1-2-1/) — *2022-06-28*

**-Balance Action and Cooldown buttons are now both active and accurately reflect cooldown status****
-Item Autosell: On the Item Info menu, you can now toggle if you want to Auto-sell any items you discover****
  Thanks Jcnas#3415** and all others for this suggestion!**
-Stock Market algorithm changed and now slightly favors increases****
  Stocks will still be highly volatile but this fixed an issue where stocks could trend downwards repeatedly. Now they should behave as expected and go both up and down.

-Patrons (and Community Boosters) can now list, transfer, and deposit Legendary Items****
-Cool Hands no longer affects Scratch Off****
Hopefully temporary change to fix Scratch-Off cooldown being calculated incorrectly

-Work Bonus frequency slightly decreased to account for Commission****
-Max Market list price to 250M, all items can be purchased from market****
-Bug fixes and other optimizations**

Note: Sigils are not currently being given out from the Quests system due to a glitch. The item will be granted to all eligible users after the current campaign is completed. Thanks!


---

## [Bconomy v6.1.2](https://blog.bconomy.net/2022/06/27/bconomy-v6-1-2/) — *2022-06-26*

**-All new New Player simplified button menu****
 ‍  New players now automatically use a simplified menu layout that only includes the essentials of the bot to help reduce confusion. This layout is automatically removed at Rank 30.

-Next Action button now includes Scratch-Off and is available on Balance page

-Numerous prestige perks have been reworked, buffed, and/or standardized, and new ones have been added as well****
  Events are now triggered solely by users through the use of prestige perks! The user who triggered the event is shown on the Cooldowns page.

-Faction Commissions added, max faction slots reduced to 50****
  Commissions are powerful boosts to user actions that finally add tangible benefits to being a faction member, with higher level factions proportionally increasing the Commission. This will hopefully incentivize teamwork in levelling up Factions in lieu of future additions like Faction Wars.

-Faction Level Cap raised to 250****
-Quests now show progress out of total needed to complete****
-Party mode for Giveaways has been added****
  Giveaways can now be set to Party mode, which broadcasts whenever a user claims just like legacy giveaways. It also comes with the benefit of allowing exactly who claimed when to be shown.

-Inventory info navigation now restricted to items you own****
-Lift Embargo is now 50M for all users by default****
-Rankup Token and Reactor are no longer Legendary items****
-Numerous bug/stability fixes and improvements**


---

## [Bconomy/Bcoins Minecraft is back!](https://blog.bconomy.net/2022/06/19/bconomy-bcoins-minecraft-is-back/) — *2022-06-18*

The Bcommunity Minecraft server has returned! Although it is no longer officially affiliated with the bot and does not allow you to earn coins in-game, you can still check it out and play with community members if you'd like. The IP is `bcoins.xyz` and you can join with Java or Bedrock 1.19!


---

## [Bconomy v6.1.1](https://blog.bconomy.net/2022/06/18/bconomy-v6-1-1/) — *2022-06-17*

-Legendary items now take up 0 inventory worth (most likely temporary)

-Pulsar and Voucher no longer break when over PP limit

-Crop 5x Boost now affects all cash crops

-Sigil use changed (mystery until the end of the event!)

-Additional bug fixes


---

## [Bconomy v6.1.0 – Summer 2022](https://blog.bconomy.net/2022/06/11/bconomy-v6-1-0-summer-2022/) — *2022-06-10*

**-Summer 2022 Boosts – 5x Fish Boost and 5x Cash Crop Earnings

-Quests are FINALLY HERE!****
In development since early-mid 2021, Questing is an elaborate system that aims to bridge the gap between users at every stage of the game and long-term progression, as well as provide another way to earn power items.

Quests are primarily item-retrieval based initially but more quests will find their way to the live bot as time goes on.

️ Quest XP is a new point system that allows for progression through seasonal events (Campaigns). *Think something like a Battle Pass, but with no option to pay for progression and more enjoyable to play through.*** For Summer, this will unlock Treasure Chests, themed items, Lunar Shards, Crates, XP modifiers, and much more! No two Campaigns are the same, You will also get a commemorative trophy upon the event ending.**
Lunar Shards and Celestial Runes are earnable from some quests! There is a ~3-5% chance of them appearing in a Hard Quest per reroll, and this chance is greatly boosted in Extreme Quests. Campaigns will always provide a reliable way to earn these as well.

-New Perk: Clean Slate – Decreases wait time until next Quest Reroll

-Celestial Uplink and Mystical Agriculture perks buffed

-New Items: Obscure Sigil

-Lunar Shard drops rebalanced to include new power items (Talisman, Charm, Voucher, etc)

-Reactor, Diamond Rod, Diamond Handknife, Diamond Pickaxe and Down Coat crafting recipes have been rebalanced

-Bankruptcy – Any stock that goes under 30 BC will get BANKRUPTED and all users with shares owned will lose their holdings in that stock. This is a temporary solution, but is needed to fix current issues with the stock market. Thanks Doc#0820 for the suggestion proposal and writeup – other solutions would have been far more detrimental.

-Legendary items are no longer transferable via any method

-Added Faction, Pet, Quest leaderboards

-Button usability upgrades

-Prestige perks can now be reset at a price

-Too… many… bug fixes…**


---

## [Summer Update – New Items Teaser!](https://blog.bconomy.net/2022/06/03/summer-update-new-items-teaser/) — *2022-06-02*

*Talisman (Replaces Shadowy Whispers)***
-Equippable

-Raises Insurance to 1B

-20 day duration

*☘️ Clover (Replaces Catnip)* and *☘️ Lucky Charm*

-Craftable from farm items and Manuscripts

-Small chance of nullifying a gambling loss when active

*Heavenly Voucher*

-Generates 15M-50M PP on use

-Ignores PP Storage limitations

*Lunar Shard* and * Celestial Rune*

-Now obtainable from Hard+ Quests

Which feature are you most excited about? These items, the long-awaited Quests update, and more coming June 10th!**


---

## [Bconomy v6.0.9.11](https://blog.bconomy.net/2022/06/01/bconomy-v6-0-9-11/) — *2022-05-31*

-Backend update for Questing system (not yet playable)**
DEV NOTE: The questing system is now fully working based on limited testing – this includes generating, progressing through, and completing the quests. It is not available to play yet, this update is just laying the groundwork and ensuring everything runs smoothly. Further testing will commence soon, and Quests are expected to launch with the Summer Update on June 10th!****
-Vote streaks now have a limit of 45** from 15

-Fixed issue where DMs could not be disabled via button

-Balance button locations and names rearranged to be friendlier for new players

-Bot now checks for permissions and displays an error message when missing them

-Bug and stability fixes


---

## [Summer 2022 Event](https://blog.bconomy.net/2022/05/30/summer-2022-event/) — *2022-05-30*

Get your beach umbrellas and sunglasses folks, because we're taking a trip down to the ocean! **The Bconomy Summer Event is back!** This time, we've got a whole lot of goodies for you guys – **Fishing and Farming boosts** are coming, in addition to **exclusive trophies, items, events, Treasure Chests and special quests** that will be making their way to the live bot as the season progresses! Be wary, though, as **pirate ships** loom on the horizon…

The event kicks off on **June 10th, 2022** – think cool, salty thoughts until then!

-Wewert

  summer time, lets go


---

## [Bconomy Website Update](https://blog.bconomy.net/2022/05/25/bconomy-website-update/) — *2022-05-25*

-All Commands page updated: [https://bcono.my/commands/](https://bcono.my/commands/)**
DEV NOTE: This page previously was broken but should now accurately reflect all aliases and commands for Bconomy. A few commands might be missing due to the page being built with an old version of the bot. Please suggest any aliases you want to see added to Bconomy, or any missing commands on the site!**

-New Partners section! [https://bcono.my/#partners](https://bcono.my/#partners)


---

## [Bconomy v6.0.9.10](https://blog.bconomy.net/2022/05/25/bconomy-v6-0-9-10/) — *2022-05-25*

-Faction leadership transfer has returned `/faction transfer`

-New inventory navigation menu and action buttons

-Robbery system standardization: ALL users with balance under 700M now have a 2 hour idle time before they can be robbed again.

-Angel Dust and Leaderboard Top 50 achievements are now Legacy

-DM Vote Reminders are back! These are disabled by default but you can enable them by visiting the Vote menu.

-Fixes for pet transfers and Vice City achievement

-Generator overheat change is now more accurately displayed

-Additional buttons and navigation improvements

-Multiple other bug fixes


---

## [The Bconomy Partner Program is back!](https://blog.bconomy.net/2022/05/24/the-bconomy-partner-program-is-back/) — *2022-05-24*

Do you have a community that you want to share the gift of Bconomy with? Then tell your server's staff to apply for our Partner Program!**
  Partner servers get awesome benefits including…****
-Server Perks on the house (yes, they're free)! – $25/mo+ value

-Ability to customize the bot to your server's theming and choice

-Millions of BC in monthly giveaway credit

-Perks for you and your staff

-Listed on our upcoming "Partners" section of [https://bcono.my/](https://bcono.my/)

-And more to come!****
Does this sound appealing to you? Then apply today!

  Partner Program Requirements:

-10,000 members or more

-Appropriate theming (No adult-centric servers, sorry)

-High activity level**

*Don't worry – there are no guarantees, but we'll try to lower the member requirement as we test out the program. You must be an admin of your server to apply – please reach out to your server's staff if you want to see Bconomy in your favorite community! We reserve the right to decline an application for any reason.*


---

## [Bconomy v6.0.9.9](https://blog.bconomy.net/2022/05/20/bconomy-v6-0-9-9/) — *2022-05-20*

-Large amount of button and UI fixes to make playing easier

-Menu for feeding buddy instead of bot attempting to choose for player

-Balance page buttons rearranged

-Confirmation menus for prestiging and buying perks

-Generators now show overheat modifiers

-Reactor item info page updated for clarity

-Bcommunity boosters can now claim customization perks

-Lots of bug fixes!!!


---

## [Bconomy v6.0.9.8](https://blog.bconomy.net/2022/05/18/bconomy-v6-0-9-8/) — *2022-05-18*

-Fixed issue causing items to randomly unequip

-Fixed issue with rob not consuming or displaying items

-Minor bug and stability fixes


---

## [Bconomy v6.0.9.7](https://blog.bconomy.net/2022/05/18/bconomy-v6-0-9-7/) — *2022-05-17*

-Multiple bugs fixed

-Additional donor system fixes


---

## [Bconomy v6.0.9.6](https://blog.bconomy.net/2022/05/17/bconomy-v6-0-9-6/) — *2022-05-17*

-Fixed error which caused Supporter rewards to be calculated incorrectly

@Legacy Partner @Donor Please double check that you received the correct rewards for donating or for being a partner! If you feel that something was not recieved, please open a ticket in (Discord channel) and I will get back to you as soon as possible. Thanks!


---

## [Bconomy v6.0.9.5](https://blog.bconomy.net/2022/05/17/bconomy-v6-0-9-5/) — *2022-05-17*

-Rob rule tweaks: Balance must not exceed 2x insurance or 75mil (whichever is greater) to obtain 4hr grace period for being uninsured, being robbed or attempted to be robbed incurs a 30min grace period. If you are above your 2x insurance or 75M limit then you are robbable 24/7 until you go below that limit.

in normal person words: whatever it says on your balance about if youre robbable is accurate


---

## [Bconomy v6.0.9.4.2.0](https://blog.bconomy.net/2022/05/17/bconomy-v6-0-9-4-2-0/) — *2022-05-17*

-Robbery system has been restructured to be fully consistent with what is displayed on your balance

You have safety from robberies if you are above your insurance, provided you have ran a command or hit a button in the last 4 hours, and your balance does not exceed 3 X your insurance or 20M (whichever is greater). Essentially this provides a ~4hr grace period for being above your insurance temporarily.

-Additional buttons

-Bug fixes


---

## [Bconomy v6.0.9](https://blog.bconomy.net/2022/05/16/bconomy-v6-0-9/) — *2022-05-16*

-Buttons now only respond to the user who ran the command being displayed. This should prevent confusion in large channels.

-"Next Action" button now exists for main actions for faster navigation

–`/rankup` and ascension have been rolled into the `/ranks` command

-Many minor UI and code tweaks

-Improved button navigation all around

-Edited buttons on Balance page

-Bug fixes… they never stop, do they?**

DEV NOTE: There have been requests for the ability to respec into prestige perks (Rune refunds) and this will be possible in a later update. It will likely require the use of PP and may be limited so that, for example, you can only respec X times per month, for example. More details to come, but do not worry if you don't like your current perks!


---

## [Bconomy v6.0.8](https://blog.bconomy.net/2022/05/15/bconomy-v6-0-8/) — *2022-05-15*

-Better navigation and button access across the board

-Full button and menu navigation for Generator Shop

-Bug and UI fixes (incl. Tagline not working for donors, Faction invites failing)**


---

## [Bconomy v6.0.7](https://blog.bconomy.net/2022/05/15/bconomy-v6-0-7/) — *2022-05-14*

-Giveaways are BACK!****
Giveaways are back, now faster, more functional, and easier to use! Donors can also deposit *into* their giveaway balance if they wish to keep holding events after they use up their credit.

-Plenty more bug fixes**


---

## [Bconomy v6.0.6.1](https://blog.bconomy.net/2022/05/14/bconomy-v6-0-6-1/) — *2022-05-14*

-Minor bug fixes


---

## [Bconomy v6.0.6](https://blog.bconomy.net/2022/05/14/bconomy-v6-0-6/) — *2022-05-14*

-Stocks UI given an overhaul – now fully button operable! Stock names and tags have also been changed.

-Added History for markets to replace market feed

-Added History for lottery to replace gamble feed

-Introduction now has a Skip button

-Huge usability upgrades for some command buttons (market, crafting, betting, etc)

-Fixed lottery pool display and actual payout inconsistency

-More bugs fixed. Squish squish!**


---

## [Bconomy v6.0.5.1](https://blog.bconomy.net/2022/05/14/bconomy-v6-0-5-1/) — *2022-05-13*

-Minor bug fixes


---

## [Bconomy v6.0.5](https://blog.bconomy.net/2022/05/14/bconomy-v6-0-5/) — *2022-05-13*

**-All new Introduction! This serves to replace the Tutorial from Bcoins and provides a concise intro to the game. It is accessible through the Help menu.

-New buttons that allow batch market buying, crafting, and feeding to buddy

-Betting has gotten a massive usability upgrade and is now fully button operational

-Misc added buttons for easier navigation through menus

-Global leaderboard Top Ranks now works

-"Classic" is now an inventory sorting method

-Plethora of bugfixes**


---

## [Bconomy v6.0.1.3](https://blog.bconomy.net/2022/05/13/bconomy-v6-0-1-3/) — *2022-05-13*

-Minor bug and stability fixes


---

## [Bconomy v6.0.1.2](https://blog.bconomy.net/2022/05/13/bconomy-v6-0-1-2/) — *2022-05-13*

-Voting has been re-enabled and is once again operational

Note: you may have to press the repair button to claim the reward

Vote Server fix: Repair no longer needed to claim votes


---

## [Bconomy v6.0.1.1](https://blog.bconomy.net/2022/05/13/bconomy-v6-0-1-1/) — *2022-05-12*

-Leaderboard has been restored and is fully working, and can be navigated in full with buttons

-Fixed issue where some commands would slip through in personal channels

-Various bugfixes


---

## [Bconomy v6.0.1](https://blog.bconomy.net/2022/05/13/bconomy-v6-0-1/) — *2022-05-12*

–**NEW FEATURE: PERSONAL CHANNELS****
DEV NOTE: Tired of getting crowded in public channels? Server admins can now create *personal channels* with `/setpersonal` which only allow you to see your own commands by button input. More complex commands can't be performed at the moment, but it's a huge improvement for public servers and mobile users!

–Robbery system now grants a longer grace period and works as displayed****
–Bot status command updated with player and server counts****
–New buttons and navigation menus for some commands****
–Many bug fixes and tweaks**


---

## [Aaaand we’re back!](https://blog.bconomy.net/2022/05/12/aaaand-were-back/) — *2022-05-12*

The bot is now operational again and user data has been reset to pre-v6 update status. Items were successfully converted to the new database structure so robbing issues should be resolved. If any progress you made since v6 was erased I'm sorry – this is a one-man operation and with the impending slash command deadline, I wanted to get a working version of the bot out ASAP so we had enough time to make sure we would have a strong foundation to build off on, even if it meant some rough edges. This will hopefully be the last database rollback we have to do for a while. Thanks!

-Wewert


---

## [A Quick Restart](https://blog.bconomy.net/2022/05/12/a-quick-restart/) — *2022-05-12*

Hey folks! I hope everyone has been enjoying v6 to some degree so far!

It seems that our launch was a whole lot more turbulent than expected, and some glitches and imbalances were found in the process. Unfortunately we will have to roll back our update by a few hours so your data will be reset to pre-v6 levels. This means we’ll have the chance to fix Diamond Shield issues, fix some critical bugs, and reconfigure some settings to make sure we put our best foot forward with this game-redefining update. The bot will be down for maintenance for the next 1-2 hours. I apologize for any unexpected issues this might cause and thank you for understanding.

-Wewert


---

## [v6 Postmortem](https://blog.bconomy.net/2022/05/12/v6-postmortem/) — *2022-05-11*

Looks like our launch was a lot rockier than I thought it would be! If you lost any items or progress due to glitches please open a ticket and we'll look into it. More info to come tomorrow regarding v6. Thanks 🙂 IF YOU GOT ROBBED DUE TO SHIELDS GETTING DISABLED PLEASE MAKE A TICKET IN THE SUPPORT SERVER I will fix your issues in a day or two. Thanks!


---

## [Bconomy v6.0.0](https://blog.bconomy.net/2022/05/12/bconomy-v6-0-0/) — *2022-05-11*

Changelog:**
Nothing will ever be the same.**


---

## [A New Name](https://blog.bconomy.net/2022/05/09/a-new-name/) — *2022-05-09*

I regret to inform everyone that Bcoins will no longer exist once v6 is released… because **Bconomy** is better in just about every single way! That's right everyone – we're officially renaming to **Bconomy for Discord** once the v6 update releases!

The name change might be a bit hard to adjust to at first, but we think not getting confused for a cryptocurrency is a good reason to change. Don't worry, the coins in-game are still called Bcoins! We've got an awesome new website domain at **[https://bcono.my](https://bcono.my)** as well. The merch giveaway has been held back because we wanted to finalize the name change before shipping out your awesome loot.

v6 is making great progress and we're super excited! Apply for our Beta Test if you haven't already!

Best,

Wewert


---

## [Big news today folks. Unbelievably HUGE news…](https://blog.bconomy.net/2022/03/28/big-news-today-folks-unbelievably-huge-news/) — *2022-03-27*

Mark your calendars because **BCOINS V6 IS A GO       ****
That's right, you heard it here first. No more waiting around, no more twiddling your thumbs playing a version of the game that's almost *a year old*, no more same boring old Prestiges and bean cravings.

   Bcoins v6 LAUNCHES GLOBALLY on APRIL 20TH (4/20)**  

The team here Bcoins HQ has got quite the lineup planned for the days leading up to the launch event.   **Donor rank giveaways, Live Dev Q&A sessions, Bcoins Merch giveaways, Community events, and SO. MUCH. MORE.**   This is quite literally going to to be the biggest upgrade to Bcoins EVER and you won't even recognize the game afterwards (In a good way. I promise!) so let's make it count.

P.S. Users who make an account before v6 drops get ***a special commemorative trophy*** so if you got any friends, let em check their balance once or twice before it's too late!

Take care guys.

-Wewert


---

## [February Community Update](https://blog.bconomy.net/2022/02/18/february-community-update-2/) — *2022-02-17*

Hey everyone! I hope 2022 has been treating you alright so far 🙂**
As previously announced, Bcoins v6 is ready to go** as soon as Discord releases some updates on their end and it has matured greatly since the last community update. **Activity log, dynamic stock market, faction audit log, daily quests for high value rewards, advanced bot logging and moderation, and item collections have all been fully implemented** and the rest of the experimental release has seen considerable progress. The update has been in continual development since August of 2021 and I cannot wait for release day!

This update is rather brief but will hopefully give everyone something on the horizon to look forward to. As always thanks for reading!

-Wewert


---

## [v6 Progress Update – 1/21/2022](https://blog.bconomy.net/2022/01/21/v6-progress-update-1-21-2022/) — *2022-01-21*

Hey folks! Here's a quick v6 progress update for what's been added so far in the next major update. These additions and changes represent nearly 1,000 hrs of dev time and tens of thousands of lines of code, not to mention significant backend changes. Just a reminder that this update is *not yet live and playable.***
  Completed Features: Buttons and Slash Command Aliases, Pet Update (Adventures, Mood, Playtime, Stat Boosters), Prestige Overhaul (Old perks system and progression replaced entirely with Celestial Rune Upgrade system), Generators Update (New Generators and New Upgrades), Factions Update (Level Cap, Warchests, Audit Log, New Permissions), Farming Changes, Collections, Stat Page Update, Bugfixes and Optimizations, Item Visual Update and More!****
⏳ In Progress: Daily Quests, Captcha, Trade Overhaul, Achievement Revisions, Offerings, New Minigames**

As stated previously Bcoins v6 will release soon after Discord releases Permissions v2 for bots. "In Progress" features may not be included in the final release but will definitely be available once they are completed. This update has been in the works for months and I can't wait to share it with you all!

-Wewert


---

## [v5.9.26](https://blog.bconomy.net/2022/01/13/v5-9-26/) — *2022-01-13*

-Crash fix

-Pets no longer incorrectly display/hide cooldown icon


---

## [Our Minecraft integration now supports Bedrock Edition!](https://blog.bconomy.net/2022/01/13/our-minecraft-integration-now-supports-bedrock-edition/) — *2022-01-12*

After extensive testing **Bedrock Edition** support for the Bcoins Minecraft integration has been released. Now you can join on Bedrock clients and on mobile! Check it out at [https://bcoins.xyz/minecraft/](https://bcoins.xyz/minecraft/)

⬆️ **Rewrite Update**

Since last communications, the Pet Update has been completed in its entirety! No spoilers yet, but pets now can go on adventures, have temporary stat boosts, have hunger/mood, and more! Additional changes like the expanded perks system have also been completed. Development continues whenever I have time and I can't wait for v6 to release!


---

## [January Community Update](https://blog.bconomy.net/2022/01/02/january-community-update/) — *2022-01-01*

**The Bcoins v6 Rewrite is Ready to Go!!!****
I am happy to announce that, after hundreds of hours of work, aid from our beta testers and many, many failed builds that Bcoins v6 is in a releasable state!** This long awaited update includes **massive balance changes especially for Prestige I+, hundreds of long-awaited QoL+ features, full support for the updated Discord API, anticheat measures, and all-new gameplay elements.** I plan on significantly improving v6 up until the public release, but the rewrite will be deployed *as soon as Discord Inc releases Permissions v2 for bots* which will drop in early 2022. I know a content drought and lack of endgame content has led many players to play less or even quit, and I apologize for the radio silence. This update gives the entire bot a fresh coat of paint and exciting gameplay mechanics users at any rank can take advantage of.**
  To reiterate, Bcoins v6 is ready for release and I am just waiting on Discord Permissions v2. As soon as it is public the Bcoins rewrite will go live. All progress will be transferred over so do not worry!**

Thanks for reading, and here's to an awesome 2022!

-Wewert


---

## [Happy New Years’ Everyone!](https://blog.bconomy.net/2022/01/02/happy-new-years-everyone/) — *2022-01-01*

Seeing as the **Minecraft Integration** [https://bcoins.xyz/minecraft/](https://bcoins.xyz/minecraft/) has been working stably, prices for ingame items have been increased…**
Raw Copper – 175 BC****
Raw Iron – 1,500 BC****
Raw Gold – 2,750 BC****
Diamond – 45,000 BC****
Nether Star – 450,000 BC****
Ancient Debris – 100,000 BC**

I hope these increases will make Minecraft a competitive alternative gameplay style for Bcoins. Additionally in the future I am hoping to add a 1:1 item bridge (for example, (Discord emoji) Minecraft Diamond <=> Bcoins Diamond) and potentially more integrations. Stay tuned for more updates and an info post for how you can prepare for upcoming gameplay changes. Take care! 🙂


---

# 2021 (218 releases)

## [v5.9.25](https://blog.bconomy.net/2021/12/20/v5-9-25/) — *2021-12-20*

-Crash fix

-BC-MC integration update

-Bcoins v6 migration preparations


---

## [v5.9.24](https://blog.bconomy.net/2021/11/04/v5-9-24/) — *2021-11-04*

-Prestiges 12-24 unlocked (DEV NOTE: Currently have no gameplay bonus but will in the future)

-Maximum rob cap raised to 10mil from 1mil

-Fix inaccurate minimum listing price display

-Cooldown now happens after rapidly cancelling or ending multiple giveaways

-Giveaway invites are no longer shown for non-public giveaways (<10mil or not shown on cooldown screen) and disclaimer for server gws

-Users can no longer receive money from other users if they have over 500,000,000

-Users with over 1,000,000,000 have a universal 30min rob protection (lowered from 4hr)

-Various bug fixes and optimizations


---

## [v5.9.23](https://blog.bconomy.net/2021/09/24/v5-9-23/) — *2021-09-24*

-Fix giveaways being unavailable for extended periods of time

-Multiple bug fixes


---

## [v5.9.22](https://blog.bconomy.net/2021/09/12/v5-9-22/) — *2021-09-12*

-Multiple bug fixes


---

## [v5.9.21](https://blog.bconomy.net/2021/09/11/v5-9-21/) — *2021-09-11*

-Multiple bug fixes

-Reactor now correctly shows 220% boost


---

## [v5.9.20](https://blog.bconomy.net/2021/09/10/v5-9-20/) — *2021-09-10*

-Critical bug fixes

-Server maintenence


---

## [v5.9.16](https://blog.bconomy.net/2021/08/21/v5-9-16/) — *2021-08-21*

-Multiple bugfixes

-Increased Reactor crafting price

-Migrate to new server infrastructure


---

## [v5.9.15](https://blog.bconomy.net/2021/08/09/v5-9-15/) — *2021-08-08*

-Fix for downtime/lag issues

-Internal changes for upcoming update

-Minor bugfixes


---

## [v5.9.13](https://blog.bconomy.net/2021/08/02/v5-9-13/) — *2021-08-02*

-Fixed lottery not properly locking**
-Fixed faction name changing failing as Lieutenant

–Bcoins Birthday Event** – 10x Work Earnings**
-Fixed rare exploit where robbing yourself is possible

-New command `bgivepet`

DEV NOTE:** This command is limited and has no gameplay-related use. It is in preparation for an upcoming update.

-Fix <4hr robbable display

-RPS now contributes to gamble stats

-Lowered market "busy" cooldown

-Insurance now properly displays when passed in balance display

-Capitalizing abbreviated numbers will now work properly (ex. 100K)

-Minor fixes


---

## [v5.9.12](https://blog.bconomy.net/2021/08/02/v5-9-12/) — *2021-08-02*

-New RPS command – now there is an option to play RPS against the bot using `brps` as well as against other users as before. This is a fun, more interactive alternative to `bbet`.

-Small changes to gambling win/loss message

-Modified Reactor crafting price

-Lottery now displays last winner for 5 minutes after drawing instead of immediately beginning next lottery round

-Each prestige now grants +3 pet storage space, maxing out at 15 for now

-Fix glitch with Prestige 4+ insurance not being calculated correctly, added description text to `btiers` to clarify

-Updated bot rules with guidelines on macros, cheating, and trading for non-Bcoins items

-Using `all` and `max` on `bbet` when you have a balance of over 5mil now defaults to 5mil instead of showing an error

-Attempting to transmute when transmuting would cause a loss of PP will now fail

-Releasing a pet will now ask for confirmation

-Released pets are automatically renamed "Abandoned Pet" and will still show as parent

–`bpets` now displays total number of pets owned

-Internal changes to pet data


---

## [v5.9.10](https://blog.bconomy.net/2021/07/30/v5-9-10/) — *2021-07-30*

-Fix `bmaketrade` incorrectly calculating inventory caps

-Migrate donor system to new support server

-Redirect support links to the Support Server

-New Vote Repair system to fix votes miscounted by the bot

-Pet system optimizations (preparing for next update)


---

## [v5.9.11](https://blog.bconomy.net/2021/07/30/v5-9-11/) — *2021-07-30*

-Fix pet names not registering properly with new system


---

## [v5.9.9](https://blog.bconomy.net/2021/07/28/v5-9-9/) — *2021-07-28*

-Emergency optimization fixes

-Decrease lottery achievement prize tier


---

## [v5.9.8](https://blog.bconomy.net/2021/07/25/v5-9-8/) — *2021-07-25*

-Various minor fixes

-Fix Down Coat and Activewear not calculating boosts correctly


---

## [v5.9.7](https://blog.bconomy.net/2021/07/18/v5-9-7/) — *2021-07-17*

**New Lottery System****
-Pool is now randomly determined instead of ticket-dependent

-Total tickets purchased is now hidden until the lottery is drawn

-Tickets purchased still increase your chance of winning but no longer affect jackpot

-Lottery is now paid out in Ancient Treasure instead of Manuscripts

DEV NOTE: This is my final attempt at making a fair lottery system. If this new system isn't well-received lottery will likely be removed as all viable balance options have been exhausted at this point.

Prestige Changes****
-All Prestige tiers now grant +10m Inventory Worth

-Prestige V perk increased to 2.5x Bank Capacity from 1.5x

-Prestige VII perk changed to 50% Miner Boost

-Prestige cost adjustment

Balance Changes****
-Iron Shield and Diamond Shield now cost more to craft

-Diamond Shield now lasts 4 days from 7 days

-Buffalo and Ox pelt rarities decreased

-Completionist titles now require *all prior pages* to be completed

Miscellaneous**

–`bbuy` now supports "all"/"max" arguments

-Minor bugfixes/QoL

-Donor system internal fixes

–`mktsell` and `mktbuy` are no longer valid commands


---

## [v5.9.6](https://blog.bconomy.net/2021/07/17/v5-9-6/) — *2021-07-16*

-Many bugfixes and optimizations

-Fix Prestige VI perk not activating

-Max. PP stored is now 75 mil

-Weed grow time is no longer affected by prestige bonus


---

## [v5.9.5](https://blog.bconomy.net/2021/07/12/v5-9-5/) — *2021-07-11*

-Lottery is now drawn every 30m

-Manifest now accepts `all` and `max`

–`bgclaim` is now an alias of `bclaim`

-Rankup token craft price increased by 1 Manuscript

-Various fixes


---

## [v5.9.4](https://blog.bconomy.net/2021/07/11/v5-9-4/) — *2021-07-11*

-Rarity decreased for some mining loot

-Boots can now be converted to Leather with `bforge`

-Increase max listed at a time in market to 2k of an item

-Increase metal gained from melting down some items

-Max listing worth increased to half of inv worth

-Increased max market sell price to 20m

-Slight decrease to minimum sell price on market


---

## [v5.9.3](https://blog.bconomy.net/2021/07/11/v5-9-3/) — *2021-07-10*

-Various formatting and bugfixes

-Fixed `bmaketrade` inaccurately interpreting abbreviated numbers

-Fixed prestige inv limit being 10mil too low

-Market activity is now logged in (Discord channel)


---

## [v5.9.2](https://blog.bconomy.net/2021/07/10/v5-9-2/) — *2021-07-09*

-Donor perk changes and system fixes


---

## [v5.9.1](https://blog.bconomy.net/2021/07/09/v5-9-1/) — *2021-07-09*

–`bplant` now shows lowered time for prestiged users
-Exploit fixed where Prestige IV users would have instant harvest


---

## [v5.9.0](https://blog.bconomy.net/2021/07/09/v5-9-0/) — *2021-07-09*

**Prestige Changes****
-Prestiges I, II and III now grant -25% crop grow time each

-Prestige 2 perk increased to 10x stock market capacity

-Pres rank/tier costs have been readjusted

-PP earning has been massively increased

-All core actions now grant PP, and has been doubled for all

-PP is now used first when ranking up/ascending, then BC is used

-Prestige Points are now displayed on balance card

Other Changes**

-Fixed lottery timer being off by ~2 minutes

-Updated `bhelp` and `bhelp all` with new information and commands

–`bincubate` is now `buse incubator`

-Aliases `fa` and `ha` for farm and harvest respectively

-Decreased Uranium and other metals’ rarities

-Decreased gamble cooldown to 3sec

-Rate limiter is now less aggressive

-Pet XP from exp/fish/mine/hunt greatly increased

-Fixed formatting issues with backtick

-Attempting to level up a faction without enough space will notify a hall is needed

-Formatting changes

-Made some commands look prettier


---

## [v5.8.6](https://blog.bconomy.net/2021/07/07/v5-8-6/) — *2021-07-07*

-Fix cooldowns triggering too often

-Multiple bug fixes


---

## [v5.8.5 – Trading Update](https://blog.bconomy.net/2021/07/07/v5-8-5-trading-update/) — *2021-07-07*

-Fix Supercomputer, Buffalo Bill, and Nucleogenesis achievements**
-ALL NEW item parser system – item IDs should finally make more sense

-ALL NEW trading system – try with `bmaketrade`

DEV NOTE: This feature was much harder to add than expected but should be functional after much testing and exploit prevention. Hopefully will make scams far less common and will finally remove the often-abused rep system.**

-Exploit prevention optimizations

-Updated bhelp with trading info


---

## [v5.8.2](https://blog.bconomy.net/2021/07/04/v5-8-2/) — *2021-07-03*

-Potential fix for giveaway issues


---

## [v5.8.1](https://blog.bconomy.net/2021/07/03/v5-8-1/) — *2021-07-03*

-Fix crate reward for Pg 6

-Fix generator achievements

-Rank cost tweaks for low ranks


---

## [v5.8.0 – Achievement Update Part 2](https://blog.bconomy.net/2021/07/03/v5-8-0-achievement-update-part-2/) — *2021-07-03*

-Large number of achievements added to achievement page to correspond with recent updates**
-Crate prizes added to achievement pages 4-6

-Discontinued achievements now show up under your personal achievement display

-Introducing Completionist Badges** – they are earned by finishing a page of achievements and show up under your balance

-Crate base sell increased to 30k


---

## [v5.7.17](https://blog.bconomy.net/2021/07/03/v5-7-17/) — *2021-07-03*

-15 plots are now buyable

-100 crates can now be opened at once

-Stock market cap raised to 1m

-Inv cap raised to +400k/rank

-Formatting/display changes

-Temporarily disabled "Bite the Hand" and "Golden Ticket" achievements

(these will return – preparing for large achievements update)

-Radar no longer equippable/robscan removed – now is `buse radar`

-Various other tweaks


---

## [v5.7.16](https://blog.bconomy.net/2021/07/02/v5-7-16/) — *2021-07-02*

-Reverted lottery to previous linear scaling (each ticket contributes 500 to pool, no cap)

-Lottery now has minimum pool of 10mil and ends every 2hr

-Introducing vote streaks! Voting daily will now add 1 extra bonus crate to your vote reward (caps at 15 crates)

-Significant rank cost decrease for low to mid-high ranks

-Slight buff to crate drop rates


---

## [v5.7.15](https://blog.bconomy.net/2021/07/01/v5-7-15/) — *2021-07-01*

-Max crates increased from 20 to 30 per vote

-Crates can now be opened above inventory worth limit

-Max crates used at once raised to 30

-Formatting changes


---

## [v5.7.14](https://blog.bconomy.net/2021/07/01/v5-7-14/) — *2021-07-01*

-Lottery pool is now calculated with a nonlinear convergent function – meaning that larger number of tickets will no longer directly correlate with lottery pool

-Lottery starting pool is now 10mil and increased when past a certain number of tickets


---

## [v5.7.13](https://blog.bconomy.net/2021/07/01/v5-7-13/) — *2021-07-01*

-New dynamic ratelimit system written from scratch**
DEV NOTE: This new system should address many of the concerns with long command ratelimits. It calculates the average time between multiple commands and meaning all commands should have a very short cooldown if not spammed.****
-Removed passive earning

DEV NOTE: Passive earning was an old feature that a very small percentage of Bcoins users were even aware of. The bot in its current state has departed far from its original vision of being a passive chat tool so this feature has been removed.****
-Overhaul item ID system – more aliases now work and are shorter

-Lottery is now capped at 40 million

-Attempting to gamble or pay large amounts, or `bsellall`, now asks for confirmation

DEV NOTE: This can be disabled in the future.**

-Replace Pride Month event with permanent 2x work bonus if the Official Server has been joined

-Fix transferring buddy without unequipping first

-Remove incorrect "equip time" display for Hearty Loaf

-Various other optimizations

-Fix "Online shield disabled" message to only trigger on high balances with more clarity


---

## [v5.7.12](https://blog.bconomy.net/2021/06/28/v5-7-12/) — *2021-06-28*

-Decreased generator buy price and overheat rate

-Decreased Uranium rarity slightly

-Vote crate scaling adjusted (max 20 at God rank)

-Prestige users now get 20 crates at all ranks

-Prestige users can now add gen slots at any rank


---

## [v5.7.11](https://blog.bconomy.net/2021/06/27/v5-7-11/) — *2021-06-26*

-Increase base explore rate and work earnings for lower ranks

-Increase chances of work bonuses (raises)

-Uranium is now less rare


---

## [v5.7.10 – Generators Update Phase 2](https://blog.bconomy.net/2021/06/26/v5-7-10-generators-update-phase-2/) — *2021-06-26*

-Release of Generator Upgrades – see `bgen upgrades` or `bhelp gens` for more info

-Overheat Risk slightly decreased

-Mining loot table adjusted to drop more metals

-Renamed "Server Rack" to "Machine Casing"

-Introducing Autosell – Any items you gain from exp/mine/fish/hunt over your max item limit will be automatically sold

-Price of Uranium decreased

-Adjusted some mining recipes

–`bhelp` now supports some aliases

-Various other adjustments


---

## [v5.7.9](https://blog.bconomy.net/2021/06/25/v5-7-9/) — *2021-06-25*

-Updated `bloot` to now display loot from all commands

-Cooldowns menu now uses circles and generator CD works properly.

-Multiple gen bugfixes

-Some metals can now be melted down in the Forge

-Included more information on gen help menu


---

## [v5.7.8 – The Long Awaited Generators Update Phase 1](https://blog.bconomy.net/2021/06/25/v5-7-8-the-long-awaited-generators-update-phase-1/) — *2021-06-25*

-Generators (previously known as miners) have arrived!

Type `bhelp gens` to view all information.

-New generator crafting recipes.

-Transmute replaced with generator time on Cooldowns.

-Forge now uses Coal instead of Gunpowder

-Fixed multiple visual bugs.


---

## [v5.7.6 – Mining Update](https://blog.bconomy.net/2021/06/24/v5-7-6-mining-update/) — *2021-06-23*

-Mining is now full-featured: mine to extract rare metals from deep inside the earth!

-Item drop rate rebalance for all commands

-Slight cost increase and recipe changes to booster items

-Formatting changes


---

## [v5.7.5](https://blog.bconomy.net/2021/06/23/v5-7-5/) — *2021-06-23*

-Diamond Pickaxe & Pickaxe no longer affects Rock drop rates

-Rock drop rates are now constant across all ranks (for mining)

-Craving Bonus lowered to 2x


---

## [v5.7.4](https://blog.bconomy.net/2021/06/22/v5-7-4/) — *2021-06-22*

-Potential fix for slow response times (data access optimizations)


---

## [v5.7.3](https://blog.bconomy.net/2021/06/22/v5-7-3/) — *2021-06-22*

-Fix bot not letting users work while still under daily limit


---

## [v5.7.2](https://blog.bconomy.net/2021/06/21/v5-7-2/) — *2021-06-21*

-Multiple bugfixes


---

## [v5.7.1](https://blog.bconomy.net/2021/06/21/v5-7-1/) — *2021-06-21*

-Proper emojis now display for all new items

-Minor bugfixes


---

## [v5.7.0 – The Update of Updates](https://blog.bconomy.net/2021/06/21/v5-7-0-the-update-of-updates/) — *2021-06-21*

–**All craft items are now findable via exploring****
-Higher ranks now have a built-in base multiplier for exploring to properly scale with increased rank.

-Pet cravings – Pets will earn 4x XP from certain foods during a period of time.

-A multitude of new foods which grant XP, crafted from existing and new update items

-XP for existing food items has been increased.

–`binfo` now displays all recipes which use the item, along with methods of obtaining

-Add fishing, mining, and hunting, which all scale with your current rank.

-Add boosters and their diamond counterparts which can be equipped for boosts on activities.

-Inventory cap has been increased for all users

-All cooldowns have been greatly reduced and cap out at 15min now.

-Working now resets twice as fast.

-Work bonuses have been made more common.

-Crates have been slightly buffed.

-New item "Rankup Token" – allows for the instant purchase of 1 rank

-New legendary loot in 500k-1mil range (this is not obtainable yet)

-Minimum item listing cost for marketplace has been increased.

-Item cost adjustments to account for new loot tables.

-Inventory pages now scale with amount of items present.

-Ranking cost adjustments to account for greatly increased earnings

-Cooldown for gambling increased to 10sec, drastically reduced for all other cmds

-Updated tutorial to reflect new commands and mechanics

-New internal item handling system

–*Many, many, MANY* internal fixes, changes, and optimizations

DEV NOTE: As this is a large update with possibly many bugs and unintended behaviors, please report any you find! Thank you so much 🙂**


---

## [v5.6.4](https://blog.bconomy.net/2021/06/18/v5-6-4/) — *2021-06-17*

-Increased base insurance for all users


---

## [v5.6.3](https://blog.bconomy.net/2021/06/17/v5-6-3/) — *2021-06-17*

-Fix fatal tutorial crash

-Update bot rules to match with server


---

## [v5.6.2](https://blog.bconomy.net/2021/06/16/v5-6-2/) — *2021-06-16*

-Vote reminders!   Type `breminder` to enable DM vote reminders, which will notify you whenever you can vote again.

-New aliases `shop` and `buy` for market

-New alias `bbudlvlup` (suggested by (Discord user))

-New alias `btp` (suggested by (Discord user))

-Transmutation is now based on your prestige level (ex: Pres I transmutes 1mil at a time, Pres II transmutes 2mil, etc – suggested by (Discord user))

-Stock portfolio view now shows net change since last buy/sell (suggested by (Discord user))

-Internal fixes


---

## [v5.6.1](https://blog.bconomy.net/2021/06/06/v5-6-1/) — *2021-06-05*

-Tutorial system fixes


---

## [v5.6.0](https://blog.bconomy.net/2021/06/06/v5-6-0/) — *2021-06-05*

-ALL NEW Interactive Tutorial – check it out with `bhelp start`**
DEV NOTE: This was *very* painful to add, but let’s face it – the old starter instructions were pretty crappy. No one wants to read a paragraph when they add a Discord bot, me included. Hopefully this addition will make getting new players and your friends into the bot a bit easier. Try it out and let me know what you think! 🙂**


---

## [v5.5.17](https://blog.bconomy.net/2021/06/04/v5-5-17/) — *2021-06-04*

-Fix exploit (thank you (Discord user) (Discord user)!)

-Exploit-proof multiple other commands for safety

-Improved internal moderation tools


---

## [v5.5.16](https://blog.bconomy.net/2021/06/04/v5-5-16/) — *2021-06-04*

-Fix water buff hiding sprinkler bonus

-Various minor tweaks

-Fix (Discord channel) not posting results after giveaway finishing


---

## [v5.5.15](https://blog.bconomy.net/2021/06/03/v5-5-15/) — *2021-06-03*

– ️‍  **Pride Month Event** – 2x Work Earnings**
-☀️ Summer Fun Event** – +30m Water Time Decrease

–`bstats` can now be accessed via Bcoins ID

-Implement advanced user moderation system for administrators


---

## [v5.5.14](https://blog.bconomy.net/2021/06/02/v5-5-14/) — *2021-06-02*

-Fix `bkick` not working via Bcoins ID

–`bpromote` and `bdemote` now work via Bcoins ID

-Various faction fixes

-Donor perk expiry change


---

## [v5.5.13 –  Happy pride month](https://blog.bconomy.net/2021/06/02/v5-5-13-happy-pride-month/) — *2021-06-01*

-New command `bvpay` allows faction members to send vault BC to other users

*DEV NOTE: This command essentially completes faction functionality – lower ranked users can now withdraw from the vault without needing to be promoted. This means that factions could potentially assign "vault manager" positions to users who manage payouts after each expedition, ensure members don't "go rogue" and withdraw everything, encourages greater faction cohesion, and much more.*

–`bmembers` now shows each members' Bcoins ID

–`bkick` and `bvpay` accept both Bcoins ID and user pings

–`bcustompetemoji` for donors – change pet's appearance to a custom emoji

-Slight buff to crates

-Minor formatting tweaks


---

## [v5.5.12](https://blog.bconomy.net/2021/05/31/v5-5-12/) — *2021-05-30*

-Fix fatal crash resulting in broken giveaways

-Fertilizer can now be used multiple times in one command

-Weeds grow and fertilizer crafting costs adjusted to prevent infinite fertilizer abuse


---

## [v5.5.11](https://blog.bconomy.net/2021/05/29/v5-5-11/) — *2021-05-29*

-"bbud" now properly works

-"bstatus" now displays total users in all servers

-Numbers in market now have place indicators

-Slight manifest cost decrease

-Minor display changes


---

## [v5.5.10](https://blog.bconomy.net/2021/05/28/v5-5-10/) — *2021-05-28*

-“bcd” now respects sprinkler autowatering


---

## [v5.5.9](https://blog.bconomy.net/2021/05/28/v5-5-9/) — *2021-05-28*

-Disable new MySQL driver settings

-Base insurance raised to 90% of a user’s rank cost (from 75%)

-Factions now track invited users’ join dates (not retroactive)

-Lieutenant+ members can reset vault contribution statistics now

-Members page for faction now displays 10 members per page

-Lieutenants can no longer promote other users to Lieutenant or demote them from Lieutenant

-Raise crafting cap to 200 items

-“binfo” now properly registers IDs like “tough rope”

-“binfo” now displays crafting recipe

-New alias “bbud” for “bbuddy”

-Giveaway notifications now show up under “Events” in cooldown menu


---

## [v5.5.8](https://blog.bconomy.net/2021/05/27/v5-5-8/) — *2021-05-27*

-Test new MySQL driver settings (enable connection pooling)

DEV NOTE: This is an experimental setting which could potentially break something but will increase the bot’s performance and prevent lost coins. Please let me know if anything misbehaves!


---

## [v5.5.7](https://blog.bconomy.net/2021/05/25/v5-5-7/) — *2021-05-25*

-Update "bhelp" with new robbery cap

-Custom emoji and banner commands can now use animated emotes without needing to find the ID


---

## [v5.5.6](https://blog.bconomy.net/2021/05/25/v5-5-6/) — *2021-05-25*

-Overhauled top ranks leaderboard ("btr"/"btopranks") – now shows user ranks and is similar to main LB

-Limit leaderboard pages to 20

-Achievement system fixes

-Donor system fixes


---

## [v5.5.3](https://blog.bconomy.net/2021/05/24/v5-5-3/) — *2021-05-24*

-All Bcoins IDs have been **moved down 100.**

-Multiple bug fixes


---

## [v5.5.2](https://blog.bconomy.net/2021/05/24/v5-5-2/) — *2021-05-23*

-Faction emblems are now displayed in emoji form on "btf" and your balance

-Multiple bug fixes

-Partial rewriting of how user data is handled – premium users now must re-verify

-Giveaway BC per month increased for donors

-Donors can now set custom faction banners


---

## [v5.5.1](https://blog.bconomy.net/2021/05/23/v5-5-1/) — *2021-05-22*

-Lottery is now draw every 6 hours instead of 24hrs.

-Fix lottery achievements

-Lottery cooldown after game end has been removed

-All Godlike+ donor servers now will allow for ALL users in that server to use donor customization commands (custom color, banner, emoji, tagline, etc). These will only display in that server however.


---

## [v5.5.0](https://blog.bconomy.net/2021/05/22/v5-5-0/) — *2021-05-21*

-"RNGesus" achievement decreased from 10 to 8 streak

-New achievement: "Grow Op"

-More keywords now work (ex. "work tools" is valid in addition to "tools")

-Fix insurances able to be non-integer values


---

## [v5.4.9](https://blog.bconomy.net/2021/05/21/v5-4-9/) — *2021-05-21*

-Achievements now grant Crate rewards upon finishing an entire page.

-Fix intermittent crashes


---

## [v5.4.8](https://blog.bconomy.net/2021/05/21/v5-4-8/) — *2021-05-21*

-Tractors have been implemented! Craft tractors to autoharvest crops. Each tractor will autoharvest 150 crops before being used up.

-Tractors can be stacked up to 600 harvests and sprinklers can be stacked up to 36 autowaters.

-New item: Shield – 2.5x insurance for 2 days

-Diamond Shield's ID changed to `diamondshield`

-Add lottery and tractor information to `bhelp`

-3 new achievements

-Massive code optimizations


---

## [v5.4.7](https://blog.bconomy.net/2021/05/20/v5-4-7/) — *2021-05-19*

-Fix buying lottery ticket not actually deducting from balance


---

## [v5.4.6 – Lottery Update](https://blog.bconomy.net/2021/05/20/v5-4-6-lottery-update/) — *2021-05-19*

-The lottery is back! Type “blottery” to access its info. Lotto will be drawn approximately once per day.

-Prestiged users are no longer bound by rank limits for buying plots.

-New lottery achievement

-Various bug fixes


---

## [v5.4.5](https://blog.bconomy.net/2021/05/18/v5-4-5/) — *2021-05-18*

-Expand maximum plots to 12

-Sprinkler crafting cost decreased

-Watering your crops with Sprinklers adds a +30m buff

-Limit new plot price to 500k max

-4 new achievements related to plot ownership

-Keywork "max" also works where "all" works

-Support for "all" and "max" added to crafting and buying stocks

-Stock market capacity doubled for all users

-"bhelp" now displays a tip at random (only 3 now)


---

## [v5.4.4](https://blog.bconomy.net/2021/05/18/v5-4-4/) — *2021-05-18*

-Bot now recognized suffixes for most commands (ex. "bg 1k" will bet 1,000)

-Achievement fixes


---

## [v5.4.3](https://blog.bconomy.net/2021/05/18/v5-4-3/) — *2021-05-17*

-Fix bugs with: God, Pet Level and Streak achievements

-Added 8 new achievements

-Giveaways made even more common with bigger prizes and longer durations

-Raised min user insurance to 200k


---

## [v5.4.2](https://blog.bconomy.net/2021/05/14/v5-4-2/) — *2021-05-13*

-Fix achievements interfering with normal gameplay balances

-Fix achievements not granting when already earned

-Achievements are now displayed in canonical order


---

## [v5.4.1](https://blog.bconomy.net/2021/05/13/v5-4-1/) — *2021-05-13*

-Achievement system hotfix


---

## [v5.4.0 – The Achievements Update](https://blog.bconomy.net/2021/05/13/v5-4-0-the-achievements-update/) — *2021-05-13*

-Achievements have been (finally!) added to the game

DEV NOTE: This was probably one of the most difficult features to implement in a scalable and efficient way. Please let me know if there are any bugs or hiccups!

-Type “bachievements” or “bach” to view all achievements that you have earned. “bach all” for all achievements available for earning.

-Upon earning an achievement the bot will DM you with a success message, then the reward for that achievement will be deposited to your balance.

-More difficult achievements will grant greater BC bounties. All achievements are only earnable once.

-Be on the lookout for seasonal achievements, which will accompany events and special seasonal tasks.

-Completely rewrote multiple pages of “bhelp”

-Internal database changes


---

## [v5.3.7](https://blog.bconomy.net/2021/05/13/v5-3-7/) — *2021-05-12*

-Global leaderboard now displays positional changes between updates

-QoL and formatting changes


---

## [v5.3.6](https://blog.bconomy.net/2021/05/12/v5-3-6/) — *2021-05-12*

-Fixed issue with limiting explore for some users

-Messages in (Discord channel) will now be autodeleted unless there is a giveaway active


---

## [v5.3.5](https://blog.bconomy.net/2021/05/11/v5-3-5/) — *2021-05-11*

The way loot/explore works in Bcoins has been completely revamped!

-The loot drop system now works on a 30sec/drop basis. Therefore you can find Extremely Rare items without having to wait at least 15 minutes. Exploring/mining at any amount of time will have the same efficiency as exploring every 30 seconds, so no need to spam pickaxe/excavators!

-Pickaxe/Excavator have been massively buffed.

-Loot drop chances have been buffed (big increases for common/uncommon items)

-Forge has been buffed – Circuit now yields 20 metal, Knife now yields 5 metal

-Forge can now be used multiple times in one command (bulk)

-Exploring now fully charges in 60 min for parity with "bwork"

-Crates no longer yield Uncommon items but yield far more Rare+ items

-Limit of Grand Halls per faction now scales with faction rank

-Maximum seaplanes for 1 faction is now capped at 23

-Giveaways will now be conducted every ~3 days in (Discord channel) automatically

-Minor display changes

-Internal database changes


---

## [v5.3.1](https://blog.bconomy.net/2021/05/10/v5-3-1/) — *2021-05-10*

-Vault tracker enabled – typing "bmembers" will display how much a user has taken or given to the faction vault

-Minor formatting changes


---

## [v5.3.0](https://blog.bconomy.net/2021/05/10/v5-3-0/) — *2021-05-10*

-Server prefix can now be set for ALL servers – no longer a premium only feature!

-Channel whitelisting – admins can now set Bcoins to only take commands in certain channels without messing with permissions.

-Numeric IDs are no longer accepted for items.


---

## [v5.2.8](https://blog.bconomy.net/2021/05/06/v5-2-8/) — *2021-05-06*

-Market limit is now 1/3 of your total inventory worth limit

-No limit to quantity of items listed

-Formatting changes


---

## [v5.2.7 – Market Overhaul](https://blog.bconomy.net/2021/05/05/v5-2-7-market-overhaul/) — *2021-05-05*

-Listings on the market now stack when at the same price point

-Items on the market can now only be listed in multiples of 50 BC

-Max listings and quantity increased

-Entire quantity of items at a price point are now purchasable at once

-Internal market orderbook restructuring (prep for bid/ask)

-Various display changes


---

## [v5.2.6](https://blog.bconomy.net/2021/05/04/v5-2-6/) — *2021-05-04*

-Market pages can now be viewed (up to 3 pages)


---

## [v5.2.5](https://blog.bconomy.net/2021/05/04/v5-2-5/) — *2021-05-04*

-Prestige I-III now grant +10m inventory cap (persists after ascension)


---

## [v5.2.4](https://blog.bconomy.net/2021/05/04/v5-2-4/) — *2021-05-04*

-All items are now sellable via "bsell" command. Sell price is listed on "binfo" page for item.

-"bsellall" still only sells loot items but now includes an optional argument for selling everything

-Various minor tweaks


---

## [v5.2.3](https://blog.bconomy.net/2021/05/03/v5-2-3/) — *2021-05-03*

-"bupgradevault" merged to "buse hall"

-Only certain items are now equippable

-Various display tweaks


---

## [v5.2.2](https://blog.bconomy.net/2021/05/03/v5-2-2/) — *2021-05-03*

-Inventory worth now accounts for crafted items

-Users now have a maximum inventory worth, trying to explore or open crates when above this will disallow the action

-Giving now respects inventory space and inventory worth

-Top prestige leaderboard now shows IDs


---

## [v5.2.1](https://blog.bconomy.net/2021/05/01/v5-2-1/) — *2021-04-30*

-Large numbers now include place commas (ex. 1000000 is rendered as 1,000,000)

-Various display tweaks

-Fix prestige leaderboard showing incorrect values


---

## [v5.2.0](https://blog.bconomy.net/2021/04/30/v5-2-0/) — *2021-04-30*

-Prestige buffs: Prestige I now has 2x bank interest, Prestige III has 2x work earnings

-Working now contributes directly to your prestige balance

-Overhauled prestige tier menu showing all relevant stats

-New command "btopprestige", allows viewing users with highest Prestige

-Balance menu now displays if you are vulnerable to robbing

-Online shield stops activating if your balance is over 3x your rank cost (this will be indicated on balance menu)

-Donors can now set a custom banner using any emoji they like (incl. animated)

-Donors with custom rank and emoji now have actual rank displayed in Info

-Slashed manifestation costs for Common and Uncommon items

-Administrative change allowing user account swaps


---

## [v5.1.5](https://blog.bconomy.net/2021/04/29/v5-1-5/) — *2021-04-29*

-Internally restructure user data storage

-Donors can now set custom embed colors


---

## [v5.1.4](https://blog.bconomy.net/2021/04/29/v5-1-4/) — *2021-04-28*

-Balance no longer shows a fake "rank up" price when you are at max rank

-"branks" now shows ascension as an option if you are at God/Goddess rank

DEV NOTE: This update lays the groundwork for a prestige system overhaul. Expect buffs to prestige tiers in the coming updates!

-Donors now can set custom taglines and use faction banners to display on their balance (see "bhelp all 7")

-Donors can now use animated emotes in their balance display, even if they do not have Discord Nitro


---

## [v5.1.3](https://blog.bconomy.net/2021/04/27/v5-1-3/) — *2021-04-27*

-Data structures for storing gendered titles have been restructured

DEV NOTE: This means that you may have lost your gendered title setting – please toggle this if so, sorry for the inconvenience!

-Boosters and donors now have the ability to set custom rank names and emojis

-Minor improvements to UI


---

## [v5.1.2](https://blog.bconomy.net/2021/04/26/v5-1-2/) — *2021-04-26*

-Complete overhaul of "branks" and "binventory" view

-Branks now shows all vital stats regarding upcoming ranks, including work, passive, insurance, special abilities, etc. in an easy to read and understand format

-Inventory now dynamically scales along with now many items you have in your backpack, adding new columns as necessary. ID will be hidden to prevent bloat once two columns are reached

-Increase vote rewards for all ranks (scale up)

-Reduced number of keywords bot responds to (ex. saying "be" in conversation will no longer trigger a bot response)


---

## [v5.1.1](https://blog.bconomy.net/2021/04/26/v5-1-1/) — *2021-04-26*

-Fix crate dupe


---

## [v5.1.0](https://blog.bconomy.net/2021/04/26/v5-1-0/) — *2021-04-26*

-Fix ratelimiter – now bot should not say "Wait a second before running another command" as often, you can quickly input multiple commands

-Cooldown menu now displays time until fully rested

-Guessing now charges up to 6 guesses every 20 minutes.

-Up to 20 crates can now be opened at a time

-Work buffs – now you will randomly receive bonuses from working


---

## [v5.0.9](https://blog.bconomy.net/2021/04/20/v5-0-9/) — *2021-04-19*

-Fix glitch preventing IDs of over 10k from being properly parsed

-Update "bhelp all" with link to webpage


---

## [v5.0.8](https://blog.bconomy.net/2021/04/17/v5-0-8/) — *2021-04-17*

-Crop death increased to 30 hrs from 24 hrs

-Minimum insurance for all users raised to 150k

-Small display tweaks

-Remove unused code


---

## [https://bcoins.xyz/ Update](https://blog.bconomy.net/2021/04/16/https-bcoins-xyz-update/) — *2021-04-15*

-Every command & usage is now listed on website

-Remove discord widget

-Styling update


---

## [v5.0.7](https://blog.bconomy.net/2021/04/15/v5-0-7/) — *2021-04-15*

-New aliases – "bpl" for "bplant", "bh" for "bharvest", "bwat" for "bwater"


---

## [v5.0.6](https://blog.bconomy.net/2021/04/15/v5-0-6/) — *2021-04-14*

-Modernize code (conform to javascript ES6)

-New command parser (case-insensitive, non-strict)

-Bot will send welcome message upon joining server

-New aliases, "bf" now opens farm, "bn" runs guess command


---

## [v5.0.5](https://blog.bconomy.net/2021/04/13/v5-0-5/) — *2021-04-12*

-Updated bank view with better information and context

-Rank needed to increase bank bal lowered by 1


---

## [v5.0.4](https://blog.bconomy.net/2021/04/12/v5-0-4/) — *2021-04-12*

-Increased bank capacity for all ranks below 500k

-Boosting no longer provides 500k bonus

-Attempting to end a server giveaway with less than 20 participants fails


---

## [v5.0.3](https://blog.bconomy.net/2021/04/12/v5-0-3/) — *2021-04-11*

-Prestige I perk is now 15% bank interest
-Prestige II perk is now 7x stock market capacity
-Slightly boosted compounding rate


---

## [v5.0.2](https://blog.bconomy.net/2021/04/12/v5-0-2/) — *2021-04-11*

-Bank interested increased to 10% for ALL users

-Prestige II users now have 1.5x bank interest

-Slight rank cost adjustment

-Fix explore glitch (timer reset when too many item)

-Prestige cost adjustment


---

## [v5.0.1](https://blog.bconomy.net/2021/04/11/v5-0-1/) — *2021-04-11*

-Minor bugfixes
-Formatting changes


---

## [v5.0.0](https://blog.bconomy.net/2021/04/11/v5-0-0/) — *2021-04-11*

-Entirely new facelift for “bbal”! Information is now conveyed in a consistent and visually appealing format.**
-Bank deposit and cap now scales with rank, topping out at 500k at higher ranks

-Bank deposit and withdrawals can now be done with any amount – no more withdrawing/depositing your entire bank account

-Bank interest now scales dynamically down to the second, allowing you to instantly earn BC as soon as your deposit into your bank and withdraw whenever.

DEV NOTE: This was a major** pain to implement but should fix a longstanding annoyance. Bank is now easier to use properly and behaves as one would expect.

-Fix fatal error where sprinklers would reset when manually watered

-Sprinklers no longer require bricks to craft

-Updates to crafting and info menus

-New ranks

-New “bbuddy” command to instantly bring you to your pet’s interface

-Slashed manifestation costs (25-50% decrease)

-Only bets greater than 1m will be posted to (Discord channel)


---

## [v4.9.16](https://blog.bconomy.net/2021/04/11/v4-9-16/) — *2021-04-10*

-Introducing   Manifestation! Users with prestige can now spend their PP to create items out of thin air – for a price.

-These items are more expensive than they sell for, but can be of use when you're trying to find the last few for a crafting recipe.

Use command with "bmanifest"


---

## [v4.9.15](https://blog.bconomy.net/2021/04/11/v4-9-15/) — *2021-04-10*

-Various bugfixes
-Pets leaderboard (“btoppets”)


---

## [v4.9.14](https://blog.bconomy.net/2021/04/11/v4-9-14/) — *2021-04-10*

-Various QoL and display fixes (pets menu, help, etc)

-Fix glitch with resetting explore time when too many of an item exists

-Fix glitch with user balance display

-Minimum bet is now 50 BC

-Removed 300 one-time stock buy cap

-Givepets format changed for consistency with give, pay, etc


---

## [v4.9.13](https://blog.bconomy.net/2021/04/10/v4-9-13/) — *2021-04-10*

-Fix bug with sprinklers being consumed without reason
-Changes to balance display info


---

## [v4.9.12: Farm Update Phase 2](https://blog.bconomy.net/2021/04/10/v4-9-12-farm-update-phase-2/) — *2021-04-10*

-Sprinklers now have a use! They will automatically water your farm if you don’t manually water yourself in 4 hours (up to 30 autowaters).

DEV NOTE: This, effectively, allows you to AFK from the game for multiple days without your crops, while also providing a nice boost

Type “binfo sprinkler” for more info!

-“bcrate”, “bfertilize” and “bsprinkler” have been merged into one “buse” command

-“binfo” command now shows use/equip functionality

-Rename “levelup” command to “buddylevelup”

-Crops now die if unwatered for 24hr+


---

## [v4.9.10](https://blog.bconomy.net/2021/04/08/v4-9-10/) — *2021-04-08*

-New item parser – bot now recognizes plurals in ID (ex. “log” and “logs” both work)


---

## [v4.9.9](https://blog.bconomy.net/2021/04/08/v4-9-9/) — *2021-04-08*

-Updated “balance” display with seperated user stats

-Increase crafting limit at one time to 50

-Boosters now get a special display on their card


---

## [v4.9.8](https://blog.bconomy.net/2021/04/06/v4-9-8/) — *2021-04-06*

-Entirely rewritten new player tutorial experience ("bhelp start")

-Fix formatting error with bcalc operations


---

## [v4.9.7](https://blog.bconomy.net/2021/04/06/v4-9-7/) — *2021-04-06*

-New command "bcalc" – Allows you to calculate raw materials, costs, and ingredients for large crafting operations

-Tiered XP system – Food XP is now calculated using an algorithm, where more complex foods yield greater XP

-Four new foods – pastry, tofu, mashed potato, chocolate

-Changed crafting recipe for Sprinkler

-Renamed "Coffee Bean" to "Exotic Bean"


---

## [v4.9.6](https://blog.bconomy.net/2021/04/03/v4-9-6/) — *2021-04-03*

-Bplant no longer requires plot ID specified, crop name now first (ex. "bplant weeds")

-Bot will respond when pinged

-Minor "bbal" display changes


---

## [v4.9.5](https://blog.bconomy.net/2021/04/02/v4-9-5/) — *2021-04-02*

-3 new stats: top global rank, crops harvested, highest gamble streak

-Gamble streaks are now tracked when gambling

-Faction ID is now shown when viewing

-Extended global leader to 1000 users


---

## [v4.9.4](https://blog.bconomy.net/2021/04/02/v4-9-4/) — *2021-04-02*

-Minor leaderboard and global rank display changes


---

## [v4.9.3](https://blog.bconomy.net/2021/04/02/v4-9-3/) — *2021-04-01*

-Checking your balance now shows your position globally if you are on the leaderboard

-Leaderboard once again has 20 pages


---

## [v4.9.2](https://blog.bconomy.net/2021/04/02/v4-9-2/) — *2021-04-01*

-New command "bleadershiptransfer" for factions

-Update insignia for Sergeant and Lieutenant

-Sergeant rank can now properly kick users


---

## [v4.9.1](https://blog.bconomy.net/2021/04/02/v4-9-1/) — *2021-04-01*

-Your rob immunity now updates when you run ANY command (not just balance anymore!)

-More than 10 seaplanes can now be purchased depending on faction level

-Fix faction rank issues


---

## [v4.9.0 – Factions Update Phase 2](https://blog.bconomy.net/2021/04/02/v4-9-0-factions-update-phase-2/) — *2021-04-01*

-Hope everyone enjoyed the April fools content! Or at least… tried to

-Factions have been completely overhauled

-Users now have a faction-specific ranks with permissions – check these with "bfperms"

-Faction specific ranks come with insignia (based off US military)

-Tiered promotion/demotion system

-Factions can now hold up to 50 users

-Pets can now be fed a specified amount of each item (no more spamming!)

-Greater amounts of plots now need a certain rank to buy

-Internal database changes


---

## [v69.420](https://blog.bconomy.net/2021/04/01/v69-420/) — *2021-03-31*

-Something… weird happened to the code. Good luck!


---

## [v4.8.7](https://blog.bconomy.net/2021/03/26/v4-8-7/) — *2021-03-26*

-Giveaways can now be cancelled or ended prematurely

-Donor servers can now set custom invites for "bgiveawayserver" via command

-Giveaway balances now roll over for each month

-Admin control tools


---

## [v4.8.6](https://blog.bconomy.net/2021/03/21/v4-8-6/) — *2021-03-20*

-Switch donation link from Patreon to QuakerPay

-Fix glitch with leaderboard cache not properly updating


---

## [v4.8.5](https://blog.bconomy.net/2021/03/20/v4-8-5/) — *2021-03-20*

-Implement leaderboard caching – internal change that will decrease DB load

-Giving pets now respects 5 pet limit


---

## [v4.8.4](https://blog.bconomy.net/2021/03/20/v4-8-4/) — *2021-03-19*

-Pet XP rollover implemented (after levelling up XP will roll over to next level)

-"binfo" now shows XP given for food items and metal given for forge items

-Display glitch fixed for "bpets" menu


---

## [v4.8.3](https://blog.bconomy.net/2021/03/20/v4-8-3/) — *2021-03-19*

Pet Update Phase 1

-Pets now earn XP! When you work or explore, the pet you have set as your buddy will earn XP toward their next level.

-Once pets have earned enough XP command "blevelup" can be run to advance their level.

-Food items can be fed to your pet using "bfeed", which will grant them XP as well. The harder to craft your food item is, the more XP it will yield!

-Various bugfixes and improvements

-Update "bstatus" with last update time

-Pet's earnings now scale with level (50 BC * level)


---

## [v4.8.2](https://blog.bconomy.net/2021/03/19/v4-8-2/) — *2021-03-19*

-Far more detailed stats for "bstatus" command

-Fleets update – you can now own more of each unit (1/2 of faction lv except for Seaplanes), easier fleet buying process

-More commands added to "bhelp all 7"

-Command "blevelup" changed to "bfaclevelup"

-You can no longer list items on the market lower than their default sell value


---

## [v4.8.1](https://blog.bconomy.net/2021/03/15/v4-8-1/) — *2021-03-15*

-Prizes for guessing game now scale with rank (higher ranks get rewards of 500k+)

-Decreased correct guess cooldown from 30hr to 24hr, increased 1 digit away cooldown to 12hr

-Rob radar now shows less users when used


---

## [v4.8.0](https://blog.bconomy.net/2021/03/15/v4-8-0/) — *2021-03-15*

-"bitem/binfo" command is now fully operational! Shows indispensable stats for each item including uses, craftability, sell price, drop rates, and more.

-Fix glitch that allowed listing 0 of an item on the market

-"interesting" message now shows up if you try to breed with another player…

-Add item descriptions by (Discord user) (Discord user) RoyBoy#2007


---

## [v4.7.9](https://blog.bconomy.net/2021/03/15/v4-7-9/) — *2021-03-14*

-Shield raised to 5x insurance, slight craft cost adjustment

-Slight pickaxe/excavator buff (~50% more materials)

-Fixed a fatal crash error


---

## [v4.7.8](https://blog.bconomy.net/2021/03/14/v4-7-8/) — *2021-03-14*

-Add item descriptions by (Discord user) and eld#3526

-Fix glitch where force unequipping would not destroy item

-Fix glitch where 3+ of some crops could be planted

-Pickaxes now have a 30 second cooldown like before


---

## [v4.7.7](https://blog.bconomy.net/2021/03/14/v4-7-7/) — *2021-03-14*

-Fertilizer fix


---

## [v4.7.6](https://blog.bconomy.net/2021/03/14/v4-7-6/) — *2021-03-13*

-Fertilizer can now be used with "bfertilize"

-Items can be looked up with "bitem " – this currently has no meaningful information aside from numerical ID but it's there

-Exploring has a min cooldown of 5 minutes if a pickaxe of any type is equipped


---

## [v4.7.5](https://blog.bconomy.net/2021/03/13/v4-7-5/) — *2021-03-13*

-Diamond Excavator – a MUCH stronger version of the normal pickaxe

-Rocks gained from normal pickaxe slightly decreased


---

## [v4.7.4](https://blog.bconomy.net/2021/03/13/v4-7-4/) — *2021-03-13*

-Fix coffee and certain prestige bonuses not registering


---

## [v4.7.3](https://blog.bconomy.net/2021/03/13/v4-7-3/) — *2021-03-13*

-Fatal crash fix


---

## [v4.7.2](https://blog.bconomy.net/2021/03/13/v4-7-2/) — *2021-03-13*

-Fix glitch where harvesting more of 1 crop type would not register item(s)

-Introducing the ⛏️ Pickaxe! Equipping a pickaxe will greatly boost the Rocks, Diamonds, Artifacts and Fossils you gain from exploring

– PC renamed to Disruptor, which will prevent you being scanned by users from showing up on brobscan

– Hearty Loaf doubles items gained from explore

-Other users’ factions can now be looked up with pings (ex. bfac (Discord user))


---

## [v4.7.0](https://blog.bconomy.net/2021/03/13/v4-7-0/) — *2021-03-13*

-Robbing Radar now allows you to view stats about another user regarding their robbing – how much you can steal, your fail rate, time until robbable, etc

-Global leaderboard no longer displays users' robbability – this is done via new command "brobscan"

– ️ Diamond Shield – grants 2.5x insurance to users who equip

-Global leaderboard reduced to 10 pgs

-☕ Espresso – 3x work BC


---

## [v4.6.6](https://blog.bconomy.net/2021/03/13/v4-6-6/) — *2021-03-12*

-Fix glitch where attempting to craft more of the same item wouldn't work properly

-Fix glitch where some crops couldn't be uprooted

-Decrease weeds from farm 42 -> 24

-Bhelp updates


---

## [v4.6.5](https://blog.bconomy.net/2021/03/13/v4-6-5/) — *2021-03-12*

-7 ALL NEW crops! Check them out with "bplant"

-"bplant" now uses textual rather than numerical IDs

-Cash crop balance changes

-Unlock crafting more than 1 item at a time

-Crafting when you don't have all necessary ingredients now will tell you what you're missing

-Internal crafting structure changes


---

## [v4.6.2](https://blog.bconomy.net/2021/03/12/v4-6-2/) — *2021-03-12*

-Crafting menu improvements

-Fix "vault over capacity" even when grand halls are available


---

## [v4.6.1](https://blog.bconomy.net/2021/03/12/v4-6-1/) — *2021-03-11*

-Transmute changes – amt per transmute is now 1M, resets every 24 hr

-Introducing   Fancy Crates! You can get these from voting, and they have a higher chance of giving you rare items.

-Increased backpack cost to balance fancy crates

-Prestige cost adjustments


---

## [v4.6.0](https://blog.bconomy.net/2021/03/12/v4-6-0/) — *2021-03-11*

-Complete rank system overhaul – to account for the massive amount of earning methods coming in the next updates the rank system has been entirely overhauled.

-Item equipping has finally been added! When an item is equipped it will allow you to use it actively.

-Bomb, Dagger, and Rusty Knife, when equipped, will allow for robberies to be completed easier (2%, 15% and 25% fail rate decrease, respectively)

-BC needed to rob someone will cap at 200k

-Market now only displays raw materials (but all items can still be bought/sold)

-Bot no longer responds to "bc" and "bb" if they are not commands.

-New Item:   Robbing Radar


---

## [v4.5.3](https://blog.bconomy.net/2021/03/09/v4-5-3/) — *2021-03-08*

-New command "bcooldown"/"bcd" – shows your remaining cooldowns for all commands

-Typing "bvote" now shows how much longer until you can vote again


---

## [v4.5.2](https://blog.bconomy.net/2021/03/08/v4-5-2/) — *2021-03-07*

User Market v1.5

-Greatly improved "bmarket" view

-Unlock buying more than 1 of an item at once

-Only max 10 listings per item


---

## [v4.5.1](https://blog.bconomy.net/2021/03/06/v4-5-1/) — *2021-03-06*

-Slight forge cost decrease


---

## [v4.5.0](https://blog.bconomy.net/2021/03/06/v4-5-0/) — *2021-03-06*

-New command – “bforge”!

-Crafting a Forge allows you to melt down items like knives into scrap metal

-Each use of the forge costs gunpowder

-Gunpowder price lowered


---

## [v4.4.4](https://blog.bconomy.net/2021/03/05/v4-4-4/) — *2021-03-05*

-Update "bstatus" with detailed uptime information


---

## [v4.4.3](https://blog.bconomy.net/2021/03/05/v4-4-3/) — *2021-03-05*

-3 new stats


---

## [v4.4.2](https://blog.bconomy.net/2021/03/05/v4-4-2/) — *2021-03-05*

-Bot now notifies you when someone purchases your items


---

## [v4.4.1](https://blog.bconomy.net/2021/03/05/v4-4-1/) — *2021-03-05*

-Various bug fixes

-Eggs can now be transferred between users


---

## [v4.4.0](https://blog.bconomy.net/2021/03/05/v4-4-0/) — *2021-03-05*

-Transition all item commands to now use name IDs instead of numbers (ex. you can use `market rock` instead of `market 0`)


---

## [v4.3.5](https://blog.bconomy.net/2021/03/05/v4-3-5/) — *2021-03-04*

-Add 4 new crafting recipes

-Made scrap metal, rich wool, rusty knife more common. Prices adjusted accordingly

-Increased max market listings

-Bhelp updated with market info

-Btrackpay glitch fix where it wouldn't remove track if you paid off the exact amount


---

## [v4.3.3](https://blog.bconomy.net/2021/03/05/v4-3-3/) — *2021-03-04*

-Add Bomb (no current use)
-Internal crafting changes


---

## [v4.3.2](https://blog.bconomy.net/2021/03/05/v4-3-2/) — *2021-03-04*

-Renamed Money Bag to Artifact

-Renamed Artifact to Tough Leather

-Two new craftable items: Big Backpack grants +750 inventory space, gunpowder has no current use


---

## [v4.3.1](https://blog.bconomy.net/2021/03/04/v4-3-1/) — *2021-03-04*

-Clarifications to listing UI (number avail, not "3x [item] for 1000")

-Add command shorthands to bhelp all

-Fix for transmute cooldown timer


---

## [v4.3.0  USER MARKET V1  – BIGGEST UPDATE IN MONTHS](https://blog.bconomy.net/2021/03/04/v4-3-0-user-market-v1-biggest-update-in-months/) — *2021-03-04*

-Introducing the USER MARKET! Type "bmarket" to get started. Help command has been updated with information regarding user market.

-Adds a basic order book to Bcoins items. Users can now list items for certain sell prices and other users can buy these items at any time.


---

## [v4.2.5](https://blog.bconomy.net/2021/03/04/v4-2-5/) — *2021-03-03*

-Rename "Warehouse" to "Grand Hall"

-New command "bupgradevault" – using Grand Halls will upgrade your faction's vault by 500k each

DEV NOTE: THIS WILL PROBABLY BE LOWERED TO 250K WHEN MORE BENEFITS ARE ADDED TO GRAND HALLS


---

## [v4.2.2](https://blog.bconomy.net/2021/03/04/v4-2-2/) — *2021-03-03*

-Switch voting botlist back to top.gg (they seem to have fixed their issues)

-Extend watering deadline to 30 hours


---

## [v4.2.1](https://blog.bconomy.net/2021/02/28/v4-2-1/) — *2021-02-28*

-Fix voting issue (temporary downtime)


---

## [v4.2.0](https://blog.bconomy.net/2021/02/27/v4-2-0/) — *2021-02-27*

-DM system implemented – now the bot can DM you when certain events happen

-"togglenotifs" – run this in DMs to disable/enable the bot DMing you

-Users are now notified if they are robbed

-Failing to rob someone will invoke a 30 minute cooldown

-Cap for online shield raised from 2mil to 5mil


---

## [v4.1.6](https://blog.bconomy.net/2021/02/26/v4-1-6/) — *2021-02-26*

-Include biggest earners and losers on topgambles

-Increased prizes for guessing game (guessed correctly, 1 away, 2 away, 3 away, etc)

-24 hr cooldown upon guessing number correctly

-Notifies users if they are on the topgambles list


---

## [v4.1.5](https://blog.bconomy.net/2021/02/26/v4-1-5/) — *2021-02-25*

-New command "btrackpay" – track your loans/debts to other users!

-Added "all time top balance" to stats page

-Bot no longer responds to "bc" unless it is a crafting command


---

## [v4.1.0](https://blog.bconomy.net/2021/02/25/v4-1-0/) — *2021-02-25*

-Massively improved bhelp command


---

## [v4.0.0](https://blog.bconomy.net/2021/02/25/v4-0-0/) — *2021-02-25*

-Implement bot sharding
*DEV NOTE: This is a MASSIVE change to the bot’s internal infrastructure! Please let me know if any unexpected behavior occurs!


---

## [v3.9.5](https://blog.bconomy.net/2021/02/25/v3-9-5/) — *2021-02-25*

-Topgambles is back! Type “btopgambles”/”btg” to see the gambling leaderboard (24hr)

-Fix leaving factions


---

## [v3.9.4](https://blog.bconomy.net/2021/02/25/v3-9-4/) — *2021-02-24*

-Re-enable faction disbanding


---

## [v3.9.3](https://blog.bconomy.net/2021/02/23/v3-9-3/) — *2021-02-23*

-Vastly improved anticheat with better alt detection


---

## [v3.9.2](https://blog.bconomy.net/2021/02/23/v3-9-2/) — *2021-02-22*

-Stats page! Type "bstats" to view. Very rudimentary and only contains gamble stats for now.


---

## [v3.9.1](https://blog.bconomy.net/2021/02/22/v3-9-1/) — *2021-02-22*

-Memory leak fix for voting server


---

## [v3.9.0](https://blog.bconomy.net/2021/02/22/v3-9-0/) — *2021-02-22*

-Memory leak fix

*DEV NOTE: This update includes massive changes to the Bcoins internal code. Please report anything that isn’t working as intended!


---

## [v3.8.0](https://blog.bconomy.net/2021/02/22/v3-8-0/) — *2021-02-22*

-Emergency partial memory leak fix

*DEV NOTE: Please report any unexpected behavior. This fix was added without extensive testing


---

## [v3.7.8](https://blog.bconomy.net/2021/02/22/v3-7-8/) — *2021-02-21*

-Factions can now be levelled up to Lv 100

*DEV NOTE: This serves no purpose right now aside from increasing your spot on top factions! By reaching level 20 you have all faction benefits in the game. I'm adding this now so players have a BC sink in case they wish to prepare for future updates.


---

## [v3.7.7](https://blog.bconomy.net/2021/02/22/v3-7-7/) — *2021-02-21*

-Updated bhelp with lots of information and FAQs


---

## [v3.7.6](https://blog.bconomy.net/2021/02/21/v3-7-6/) — *2021-02-20*

-You can only incubate your own eggs now


---

## [v3.7.5](https://blog.bconomy.net/2021/02/20/v3-7-5/) — *2021-02-20*

-Fix pricing error with some commodities (ex. ADA/Cardano)


---

## [v3.7.4](https://blog.bconomy.net/2021/02/20/v3-7-4/) — *2021-02-20*

-Users with balances over 2mil+ cannot reset their rob shield by being active (4hr shield on successful rob still applies)

-Disable disband factions feature until a fix is implemented


---

## [Bcoins Website Update](https://blog.bconomy.net/2021/02/20/bcoins-website-update/) — *2021-02-20*

-Proper https:// SSL security

-Website displays properly on mobile


---

## [v3.7.3](https://blog.bconomy.net/2021/02/19/v3-7-3/) — *2021-02-19*

-Plants now wither away and die if not watered in 24 hours


---

## [v3.7.2](https://blog.bconomy.net/2021/02/19/v3-7-2/) — *2021-02-19*

-Faction changes

-Voting changes

-Internal fixes and optimizations


---

## [v3.7.1](https://blog.bconomy.net/2021/02/19/v3-7-1/) — *2021-02-18*

-Fix voting system to properly register user votes


---

## [v3.7.0](https://blog.bconomy.net/2021/02/19/v3-7-0/) — *2021-02-18*

-New voting system! This change should make votes register easier, and will almost never go down like the old vote command. Please try this out and let me know if it works! This was a big change to code.


---

## [v3.6.0](https://blog.bconomy.net/2021/02/18/v3-6-0/) — *2021-02-18*

-The Rock Paper Scissors update! Challenge your friends to Rock Paper Scissors for that sweet sweet BC.

-Command usage is "brps  "


---

## [v3.5.0](https://blog.bconomy.net/2021/02/16/v3-5-0/) — *2021-02-15*

-Implement Prestige V perk


---

## [v3.4.9](https://blog.bconomy.net/2021/02/16/v3-4-9/) — *2021-02-15*

-Maximum bet is now 5mil (sorry (Discord user)…)

-No maximum rob amount (15% of target balance, no max)

-Prestige cost adjustment


---

## [v3.4.7](https://blog.bconomy.net/2021/02/15/v3-4-7/) — *2021-02-14*

-Minor DB and networking/security fixes

-Create framework for additional bot list support


---

## [v3.4.6](https://blog.bconomy.net/2021/02/15/v3-4-6/) — *2021-02-14*

-Users who boost this server will automatically recieve 500k BC


---

## [Bcoins Helper v1.2.0](https://blog.bconomy.net/2021/02/14/bcoins-helper-v1-2-0/) — *2021-02-14*

-Better handling of autodelete in channels that aren't command channels


---

## [v3.4.5](https://blog.bconomy.net/2021/02/13/v3-4-5/) — *2021-02-13*

-Max 3 of any crop can be planted


---

## [v3.4.3](https://blog.bconomy.net/2021/02/13/v3-4-3/) — *2021-02-12*

-Trying to fix passive earns again…

(It worked. Thank god.)


---

## [2/13 Changelog: v3.4.2](https://blog.bconomy.net/2021/02/13/2-13-changelog-v3-4-2/) — *2021-02-12*

-Fix for passive earns not registering

Reverted to v3.4.0 due to bugs…


---

## [v3.4.0](https://blog.bconomy.net/2021/02/13/v3-4-0/) — *2021-02-12*

THE BANNERS UPDATE

-Added 12 ALL NEW faction banners! Type "bbanners" for more info!


---

## [v3.3.1](https://blog.bconomy.net/2021/02/13/v3-3-1/) — *2021-02-12*

-Added up to 9 plots of land available for plot purchase

-Plot cost now scales exponentially


---

## [2/12 Changelog: v3.3.0](https://blog.bconomy.net/2021/02/12/2-12-changelog-v3-3-0/) — *2021-02-12*

THE FARMING UPDATE!!!!

-NEW farming feature! Type "bhelp farming" to get started.

-Internal fixes


---

## [2/12 Changelog: v3.2.0](https://blog.bconomy.net/2021/02/12/2-12-changelog-v3-2-0/) — *2021-02-11*

-Updated guessing game, now you earn incremental rewards for guessing close to the jackpot number. Prize raised to 200k BC

-Updated bhelp command


---

## [v3.1.5.1](https://blog.bconomy.net/2021/02/12/v3-1-5-1/) — *2021-02-11*

-Removed random jackpots due to bugs

-Updated bhelp


---

## [v3.1.5](https://blog.bconomy.net/2021/02/11/v3-1-5/) — *2021-02-11*

-New giveaway system


---

## [2/11 Changelog: v3.1.4](https://blog.bconomy.net/2021/02/11/2-11-changelog-v3-1-4/) — *2021-02-10*

-New game: Guess my number! Type "bguessnumber" to get started. A roulette-like game where you can guess a number between 1-100 to win a jackpot.

-Internal fixes


---

## [2/9 Changelog: v3.1.3](https://blog.bconomy.net/2021/02/09/2-9-changelog-v3-1-3/) — *2021-02-08*

-Introducing faction leaderboard! Type "btopfactions"/"btf" to view how your faction ranks.

-Fixed multiple fatal crash errors

Made eggs easier to find (Ancient Fossil)


---

## [2/5 Changelog: v3.1.2.1](https://blog.bconomy.net/2021/02/05/2-5-changelog-v3-1-2-1/) — *2021-02-05*

-Fixed bug with faction kicking

-Reinstated 5k BC join bonus with alt abuse prevention

-Rate limiting

-Big bets are posted to (Discord channel)

-Internal fixes


---

## [2/4 Changelog: v3.1.2](https://blog.bconomy.net/2021/02/04/2-4-changelog-v3-1-2/) — *2021-02-04*

-More command shorthands

-Ability to give other users items

-New crafting recipes (no use for these yet!)

-Updated help menu

-Internal fixes


---

## [2/4 Changelog: v3.1.1](https://blog.bconomy.net/2021/02/04/2-4-changelog-v3-1-1/) — *2021-02-03*

-Quality of life changes – new command shorthands, ability to use "all" when selling items or stocks

-Work and explore will no longer reset sporadically

-Many bugfixes

-Server leaderboard now properly functions


---

## [2/3 Changelog: v3.1](https://blog.bconomy.net/2021/02/03/2-3-changelog-v3-1/) — *2021-02-03*

-New stock market! Now fetches LIVE stock data from US markets (NYSE & NASDAQ) and crypto markets (Kraken). Type "bstockmarket" to open an account and get started!

-150k maximum combined balance for bank and stock market

-Adjusted prestige perks – double stonk market capacity, 50k bank capacity

-Many bug fixes

-New shorthand commands (see bhelp allcmds!)

-Adjusted rank protection for robbing/raiding

-Adjusted explore loot chances


---

## [1/30 Changelog](https://blog.bconomy.net/2021/01/30/1-30-changelog/) — *2021-01-30*

-Re-adjust rank costs – all rank costs AND earn rates for all earn commands have been increased

-Decrease default transmute from 7 days cooldown to 4 days cooldown

-Increase ascend costs

-Made certain rare items easier to find

-Bank size increased to 50k for all users, interest rate adjusted downward to 20

-Prestiged users get max bank size of 100k


---

## [1/29 Changelog](https://blog.bconomy.net/2021/01/29/1-29-changelog/) — *2021-01-29*

-Leaderboard changes – users only show up on Global Leaderboard if they have a balance of ~15000 BC or greater

-Server leaderboard no longer displays pages

-Explore loot table adjustments

-Prestige 3 ability is now +70 earned from work command


---

## [1/28 Changelog](https://blog.bconomy.net/2021/01/28/1-28-changelog/) — *2021-01-28*

-Hosting changes (better uptime)

-Loot table adjustments for explore

-Faction logs are enabled! Type "bfaclogs" to view faction logs.

-Minor faction log fixes

-Fixed glitch with faction invites


---

## [1/27 Changelog](https://blog.bconomy.net/2021/01/27/1-27-changelog/) — *2021-01-27*

-Fix error with some user IDs not working

-Max rob is now 15% of total balance (capped at 100k) instead of 20k


---

## [1/19 Changelog](https://blog.bconomy.net/2021/01/19/1-19-changelog/) — *2021-01-19*

-Minimum insurance set to 15k for all users

-Limit global leaderboard pages to 15

-Adjust bank interest to 30% daily compounded

-Fix leaderboard display

-Internal fixes


---

## [1/18 Changelog](https://blog.bconomy.net/2021/01/18/1-18-changelog/) — *2021-01-18*

-Bank interest default raised to 40% (80% for prestiged users)

-Robbing users now resets their cooldown to 4 hours (no more chain robbing)

-Various bugfixes


---

## [1/12 Changelog](https://blog.bconomy.net/2021/01/12/1-12-changelog/) — *2021-01-12*

-New command "bfixbalance" to fix incorrect/corrupt user balances

-Fixed this server's BC join bonus

-More donor perks implemented

-Begin porting database to MySQL

-Fixed "double register command" glitch

-Upgraded bot's internal libraries (now running djs-light-v12) (I haven't fully tested this but it should work so please let me know if any new bugs crop up)


---

## [1/10 Changelog](https://blog.bconomy.net/2021/01/10/1-10-changelog/) — *2021-01-10*

-Bot prefix is now "b"

-New work/explore functions! Explore has a cooldown of 30 seconds, and is more interactive than the previous explore. Old "explore" function has been renamed to "work" and features somewhat lower income (this is more than made up by the "explore" function)

-Rank cost rebalances

-Removed "setserverprefix" command

-Fixed glitch where users could join (Discord channel) and farm 5k BC bonuses under certain circumstances

-Fixed glitch where "createfaction" and "changefactionname" commands would not execute

-Nerfed naval fleets – 33% instead of 50% of unit price earned

-Implemented seaplanes – each seaplane decreases exp time by 4 hours

-Max faction level cap raised to level 20

-Max user count per faction raised to 12


---

## [1/8 Changelog](https://blog.bconomy.net/2021/01/08/1-8-changelog/) — *2021-01-08*

-Fixed longtime leaderboard glitch – server leaderboard no longer displays duplicate users with same balance

-Lotto pool now starts at base 750,000 BC and tickets stack on top

-Users who join this server will gain a 5k BC reward

-More leaderboard fixes


---

## [1/7 Changelog](https://blog.bconomy.net/2021/01/07/1-7-changelog/) — *2021-01-07*

-Added lottery. Type "bclottery" to access this

-Users can no longer be raided if they have been online in the last 4 hours


---

## [1/5 Changelog](https://blog.bconomy.net/2021/01/05/1-5-changelog/) — *2021-01-05*

-Leaderboard is now per-server by default

-Faction list is also per-server

*Note: server leaderboard may take time to populate, users will appear once they check their balance at least once in a server


---

## [1/4 Changelog](https://blog.bconomy.net/2021/01/04/1-4-changelog/) — *2021-01-04*

-Removed warchest from faction view

-New look for bchelp command


---

## [1/3 Changelog](https://blog.bconomy.net/2021/01/03/1-3-changelog/) — *2021-01-03*

-Robbing/raiding has been revamped!

Faction is no longer required to rob/raid

20k is the max you can steal per raid

You can no longer take anything under the target's insurance value

Warchest has been deprecatd

Maximum penalty per rob is 5k

No more police – target will recieve any money that is stolen upon failure

-Gambling leaderboard has been upgraded

Now displays monthly, weekly, and daily top gambles

-Various bugfixes

Please let me know if there are any new bugs or suggestions!


---

# 2020 (3 releases)

## [12/23 Changelog](https://blog.bconomy.net/2020/12/24/12-23-changelog/) — *2020-12-23*

-Fixed voting – the bot should now credit you right after you vote.

-Fixed transfer, invite, etc. commands to work with IDs and mobile tags

Note: Warchest will be removed in the next update so withdraw any balances you have in there if you're using it for storage!

Update: Warchest will NOT be removed but will no longer be used for raiding. It is OK to keep money in there for now.


---

## [12/20 Changelog](https://blog.bconomy.net/2020/12/20/12-20-changelog/) — *2020-12-20*

-More bugfixes

-Implement Prestige perks for Prestiges 1 and 2

-Removed user DM raid notifs

-If a user got raided then they will get a notif next time they check bal.

-Applied fix to allow votes to update faster


---

## [12/19 Changelog](https://blog.bconomy.net/2020/12/19/12-19-changelog/) — *2020-12-18*

-Reading other users' balances no longer indicates when they will get their next BC reward

-Voting is now fully functional! Command is "bcvote"/"vote"

-Balance cmd will show how far you are from the next rank/ascension in BC

-Fixed user balance mismatch error

-Added more ranks

You might have gone down a rank or two – this is normal! Your rank name may have changed but your rank reward and perks have stayed the same.

-Rebalanced rank costs to reflect voting rewards and exp

-Exp now has a 50% floor minimum

-Voting reward now scales with your rank

-Better "bchelp" instructions

-Various bugfixes


---

