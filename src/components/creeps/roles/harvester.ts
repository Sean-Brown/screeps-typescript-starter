import * as creepActions from "../creepActions";
import * as baseCreep from "./base-creep";

import { log } from "../../../lib/logger/log";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (!baseCreep.run(creep)) {
    return;
  }
  // Check if the creep is at capacity
  const creepEnergy = creep.carry.energy ? creep.carry.energy : 0;
  if (creepEnergy < creep.carryCapacity) {
    creepActions.harvestClosestSource(creep);
    return;
  }
  // Find spawns that need energy
  const spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (s: Spawn) => s.energy < s.energyCapacity,
  });
  if (spawns.length) {
    const spawn = creepActions.sortByClosest(creep, spawns)[0];
    log.info(`creep ${creep.name} moving energy to spawn ${spawn.name}`);
    creepActions.moveToDropEnergy(creep, spawn);
    return;
  }

  // Check if any controllers need energy
  const controllers = creep.room.find<Controller>(FIND_STRUCTURES, {
    filter: (s: Structure) => (s.structureType === STRUCTURE_CONTROLLER) && ((s as Controller).ticksToDowngrade < 3000),
  });
  if (controllers.length) {
    const controller = creepActions.sortByClosest(creep, controllers)[0];
    log.info(`creep ${creep.name} moving energy to controller ${controller.id}`);
    creepActions.moveToDropEnergy(creep, controller);
    return;
  }

  // Find extensions that need energy
  const extensions = creep.room.find<Extension>(FIND_MY_STRUCTURES, {
    filter: (s: Structure) => (s.structureType === STRUCTURE_EXTENSION)  && ((s as Extension).energy < (s as Extension).energyCapacity),
  });
  if (extensions.length) {
    const extension = creepActions.sortByClosest(creep, extensions)[0];
    log.info(`creep ${creep.name} moving energy to extension ${extension.id}`);
    creepActions.moveToDropEnergy(creep, extension);
    return;
  }

  // Find containers that need energy
  const container = creep.pos.findClosestByPath<Container>(FIND_STRUCTURES, {
    filter: (s: Structure) => (s.structureType === STRUCTURE_CONTAINER) && (_.sum((s as Container).store) < (s as Container).storeCapacity),
  });
  if (container) {
    log.info(`creep ${creep.name} moving energy to container ${container.id}`);
    creepActions.moveToDropEnergy(creep, container);
    return;
  }

  // Check if there are any construction sites
  if (!checkSites(creep)) {
    return;
  }

  log.warning(`idle harvester ${creep.name}`);
}

/**
 * Check if any structures need energy
 * @param {Creep} creep
 * @returns {boolean} true if the caller should continue, false if the caller should cease actions (i.e. return)
 */
function checkSites(creep: Creep): boolean {
  const site = creep.pos.findClosestByPath<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
  if (site) {
    creepActions.moveToConstructionSite(creep, site);
    return false;
  }
  return true;
}

/**
 * Get the harvester's body given the room size
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
    case 4: return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    case 5: return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
  }
}
