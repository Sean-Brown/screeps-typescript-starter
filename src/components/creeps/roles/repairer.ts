import * as creepActions from "../creepActions";

/**
 * Runs repairer actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (creep.memory.repairing && creep.carry.energy === 0) {
    creep.memory.repairing = false;
    creep.say("Harvesting");
  }
  if (!creep.memory.repairing && creep.carry.energy === creep.carryCapacity) {
    creep.memory.repairing = true;
    creep.say("Repairing");
  }

  if (creep.memory.repairing) {
    let structures = creep.room.find<Structure>(FIND_MY_STRUCTURES);
    if (structures.length) {
      // Find the closest structure
      structures = creepActions.sortStructuresMostNeedingRepair(structures);
      if (creep.repair(structures[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  } else {
    let sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length) {
      sources = creepActions.sortClosestEnergySources(creep, sources);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
}
