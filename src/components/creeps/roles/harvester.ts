import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  const spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS);
  if (spawns.length) {
    const spawn = spawns[0];
    if (creepActions.needsRenew(creep)) {
      creepActions.moveToRenew(creep, spawn);
    } else if (_.sum(creep.carry) === creep.carryCapacity) {
      if (spawn.energy < spawn.energyCapacity) {
        creepActions.moveToDropEnergy(creep, spawn);
      } else {
        checkStructures(creep);
      }
    } else {
      creepActions.harvestClosestSource(creep);
    }
  } else {
    creepActions.harvestClosestSource(creep);
  }
}

function checkStructures(creep: Creep) {
  let structures = creep.room.find<Structure>(FIND_MY_STRUCTURES);
  if (structures.length) {
    // Find structure in most need of energy
    structures = creepActions.sortMostNeedingEnergy(structures);
    creepActions.moveToDropEnergy(creep, structures[0]);
  } else {
    let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
    if (constructionSites.length) {
      // Find the closest construction site
      constructionSites = creepActions.sortClosestConstructionSites(creep, constructionSites);
      creepActions.moveToConstructionSite(creep, constructionSites[0]);
    }
  }
}
