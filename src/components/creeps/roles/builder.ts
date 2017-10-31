import * as creepActions from "../creepActions";

/**
 * Runs builder actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (creep.memory.building && creep.carry.energy === 0) {
    creep.memory.building = false;
    creep.say("Harvesting");
  }
  if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
    creep.memory.building = true;
    creep.say("Building");
  }

  if (creep.memory.building) {
    let targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      // Find the closest construction site
      targets = creepActions.sortClosestConstructionSites(creep, targets);
      creepActions.moveToConstructionSite(creep, targets[0]);
    }
  } else {
    let sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length) {
      sources = creepActions.sortClosestEnergySources(creep, sources);
      creepActions.moveToHarvest(creep, sources[0]);
    }
  }
}
