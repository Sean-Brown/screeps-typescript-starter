import * as creepActions from "../creepActions";

import { log } from "../../../lib/logger/log";

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
    let hitStructures = creep.room.find<Structure>(FIND_MY_STRUCTURES).filter((s: Structure) => s.hits < s.hitsMax);
    if (hitStructures.length) {
      log.info("repairing structures");
      // Find the closest structure
      hitStructures = creepActions.sortMostNeedingRepair(hitStructures);
      creepActions.moveToRepair(creep, hitStructures[0]);
    } else {
      let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
      if (constructionSites.length) {
        log.info("repairing construction sites");
        // Find the closest construction site
        constructionSites = creepActions.sortClosestConstructionSites(creep, constructionSites);
        creepActions.moveToConstructionSite(creep, constructionSites[0]);
      } else {
        let spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS);
        if (spawns.length) {
          log.info("repairing spawns");
          spawns = creepActions.sortMostNeedingRepair(spawns) as Spawn[];
          creepActions.moveToRepair(creep, spawns[0]);
        } else {
          log.info("repairing nothing");
        }
      }
    }
  } else {
    let sources = creep.room.find<Source>(FIND_SOURCES);
    if (sources.length) {
      sources = creepActions.sortClosestEnergySources(creep, sources);
      creepActions.moveToHarvest(creep, sources[0]);
    }
  }
}
