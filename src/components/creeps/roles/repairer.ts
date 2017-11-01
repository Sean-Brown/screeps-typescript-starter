import * as creepActions from "../creepActions";

import {log} from "../../../lib/logger/log";

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
    const structures = creep.room.find<Structure>(FIND_MY_STRUCTURES);
    let hitStructures = structures.filter((s: Structure) => s.hits < s.hitsMax);
    if (hitStructures.length) {
      // Find the closest structure
      hitStructures = creepActions.sortMostNeedingRepair(hitStructures);
      const structure = hitStructures[0];
      log.info(`repairing repairing ${structure.id} ${structure.pos}`);
      creepActions.moveToRepair(creep, structure);
    } else {
      let depletedStructures = structures.filter((s: Structure) => creepActions.structureIsDecaying(s));
      if (depletedStructures.length) {
        depletedStructures = creepActions.sortMostNeedingEnergy(depletedStructures);
        const structure = depletedStructures[0];
        log.info(`repairer replenishing ${structure.id} ${structure.pos}`);
        creepActions.moveToDropEnergy(creep, structure);
      } else {
        let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length) {
          // Find the closest construction site
          constructionSites = creepActions.sortClosestConstructionSites(creep, constructionSites);
          const structure = constructionSites[0];
          log.info(`repairer moving to construction site ${structure.id} ${structure.pos}`);
          creepActions.moveToConstructionSite(creep, structure);
        } else {
          let spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS);
          if (spawns.length) {
            spawns = creepActions.sortMostNeedingRepair(spawns) as Spawn[];
            const spawn = spawns[0];
            log.info(`repairer moving to spawn ${spawn.id} ${spawn.pos}`);
            creepActions.moveToRepair(creep, spawn);
          }
        }
      }
    }
  } else {
    creepActions.harvestClosestSource(creep);
  }
}
