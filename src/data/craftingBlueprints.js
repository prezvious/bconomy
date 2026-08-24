'use strict';

// Material indexes refer to the canonical 25-entry material order for each domain.
// Groups align with that domain's raw-only recipes followed by its mixed recipes.
// Every assignment is product-specific; repeated stock represents legitimate common use.
const MATERIAL_GROUPS = Object.freeze({
    agriculture_food: Object.freeze([
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 15], [0, 1, 9, 10, 11], [12, 16, 17, 18, 24],
        [11, 13, 17, 22], [14, 19, 21, 23], [15, 18, 20, 22], [12, 16], [8, 20, 21], [13, 14, 19, 23]
    ]),
    forestry_wood: Object.freeze([
        [0, 1, 2, 3, 7], [4, 6, 12, 23, 24], [8, 10, 11, 19, 21], [12, 21, 22, 23, 24],
        [2, 14, 15, 20], [0, 1, 5, 6], [8, 13, 17, 18], [5, 7, 14, 15], [3, 4, 10, 16], [9, 13, 16, 20]
    ]),
    textiles_leather: Object.freeze([
        [0, 1, 2, 3, 4], [2, 3, 19, 20, 24], [6, 7, 8, 16, 22], [9, 12, 13, 14, 15],
        [1, 4, 5, 24], [10, 17, 18, 22], [5, 10, 20, 21], [0, 12, 14, 19], [9, 13, 15, 23], [8, 11, 16, 17]
    ]),
    mining_minerals: Object.freeze([
        [0, 1, 16, 19, 21], [2, 17, 18, 20, 24], [3, 4, 5, 15, 22], [17, 18, 19, 20, 23],
        [0, 8, 9, 10], [7, 11, 24], [6, 12, 21], [4, 5, 13, 14], [8, 9], [1, 2, 7, 23]
    ]),
    metal_fabrication: Object.freeze([
        [0, 1, 6, 22, 23], [6, 8, 17, 22, 24], [2, 3, 5, 13, 24], [0, 15, 16, 20, 21],
        [1, 4, 11, 23], [9, 14, 18, 19], [10, 15, 16, 18], [2, 3, 7, 12], [5, 7, 13, 17], [4, 11, 12, 14]
    ]),
    chemicals_polymers: Object.freeze([
        [0, 1, 2, 3, 10], [1, 12, 21, 22, 24], [4, 5, 13, 14, 18], [4, 14, 15, 19, 23],
        [9, 13, 21, 24], [6, 7, 16, 17], [7, 8, 10, 20], [11, 17, 22, 23], [8, 11, 15, 20], [5, 6, 18, 19]
    ]),
    construction_building: Object.freeze([
        [0, 1, 2, 3, 4], [0, 3, 5, 6, 7], [1, 2, 8, 9, 10],
        [13, 14, 17, 23], [11, 12, 15, 24], [9, 18, 19, 21], [7, 8, 15, 16], [13, 17, 20, 22]
    ]),
    machinery_tools: Object.freeze([
        [0, 3, 4, 13, 14], [5, 6, 8, 9, 10], [2, 10, 12, 17, 18],
        [4, 7, 12, 21], [11, 15, 16, 24], [3, 18, 19, 20], [0, 1, 13, 21], [5, 7, 22, 23]
    ]),
    fluid_systems: Object.freeze([
        [14, 15, 16, 17, 19], [2, 4, 5, 9, 22], [6, 7, 20, 23, 24],
        [10, 18, 20, 21], [0, 1, 2, 3], [10, 12, 13, 21], [4, 5, 6, 8], [0, 1, 11, 13]
    ]),
    electrical_electronics: Object.freeze([
        [0, 3, 5, 18, 19], [2, 8, 18, 21, 22], [3, 10, 11, 12, 16],
        [4, 7, 20, 24], [1, 6, 9, 21], [2, 12, 15, 20], [9, 13, 14, 17], [0, 5, 19, 23]
    ]),
    energy_storage: Object.freeze([
        [1, 18, 20, 21, 23], [2, 9, 10, 11, 12], [3, 4, 5, 6, 16],
        [0, 19, 20, 24], [1, 7, 15, 19], [14, 17, 18, 22], [13, 21, 22], [7, 8, 23, 24]
    ]),
    heavy_transport: Object.freeze([
        [4, 12, 17, 18, 20], [3, 7, 11, 15, 21], [0, 2, 5, 6, 10],
        [1, 8, 17, 22], [6, 19, 20, 24], [10, 13, 14, 15], [1, 8, 22, 23], [7, 9, 16, 19]
    ]),
    marine: Object.freeze([
        [0, 1, 8, 22, 23], [2, 3, 4, 9, 14], [10, 15, 17, 20, 24],
        [11, 16, 18, 20], [8, 16, 22, 23], [6, 7, 12, 19], [5, 10, 13, 21], [17, 21, 24]
    ]),
    outdoor_safety: Object.freeze([
        [1, 3, 5, 19, 20], [2, 13, 14, 18, 21], [4, 8, 11, 17, 18],
        [5, 7, 9, 23], [0, 10, 15, 16], [0, 12, 19, 20], [6, 7, 22, 24], [3, 4, 8, 23]
    ]),
    medical_science: Object.freeze([
        [0, 1, 2, 15, 21], [4, 7, 8, 13, 22], [9, 10, 12, 17, 19],
        [0, 14, 15, 16], [3, 6, 8, 22], [2, 5, 6, 7], [11, 16, 18, 20], [12, 13, 23, 24]
    ]),
    defense_security: Object.freeze([
        [0, 1, 2, 3, 4], [5, 6, 7, 9, 14], [3, 4, 11, 16, 24],
        [8, 11, 17, 19], [10, 13, 15, 23], [16, 18, 20, 24], [10, 12, 21, 22], [0, 1, 5, 7]
    ]),
    aerospace: Object.freeze([
        [0, 1, 4, 14, 17], [6, 9, 11, 12, 24], [8, 12, 18, 20, 23],
        [2, 3, 5, 7], [6, 9, 10, 13], [1, 5, 8, 15], [14, 16, 19, 22], [3, 7, 10, 21]
    ]),
    space_life_support: Object.freeze([
        [3, 4, 5, 6, 15], [6, 7, 8, 9, 16], [10, 11, 19, 22, 24],
        [1, 2, 17, 18], [18, 20, 22, 23], [13, 14, 15, 17], [0, 11, 12, 19], [3, 7, 9, 21]
    ])
});

