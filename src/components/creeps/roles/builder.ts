import * as creepActions from "../creepActions";
import * as baseCreep from "./base-creep";

/**
 * Runs builder actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (!baseCreep.run(creep)) {
    return;
  }

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
      targets = creepActions.sortByClosest(creep, targets);
      creepActions.moveToConstructionSite(creep, targets[0]);
    } else {
      let structures = creep.room.find<Structure>(FIND_STRUCTURES);
      if (structures.length) {
        structures = creepActions.sortMostNeedingEnergy(structures);
        creepActions.moveToDropEnergy(creep, structures[0]);
      }
    }
  } else {
    creepActions.gatherEnergy(creep);
  }
}
