'use strict';

const {
    CATALOG_VERSION,
    RARITY_STACKS,
    DOMAIN_NAMES,
    DOMAIN_ICONS,
    MATERIALS,
    MATERIAL_BY_ID,
    displayNameFromId
} = require('./craftingMaterials');
const { SOCKET_MODULE_DEFINITIONS } = require('../engine/dropTables');
const { MATERIAL_GROUPS, CRAFTED_INPUT_GROUPS, FINAL_INPUT_GROUPS } = require('./craftingBlueprints');

const DOMAIN_ORDER = Object.freeze([
    'agriculture_food', 'forestry_wood', 'textiles_leather', 'mining_minerals',
    'metal_fabrication', 'construction_building', 'chemicals_polymers', 'machinery_tools',
    'fluid_systems', 'electrical_electronics', 'energy_storage', 'heavy_transport',
    'marine', 'outdoor_safety', 'medical_science', 'defense_security', 'aerospace',
    'space_life_support'
]);

const EFFORT_BANDS = Object.freeze({
    Basic: Object.freeze({ minActions: 1, maxActions: 3, baseQuantity: 2 }),
    Workshop: Object.freeze({ minActions: 4, maxActions: 12, baseQuantity: 6 }),
    Industrial: Object.freeze({ minActions: 13, maxActions: 40, baseQuantity: 18 }),
    Advanced: Object.freeze({ minActions: 41, maxActions: 120, baseQuantity: 54 }),
    Specialized: Object.freeze({ minActions: 121, maxActions: 300, baseQuantity: 144 }),
    Frontier: Object.freeze({ minActions: 301, maxActions: 750, baseQuantity: 360 })
});

const PROFILE_A = Object.freeze(['Basic', 'Basic', 'Workshop', 'Workshop', 'Workshop', 'Industrial', 'Industrial', 'Industrial', 'Advanced', 'Advanced', 'Specialized', 'Frontier']);
const PROFILE_B = Object.freeze(['Basic', 'Basic', 'Workshop', 'Workshop', 'Workshop', 'Industrial', 'Industrial', 'Advanced', 'Advanced', 'Advanced', 'Specialized', 'Specialized']);
const PROFILE_C = Object.freeze(['Basic', 'Basic', 'Workshop', 'Workshop', 'Industrial', 'Industrial', 'Industrial', 'Advanced', 'Advanced', 'Specialized', 'Specialized', 'Frontier']);

const PROFILE_BY_DOMAIN = Object.freeze({
    agriculture_food: PROFILE_A,
    mining_minerals: PROFILE_A,
    construction_building: PROFILE_A,
    fluid_systems: PROFILE_A,
    outdoor_safety: PROFILE_A,
    defense_security: PROFILE_A,
    forestry_wood: PROFILE_B,
    metal_fabrication: PROFILE_B,
    machinery_tools: PROFILE_B,
    energy_storage: PROFILE_B,
    marine: PROFILE_B,
    space_life_support: PROFILE_B,
    textiles_leather: PROFILE_C,
    chemicals_polymers: PROFILE_C,
    electrical_electronics: PROFILE_C,
    heavy_transport: PROFILE_C,
    medical_science: PROFILE_C,
    aerospace: PROFILE_C
});

