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
  if (_.sum(creep.carry) < creep.carryCapacity) {
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

  // Find containers that need energy
  const containers = creep.room.find<Container>(FIND_MY_STRUCTURES, {
    filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER && (s as Container).store < (s as Container).storeCapacity,
  });
  if (containers.length) {
    const container = creepActions.sortByClosest(creep, containers)[0];
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
