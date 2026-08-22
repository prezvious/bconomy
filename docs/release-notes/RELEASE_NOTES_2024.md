# Bconomy Release Notes — 2024

> Source: [Bconomy Updates Category](https://blog.bconomy.net/category/updates/)

**Total Updates in 2024**: 15

[Back to Release Notes Index](README.md) | [View All Releases](ALL_RELEASE_NOTES.md)

---

## [Game Update](https://blog.bconomy.net/2024/12/27/game-update-5/)
**Date:** 2024-12-27

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

## [Game Update](https://blog.bconomy.net/2024/12/25/game-update-4/)
**Date:** 2024-12-25

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

## [Game Update](https://blog.bconomy.net/2024/12/24/game-update-3/)
**Date:** 2024-12-24

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

## [The Boss Fight Update](https://blog.bconomy.net/2024/12/16/the-boss-fight-update/)
**Date:** 2024-12-16

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

## [Game Patch](https://blog.bconomy.net/2024/12/06/game-patch-4/)
**Date:** 2024-12-06

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

## [The Quests Update: A Cold Start](https://blog.bconomy.net/2024/12/05/a-cold-start-quests-update/)
**Date:** 2024-12-05

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

## [Game Update](https://blog.bconomy.net/2024/11/25/game-update-2/)
**Date:** 2024-11-25

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

## [Game Update](https://blog.bconomy.net/2024/11/09/game-update/)
**Date:** 2024-11-09

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

## [Game Patch](https://blog.bconomy.net/2024/11/07/game-patch-3/)
**Date:** 2024-11-07

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

## [A Pets Update](https://blog.bconomy.net/2024/11/05/a-pets-update/)
**Date:** 2024-11-05

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

## [Game Patch](https://blog.bconomy.net/2024/08/21/game-patch-2/)
**Date:** 2024-08-21

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

## [The Fearsome Factions Update](https://blog.bconomy.net/2024/08/19/the-freaky-factions-update/)
**Date:** 2024-08-19

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

## [Game Patch](https://blog.bconomy.net/2024/08/09/game-patch/)
**Date:** 2024-08-09

- Fancy new graphics for added and renamed items from previous update

- Renamed some items changed in previous update

- Fixed a critical bug with Discord UI display

---

## [Game Update – Laying the Groundwork](https://blog.bconomy.net/2024/08/09/game-update-laying-the-groundwork/)
**Date:** 2024-08-08

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

## [Bconomy is Back (2024 Relaunch)](https://blog.bconomy.net/2024/08/06/bconomy-is-back-2024-relaunch/)
**Date:** 2024-08-06

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