const DOMAIN_CRAFTABLE_IDS = Object.freeze({
    agriculture_food: Object.freeze([
        'WholeGrainFlourBlend', 'FoodGradeLipidBlend', 'StarchBinderPowder', 'BalancedFeedPremix',
        'BiodegradableSeedlingPotSet', 'NaturalRubberCompound', 'BoneGelatinBinder',
        'BalancedFeedPelletBatch', 'ShelfStableProteinRationBatch', 'WaxedProduceCrate',
        'IrrigatedRaisedBedModule', 'MobileFeedHopper'
    ]),
    forestry_wood: Object.freeze([
        'StructuralTimberBundle', 'OakVeneerPanel', 'MoldedWoodFiberPanel', 'LinseedRosinWoodFinishingKit',
        'LaminatedTimberBeam', 'MortiseTenonTimberFrame', 'PlywoodStorageCrate', 'CarpentersWorkbench',
        'ExteriorTimberDoor', 'RaisedGardenBedFrame', 'TimberEquipmentShelter', 'ModularWoodStorageRack'
    ]),
    textiles_leather: Object.freeze([
        'CottonCanvasRoll', 'HempRopeCoil', 'WoolFeltPad', 'LeatherStrapSet',
        'ReinforcedWebbingStrap', 'InsulatedLeatherPanel', 'HybridFiberCompositePanel', 'CanvasToolRoll',
        'LeatherWorkApron', 'InsulatedFieldBlanket', 'LoadBearingEquipmentHarness', 'ProtectiveEquipmentBag'
    ]),
    mining_minerals: Object.freeze([
        'IronOrePelletBatch', 'AluminaBriquetteBatch', 'PolymetallicLeachFilterCakeBatch', 'FireclayRefractoryBrick',
        'ManganeseCrusherJaw', 'MineralScreenPanel', 'RotaryDistributorHead', 'CoreSampleStorageRack',
        'BenchJawCrusher', 'HydrocycloneSeparator', 'VibratorySampleSieve', 'RotarySampleDivider'
    ]),
    metal_fabrication: Object.freeze([
        'ThreadedFastenerSet', 'CorrosionResistantWireMeshRoll', 'FormedSheetMetalHousing', 'PrecisionShaftAndSleeveSet',
        'FabricatedEquipmentFrame', 'WeldedPipeManifold', 'CastBearingHousing', 'LockableSteelToolChest',
        'SheetMetalVentilationHood', 'ModularWorkbenchFrame', 'PipeworkSupportSkid', 'EnclosedMachineBase'
    ]),
    construction_building: Object.freeze([
        'ConcreteMasonryBlock', 'ReinforcedConcretePanel', 'CopperPlumbingLoop', 'InsulatedWallPanel',
        'GlazedWindowAssembly', 'RoofDrainageSection', 'TimberRoofTruss', 'UtilityServiceWall',
        'SmallGreenhouseFrame', 'WeatherproofGardenShed', 'PumpHouseEnclosure', 'ModularSiteOffice'
    ]),
    chemicals_polymers: Object.freeze([
        'NeutralizingBufferBlend', 'TwoPartEpoxyAdhesive', 'RigidPVCPanel', 'CutSiliconeGasketSet',
        'PhosphateEpoxyPrimer', 'RotomoldedHDPEChemicalTank', 'LaminatedAcrylicSafetyPanel',
        'PolypropyleneSpillTray', 'ChemicalStorageCabinet', 'PVCFumeDuctSection',
        'AcidResistantLaboratoryWorktop', 'VentilatedChemicalStorageEnclosure'
    ]),
    machinery_tools: Object.freeze([
        'PrecisionBallBearingSet', 'MultiMaterialSpurGearSet', 'CompressionSpringAndIsolatorSet', 'BearingAndBushingServiceSet',
        'ReplaceableCuttingToolHead', 'FlexibleShaftCoupling', 'MachineSlideAssembly', 'GearboxCoreAssembly',
        'BenchDrillAndGrindingStation', 'ManualMetalLathe', 'PrecisionToolGrindingStation', 'CompactHydraulicPress'
    ]),
    fluid_systems: Object.freeze([
        'FlexibleHoseAssembly', 'ValveTrimSet', 'FilterCartridgeCore', 'GasketAndSealKit',
        'PipeSpoolSection', 'MechanicalSealAssembly', 'MeteringPumpHeadAssembly', 'ProcessWaterPump',
        'FluidTransferSkid', 'ChemicalDosingStation', 'FiltrationManifoldAssembly', 'ClosedLoopCoolingModule'
    ]),
    electrical_electronics: Object.freeze([
        'InsulatedCopperConductor', 'LaminatedTransformerCore', 'ElectricalContactSet', 'PowerResistorAndProtectionBank',
        'RigidBusbarAssembly', 'PermanentMagnetRotor', 'PowerElectronicsSubstrateAssembly',
        'ProtectedWiringHarness', 'VariableSpeedElectricMotor', 'BenchPowerDistributionPanel',
        'TransformerRectifierUnit', 'IndustrialMotorControlCabinet'
    ]),
    energy_storage: Object.freeze([
        'CarbonElectrodeSheet', 'LithiumCathodeMaterialSet', 'AlkalineChemistryElectrodeSet', 'LeadAcidCellPack',
        'LithiumIonCellPack', 'ProtonExchangeMembraneFuelCellStack', 'RedoxFlowCellStack',
        'BatteryThermalManagementPack', 'StationaryBatteryCabinet', 'HybridEnergyBuffer',
        'FuelCellPowerModule', 'RedoxFlowStorageModule'
    ]),
    heavy_transport: Object.freeze([
        'LaminatedVehiclePanel', 'BrakeRotorAndPadSet', 'RailWheelAndAxleSet', 'ReinforcedChassisSection',
        'CompositeDriveShaft', 'SuspensionCornerAssembly', 'CrashProtectionModule',
        'ExhaustAftertreatmentAssembly', 'LightUtilityTrailer', 'RailMaintenanceTrolley',
        'HeavyEquipmentCarrier', 'MobileWorkshopVehicleBody'
    ]),
    marine: Object.freeze([
        'NaturalFiberCaulkingCord', 'ShellMineralCompositePanel', 'BioCompositeHullCore',
        'LaminatedMarineBearing', 'ReinforcedSailPanel', 'MarineFilterMediaPack', 'WaterproofDeckPanel',
        'SmallBoatHullAssembly', 'CoastalSamplingSkiff', 'FloatingWorkPlatform',
        'NearshoreAquacultureServiceRaft', 'ShallowWaterSurveyBoat'
    ]),
    outdoor_safety: Object.freeze([
        'WaxedCanvasPanel', 'InsulationFillPack', 'BraidedUtilityCord', 'WeatherproofWindowPanel',
        'DurableGripAssembly', 'FlexibleBrushHead', 'ProtectiveShellPanel', 'AllWeatherFieldPack',
        'PortableFieldShelter', 'RescueStretcher', 'InsulatedToolCase', 'FieldMaintenanceKit'
    ]),
    medical_science: Object.freeze([
        'SterileDressingPack', 'CapsuleAndCarrierSet', 'BoneRepairComposite', 'WoundClosureSet',
        'SterileFluidLineSet', 'ProtectiveFaceShield', 'SoftTissuePatch', 'BiologicFieldTreatmentModule',
        'MobileClinicalWorkstation', 'PortableSampleProcessingKit', 'OrthopedicRepairKit',
        'FieldSterilizationStation'
    ]),
    defense_security: Object.freeze([
        'ReinforcedSecurityPanel', 'BallisticCeramicArray', 'TamperResistantLockCore',
        'TransparentArmorPanel', 'FireResistantBarrierCurtain', 'IntrusionSensorMat',
        'ImpactRestraintAssembly', 'SecureEquipmentEnclosure', 'HardenedCheckpointGate',
        'MobileSecureStorageUnit', 'RemotePerimeterSensorStation', 'ProtectiveControlBooth'
    ]),
    aerospace: Object.freeze([
        'AerospaceSandwichPanel', 'HighTemperatureShieldPanel', 'AircraftControlCableSet',
        'LandingGearStrutAssembly', 'TurbineHotSectionAssembly', 'LightweightAirframeJoint',
        'CompositeControlSurface', 'PropulsionAccessoryGearbox', 'UtilityAircraftFuselageSection',
        'UncrewedSurveyAircraft', 'ShortTakeoffUtilityAirframe', 'HighAltitudeResearchAircraftModule'
    ]),
    space_life_support: Object.freeze([
        'CarbonDioxideScrubberCartridge', 'TraceContaminantFilter', 'VacuumInsulationBlanket',
        'OxygenLineAssembly', 'PressureBladderAssembly', 'CatalyticWaterProcessor',
        'PressureWindowAndRadiatorPanel', 'EnvironmentalControlCoreAssembly', 'PortableLifeSupportPack',
        'SealedResearchHabitatModule', 'MobileDecontaminationAirlock', 'ClosedLoopFieldLaboratory'
    ])
});

