'use strict';

const CATALOG_VERSION = '3.0.0';

const RARITY_STACKS = Object.freeze({
    Common: Object.freeze({ min: 25, max: 100, weight: 64 }),
    Uncommon: Object.freeze({ min: 15, max: 60, weight: 32 }),
    Rare: Object.freeze({ min: 8, max: 35, weight: 16 }),
    'Very Rare': Object.freeze({ min: 4, max: 18, weight: 8 }),
    'Ultra Rare': Object.freeze({ min: 2, max: 8, weight: 4 }),
    Exceptional: Object.freeze({ min: 1, max: 1, weight: 1 })
});

const DOMAIN_NAMES = Object.freeze({
    agriculture_food: 'Agriculture & Food',
    forestry_wood: 'Forestry & Wood',
    textiles_leather: 'Textiles & Leather',
    mining_minerals: 'Mining & Minerals',
    metal_fabrication: 'Metal Fabrication',
    construction_building: 'Construction & Building Services',
    chemicals_polymers: 'Chemicals, Polymers & Coatings',
    machinery_tools: 'Machinery & Tools',
    fluid_systems: 'Fluid Systems',
    electrical_electronics: 'Electrical & Electronics',
    energy_storage: 'Energy & Storage',
    heavy_transport: 'Road, Rail & Heavy Transport',
    marine: 'Marine',
    outdoor_safety: 'Outdoor, Household & Safety',
    medical_science: 'Medical, Laboratory & Science',
    defense_security: 'Defense & Security',
    aerospace: 'Aerospace',
    space_life_support: 'Space & Life Support'
});

const DOMAIN_ICONS = Object.freeze({
    agriculture_food: 'lucide:wheat',
    forestry_wood: 'lucide:trees',
    textiles_leather: 'lucide:shirt',
    mining_minerals: 'lucide:mountain',
    metal_fabrication: 'lucide:anvil',
    construction_building: 'lucide:hard-hat',
    chemicals_polymers: 'lucide:flask-conical',
    machinery_tools: 'lucide:cog',
    fluid_systems: 'lucide:pipette',
    electrical_electronics: 'lucide:zap',
    energy_storage: 'lucide:battery-charging',
    heavy_transport: 'lucide:truck',
    marine: 'lucide:ship-wheel',
    outdoor_safety: 'lucide:tent-tree',
    medical_science: 'lucide:microscope',
    defense_security: 'lucide:shield-check',
    aerospace: 'lucide:plane',
    space_life_support: 'lucide:orbit'
});

const ACRONYMS = new Set([
    'AISI', 'ASTM', 'EPDM', 'EVA', 'FKM', 'GaN', 'HDPE', 'HSLA', 'LFP', 'NMC',
    'PBI', 'PBO', 'PCD', 'PEEK', 'PET', 'PTFE', 'PVC', 'TPU', 'UHMWPE', 'UV'
]);

function displayNameFromId(id) {
    return String(id)
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Za-z])([0-9])/g, '$1 $2')
        .replace(/([0-9])([A-Za-z])/g, '$1 $2')
        .split(/\s+/)
        .map(part => ACRONYMS.has(part) || /^[A-Z0-9-]{2,}$/.test(part) ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ')
        .replace(/\bASTMA (?=\d)/g, 'ASTM A')
        .replace(/\b316 L\b/g, '316L')
        .replace(/\b304 L\b/g, '304L')
        .replace(/\bPVC\s+(Panel|Hose|Resin)/g, 'PVC $1')
        .replace(/ Percent$/i, '%');
}

function iconForMaterial(id, domain) {
    if (/Acid|Oil|Solution|Sap|Peroxide|Hydroxide/i.test(id)) return 'lucide:droplets';
    if (/Wire|Cable|Cord|Rope|Tow|Lacing/i.test(id)) return 'lucide:cable';
    if (/Tube|Pipe|Hose|Tubing/i.test(id)) return 'lucide:route';
    if (/Sheet|Plate|Panel|Fabric|Film|Membrane|Foil|Paper|Mat|Cloth/i.test(id)) return 'lucide:file';
    if (/Bar|Rod|Strip|Beam|Board|Culm|Rebar/i.test(id)) return 'lucide:minus';
    if (/Log|Lumber|Plywood|Wood|Bamboo|Rattan|Cork/i.test(id)) return 'lucide:trees';
    if (/Ore|Rock|Sand|Clay|Aggregate|Granules|Powder|Flakes|Pellet|Crystals/i.test(id)) return 'lucide:mountain';
    if (/Fiber|Wool|Hair|Hide|Leather|Felt|Feather|Roving|Down/i.test(id)) return 'lucide:layers-3';
    if (/Grain|Seed|Root|Tuber|Hay|Meal/i.test(id)) return 'lucide:wheat';
    if (/Magnet/i.test(id)) return 'lucide:magnet';
    if (/Glass|Sapphire|Diamond|Nacre|Pearl|Shell/i.test(id)) return 'lucide:gem';
    if (/Blank|Ingot|Briquette/i.test(id)) return 'lucide:box';
    return DOMAIN_ICONS[domain] || 'lucide:package';
}

function unitDescription(unit) {
    const descriptions = {
        kg: 'by kilogram', L: 'by litre', m: 'by metre', 'm²': 'by square metre',
        sheet: 'as a standard sheet', plate: 'as a standard plate', bar: 'as a standard bar',
        blank: 'as a machining blank', roll: 'as a standard roll', spool: 'on a standard spool',
        bale: 'as a compressed bale', block: 'as a standard block', section: 'as a standard section',
        bundle: 'as a controlled bundle', set: 'as a matched set', disc: 'as a standard disc',
        tile: 'as a standard tile', wafer: 'as a standard wafer', substrate: 'as a standard substrate',
        face: 'as a finished seal face', scaffold: 'as a formed scaffold', stone: 'as a finished stone',
        pad: 'as a standard pad', sponge: 'as a formed sponge', shell: 'as an individual shell',
        piece: 'as an individual piece', panel: 'as a standard panel', core: 'as a standard core',
        cartridge: 'as a replaceable cartridge'
    };
    return descriptions[unit] || `as one ${unit}`;
}

