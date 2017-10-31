import * as Config from "../../../config/config";
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
    creep.say("🔄 harvest");
  }
  if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
    creep.memory.building = true;
    creep.say("🚧 build");
  }

  if (creep.memory.building) {
    let targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      // Find the closest construction site
      targets = creepActions.sortClosestConstructionSites(creep, targets);
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else if (Config.ENABLE_DEBUG_MODE) {
      console.info("No construction sites available");
    }
  } else {
    let sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length) {
      sources = creepActions.sortClosestEnergySources(creep, sources);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else if (Config.ENABLE_DEBUG_MODE) {
      console.info("No sources available");
    }
  }
}