// Groups align with mixed recipes only. All cross-domain dependencies are
// completed, physically plausible components and the graph remains acyclic.
const CRAFTED_INPUT_GROUPS = Object.freeze({
    agriculture_food: Object.freeze([
        ['MoldedWoodFiberPanel'], ['FoodGradeLipidBlend'], ['NeutralizingBufferBlend'],
        ['BalancedFeedPremix', 'StarchBinderPowder', 'BoneGelatinBinder'], ['WholeGrainFlourBlend', 'FoodGradeLipidBlend'], ['PlywoodStorageCrate']
    ]),
    forestry_wood: Object.freeze([
        ['TwoPartEpoxyAdhesive'], ['ThreadedFastenerSet'], ['ThreadedFastenerSet'],
        ['ThreadedFastenerSet'], ['WoolFeltPad'], ['ThreadedFastenerSet']
    ]),
    textiles_leather: Object.freeze([
        ['NaturalRubberCompound'], ['RigidPVCPanel'], ['TwoPartEpoxyAdhesive'],
        ['ThreadedFastenerSet'], ['CottonCanvasRoll'], ['WoolFeltPad']
    ]),
    mining_minerals: Object.freeze([
        ['IronOrePelletBatch'], ['CorrosionResistantWireMeshRoll', 'AluminaBriquetteBatch'], ['PrecisionShaftAndSleeveSet', 'PolymetallicLeachFilterCakeBatch'],
        ['ThreadedFastenerSet'], ['FabricatedEquipmentFrame', 'FireclayRefractoryBrick', 'ManganeseCrusherJaw'], ['WeldedPipeManifold']
    ]),
    metal_fabrication: Object.freeze([
        ['IronOrePelletBatch'], ['PrecisionShaftAndSleeveSet'], ['IronOrePelletBatch'],
        ['TamperResistantLockCore'], ['CorrosionResistantWireMeshRoll'], ['StructuralTimberBundle']
    ]),
    chemicals_polymers: Object.freeze([
        ['TwoPartEpoxyAdhesive'], ['CutSiliconeGasketSet'], ['TwoPartEpoxyAdhesive'],
        ['CutSiliconeGasketSet'], ['FormedSheetMetalHousing'], ['RigidPVCPanel']
    ]),
    construction_building: Object.freeze([
        ['ReinforcedConcretePanel'], ['FormedSheetMetalHousing'], ['FormedSheetMetalHousing'],
        ['StructuralTimberBundle'], ['InsulatedCopperConductor']
    ]),
    machinery_tools: Object.freeze([
        ['PrecisionBallBearingSet'], ['PrecisionShaftAndSleeveSet'], ['PrecisionShaftAndSleeveSet'],
        ['PrecisionBallBearingSet'], ['MultiMaterialSpurGearSet']
    ]),
    fluid_systems: Object.freeze([
        ['CutSiliconeGasketSet'], ['ThreadedFastenerSet'], ['PrecisionShaftAndSleeveSet'],
        ['PrecisionBallBearingSet'], ['FlexibleHoseAssembly']
    ]),
    electrical_electronics: Object.freeze([
        ['CutSiliconeGasketSet'], ['ThreadedFastenerSet'], ['PrecisionBallBearingSet'],
        ['CutSiliconeGasketSet'], ['ReinforcedWebbingStrap']
    ]),
    energy_storage: Object.freeze([
        ['InsulatedCopperConductor'], ['LithiumCathodeMaterialSet'], ['PowerElectronicsSubstrateAssembly'],
        ['CarbonElectrodeSheet', 'ProcessWaterPump'], ['FlexibleHoseAssembly']
    ]),
    heavy_transport: Object.freeze([
        ['FabricatedEquipmentFrame'], ['PrecisionShaftAndSleeveSet'], ['PrecisionBallBearingSet'],
        ['HybridFiberCompositePanel'], ['CorrosionResistantWireMeshRoll']
    ]),
    marine: Object.freeze([
        ['BearingAndBushingServiceSet'], ['CottonCanvasRoll'], ['FilterCartridgeCore'],
        ['TwoPartEpoxyAdhesive'], ['BioCompositeHullCore', 'FabricatedEquipmentFrame']
    ]),
    outdoor_safety: Object.freeze([
        ['LaminatedAcrylicSafetyPanel'], ['FlexibleShaftCoupling'], ['DurableGripAssembly'],
        ['HybridFiberCompositePanel'], ['ReinforcedWebbingStrap']
    ]),
    medical_science: Object.freeze([
        ['SterileDressingPack'], ['CutSiliconeGasketSet'], ['LaminatedAcrylicSafetyPanel'],
        ['SterileDressingPack'], ['SterileDressingPack']
    ]),
    defense_security: Object.freeze([
        ['LaminatedAcrylicSafetyPanel'], ['ReinforcedWebbingStrap'], ['ElectricalContactSet'],
        ['ReinforcedWebbingStrap'], ['FormedSheetMetalHousing']
    ]),
    aerospace: Object.freeze([
        ['PrecisionShaftAndSleeveSet'], ['HighTemperatureShieldPanel'], ['ThreadedFastenerSet'],
        ['AerospaceSandwichPanel'], ['MultiMaterialSpurGearSet']
    ]),
    space_life_support: Object.freeze([
        ['FlexibleHoseAssembly'], ['ReinforcedWebbingStrap'], ['ProcessWaterPump'],
        ['AerospaceSandwichPanel'], ['TraceContaminantFilter']
    ])
});

