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
      console.info("repairing structures");
      // Find the closest structure
      structures = creepActions.sortMostNeedingRepair(structures);
      creepActions.moveToRepair(creep, structures[0]);
    } else {
      let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
      if (constructionSites.length) {
        console.info("repairing construction sites");
        // Find the closest construction site
        constructionSites = creepActions.sortClosestConstructionSites(creep, constructionSites);
        creepActions.moveToConstructionSite(creep, constructionSites[0]);
      } else {
        let spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS);
        if (spawns.length) {
          console.info("repairing spawns");
          spawns = creepActions.sortMostNeedingRepair(spawns) as Spawn[];
          creepActions.moveToRepair(creep, spawns[0]);
        } else {
          console.info("repairing nothing");
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