function descriptionForMaterial(id, unit, domain, sourceAction, rarity) {
    const name = displayNameFromId(id);
    const acquisition = {
        mine: 'recovered during mining operations',
        explore: 'recovered through exploration',
        hunt: 'obtained through hunting',
        fish: 'obtained through fishing'
    }[sourceAction] || sourceAction.toLowerCase();
    return `${name} is ${rarity.toLowerCase()} ${DOMAIN_NAMES[domain].toLowerCase()} stock measured ${unitDescription(unit)} and ${acquisition}. The specified grade and physical form make it an unambiguous input for fabrication, maintenance, facilities, and equipment upgrades.`;
}

function entries(domain, sourceAction, rarity, rows) {
    return rows.map(([id, unit]) => Object.freeze({
        id,
        name: displayNameFromId(id),
        kind: 'raw',
        domain,
        domainName: DOMAIN_NAMES[domain],
        description: descriptionForMaterial(id, unit, domain, sourceAction, rarity),
        unit: Object.freeze({ id: unit, singular: unit, plural: unit }),
        icon: iconForMaterial(id, domain),
        sourceAction,
        rarity,
        baseStack: RARITY_STACKS[rarity],
        weight: RARITY_STACKS[rarity].weight,
        tags: Object.freeze(['raw-material', domain, sourceAction, rarity.toLowerCase().replace(/\s+/g, '-')])
    }));
}