const EIGHT_INTERMEDIATE_DOMAINS = new Set(['machinery_tools', 'electrical_electronics', 'aerospace', 'space_life_support']);
const FOUR_RAW_DOMAINS = new Set([
    'agriculture_food', 'forestry_wood', 'textiles_leather',
    'mining_minerals', 'metal_fabrication', 'chemicals_polymers'
]);

function craftUnit(id) {
    if (/Batch$/.test(id)) return 'batch';
    if (/Blend$|Compound$|Binder$|Primer$|Adhesive$|Finish$/.test(id)) return 'batch';
    if (/Set$/.test(id)) return 'set';
    if (/Panel$|Sheet$/.test(id)) return 'panel';
    if (/Pack$|Kit$/.test(id)) return 'pack';
    if (/Assembly$/.test(id)) return 'assembly';
    if (/Module$|Unit$/.test(id)) return 'module';
    if (/Station$|Workstation$/.test(id)) return 'station';
    if (/Frame$|Section$/.test(id)) return 'section';
    if (/Cabinet$|Enclosure$|Chest$|Case$|Crate$/.test(id)) return 'container';
    return 'item';
}

function unitMetadata(unit) {
    const plural = {
        assembly: 'assemblies', batch: 'batches', beam: 'beams', coil: 'coils', container: 'containers',
        item: 'items', module: 'modules', pack: 'packs', panel: 'panels', roll: 'rolls', section: 'sections',
        set: 'sets', sheet: 'sheets', station: 'stations'
    }[unit] || `${unit}s`;
    return Object.freeze({ id: unit, singular: unit, plural });
}

