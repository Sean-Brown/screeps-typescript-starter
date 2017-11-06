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
  const creepEnergy = creep.carry.energy ? creep.carry.energy : 0;
  if (creep.memory.building && creepEnergy === 0) {
    creep.memory.building = false;
    creep.say("Harvesting");
  }
  if (!creep.memory.building && (creepEnergy >= (creep.carryCapacity * .75))) {
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

/**
 * Get the builder's body given the room size
 * @param room
 */
export function getBody(room: Room): string[] {
  const controllerLevel = (room.controller ? room.controller.level : 0);
  switch (controllerLevel) {
    default:
    case 0: return [WORK, CARRY, MOVE];
    case 1: return [WORK, CARRY, MOVE];
    case 2: return [WORK, WORK, CARRY, MOVE];
    case 3: return [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
  }
}
