import * as Config from "../../config/config";

import { log } from "../../lib/logger/log";

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
    moveTo(creep, spawn);
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
  const creepEnergy = creep.carry.energy ? creep.carry.energy : 0;
  if (working && creepEnergy === 0) {
    creep.memory.working = false;
    return false;
  } else if (!working && creepEnergy === creep.carryCapacity) {
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
 * Gather energy from the nearest storage container or energy source
 * @param {Creep} creep
 */
export function gatherEnergy(creep: Creep) {
  const container = creep.pos.findClosestByPath<Container>(FIND_STRUCTURES, {
    filter: (s: Structure) => (s.structureType === STRUCTURE_CONTAINER) && (_.sum((s as Container).store) > ((s as Container).storeCapacity * .05)),
  });
  if (container) {
    // Get energy from the container
    gatherFromContainer(creep, container);
  } else {
    // Get energy from the closest source
    harvestClosestSource(creep);
  }
}

function gatherFromContainer(creep: Creep, container: Container) {
  if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(container.pos);
  }
}

/**
 * Harvest the closest source to the creep
 * @param {Creep} creep
 */
export function harvestClosestSource(creep: Creep) {
  let sources = creep.room.find<Source>(FIND_SOURCES);
  if (sources.length) {
    sources = sortClosestEnergySources(creep, sources);
    const source = sources[0];
    log.debug(`harvester ${creep.name} harvesting from ${source.id}, ${source.pos}`);
    moveToHarvest(creep, source);
  }
}

/**
 * Sort the objects by the ones closest to the creep
 * @param {Creep} creep
 * @param {T[]} objects
 * @returns {T[]}
 */
export function sortByClosest<T extends Structure | ConstructionSite | Spawn | Container>(creep: Creep, objects: T[]): T[] {
  const creepPos = creep.pos;
  return objects.sort((structA, structB) => {
    const lenA = creep.room.findPath(creepPos, structA.pos).length;
    const lenB = creep.room.findPath(creepPos, structB.pos).length;
    return lenA > lenB ? 1 : lenA < lenB ? -1 : 0;
  });
}

/**
 * Sort the structures or spawns by the ones in the most need of repair
 * @param {Array<Structure|Spawn>} structures
 * @returns {Array<Structure|Spawn>}
 */
export function sortMostNeedingRepair(structures: Array<Structure|Spawn>): Array<Structure|Spawn> {
  return structures.sort((sA, sB) => {
    const sAdeficit = sA.hitsMax - sA.hits;
    const sBdeficit = sB.hitsMax - sB.hits;
    return sAdeficit > sBdeficit ? 1 : sAdeficit < sBdeficit ? -1 : 0;
  });
}

function hasDecay(item: Structure | Spawn): boolean {
  return item.structureType === STRUCTURE_RAMPART ||
    item.structureType === STRUCTURE_ROAD ||
    item.structureType === STRUCTURE_POWER_BANK ||
    item.structureType === STRUCTURE_CONTAINER ||
    item.structureType === STRUCTURE_PORTAL;
}

function isController(item: Structure | Spawn): boolean {
  return item.structureType === STRUCTURE_CONTROLLER;
}

export function sortMostNeedingEnergy(structures: Array<Structure|Spawn>): Array<Structure|Spawn> {
  return structures.sort((sA, sB) => {
    const aIsController = isController(sA);
    const bIsController = isController(sB);
    const aHasDecay = hasDecay(sA);
    const bHasDecay = hasDecay(sB);
    const chooseA = (aIsController || aHasDecay);
    const chooseB = (bIsController || bHasDecay);
    if (chooseA && !chooseB) {
      return 1;
    } else if (chooseB && !chooseA) {
      return -1;
    } else if (chooseA && chooseB) {
      if (aIsController && bIsController) {
        const aController = (sA as Controller);
        const aTicks = aController ? aController.ticksToDowngrade : 0;
        const bController = (sB as Controller);
        const bTicks = bController ? bController.ticksToDowngrade : 0;
        return aTicks < bTicks ? 1 : bTicks > aTicks ? -1 : 0;
      } else if (aIsController && !bIsController) {
        return 1;
      } else if (bIsController && !aIsController) {
        return -1;
      } else {
        const aTicks = getStructureTicksToDecay(sA);
        const bTicks = getStructureTicksToDecay(sB);
        return aTicks < bTicks ? 1 : bTicks < aTicks ? -1 : 0;
      }
    } else {
      return 0;
    }
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

export function tryEnergyDropOff(creep: Creep, target: Spawn | Structure | Container): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

export function moveToDropEnergy(creep: Creep, target: Spawn | Structure | Container): void {
  const errCode = tryEnergyDropOff(creep, target);
  if (errCode === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  } else if (errCode !== OK) {
    log.error(`creep ${creep.name} received error ${errCode} attempting to drop off energy at ${target.pos}`);
  }
}

export function moveToRepair(creep: Creep, target: Spawn | Structure): void {
  log.info( `harveseter ${creep.name} moving to repair target ${target.id}` +
            `, ${target.pos}, ${target.hits} of ${target.hitsMax}`);
  if (creep.repair(target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}

export function moveToConstructionSite(creep: Creep, target: ConstructionSite): void {
  log.info(`creep ${creep.name} moving to construction site ${target.id}`);
  if (creep.build(target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}

function getStructureTicksToDecay(structure: Structure): number {
  const rampart = structure as Rampart;
  if (rampart) {
    return rampart.ticksToDecay;
  }
  const road = structure as StructureRoad;
  if (road) {
    return road.ticksToDecay;
  }
  const powerBank = structure as PowerBank;
  if (powerBank) {
    return powerBank.ticksToDecay;
  }
  const container = structure as Container;
  if (container) {
    return container.ticksToDecay;
  }
  const portal = structure as StructurePortal;
  if (portal) {
    return portal.ticksToDecay;
  }
  return -1;
}

export function structureIsDecaying(structure: Structure): boolean {
  const ticksToDecay = getStructureTicksToDecay(structure);
  return ticksToDecay > -1 && ticksToDecay < 300;
}