function craftIcon(id, domain) {
    if (/Panel|Sheet|Window/.test(id)) return 'lucide:panel-top';
    if (/Filter|Sieve|Scrubber/.test(id)) return 'lucide:filter';
    if (/Pump|Fluid|Pipe|Plumbing|Dosing/.test(id)) return 'lucide:pipette';
    if (/Motor|Gear|Bearing|Machine|Lathe|Press|Drill/.test(id)) return 'lucide:cog';
    if (/Battery|Energy|Cell|Electrical|Power|Transformer/.test(id)) return 'lucide:battery-charging';
    if (/Boat|Skiff|Marine|Raft/.test(id)) return 'lucide:ship-wheel';
    if (/Aircraft|Airframe|Aerospace|Fuselage/.test(id)) return 'lucide:plane';
    if (/Security|Armor|Ballistic|Protective|Checkpoint/.test(id)) return 'lucide:shield-check';
    if (/Medical|Clinical|Dressing|Wound|Orthopedic|FirstAid/.test(id)) return 'lucide:briefcase-medical';
    return DOMAIN_ICONS[domain] || 'lucide:package';
}

function craftDescription(id, classification, domain, unit, inputs) {
    const name = displayNameFromId(id);
    const purpose = /Panel|Sheet|Curtain/.test(id) ? 'a planar barrier, facing, or structural layer'
        : /Assembly|Unit|Module|Station|Workstation/.test(id) ? 'an integrated serviceable equipment assembly'
            : /Frame|Truss|Skid|Rack|Chassis/.test(id) ? 'a load-bearing support structure'
                : /Pack|Kit|Set/.test(id) ? 'a matched set of parts prepared for field or workshop use'
                    : /Blend|Premix|Batch|Compound|Binder|Primer|Adhesive/.test(id) ? 'a controlled formulation prepared for a subsequent production step'
                        : /Crate|Chest|Cabinet|Enclosure|Case|Bag/.test(id) ? 'a purpose-built storage or protective container'
                            : /Pump|Motor|Gearbox|Press|Lathe|Crusher|Sieve|Separator|Divider/.test(id) ? 'a maintainable mechanical production device'
                                : /Boat|Skiff|Raft|Trailer|Trolley|Carrier|Aircraft|Airframe|Habitat|Laboratory/.test(id) ? 'an operational transport or field platform'
                                    : 'a defined physical component for installation or downstream assembly';
    const role = classification === 'intermediate' ? 'intermediate' : 'finished';
    const article = role === 'intermediate' ? 'an' : 'a';
    const inputNames = inputs.map(input => displayNameFromId(input.itemId));
    const materialList = inputNames.length === 1
        ? inputNames[0]
        : `${inputNames.slice(0, -1).join(', ')}, and ${inputNames.at(-1)}`;
    return `${name} is ${article} ${role} ${DOMAIN_NAMES[domain].toLowerCase()} product made as one ${unit} from ${materialList}. It serves as ${purpose}; the named inputs define the exact stock and completed subassemblies consumed by its bill of materials.`;
}

function ingredient(itemId, quantity) {
    return Object.freeze({ itemId, quantity });
}

