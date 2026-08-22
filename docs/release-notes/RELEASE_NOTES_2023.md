# Bconomy Release Notes — 2023

> Source: [Bconomy Updates Category](https://blog.bconomy.net/category/updates/)

**Total Updates in 2023**: 14

[Back to Release Notes Index](README.md) | [View All Releases](ALL_RELEASE_NOTES.md)

---

## [Bconomy v8.2.0](https://blog.bconomy.net/2023/11/07/bconomy-v8-2-0/)
**Date:** 2023-11-07

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

## [Minor Update (10/16/23)](https://blog.bconomy.net/2023/10/16/minor-update-10-16-23/)
**Date:** 2023-10-16

-Leftover bug fixes and improvements to Discord client

-Slight adjustment to farm crop harvest rewards

---

## [Bconomy v8.1.0](https://blog.bconomy.net/2023/10/16/bconomy-v8-1-0/)
**Date:** 2023-10-15

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

## [Bconomy v8.0.1](https://blog.bconomy.net/2023/08/27/bconomy-v8-0-1/)
**Date:** 2023-08-26

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

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/14/bconomy-zero/)
**Date:** 2023-07-13

-Renamed Fertilizer to "Manure" and it is no longer craftable, instead it's Hunt loot. Re-enabled for use on crops (-30M for all).

-Fixed Hard Drives not being able to be used multiple times in one command, and not updating Web UI when used.

-Fixed Tractor autoharvest added # being inaccurate on send message.

---

## [Bconomy “Zero” – Update 4](https://blog.bconomy.net/2023/07/12/bconomy-zero-update-4/)
**Date:** 2023-07-11

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

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/11/bconomy-zero-2/)
**Date:** 2023-07-11

-Updates to random events and action boosts to be slightly less common, slightly lower rewards/multipliers, and add more funny messages

-Fix numerous bugs:

Autosell not toggleable from Discord client (Thanks @stackrstarve1500)

Long-term Bank bugs (losing money on withdraw, not useable from Discord client)**
NOTE: If you lost money from this please open a support request** if you have not already

-Temporarily disabled Prestige view from Discord client to prevent confusion

-Misc improvements

---

## [Bconomy “Zero”](https://blog.bconomy.net/2023/07/11/bconomy-zero-3/)
**Date:** 2023-07-10

-Fixed certain items not displaying properly on Discord client

-Fixed certain button interacts causing errors (in Market All view and Item Info view)

Thank you @henpod__5 for reporting!

---

## [Bconomy “Zero” – Update 3](https://blog.bconomy.net/2023/07/11/bconomy-zero-update-3/)
**Date:** 2023-07-10

-New Events: **Random Events** and **Action Boosts**

**Random Events** spawn randomly in chat and last for 15 minutes. Anyone who sends a message in chat from Discord or the Web Client in the meantime receives the rewards.

**Action Boosts** replace the Finger Snaps and will cause for boosts from 3x (more common) to 20x (rarer). Like Finger Snaps, these stack with item boosts (for ex. 10x Mine Boost + 4x Diamond Pick = 40x Boost)

-Web UI has been updated with improvements, and a live display of active boosts, and total boost multiplier on top of action buttons. Actions no longer log into the General channel (Console only).

---

## [Bconomy “Zero” – Update 2](https://blog.bconomy.net/2023/07/09/bconomy-zero-update-2/)
**Date:** 2023-07-09

-Web Client chat history now shows a log of previous messages sent on first load. This syncs with deleted and edited messages on the Discord side.

---

## [Bconomy “Zero” – Update 1](https://blog.bconomy.net/2023/07/09/bconomy-zero-update-1/)
**Date:** 2023-07-08

-Server migration has finished and both web and Discord client are stable. Thanks for your patience!

-Major facelift and redesign was applied to [https://bcono.my/](https://bcono.my/) to show registered user count, showcase of Bconomy on web and Discord, provide links to Community server.

-Web Client received multiple changes to improve gameplay and user experience (these were coded months ago, but never made it to Live until today)

-Addressed multiple crippling bugs preventing proper gameplay in the Discord and Web Client. Both should be fully functional once again.

-Re-enabled chat relay between Web Client and Community Server with fixes to prevent ping abuse.

-Misc. performance improvements, fixes, etc…

---

## [Bconomy Announcement](https://blog.bconomy.net/2023/07/08/bconomy-announcement/)
**Date:** 2023-07-07

-I will be migrating the main server the Bconomy services are hosted on over the next few days. Expect some downtime for the web interface and Discord app.

-In the coming month, I hope to iron out any remaining bugs in the base game that are present on the Discord and Web client, as well as finish up any missing features that were dropped in the core game rewrite (faction invites, etc).

-Classic features (giving items and money, Community server GW, Faction warchest) will be returning in their original state, with no caps, restrictions, etc in place.

-"Automated" seasonal content will be added (custom Web themes, special boxes, etc) to keep the game fresh, even in long periods of decreased development.

**It's fairly obvious that Bconomy has been left in a state of disrepair over the last few months. It would be an absolute shame for this project to fade away – the least I can do is patch up core functionality and apply a fresh coat of paint so that it's still enjoyable. These fixes won't happen overnight but I'll be doing my best to shore up the core gameplay in my free time or if I need a break from other endeavors.** Many of these fixes may be implemented in small increments and won't be publicly announced to prevent spam.

Thanks as always.

-Wewert

---

## [Q&A Session – Feb/March 2023](https://blog.bconomy.net/2023/02/24/qa-session-feb-march-2023/)
**Date:** 2023-02-24

Hey folks – I'm currently holding a casual Q&A session for the next 24 hours on the Bcommunity server about the game, its future, and everything in between. Hopefully this will become a monthly or bi-monthly event. Drop by if you have the time!

[https://discord.gg/kq8ERdxF](https://discord.gg/kq8ERdxF)

---

## [February Community Update](https://blog.bconomy.net/2023/02/01/february-community-update/)
**Date:** 2023-02-01

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