// Groups align with each domain's crafted-only finished products. These bills
// of materials use completed subassemblies instead of unprocessed stock.
const FINAL_INPUT_GROUPS = Object.freeze({
    agriculture_food: Object.freeze([
        ['BiodegradableSeedlingPotSet', 'NaturalRubberCompound', 'CopperPlumbingLoop', 'MortiseTenonTimberFrame'],
        ['BalancedFeedPelletBatch', 'FabricatedEquipmentFrame', 'FormedSheetMetalHousing', 'FlexibleHoseAssembly']
    ]),
    forestry_wood: Object.freeze([
        ['MortiseTenonTimberFrame', 'LaminatedTimberBeam', 'ExteriorTimberDoor', 'RoofDrainageSection', 'LinseedRosinWoodFinishingKit'],
        ['LaminatedTimberBeam', 'PlywoodStorageCrate', 'ThreadedFastenerSet', 'OakVeneerPanel']
    ]),
    textiles_leather: Object.freeze([
        ['ReinforcedWebbingStrap', 'LeatherStrapSet', 'HybridFiberCompositePanel', 'InsulatedLeatherPanel', 'ThreadedFastenerSet'],
        ['CottonCanvasRoll', 'ReinforcedWebbingStrap', 'LeatherStrapSet', 'HempRopeCoil', 'RigidPVCPanel']
    ]),
    mining_minerals: Object.freeze([
        ['MineralScreenPanel', 'CompressionSpringAndIsolatorSet', 'VariableSpeedElectricMotor', 'FabricatedEquipmentFrame'],
        ['RotaryDistributorHead', 'PrecisionBallBearingSet', 'VariableSpeedElectricMotor', 'FabricatedEquipmentFrame']
    ]),
    metal_fabrication: Object.freeze([
        ['FabricatedEquipmentFrame', 'WeldedPipeManifold', 'PipeSpoolSection', 'ThreadedFastenerSet'],
        ['FabricatedEquipmentFrame', 'CastBearingHousing', 'FormedSheetMetalHousing', 'NaturalRubberCompound']
    ]),
    chemicals_polymers: Object.freeze([
        ['RigidPVCPanel', 'TwoPartEpoxyAdhesive', 'CutSiliconeGasketSet', 'LaminatedAcrylicSafetyPanel'],
        ['ChemicalStorageCabinet', 'PVCFumeDuctSection', 'RotomoldedHDPEChemicalTank', 'ProtectedWiringHarness']
    ]),
    construction_building: Object.freeze([
        ['GlazedWindowAssembly', 'TimberRoofTruss', 'ReinforcedConcretePanel', 'CopperPlumbingLoop'],
        ['TimberRoofTruss', 'ExteriorTimberDoor', 'InsulatedWallPanel', 'RoofDrainageSection'],
        ['ConcreteMasonryBlock', 'PipeSpoolSection', 'ProcessWaterPump', 'IndustrialMotorControlCabinet'],
        ['UtilityServiceWall', 'InsulatedWallPanel', 'GlazedWindowAssembly', 'TimberRoofTruss']
    ]),
    machinery_tools: Object.freeze([
        ['MachineSlideAssembly', 'ReplaceableCuttingToolHead', 'CompressionSpringAndIsolatorSet', 'VariableSpeedElectricMotor', 'FabricatedEquipmentFrame'],
        ['GearboxCoreAssembly', 'MachineSlideAssembly', 'PrecisionBallBearingSet', 'FabricatedEquipmentFrame'],
        ['ReplaceableCuttingToolHead', 'MachineSlideAssembly', 'VariableSpeedElectricMotor', 'RigidBusbarAssembly'],
        ['FlexibleShaftCoupling', 'MachineSlideAssembly', 'MeteringPumpHeadAssembly', 'FabricatedEquipmentFrame']
    ]),
    fluid_systems: Object.freeze([
        ['ProcessWaterPump', 'PipeSpoolSection', 'FlexibleHoseAssembly', 'FabricatedEquipmentFrame'],
        ['MeteringPumpHeadAssembly', 'PipeSpoolSection', 'IndustrialMotorControlCabinet', 'FluidTransferSkid'],
        ['FilterCartridgeCore', 'PipeSpoolSection', 'ValveTrimSet', 'WeldedPipeManifold'],
        ['ProcessWaterPump', 'MechanicalSealAssembly', 'GasketAndSealKit', 'PipeSpoolSection', 'PowerElectronicsSubstrateAssembly']
    ]),
    electrical_electronics: Object.freeze([
        ['PermanentMagnetRotor', 'InsulatedCopperConductor', 'PrecisionBallBearingSet', 'PowerElectronicsSubstrateAssembly'],
        ['RigidBusbarAssembly', 'ElectricalContactSet', 'PowerResistorAndProtectionBank', 'FormedSheetMetalHousing'],
        ['LaminatedTransformerCore', 'PowerElectronicsSubstrateAssembly', 'ProtectedWiringHarness', 'RigidBusbarAssembly'],
        ['PowerElectronicsSubstrateAssembly', 'ProtectedWiringHarness', 'RigidBusbarAssembly', 'FormedSheetMetalHousing']
    ]),
    energy_storage: Object.freeze([
        ['LeadAcidCellPack', 'FormedSheetMetalHousing', 'ProtectedWiringHarness', 'RigidBusbarAssembly'],
        ['AlkalineChemistryElectrodeSet', 'LithiumIonCellPack', 'RedoxFlowCellStack', 'PowerElectronicsSubstrateAssembly', 'BatteryThermalManagementPack'],
        ['ProtonExchangeMembraneFuelCellStack', 'BatteryThermalManagementPack', 'TransformerRectifierUnit', 'FluidTransferSkid'],
        ['RedoxFlowCellStack', 'ProcessWaterPump', 'FluidTransferSkid', 'IndustrialMotorControlCabinet']
    ]),
    heavy_transport: Object.freeze([
        ['ReinforcedChassisSection', 'SuspensionCornerAssembly', 'BrakeRotorAndPadSet', 'LaminatedVehiclePanel'],
        ['RailWheelAndAxleSet', 'BrakeRotorAndPadSet', 'PrecisionBallBearingSet', 'RigidBusbarAssembly'],
        ['ReinforcedChassisSection', 'CompositeDriveShaft', 'SuspensionCornerAssembly', 'CrashProtectionModule'],
        ['LaminatedVehiclePanel', 'ReinforcedChassisSection', 'ProtectedWiringHarness', 'InsulatedWallPanel']
    ]),
    marine: Object.freeze([
        ['BioCompositeHullCore', 'ShellMineralCompositePanel', 'WaterproofDeckPanel', 'LaminatedMarineBearing', 'NaturalFiberCaulkingCord'],
        ['SmallBoatHullAssembly', 'ReinforcedSailPanel', 'MarineFilterMediaPack', 'ProcessWaterPump', 'ProtectedWiringHarness'],
        ['WaterproofDeckPanel', 'FabricatedEquipmentFrame', 'NaturalFiberCaulkingCord', 'FlexibleHoseAssembly'],
        ['SmallBoatHullAssembly', 'MarineFilterMediaPack', 'FluidTransferSkid', 'ProtectedWiringHarness']
    ]),
    outdoor_safety: Object.freeze([
        ['WaxedCanvasPanel', 'BraidedUtilityCord', 'WeatherproofWindowPanel', 'ReinforcedWebbingStrap'],
        ['BraidedUtilityCord', 'DurableGripAssembly', 'ProtectiveShellPanel', 'ReinforcedWebbingStrap'],
        ['ProtectiveShellPanel', 'InsulationFillPack', 'CutSiliconeGasketSet', 'TamperResistantLockCore'],
        ['CanvasToolRoll', 'DurableGripAssembly', 'FlexibleBrushHead', 'ProtectiveEquipmentBag']
    ]),
    medical_science: Object.freeze([
        ['SterileDressingPack', 'WoundClosureSet', 'SterileFluidLineSet', 'ProtectiveEquipmentBag'],
        ['ProtectiveFaceShield', 'FilterCartridgeCore', 'SterileFluidLineSet', 'CapsuleAndCarrierSet'],
        ['BoneRepairComposite', 'SoftTissuePatch', 'WoundClosureSet', 'SterileDressingPack', 'ProtectiveEquipmentBag'],
        ['SterileFluidLineSet', 'FilterCartridgeCore', 'RigidBusbarAssembly', 'FormedSheetMetalHousing']
    ]),
    defense_security: Object.freeze([
        ['ReinforcedSecurityPanel', 'BallisticCeramicArray', 'TamperResistantLockCore', 'IntrusionSensorMat', 'ImpactRestraintAssembly'],
        ['SecureEquipmentEnclosure', 'ReinforcedChassisSection', 'TamperResistantLockCore', 'FireResistantBarrierCurtain'],
        ['IntrusionSensorMat', 'ProtectedWiringHarness', 'HybridEnergyBuffer', 'ProtectiveShellPanel'],
        ['TransparentArmorPanel', 'ReinforcedSecurityPanel', 'IndustrialMotorControlCabinet', 'InsulatedWallPanel']
    ]),
    aerospace: Object.freeze([
        ['AerospaceSandwichPanel', 'LightweightAirframeJoint', 'CompositeControlSurface', 'AircraftControlCableSet'],
        ['AerospaceSandwichPanel', 'CompositeControlSurface', 'TurbineHotSectionAssembly', 'PropulsionAccessoryGearbox', 'ProtectedWiringHarness'],
        ['UtilityAircraftFuselageSection', 'LandingGearStrutAssembly', 'AircraftControlCableSet', 'PropulsionAccessoryGearbox'],
        ['UtilityAircraftFuselageSection', 'HighTemperatureShieldPanel', 'EnvironmentalControlCoreAssembly', 'ProtectedWiringHarness']
    ]),
    space_life_support: Object.freeze([
        ['CarbonDioxideScrubberCartridge', 'OxygenLineAssembly', 'PressureBladderAssembly', 'EnvironmentalControlCoreAssembly'],
        ['EnvironmentalControlCoreAssembly', 'PressureWindowAndRadiatorPanel', 'VacuumInsulationBlanket', 'ProtectedWiringHarness'],
        ['TraceContaminantFilter', 'PressureBladderAssembly', 'CatalyticWaterProcessor', 'TamperResistantLockCore'],
        ['EnvironmentalControlCoreAssembly', 'CatalyticWaterProcessor', 'PressureWindowAndRadiatorPanel', 'SealedResearchHabitatModule']
    ])
});

module.exports = { MATERIAL_GROUPS, CRAFTED_INPUT_GROUPS, FINAL_INPUT_GROUPS };