function makeRecipesForDomain(domain, ids) {
    const localMaterials = MATERIALS.filter(material => material.domain === domain).map(material => material.id);
    const rawCount = FOUR_RAW_DOMAINS.has(domain) ? 4 : 3;
    const mixedCount = FOUR_RAW_DOMAINS.has(domain) ? 6 : 5;
    const materialGroups = MATERIAL_GROUPS[domain];
    const craftedGroups = CRAFTED_INPUT_GROUPS[domain];
    const finalGroups = FINAL_INPUT_GROUPS[domain];
    const recipes = [];

    if (!materialGroups || materialGroups.length !== rawCount + mixedCount) {
        throw new Error(`${domain} has an invalid curated material blueprint`);
    }
    if (!craftedGroups || craftedGroups.length !== mixedCount) {
        throw new Error(`${domain} has an invalid curated component blueprint`);
    }

    for (let index = 0; index < materialGroups.length; index += 1) {
        const effort = PROFILE_BY_DOMAIN[domain][index];
        const base = EFFORT_BANDS[effort].baseQuantity;
        const rawIds = materialGroups[index].map(materialIndex => {
            if (!Number.isInteger(materialIndex) || !localMaterials[materialIndex]) {
                throw new Error(`${domain} recipe ${index} references invalid material index ${materialIndex}`);
            }
            return localMaterials[materialIndex];
        });
        const inputs = rawIds.map(itemId => ingredient(itemId, Math.max(1, Math.ceil(base / rawIds.length))));
        if (index >= rawCount) {
            const craftedIds = craftedGroups[index - rawCount];
            inputs.unshift(...craftedIds.map(itemId => ingredient(itemId, Math.max(1, Math.ceil(base / 72)))));
        }
        recipes.push(inputs);
    }

    while (recipes.length < ids.length) {
        const index = recipes.length;
        const finalIndex = index - materialGroups.length;
        const dependencies = finalGroups && finalGroups[finalIndex];
        if (!dependencies || dependencies.length < 2 || dependencies.length > 5) {
            throw new Error(`${domain} crafted-only recipe ${finalIndex} has an invalid blueprint`);
        }
        const base = EFFORT_BANDS[PROFILE_BY_DOMAIN[domain][index]].baseQuantity;
        recipes.push(dependencies.map(itemId => ingredient(itemId, Math.max(1, Math.ceil(base / 144)))));
    }

    return recipes;
}

const NEW_CRAFTABLES = [];
const NEW_RECIPES = [];

for (const domain of DOMAIN_ORDER) {
    const ids = DOMAIN_CRAFTABLE_IDS[domain];
    const recipes = makeRecipesForDomain(domain, ids);
    const intermediateCount = EIGHT_INTERMEDIATE_DOMAINS.has(domain) ? 8 : 7;

    ids.forEach((id, index) => {
        const classification = index < intermediateCount ? 'intermediate' : 'finished';
        const recipeId = `recipe_${id}`;
        const unit = craftUnit(id);
        NEW_CRAFTABLES.push(Object.freeze({
            id,
            name: displayNameFromId(id),
            kind: 'crafted',
            domain,
            domainName: DOMAIN_NAMES[domain],
            classification,
            effortBand: PROFILE_BY_DOMAIN[domain][index],
            description: craftDescription(id, classification, domain, unit, recipes[index]),
            unit: unitMetadata(unit),
            icon: craftIcon(id, domain),
            storage: 'inventory',
            recipeId,
            tags: Object.freeze(['crafted-item', domain, classification, PROFILE_BY_DOMAIN[domain][index].toLowerCase()])
        }));
        NEW_RECIPES.push(Object.freeze({
            id: recipeId,
            output: Object.freeze({ itemId: id, quantity: 1 }),
            ingredients: Object.freeze(recipes[index])
        }));
    });
}

