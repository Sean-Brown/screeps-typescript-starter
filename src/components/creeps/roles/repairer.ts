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
    const structures = creep.room.find<Structure>(FIND_MY_STRUCTURES);
    let hitStructures = structures.filter((s: Structure) => s.hits < s.hitsMax);
    if (hitStructures.length) {
      // Find the closest structure
      hitStructures = creepActions.sortMostNeedingRepair(hitStructures);
      creepActions.moveToRepair(creep, hitStructures[0]);
    } else {
      let depletedStructures = structures.filter((s: Structure) => {
        const decaying = (s as creepActions.StructureDecay);
        if (decaying && decaying.ticksToDecay < 300) {
          return decaying;
        }
      });
      if (depletedStructures.length) {
        depletedStructures = creepActions.sortMostNeedingEnergy(depletedStructures);
        creepActions.moveToDropEnergy(creep, depletedStructures[0]);
      } else {
        let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length) {
          // Find the closest construction site
          constructionSites = creepActions.sortClosestConstructionSites(creep, constructionSites);
          creepActions.moveToConstructionSite(creep, constructionSites[0]);
        } else {
          let spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS);
          if (spawns.length) {
            spawns = creepActions.sortMostNeedingRepair(spawns) as Spawn[];
            creepActions.moveToRepair(creep, spawns[0]);
          }
        }
      }
    }
  } else {
    creepActions.harvestClosestSource(creep);
  }
}