const MATERIALS = [
    ...entries('mining_minerals', 'mine', 'Common', [
        ['HematiteOre', 'kg'], ['MagnetiteOre', 'kg'], ['BauxiteOre', 'kg'], ['ChalcopyriteOre', 'kg'],
        ['GalenaOre', 'kg'], ['SphaleriteOre', 'kg'], ['CassiteriteOre', 'kg']
    ]),
    ...entries('mining_minerals', 'mine', 'Uncommon', [
        ['IlmeniteConcentrate', 'kg'], ['ChromiteOre', 'kg'], ['PyrolusiteOre', 'kg'],
        ['MolybdeniteConcentrate', 'kg'], ['ScheeliteConcentrate', 'kg'], ['PhosphateRock', 'kg']
    ]),
    ...entries('mining_minerals', 'mine', 'Rare', [
        ['MonaziteSand', 'kg'], ['SpodumeneConcentrate', 'kg'], ['SylviniteOre', 'kg'],
        ['GypsumRock', 'kg'], ['SilicaSand', 'kg']
    ]),
    ...entries('mining_minerals', 'mine', 'Very Rare', [
        ['LimestoneAggregate', 'kg'], ['BentoniteClay', 'kg'], ['KaolinClay', 'kg']
    ]),
    ...entries('mining_minerals', 'mine', 'Ultra Rare', [
        ['GraphiteFlake', 'kg'], ['NativeSulfur', 'kg'], ['FluoriteOre', 'kg']
    ]),
    ...entries('mining_minerals', 'mine', 'Exceptional', [['ZirconSand', 'kg']]),

    ...entries('metal_fabrication', 'mine', 'Common', [
        ['AISI1018SteelRoundBar', 'kg'], ['ASTMA36SteelFlatBar', 'kg'], ['ASTMA1011HotRolledSteelSheet', 'm²'],
        ['ASTMA1008ColdRolledSteelSheet', 'm²'], ['ASTMA36StructuralSteelPlate', 'kg'],
        ['ASTMA653GalvanizedSteelSheet', 'm²'], ['LowCarbonSteelWireSpool', 'spool']
    ]),
    ...entries('metal_fabrication', 'mine', 'Uncommon', [
        ['StainlessSteel304Sheet', 'm²'], ['StainlessSteel304WireSpool', 'spool'], ['StainlessSteel316LTube', 'm'],
        ['GrayCastIronIngot', 'kg'], ['Aluminum6061T6Plate', 'kg'], ['Aluminum7075T6Bar', 'kg'], ['C110CopperSheet', 'm²']
    ]),
    ...entries('metal_fabrication', 'mine', 'Rare', [
        ['C110CopperRod', 'kg'], ['C360BrassBar', 'kg'], ['C932BearingBronzeIngot', 'kg'],
        ['Nickel200Sheet', 'm²'], ['NickelAlloy718Bar', 'kg']
    ]),
    ...entries('metal_fabrication', 'mine', 'Very Rare', [
        ['Grade2TitaniumSheet', 'm²'], ['Ti6Al4VBar', 'kg'], ['TungstenCarbideBlank', 'blank']
    ]),
    ...entries('metal_fabrication', 'mine', 'Ultra Rare', [['ZincIngot', 'kg']]),
    ...entries('metal_fabrication', 'explore', 'Common', [['CleanCarbonSteelScrap', 'kg'], ['CleanAluminumScrap', 'kg']]),

    ...entries('chemicals_polymers', 'mine', 'Common', [
        ['SodiumChlorideGranules', 'kg'], ['GroundCalciumCarbonate', 'kg'], ['SodaAsh', 'kg'], ['SodiumHydroxideFlakes', 'kg']
    ]),
    ...entries('chemicals_polymers', 'mine', 'Uncommon', [
        ['DioctylTerephthalatePlasticizer', 'L'], ['CalciumZincPVCStabilizer', 'kg'], ['ChlorinatedPolyethyleneImpactModifier', 'kg'],
        ['HinderedAmineLightStabilizer', 'kg'], ['AcrylicLaminationInterlayerFilm', 'roll']
    ]),
    ...entries('chemicals_polymers', 'mine', 'Rare', [
        ['PhosphoricAcid85Percent', 'L'], ['BoricAcidPowder', 'kg'], ['SodiumSilicateSolution', 'L']
    ]),
    ...entries('chemicals_polymers', 'mine', 'Very Rare', [
        ['AmineEpoxyHardener', 'L'], ['RutileTitaniumDioxidePigment', 'kg']
    ]),
    ...entries('chemicals_polymers', 'mine', 'Ultra Rare', [['FurnaceCarbonBlack', 'kg']]),
    ...entries('chemicals_polymers', 'explore', 'Common', [
        ['NaturalRubberSheet', 'm²'], ['HDPEPellets', 'kg'], ['PolypropyleneHomopolymerPellets', 'kg']
    ]),
    ...entries('chemicals_polymers', 'explore', 'Uncommon', [
        ['RigidPVCResinPellets', 'kg'], ['SiliconeRubberSheet', 'm²']
    ]),
    ...entries('chemicals_polymers', 'explore', 'Rare', [['CastAcrylicSheet', 'sheet']]),
    ...entries('chemicals_polymers', 'explore', 'Very Rare', [['BisphenolAEpoxyResin', 'L']]),
    ...entries('chemicals_polymers', 'fish', 'Common', [['ChitosanPowder', 'kg']]),
    ...entries('chemicals_polymers', 'fish', 'Uncommon', [['SodiumAlginatePowder', 'kg']]),
    ...entries('chemicals_polymers', 'fish', 'Rare', [['RefinedFishOil', 'L']]),

    ...entries('forestry_wood', 'explore', 'Common', [
        ['DouglasFirLog', 'section'], ['ClearGradeSitkaSpruceLog', 'section'], ['SouthernYellowPineLog', 'section'],
        ['WesternRedCedarLog', 'section'], ['EuropeanOakLog', 'section'], ['HardMapleLog', 'section'],
        ['BirchLog', 'section'], ['BeechLog', 'section']
    ]),
    ...entries('forestry_wood', 'explore', 'Uncommon', [
        ['PoplarLog', 'section'], ['BambooCulmBundle', 'bundle'], ['CorkBarkSheet', 'sheet'],
        ['NaturalRattanCane', 'm'], ['WoodVeneerSheet', 'sheet'], ['KilnDriedPineBoard', 'm'], ['KilnDriedOakBoard', 'm']
    ]),
    ...entries('forestry_wood', 'explore', 'Rare', [
        ['KilnDriedHardMapleBoard', 'm'], ['ExteriorPlywoodSheet', 'sheet'], ['BirchPlywoodSheet', 'sheet'],
        ['OrientedStrandBoardSheet', 'sheet'], ['MediumDensityFiberboardSheet', 'sheet']
    ]),
    ...entries('forestry_wood', 'explore', 'Very Rare', [
        ['LaminatedVeneerLumberBeam', 'm'], ['WoodFlour', 'kg'], ['PineRosin', 'kg']
    ]),
    ...entries('forestry_wood', 'explore', 'Ultra Rare', [['RefinedLinseedOil', 'L']]),
    ...entries('forestry_wood', 'explore', 'Exceptional', [['NaturalShellacFlakes', 'kg']]),

    ...entries('textiles_leather', 'explore', 'Common', [['CottonFiberBale', 'bale'], ['FlaxFiberBundle', 'bundle']]),
    ...entries('textiles_leather', 'explore', 'Uncommon', [['HempFiberBundle', 'bundle'], ['JuteFiberBale', 'bale']]),
    ...entries('textiles_leather', 'explore', 'Rare', [['WovenNylonFabricRoll', 'm²']]),
    ...entries('textiles_leather', 'explore', 'Ultra Rare', [['AramidFabricRoll', 'm²']]),
    ...entries('textiles_leather', 'hunt', 'Common', [
        ['RawSheepWool', 'kg'], ['WashedWoolRoving', 'kg'], ['AlpacaFiberBale', 'bale'], ['RawCattleHide', 'm²'], ['HorsehairBundle', 'bundle']
    ]),
    ...entries('textiles_leather', 'hunt', 'Uncommon', [
        ['CashmereFiber', 'kg'], ['VegetableTannedCowhide', 'm²'], ['ChromeTannedLeather', 'm²'],
        ['SuedeLeatherSheet', 'm²'], ['GoatskinLeather', 'm²']
    ]),
    ...entries('textiles_leather', 'hunt', 'Rare', [
        ['QiviutFiber', 'kg'], ['DownFeatherFill', 'kg'], ['GooseQuillBundle', 'bundle'], ['BeeswaxBlock', 'kg']
    ]),
    ...entries('textiles_leather', 'hunt', 'Very Rare', [['RawSilkHank', 'kg']]),
    ...entries('textiles_leather', 'hunt', 'Ultra Rare', [['SilkFabricRoll', 'm²']]),
    ...entries('textiles_leather', 'hunt', 'Exceptional', [['FeltedWoolSheet', 'm²']]),
    ...entries('textiles_leather', 'fish', 'Very Rare', [['SalmonLeatherSheet', 'm²']]),
    ...entries('textiles_leather', 'fish', 'Ultra Rare', [['MusselByssusFiberBundle', 'bundle']]),

    ...entries('construction_building', 'mine', 'Common', [
        ['PortlandCementTypeILII', 'kg'], ['HydraulicLime', 'kg'], ['MasonrySand', 'kg'],
        ['CrushedGraniteAggregate', 'kg'], ['ExpandedClayAggregate', 'kg'], ['ClassFFlyAsh', 'kg']
    ]),
    ...entries('construction_building', 'mine', 'Uncommon', [
        ['GroundGranulatedBlastFurnaceSlag', 'kg'], ['Grade60SteelRebar', 'kg'], ['StainlessSteelRebar', 'kg'],
        ['AnnealedCopperPipe', 'm'], ['PEXTubing', 'm']
    ]),
    ...entries('construction_building', 'mine', 'Rare', [
        ['TemperedFloatGlass', 'sheet'], ['LowEInsulatedGlassUnit', 'panel'], ['MineralWoolInsulationBatt', 'm²']
    ]),
    ...entries('construction_building', 'mine', 'Very Rare', [['FiberglassInsulationBatt', 'm²']]),
    ...entries('construction_building', 'explore', 'Common', [
        ['KilnDriedFramingLumber', 'm'], ['PressureTreatedLumber', 'm'], ['GypsumWallboard', 'sheet']
    ]),
    ...entries('construction_building', 'explore', 'Uncommon', [
        ['AsphaltRoofingShingleBundle', 'bundle'], ['BituminousWaterproofingMembrane', 'm²'], ['CeramicFloorTile', 'tile']
    ]),
    ...entries('construction_building', 'explore', 'Rare', [
        ['EPDMRoofingMembrane', 'm²'], ['PorcelainFloorTile', 'tile']
    ]),
    ...entries('construction_building', 'explore', 'Very Rare', [
        ['SilicaAerogelBlanket', 'm²'], ['VacuumInsulatedPanel', 'panel']
    ]),

    ...entries('agriculture_food', 'explore', 'Common', [
        ['HardRedWinterWheatGrain', 'kg'], ['DentCornKernel', 'kg'], ['HulledBarleyGrain', 'kg'],
        ['OatGroat', 'kg'], ['LongGrainRice', 'kg']
    ]),
    ...entries('agriculture_food', 'explore', 'Uncommon', [
        ['SoybeanSeed', 'kg'], ['CanolaSeed', 'kg'], ['SunflowerSeed', 'kg'], ['PeanutKernel', 'kg']
    ]),
    ...entries('agriculture_food', 'explore', 'Rare', [
        ['SugarBeetRoot', 'kg'], ['PotatoTuber', 'kg'], ['CassavaRoot', 'kg']
    ]),
    ...entries('agriculture_food', 'explore', 'Very Rare', [
        ['AlfalfaHayBale', 'bale'], ['CoconutHuskFiber', 'kg']
    ]),
    ...entries('agriculture_food', 'explore', 'Ultra Rare', [['NaturalLatexSap', 'L']]),
    ...entries('agriculture_food', 'hunt', 'Common', [
        ['RenderedAnimalFat', 'kg'], ['DriedBloodMeal', 'kg'], ['FeatherMeal', 'kg']
    ]),
    ...entries('agriculture_food', 'hunt', 'Uncommon', [['BovineBoneMeal', 'kg'], ['LanolinWax', 'kg']]),
    ...entries('agriculture_food', 'hunt', 'Rare', [['FoodGradeGelatinGranules', 'kg'], ['CaseinPowder', 'kg']]),
    ...entries('agriculture_food', 'hunt', 'Very Rare', [['CollagenCasingRoll', 'roll']]),
    ...entries('agriculture_food', 'hunt', 'Ultra Rare', [['NaturalBeeswaxPellet', 'kg']]),
    ...entries('agriculture_food', 'fish', 'Common', [['FishMealGranules', 'kg']]),

    ...entries('machinery_tools', 'mine', 'Common', [
        ['AISI52100BearingSteelRoundBar', 'kg'], ['HardenedSteelDrillRod', 'kg'], ['OilTemperedSpringSteelWire', 'kg'],
        ['AluminumBronzeBar', 'kg'], ['SAE660BearingBronzeTube', 'kg'], ['DuctileIronIngot', 'kg']
    ]),
    ...entries('machinery_tools', 'mine', 'Uncommon', [
        ['TungstenCopperBar', 'kg'], ['OilImpregnatedSinteredBronzeBlank', 'blank'],
        ['ChromiumCarbideOverlayPlate', 'kg'], ['C54400PhosphorBronzeBar', 'kg']
    ]),
    ...entries('machinery_tools', 'mine', 'Rare', [
        ['Maraging300SteelBar', 'kg'], ['CobaltHighSpeedSteelBlank', 'blank'], ['MolybdenumDisulfidePowder', 'kg']
    ]),
    ...entries('machinery_tools', 'mine', 'Very Rare', [
        ['SiliconNitrideBearingBallSet', 'set'], ['YttriaStabilizedZirconiaBlank', 'blank']
    ]),
    ...entries('machinery_tools', 'mine', 'Ultra Rare', [
        ['PolycrystallineDiamondInsertBlank', 'blank'], ['CubicBoronNitrideInsertBlank', 'blank']
    ]),
    ...entries('machinery_tools', 'mine', 'Exceptional', [['RheniumAlloyWireSpool', 'spool']]),
    ...entries('machinery_tools', 'explore', 'Common', [['NaturalRubberVibrationPad', 'pad'], ['CelluloseGasketSheet', 'sheet']]),
    ...entries('machinery_tools', 'explore', 'Uncommon', [['PhenolicLaminateSheet', 'sheet'], ['UHMWPolyethyleneWearStrip', 'm']]),
    ...entries('machinery_tools', 'explore', 'Rare', [['LeatherMachineBeltRoll', 'roll']]),
    ...entries('machinery_tools', 'explore', 'Very Rare', [['LignumVitaeBearingBlank', 'blank']]),
    ...entries('machinery_tools', 'explore', 'Exceptional', [['FineArkansasNovaculiteStone', 'stone']]),

    ...entries('fluid_systems', 'mine', 'Common', [
        ['SeamlessCarbonSteelPipe', 'm'], ['Schedule40Stainless304Pipe', 'm'], ['AnnealedCopperTubeCoil', 'm'],
        ['DuctileIronPipeSection', 'section']
    ]),
    ...entries('fluid_systems', 'mine', 'Uncommon', [
        ['BrassValveBarStock', 'kg'], ['PTFEValveSeatRod', 'm'], ['BorosilicateSightGlassTube', 'm'],
        ['SinteredStainlessFilterDisc', 'disc']
    ]),
    ...entries('fluid_systems', 'mine', 'Rare', [
        ['Duplex2205StainlessPipe', 'm'], ['NickelAlloy625Tube', 'm'], ['VitonFKMSealSheet', 'm²']
    ]),
    ...entries('fluid_systems', 'mine', 'Very Rare', [
        ['HastelloyC276Tube', 'm'], ['SiliconCarbideMechanicalSealFace', 'face']
    ]),
    ...entries('fluid_systems', 'mine', 'Ultra Rare', [['PEEKBearingRod', 'm']]),
    ...entries('fluid_systems', 'explore', 'Common', [['EPDMHose', 'm'], ['NaturalRubberHose', 'm']]),
    ...entries('fluid_systems', 'explore', 'Uncommon', [['FiberReinforcedPVCHose', 'm']]),
    ...entries('fluid_systems', 'explore', 'Rare', [['PolyurethaneTube', 'm'], ['CorkRubberGasketSheet', 'm²']]),
    ...entries('fluid_systems', 'explore', 'Very Rare', [['AramidBraidedHose', 'm'], ['ExpandedPTFEGasketSheet', 'm²']]),
    ...entries('fluid_systems', 'explore', 'Ultra Rare', [['GraphiteFoilGasketSheet', 'm²']]),
    ...entries('fluid_systems', 'fish', 'Common', [['PearlShellValveSeatBlank', 'blank']]),
    ...entries('fluid_systems', 'fish', 'Uncommon', [['FishSkinCollagenMembrane', 'm²']]),
    ...entries('fluid_systems', 'fish', 'Rare', [['ChitinFilterFiber', 'kg']]),

    ...entries('electrical_electronics', 'mine', 'Common', [
        ['OxygenFreeCopperWireSpool', 'spool'], ['ElectrolyticCopperBusbar', 'bar'],
        ['ElectricalSteelLaminationSheet', 'sheet'], ['TinIngot', 'kg'], ['ZincOxideVaristorPowder', 'kg']
    ]),
    ...entries('electrical_electronics', 'mine', 'Uncommon', [
        ['SilverPlatedCopperWire', 'm'], ['NickelPlatedCopperBusbar', 'bar'],
        ['ManganinResistanceWire', 'm'], ['FerriteCoreBlank', 'blank']
    ]),
    ...entries('electrical_electronics', 'mine', 'Rare', [
        ['HighPurityAluminaCeramic', 'blank'], ['BerylliumCopperSpringStrip', 'm'],
        ['SilverContactRivetBlank', 'blank'], ['NeodymiumMagnetBlank', 'blank']
    ]),
    ...entries('electrical_electronics', 'mine', 'Very Rare', [
        ['HighPuritySiliconWafer', 'wafer'], ['GalliumNitrideWafer', 'wafer'], ['SamariumCobaltMagnetBlank', 'blank']
    ]),
    ...entries('electrical_electronics', 'mine', 'Ultra Rare', [['HighPurityGoldBondingWire', 'm']]),
    ...entries('electrical_electronics', 'mine', 'Exceptional', [['SyntheticSapphireSubstrate', 'substrate']]),
    ...entries('electrical_electronics', 'explore', 'Common', [['CelluloseInsulationPaper', 'm²'], ['NaturalRubberCableSleeve', 'm']]),
    ...entries('electrical_electronics', 'explore', 'Uncommon', [['PhenolicElectricalLaminateSheet', 'sheet'], ['MicaPaperRoll', 'm²']]),
    ...entries('electrical_electronics', 'explore', 'Rare', [['AramidInsulationPaper', 'm²']]),
    ...entries('electrical_electronics', 'explore', 'Very Rare', [['PolyimideFilmRoll', 'm²']]),
    ...entries('electrical_electronics', 'explore', 'Ultra Rare', [['SilverNanowireInk', 'L']]),

    ...entries('energy_storage', 'mine', 'Common', [
        ['BatteryGradeLeadIngot', 'kg'], ['GraphiteAnodePowder', 'kg'], ['LithiumIronPhosphatePowder', 'kg'],
        ['NickelHydroxidePowder', 'kg'], ['PotassiumHydroxideFlakes', 'kg']
    ]),
    ...entries('energy_storage', 'mine', 'Uncommon', [
        ['ManganeseDioxideBatteryGrade', 'kg'], ['ZincAnodeSheet', 'm²'],
        ['CopperCurrentCollectorFoil', 'm²'], ['AluminumCurrentCollectorFoil', 'm²']
    ]),
    ...entries('energy_storage', 'mine', 'Rare', [
        ['LithiumCarbonateBatteryGrade', 'kg'], ['CobaltSulfateCrystals', 'kg'], ['NickelSulfateCrystals', 'kg']
    ]),
    ...entries('energy_storage', 'mine', 'Very Rare', [
        ['LithiumNickelManganeseCobaltOxidePowder', 'kg'], ['VanadiumPentoxideElectrolyteGrade', 'kg'],
        ['ProtonExchangeMembraneSheet', 'm²']
    ]),
    ...entries('energy_storage', 'mine', 'Ultra Rare', [
        ['LithiumHexafluorophosphateSalt', 'kg'], ['RareEarthHydrideAlloyPowder', 'kg']
    ]),
    ...entries('energy_storage', 'mine', 'Exceptional', [['PlatinumCatalystMesh', 'm²']]),
    ...entries('energy_storage', 'explore', 'Common', [['CoconutShellActivatedCarbon', 'kg'], ['CelluloseBatterySeparatorPaper', 'm²']]),
    ...entries('energy_storage', 'explore', 'Uncommon', [['HardCarbonPowder', 'kg'], ['NaturalGraphiteFoil', 'm²']]),
    ...entries('energy_storage', 'explore', 'Rare', [['SulfonatedPEEKMembrane', 'm²'], ['CarbonFeltElectrodeSheet', 'm²']]),
    ...entries('energy_storage', 'explore', 'Very Rare', [['AerogelThermalBarrierSheet', 'm²']]),

    ...entries('heavy_transport', 'mine', 'Common', [
        ['RailGradePearliticSteelBar', 'kg'], ['HSLAChassisSteelPlate', 'kg'], ['DuctileIronWheelBlank', 'blank'],
        ['CopperBrakeLineTube', 'm'], ['AluminumBodySheet', 'm²']
    ]),
    ...entries('heavy_transport', 'mine', 'Uncommon', [
        ['AustemperedDuctileIronIngot', 'kg'], ['ChromiumMolybdenumAxleBar', 'kg'], ['SinteredIronFrictionPowder', 'kg']
    ]),
    ...entries('heavy_transport', 'mine', 'Rare', [
        ['BoronUltraHighStrengthSteelSheet', 'm²'], ['StainlessSteelExhaustTube', 'm'], ['BearingGradeSteelTube', 'm']
    ]),
    ...entries('heavy_transport', 'mine', 'Very Rare', [
        ['CarbonCeramicBrakeDiscBlank', 'blank'], ['MagnesiumAlloyBodySheet', 'm²']
    ]),
    ...entries('heavy_transport', 'mine', 'Ultra Rare', [
        ['TitaniumAluminideBar', 'kg'], ['TungstenHeavyAlloyCounterweight', 'piece']
    ]),
    ...entries('heavy_transport', 'explore', 'Common', [
        ['NaturalRubberTireCompound', 'kg'], ['CorkRubberIsolationSheet', 'm²'], ['JuteReinforcementMat', 'm²']
    ]),
    ...entries('heavy_transport', 'explore', 'Uncommon', [
        ['GlassFiberReinforcementCloth', 'm²'], ['RecycledPETAcousticFelt', 'm²']
    ]),
    ...entries('heavy_transport', 'explore', 'Rare', [
        ['CarbonFiberFabricRoll', 'm²'], ['BasaltFiberFabricRoll', 'm²']
    ]),
    ...entries('heavy_transport', 'explore', 'Very Rare', [['AramidHoneycombCore', 'm²']]),
    ...entries('heavy_transport', 'explore', 'Ultra Rare', [['UHMWPEArmorPanel', 'panel']]),
    ...entries('heavy_transport', 'explore', 'Exceptional', [['HighModulusCarbonFiberTow', 'kg']]),

    ...entries('marine', 'fish', 'Common', [
        ['KilnDriedKelpFiber', 'kg'], ['DriedSeagrassFiber', 'kg'], ['OysterShellAggregate', 'kg'],
        ['MusselShellAggregate', 'kg'], ['CalcareousAlgaeAggregate', 'kg'], ['FishScaleCollagenFiber', 'kg']
    ]),
    ...entries('marine', 'fish', 'Uncommon', [
        ['ChitinFlake', 'kg'], ['ChitosanFilmSheet', 'm²'], ['SeaweedAlginateFiber', 'kg'],
        ['CuttlefishBonePowder', 'kg'], ['PearlShellLaminate', 'm²']
    ]),
    ...entries('marine', 'fish', 'Rare', [
        ['SquidPenChitinFilm', 'm²'], ['MarineCollagenMembrane', 'm²'], ['MotherOfPearlSheet', 'm²'],
        ['CrabShellBiocalcium', 'kg']
    ]),
    ...entries('marine', 'fish', 'Very Rare', [
        ['AbaloneShellLaminate', 'm²'], ['ByssusCompositeFiberSheet', 'm²'], ['KelpDerivedCarbonFoam', 'block']
    ]),
    ...entries('marine', 'fish', 'Ultra Rare', [['PearlNacreBearingBlank', 'blank']]),
    ...entries('marine', 'fish', 'Exceptional', [['SpongeSpiculeSilicaMat', 'm²']]),
    ...entries('marine', 'explore', 'Common', [['MarineGradePlywoodSheet', 'sheet'], ['NaturalCorkBuoyancyBlock', 'block']]),
    ...entries('marine', 'explore', 'Uncommon', [['HempMarineRope', 'm']]),
    ...entries('marine', 'explore', 'Rare', [['FlaxSailclothRoll', 'm²']]),
    ...entries('marine', 'explore', 'Very Rare', [['BalsaEndGrainCore', 'm²']]),

    ...entries('outdoor_safety', 'explore', 'Common', [
        ['HardwoodToolHandleBlank', 'blank'], ['WovenRattanPanel', 'panel'], ['CorkInsulationSheet', 'm²']
    ]),
    ...entries('outdoor_safety', 'explore', 'Uncommon', [
        ['WaxedCottonCanvasRoll', 'm²'], ['RecycledPolyesterWebbingRoll', 'm']
    ]),
    ...entries('outdoor_safety', 'explore', 'Rare', [
        ['UVStabilizedNylonFabricRoll', 'm²'], ['ClosedCellEVAFoamSheet', 'm²']
    ]),
    ...entries('outdoor_safety', 'explore', 'Very Rare', [['TransparentPolycarbonateSheet', 'sheet']]),
    ...entries('outdoor_safety', 'explore', 'Ultra Rare', [['UHMWPECord', 'm']]),
    ...entries('outdoor_safety', 'explore', 'Exceptional', [['FusedSilicaWindowBlank', 'blank']]),
    ...entries('outdoor_safety', 'hunt', 'Common', [
        ['DeerHideLeather', 'm²'], ['RawhideLacingCord', 'm'], ['BoarBristleBundle', 'bundle'], ['GooseDownInsulation', 'kg']
    ]),
    ...entries('outdoor_safety', 'hunt', 'Uncommon', [['ShearlingWoolPanel', 'm²'], ['HornButtonBlank', 'blank']]),
    ...entries('outdoor_safety', 'hunt', 'Rare', [['ElkAntlerHandleBlank', 'blank'], ['AnimalSinewCordBundle', 'bundle']]),
    ...entries('outdoor_safety', 'hunt', 'Very Rare', [['MuskOxWoolRoving', 'kg'], ['BeaverFeltSheet', 'm²']]),
    ...entries('outdoor_safety', 'hunt', 'Ultra Rare', [['BisonLeatherSheet', 'm²']]),
    ...entries('outdoor_safety', 'hunt', 'Exceptional', [['SustainablySourcedVicunaFiber', 'kg']]),
    ...entries('outdoor_safety', 'fish', 'Common', [['TilapiaLeatherSheet', 'm²']]),
    ...entries('outdoor_safety', 'fish', 'Uncommon', [['FishScaleReflectiveLaminate', 'm²']]),
    ...entries('outdoor_safety', 'fish', 'Very Rare', [['StingrayLeatherSheet', 'm²']]),

    ...entries('medical_science', 'explore', 'Common', [
        ['MedicalGradeCottonGauzeRoll', 'm²'], ['CelluloseWoundDressingSheet', 'm²']
    ]),
    ...entries('medical_science', 'explore', 'Uncommon', [
        ['NonwovenPolypropyleneMedicalFabric', 'm²'], ['MedicalGradeSiliconeTubing', 'm'], ['BorosilicateSampleVialBlank', 'blank']
    ]),
    ...entries('medical_science', 'explore', 'Rare', [
        ['PolycarbonateFaceShieldSheet', 'sheet'], ['MedicalGradeTPUFilm', 'm²'], ['SterilizationIndicatorPaper', 'm²']
    ]),
    ...entries('medical_science', 'explore', 'Very Rare', [
        ['PTFEFilterMembrane', 'm²'], ['AluminaDentalCeramicBlank', 'blank']
    ]),
    ...entries('medical_science', 'explore', 'Ultra Rare', [['PEEKOrthopedicRod', 'm']]),
    ...entries('medical_science', 'hunt', 'Common', [['PurifiedWoolLanolin', 'kg'], ['BovineCollagenSponge', 'sponge']]),
    ...entries('medical_science', 'hunt', 'Uncommon', [['GelatinCapsuleShell', 'shell'], ['SilkSutureFiber', 'm']]),
    ...entries('medical_science', 'hunt', 'Rare', [['ChitosanHemostaticFiber', 'kg'], ['DecellularizedBovinePericardiumSheet', 'm²']]),
    ...entries('medical_science', 'hunt', 'Very Rare', [['HydroxyapatiteBoneMineralGranules', 'kg'], ['KeratinBiopolymerPowder', 'kg']]),
    ...entries('medical_science', 'hunt', 'Ultra Rare', [['DemineralizedBoneMatrixGranules', 'kg']]),
    ...entries('medical_science', 'fish', 'Common', [['FishCollagenPeptidePowder', 'kg']]),
    ...entries('medical_science', 'fish', 'Uncommon', [['CalciumAlginateWoundFiber', 'kg']]),
    ...entries('medical_science', 'fish', 'Rare', [['ChitosanMedicalFilm', 'm²'], ['MedicalGradeMarineOmega3Oil', 'L']]),
    ...entries('medical_science', 'fish', 'Ultra Rare', [['MarineCollagenScaffold', 'scaffold']]),

    ...entries('defense_security', 'mine', 'Common', [
        ['AbrasionResistantAR500SteelPlate', 'kg'], ['BallisticGrade5083AluminumPlate', 'kg'], ['AusteniticManganeseSecurityPlate', 'kg']
    ]),
    ...entries('defense_security', 'mine', 'Uncommon', [['ToolSteelLockBar', 'kg'], ['HardenedSteelChainLinkStock', 'kg']]),
    ...entries('defense_security', 'mine', 'Rare', [['TungstenCarbideDrillResistantTile', 'tile'], ['AluminaBallisticCeramicTile', 'tile']]),
    ...entries('defense_security', 'mine', 'Very Rare', [['BoronCarbideBallisticTile', 'tile'], ['TransparentSpinelCeramicPlate', 'plate']]),
    ...entries('defense_security', 'mine', 'Ultra Rare', [['TungstenHeavyAlloyShieldingPlate', 'plate']]),
    ...entries('defense_security', 'explore', 'Common', [
        ['BallisticNylonFabricRoll', 'm²'], ['TemperedSecurityGlassSheet', 'sheet'], ['NaturalRubberImpactMat', 'm²']
    ]),
    ...entries('defense_security', 'explore', 'Uncommon', [['AramidBallisticFabricRoll', 'm²'], ['UHMWPEBallisticFiberSheet', 'm²']]),
    ...entries('defense_security', 'explore', 'Rare', [['FireResistantModacrylicFabric', 'm²'], ['TamperEvidentPolyesterFilm', 'm²']]),
    ...entries('defense_security', 'explore', 'Very Rare', [['PolycarbonateSecurityLaminate', 'sheet']]),
    ...entries('defense_security', 'explore', 'Ultra Rare', [['ConductiveCarbonNanotubeFabric', 'm²'], ['TransparentAluminumOxynitridePanel', 'panel']]),
    ...entries('defense_security', 'hunt', 'Common', [['HorsehairAcousticFelt', 'm²']]),
    ...entries('defense_security', 'hunt', 'Uncommon', [['RawhideImpactLacing', 'm']]),
    ...entries('defense_security', 'hunt', 'Very Rare', [['HornCompositeGripBlank', 'blank']]),
    ...entries('defense_security', 'fish', 'Common', [['ChitosanFireRetardantFilm', 'm²']]),
    ...entries('defense_security', 'fish', 'Uncommon', [['NacreAntiTamperLaminate', 'm²']]),

    ...entries('aerospace', 'mine', 'Common', [
        ['2024T3AluminumSheet', 'm²'], ['7075T7351AluminumPlate', 'kg'], ['AISI4130ChromolyTube', 'm'], ['174PHStainlessBar', 'kg']
    ]),
    ...entries('aerospace', 'mine', 'Uncommon', [
        ['MagnesiumAZ31BSheet', 'm²'], ['TitaniumGrade5FastenerStock', 'kg'], ['Inconel625Sheet', 'm²']
    ]),
    ...entries('aerospace', 'mine', 'Rare', [
        ['Maraging300AerospaceBar', 'kg'], ['CopperBerylliumAerospaceStrip', 'm'], ['Rene41SuperalloySheet', 'm²']
    ]),
    ...entries('aerospace', 'mine', 'Very Rare', [['GammaTitaniumAluminideBlank', 'blank'], ['CarbonCarbonCompositeSheet', 'm²']]),
    ...entries('aerospace', 'mine', 'Ultra Rare', [['TungstenRheniumThermocoupleWire', 'm']]),
    ...entries('aerospace', 'mine', 'Exceptional', [['SingleCrystalNickelSuperalloyBlank', 'blank']]),
    ...entries('aerospace', 'explore', 'Common', [['GlassFiberPrepregRoll', 'm²'], ['AerospaceBirchPlywoodSheet', 'sheet']]),
    ...entries('aerospace', 'explore', 'Uncommon', [
        ['EpoxyCarbonFiberPrepregRoll', 'm²'], ['NomexHoneycombCoreSheet', 'm²'], ['PTFEInsulatedWireRoll', 'm']
    ]),
    ...entries('aerospace', 'explore', 'Rare', [['AramidFiberPrepregRoll', 'm²'], ['PolyimideFoamInsulationSheet', 'm²']]),
    ...entries('aerospace', 'explore', 'Very Rare', [['QuartzFiberFabricRoll', 'm²'], ['CyanateEsterPrepregRoll', 'm²']]),
    ...entries('aerospace', 'explore', 'Ultra Rare', [['PBOFiberFabricRoll', 'm²']]),
    ...entries('aerospace', 'fish', 'Very Rare', [['NaturalNacreLaminateSheet', 'm²']]),

    ...entries('space_life_support', 'mine', 'Common', [
        ['AerospaceAluminumLithiumPlate', 'kg'], ['316LVacuumTube', 'm'], ['OxygenCompatibleCopperTube', 'm'],
        ['MolecularSieveZeolitePellet', 'kg']
    ]),
    ...entries('space_life_support', 'mine', 'Uncommon', [
        ['LithiumHydroxideGranules', 'kg'], ['SodaLimeGranules', 'kg'], ['ActivatedAluminaDesiccant', 'kg']
    ]),
    ...entries('space_life_support', 'mine', 'Rare', [
        ['PalladiumHydrogenPurifierFoil', 'm²'], ['ZirconiumGetterAlloyStrip', 'm'], ['HighPurityNickelFoam', 'm²']
    ]),
    ...entries('space_life_support', 'mine', 'Very Rare', [
        ['AerogelMicroporousInsulationPanel', 'panel'], ['GraphiteRadiatorSheet', 'm²'], ['SapphirePressureWindowBlank', 'blank']
    ]),
    ...entries('space_life_support', 'mine', 'Ultra Rare', [['IridiumCatalystMesh', 'm²']]),
    ...entries('space_life_support', 'mine', 'Exceptional', [['RutheniumIridiumOxideElectrodeMesh', 'm²']]),
    ...entries('space_life_support', 'explore', 'Common', [['ActivatedCarbonFilterCloth', 'm²'], ['CelluloseAirFilterPaper', 'm²']]),
    ...entries('space_life_support', 'explore', 'Uncommon', [['PTFEMicroporousMembrane', 'm²'], ['SiliconeCoatedGlassCloth', 'm²']]),
    ...entries('space_life_support', 'explore', 'Rare', [['PolyimideMultilayerInsulationFilm', 'm²'], ['KevlarPressureBladderFabric', 'm²']]),
    ...entries('space_life_support', 'explore', 'Very Rare', [['PBIFlameBarrierFabric', 'm²']]),
    ...entries('space_life_support', 'explore', 'Ultra Rare', [['VectranRestraintFabric', 'm²'], ['PEEKFoamCoreSheet', 'm²']]),
    ...entries('space_life_support', 'explore', 'Exceptional', [['SilicaAerogelFiberMat', 'm²']])
];

const MATERIAL_BY_ID = Object.freeze(Object.fromEntries(MATERIALS.map(material => [material.id, material])));

module.exports = {
    CATALOG_VERSION,
    RARITY_STACKS,
    DOMAIN_NAMES,
    DOMAIN_ICONS,
    MATERIALS: Object.freeze(MATERIALS),
    MATERIAL_BY_ID,
    displayNameFromId
};