const LEGACY_COMPONENT_RECIPES = Object.freeze([
    ['ThickRope', 'textiles_leather', 'bundle', [['HempFiberBundle', 8], ['JuteFiberBale', 2], ['NaturalBeeswaxPellet', 1]]],
    ['LightSuede', 'textiles_leather', 'sheet', [['SuedeLeatherSheet', 2], ['RefinedLinseedOil', 1]]],
    ['ReinforcedChain', 'metal_fabrication', 'set', [['LowCarbonSteelWireSpool', 2], ['ThreadedFastenerSet', 1], ['ZincIngot', 2]]],
    ['ToughRawhide', 'textiles_leather', 'sheet', [['RawCattleHide', 2], ['NaturalBeeswaxPellet', 1], ['RefinedLinseedOil', 1]]],
    ['DiamondTether', 'machinery_tools', 'coil', [['UHMWPECord', 6], ['PolycrystallineDiamondInsertBlank', 2], ['ReinforcedChain', 1]]],
    ['TreatedHull', 'marine', 'section', [['MarineGradePlywoodSheet', 4], ['PhosphateEpoxyPrimer', 1], ['NaturalFiberCaulkingCord', 1]]],
    ['ReinforcedHull', 'marine', 'section', [['TreatedHull', 1], ['BioCompositeHullCore', 2], ['HybridFiberCompositePanel', 1]]],
    ['SteelBeam', 'metal_fabrication', 'beam', [['ASTMA36StructuralSteelPlate', 8], ['ASTMA36SteelFlatBar', 4], ['ThreadedFastenerSet', 2]]],
    ['Thermite', 'chemicals_polymers', 'batch', [['CleanAluminumScrap', 6], ['HematiteOre', 8], ['FurnaceCarbonBlack', 1]]],
    ['LuckyCharm', 'outdoor_safety', 'item', [['RabbitFoot', 1], ['NaturalBeeswaxPellet', 1], ['BraidedUtilityCord', 1]]]
]);

const LEGACY_CRAFTABLES = [];
const LEGACY_RECIPES = [];

for (const [id, domain, unit, rawIngredients] of LEGACY_COMPONENT_RECIPES) {
    const recipeId = `recipe_${id}`;
    LEGACY_CRAFTABLES.push(Object.freeze({
        id,
        name: displayNameFromId(id),
        kind: 'crafted',
        domain,
        domainName: DOMAIN_NAMES[domain],
        classification: 'legacy',
        effortBand: 'Workshop',
        description: `${displayNameFromId(id)} is an existing Bconomy derived component now backed by a canonical shared crafting recipe.`,
        unit: unitMetadata(unit),
        icon: craftIcon(id, domain),
        storage: 'inventory',
        recipeId,
        tags: Object.freeze(['crafted-item', 'legacy-component', domain])
    }));
    LEGACY_RECIPES.push(Object.freeze({
        id: recipeId,
        output: Object.freeze({ itemId: id, quantity: 1 }),
        ingredients: Object.freeze(rawIngredients.map(([itemId, quantity]) => ingredient(itemId, quantity)))
    }));
}

const MODULE_CRAFTABLES = [];
const MODULE_RECIPES = [];

for (const moduleDefinition of Object.values(SOCKET_MODULE_DEFINITIONS)) {
    const recipeId = `recipe_${moduleDefinition.id}`;
    MODULE_CRAFTABLES.push(Object.freeze({
        id: moduleDefinition.id,
        name: moduleDefinition.name,
        kind: 'crafted',
        domain: 'machinery_tools',
        domainName: DOMAIN_NAMES.machinery_tools,
        classification: 'socket-module',
        effortBand: moduleDefinition.tier === 1 ? 'Workshop' : moduleDefinition.tier === 2 ? 'Advanced' : 'Specialized',
        description: moduleDefinition.description,
        unit: Object.freeze({ id: 'module', singular: 'module', plural: 'modules' }),
        icon: 'lucide:cpu',
        storage: 'toolModules',
        recipeId,
        tags: Object.freeze(['crafted-item', 'socket-module', moduleDefinition.family, `tier-${moduleDefinition.tier}`])
    }));
    MODULE_RECIPES.push(Object.freeze({
        id: recipeId,
        output: Object.freeze({ itemId: moduleDefinition.id, quantity: 1 }),
        ingredients: Object.freeze(moduleDefinition.recipe.map(req => ingredient(req.item, req.quantity)))
    }));
}

const CRAFTABLES = Object.freeze([...NEW_CRAFTABLES, ...LEGACY_CRAFTABLES, ...MODULE_CRAFTABLES]);
const RECIPES = Object.freeze([...NEW_RECIPES, ...LEGACY_RECIPES, ...MODULE_RECIPES]);
const CRAFTABLE_BY_ID = Object.freeze(Object.fromEntries(CRAFTABLES.map(item => [item.id, item])));
const RECIPE_BY_ID = Object.freeze(Object.fromEntries(RECIPES.map(recipe => [recipe.id, recipe])));
const RECIPE_BY_OUTPUT_ID = Object.freeze(Object.fromEntries(RECIPES.map(recipe => [recipe.output.itemId, recipe])));

