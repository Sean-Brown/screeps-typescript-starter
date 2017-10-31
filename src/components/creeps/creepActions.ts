import * as Config from "../../config/config";

/**
 * Shorthand method for `Creep.moveTo()`.
 *
 * @export
 * @param {Creep} creep
 * @param {(Structure | RoomPosition)} target
 * @returns {number}
 */
export function moveTo(creep: Creep, target: Structure | RoomPosition): number {
  return creep.moveTo(target);
}

/**
 * Returns true if the `ticksToLive` of a creep has dropped below the renew
 * limit set in config.
 *
 * @export
 * @param {Creep} creep
 * @returns {boolean}
 */
export function needsRenew(creep: Creep): boolean {
  return (creep.ticksToLive < Config.DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL);
}

/**
 * Shorthand method for `renewCreep()`.
 *
 * @export
 * @param {Creep} creep
 * @param {Spawn} spawn
 * @returns {number}
 */
export function tryRenew(creep: Creep, spawn: Spawn): number {
  return spawn.renewCreep(creep);
}

/**
 * Moves a creep to a designated renew spot (in this case the spawn).
 *
 * @export
 * @param {Creep} creep
 * @param {Spawn} spawn
 */
export function moveToRenew(creep: Creep, spawn: Spawn): void {
  if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }
}

/**
 * Attempts transferring available resources to the creep.
 *
 * @export
 * @param {Creep} creep
 * @param {RoomObject} roomObject
 */
export function getEnergy(creep: Creep, roomObject: RoomObject): void {
  const energy: Resource = roomObject as Resource;

  if (energy) {
    if (creep.pos.isNearTo(energy)) {
      creep.pickup(energy);
    } else {
      moveTo(creep, energy.pos);
    }
  }
}

/**
 * Returns true if a creep's `working` memory entry is set to true, and false
 * otherwise.
 *
 * @export
 * @param {Creep} creep
 * @returns {boolean}
 */
export function canWork(creep: Creep): boolean {
  const working = creep.memory.working;

  if (working && _.sum(creep.carry) === 0) {
    creep.memory.working = false;
    return false;
  } else if (!working && _.sum(creep.carry) === creep.carryCapacity) {
    creep.memory.working = true;
    return true;
  } else {
    return creep.memory.working;
  }
}

/**
 * Returns the cost of calculating a creep given the body parts
 *
 * @export
 * @param {string[]} bodyParts
 * @returns {number}
 */
export function creepBuildCost(bodyParts: string[]): number {
  return bodyParts.reduce((cost, part) => cost + BODYPART_COST[part], 0);
}

/**
 * Sort the construction sites by sites closest to the creep
 * @param {Creep} creep
 * @param {ConstructionSite[]} sites
 * @returns {ConstructionSite[]}
 */
export function sortClosestConstructionSites(creep: Creep, sites: ConstructionSite[]): ConstructionSite[] {
  const creepPos = creep.pos;
  return sites.sort((siteA, siteB) => {
    const lenA = creep.room.findPath(creepPos, siteA.pos).length;
    const lenB = creep.room.findPath(creepPos, siteB.pos).length;
    return lenA > lenB ? 1 : lenA < lenB ? -1 : 0;
  });
}

/**
 * Sort the structures by structures in the most need of repair
 * @param {Structure[]} structures
 * @returns {Structure[]}
 */
export function sortStructuresMostNeedingRepair(structures: Structure[]): Structure[] {
  return structures.sort((sA, sB) => {
    const sAdeficit = sA.hitsMax - sA.hits;
    const sBdeficit = sB.hitsMax - sB.hits;
    return sAdeficit > sBdeficit ? 1 : sAdeficit < sBdeficit ? -1 : 0;
  });
}

/**
 * Sort the energy sources by distance from the creep
 * @param {Creep} creep
 * @param {Source[]} energySources
 * @returns {Source[]}
 */
export function sortClosestEnergySources(creep: Creep, energySources: Source[]): Source[] {
  const creepPos = creep.pos;
  return energySources.sort((sourceA, sourceB) => {
    const lenA = creep.room.findPath(creepPos, sourceA.pos).length;
    const lenB = creep.room.findPath(creepPos, sourceB.pos).length;
    return lenA > lenB ? 1 : lenA < lenB ? -1 : 0;
  });
}

export function tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

export function moveToHarvest(creep: Creep, target: Source): void {
  if (tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}

export function tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

export function moveToDropEnergy(creep: Creep, target: Spawn | Structure): void {
  if (tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}

export function moveToRepair(creep: Creep, target: Spawn | Structure): void {
  const repairErr = creep.repair(target);
  console.info(`repair error: ${repairErr}`);
  if (creep.repair(target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}

export function moveToConstructionSite(creep: Creep, target: ConstructionSite): void {
  if (creep.build(target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}
