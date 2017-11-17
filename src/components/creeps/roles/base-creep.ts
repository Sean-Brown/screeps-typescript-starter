import * as creepActions from "../creepActions";

import { log } from "../../../lib/logger/log";

/**
 * Run the creep's base actions
 * @param {Creep} creep
 * @returns {boolean} true if the caller should continue execution, false if they shouldn't
 */
export function run(creep: Creep): boolean {
  // Check if the creep is running low on health
  const creepEnergy = creep.carry.energy ? creep.carry.energy : 0;
  if (creepActions.needsRenew(creep)) {
    if (creepEnergy > 0 && creep.ticksToLive > 60) {
      // Allow the creep to carry the energy to where ever it's going
      return true;
    }
    // Find the closest spawn with more energy than twenty percent capacity
    const spawn = creep.pos.findClosestByPath<Spawn>(FIND_MY_SPAWNS, {
      filter: (s: Spawn) => s.energy > (s.energyCapacity * .2),
    });
    if (spawn) {
      creepActions.moveToRenew(creep, spawn);
      return false;
    } else {
      log.warning(`Creep ${creep.name} requires energy but there isn't enough energy at any nearby spawn`);
    }
  }
  // Check if there's dropped energy

  return true;
}