function recipeForm(recipe) {
    const craftedCount = recipe.ingredients.filter(input => CRAFTABLE_BY_ID[input.itemId]).length;
    if (craftedCount === 0) return 'raw-only';
    if (craftedCount === recipe.ingredients.length) return 'crafted-only';
    return 'mixed';
}

function validateCatalog() {
    const errors = [];
    const assert = (condition, message) => { if (!condition) errors.push(message); };
    const unique = values => new Set(values).size === values.length;
    const countBy = (values, selector) => values.reduce((result, value) => {
        const key = selector(value);
        result[key] = (result[key] || 0) + 1;
        return result;
    }, {});

    assert(MATERIALS.length === 450, `Expected 450 materials, received ${MATERIALS.length}`);
    assert(NEW_CRAFTABLES.length === 216, `Expected 216 new craftables, received ${NEW_CRAFTABLES.length}`);
    assert(NEW_CRAFTABLES.filter(item => item.classification === 'intermediate').length === 130, 'Expected 130 intermediates');
    assert(NEW_CRAFTABLES.filter(item => item.classification === 'finished').length === 86, 'Expected 86 finished products');
    assert(LEGACY_CRAFTABLES.length === 10, 'Expected 10 legacy component recipes');
    assert(MODULE_CRAFTABLES.length === 15, 'Expected 15 socket-module recipes');
    assert(unique(MATERIALS.map(item => item.id)), 'Material IDs must be unique');
    assert(unique(CRAFTABLES.map(item => item.id)), 'Craftable IDs must be unique');
    assert(unique(RECIPES.map(item => item.id)), 'Recipe IDs must be unique');

    const sourceCounts = countBy(MATERIALS, item => item.sourceAction);
    assert(sourceCounts.mine === 200 && sourceCounts.explore === 160 && sourceCounts.hunt === 50 && sourceCounts.fish === 40, 'Material source quotas are invalid');
    const rarityCounts = countBy(MATERIALS, item => item.rarity);
    const expectedRarity = { Common: 135, Uncommon: 112, Rare: 90, 'Very Rare': 63, 'Ultra Rare': 36, Exceptional: 14 };
    for (const [rarity, count] of Object.entries(expectedRarity)) assert(rarityCounts[rarity] === count, `Expected ${count} ${rarity} materials`);
    for (const domain of DOMAIN_ORDER) {
        assert(MATERIALS.filter(item => item.domain === domain).length === 25, `${domain} must own 25 materials`);
        assert(NEW_CRAFTABLES.filter(item => item.domain === domain).length === 12, `${domain} must own 12 craftables`);
    }

    const newRecipeForms = countBy(NEW_RECIPES, recipeForm);
    assert(newRecipeForms['raw-only'] === 60, `Expected 60 raw-only recipes, received ${newRecipeForms['raw-only'] || 0}`);
    assert(newRecipeForms.mixed === 96, `Expected 96 mixed recipes, received ${newRecipeForms.mixed || 0}`);
    assert(newRecipeForms['crafted-only'] === 60, `Expected 60 crafted-only recipes, received ${newRecipeForms['crafted-only'] || 0}`);

    const effortCounts = countBy(NEW_CRAFTABLES, item => item.effortBand);
    const expectedEffort = { Basic: 36, Workshop: 48, Industrial: 48, Advanced: 42, Specialized: 30, Frontier: 12 };
    for (const [band, count] of Object.entries(expectedEffort)) assert(effortCounts[band] === count, `Expected ${count} ${band} craftables`);

    const knownIds = new Set([...MATERIALS.map(item => item.id), ...CRAFTABLES.map(item => item.id)]);
    const permittedLegacyInputs = new Set(Object.values(SOCKET_MODULE_DEFINITIONS).flatMap(definition => definition.recipe.map(req => req.item)).concat(['RabbitFoot']));
    for (const recipe of RECIPES) {
        assert(recipe.ingredients.length >= 1 && recipe.ingredients.length <= 5, `${recipe.id} must have 1-5 ingredients`);
        assert(unique(recipe.ingredients.map(input => input.itemId)), `${recipe.id} contains duplicate ingredient types`);
        assert(Number.isSafeInteger(recipe.output.quantity) && recipe.output.quantity > 0, `${recipe.id} has invalid output quantity`);
        for (const input of recipe.ingredients) {
            assert(Number.isSafeInteger(input.quantity) && input.quantity > 0, `${recipe.id} has an invalid ingredient quantity`);
            assert(knownIds.has(input.itemId) || permittedLegacyInputs.has(input.itemId), `${recipe.id} references unknown item ${input.itemId}`);
        }
    }

    const usedOutputs = new Set(RECIPES.flatMap(recipe => recipe.ingredients.map(input => input.itemId)));
    for (const item of NEW_CRAFTABLES.filter(candidate => candidate.classification === 'intermediate')) {
        assert(usedOutputs.has(item.id), `${item.id} is not used downstream`);
    }

    const visiting = new Set();
    const visitedDepth = new Map();
    const depthOf = itemId => {
        if (visitedDepth.has(itemId)) return visitedDepth.get(itemId);
        if (visiting.has(itemId)) {
            errors.push(`Crafting dependency cycle includes ${itemId}`);
            return 99;
        }
        const recipe = RECIPE_BY_OUTPUT_ID[itemId];
        if (!recipe) return 0;
        visiting.add(itemId);
        const depth = 1 + Math.max(0, ...recipe.ingredients.map(input => CRAFTABLE_BY_ID[input.itemId] ? depthOf(input.itemId) : 0));
        visiting.delete(itemId);
        visitedDepth.set(itemId, depth);
        return depth;
    };
    for (const item of CRAFTABLES) assert(depthOf(item.id) <= 12, `${item.id} exceeds dependency depth 12`);

    const materialUseCounts = Object.fromEntries(MATERIALS.map(item => [item.id, 0]));
    for (const recipe of NEW_RECIPES) {
        for (const input of recipe.ingredients) if (Object.hasOwn(materialUseCounts, input.itemId)) materialUseCounts[input.itemId] += 1;
    }
    assert(Object.values(materialUseCounts).every(count => count >= 1), 'Every material must be used by at least one new recipe');
    const reusedMaterialCount = Object.values(materialUseCounts).filter(count => count >= 2).length;
    assert(reusedMaterialCount >= 225, `At least half of all materials must be reused; received ${reusedMaterialCount}`);

    const crossDomainCount = NEW_RECIPES.filter(recipe => {
        const outputDomain = CRAFTABLE_BY_ID[recipe.output.itemId].domain;
        return recipe.ingredients.some(input => {
            const definition = MATERIAL_BY_ID[input.itemId] || CRAFTABLE_BY_ID[input.itemId];
            return definition && definition.domain !== outputDomain;
        });
    }).length;
    assert(crossDomainCount >= Math.ceil(NEW_RECIPES.length * 0.20), 'At least 20% of recipes must cross domains');

    if (errors.length) {
        const error = new Error(`Crafting catalog validation failed:\n- ${errors.join('\n- ')}`);
        error.validationErrors = errors;
        throw error;
    }

    return Object.freeze({
        materialCount: MATERIALS.length,
        newCraftableCount: NEW_CRAFTABLES.length,
        legacyCraftableCount: LEGACY_CRAFTABLES.length,
        socketModuleCount: MODULE_CRAFTABLES.length,
        recipeCount: RECIPES.length,
        sourceCounts: Object.freeze(sourceCounts),
        rarityCounts: Object.freeze(rarityCounts),
        effortCounts: Object.freeze(effortCounts),
        recipeForms: Object.freeze(newRecipeForms),
        reusedMaterialCount,
        crossDomainCount,
        maxDepth: Math.max(...visitedDepth.values())
    });
}

const VALIDATION_SUMMARY = validateCatalog();

module.exports = {
    CATALOG_VERSION,
    DOMAIN_ORDER,
    DOMAIN_NAMES,
    DOMAIN_ICONS,
    EFFORT_BANDS,
    RARITY_STACKS,
    MATERIALS,
    MATERIAL_BY_ID,
    NEW_CRAFTABLES: Object.freeze(NEW_CRAFTABLES),
    LEGACY_CRAFTABLES: Object.freeze(LEGACY_CRAFTABLES),
    MODULE_CRAFTABLES: Object.freeze(MODULE_CRAFTABLES),
    CRAFTABLES,
    CRAFTABLE_BY_ID,
    NEW_RECIPES: Object.freeze(NEW_RECIPES),
    RECIPES,
    RECIPE_BY_ID,
    RECIPE_BY_OUTPUT_ID,
    recipeForm,
    validateCatalog,
    VALIDATION_SUMMARY
};
