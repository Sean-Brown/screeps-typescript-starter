import * as creepActions from "../creepActions";
import * as baseCreep from "./base-creep";

import {log} from "../../../lib/logger/log";

function repairStructure(creep: Creep, structure: Structure) {
  log.info(`repairer ${creep.name} repairing ${structure.structureType}, ${structure.id}, ${structure.pos}`);
  creep.memory.structure = structure.id;
  creepActions.moveToRepair(creep, structure);
}

function replenishStructure(creep: Creep, structure: Structure) {
  log.info(`repairer ${creep.name} replenishing ${structure.structureType}, ${structure.id}, ${structure.pos}`);
  creep.memory.structure = structure.id;
  creepActions.moveToDropEnergy(creep, structure);
}

function construct(creep: Creep, site: ConstructionSite) {
  log.info(`repairer ${creep.name} constructing ${site.id}, ${site.pos}`);
  creepActions.moveToConstructionSite(creep, site);
}

/**
 * Runs repairer actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (!baseCreep.run(creep)) {
    return;
  }
  const creepEnergy = creep.carry.energy ? creep.carry.energy : 0;
  if (creep.memory.repairing && creepEnergy === 0) {
    creep.memory.repairing = false;
    creep.say("Harvesting");
  }
  if (!creep.memory.repairing && (creepEnergy >= (creep.carryCapacity * .75))) {
    creep.memory.repairing = true;
    creep.say("Repairing");
  }
  if (creep.memory.repairing) {
    if (creep.memory.structure) {
      // Keep repairing the same structure
      const structures = creep.room.find<Structure>(FIND_MY_STRUCTURES, {
        filter: (s: Structure) => s.id === creep.memory.structure,
      });
      if (structures.length > 0) {
        const structure = structures[0];
        if (creepActions.structureIsDecaying(structure)) {
          replenishStructure(creep, structure);
        } else {
          repairStructure(creep, structure);
        }
        // If the structure is more than 90% repaired and replenished, then choose a new structure
        if ((structure.hits >= (structure.hitsMax * .9)) && (!creepActions.structureIsDecaying(structure))) {
          creep.memory.structure = null;
        } else {
          return;
        }
      }
    }

    // Find something new to repair

    // Find spawns with less than 20% hp remaining
    const spawns = creep.room.find<Spawn>(FIND_MY_SPAWNS, {
      filter: (s: Structure) => s.hits < (s.hitsMax * .2),
    });
    if (spawns.length) {
      repairStructure(creep, creepActions.sortMostNeedingRepair(spawns)[0]);
      return;
    }

    // Find ramparts with less than 20% hp remaining
    const ramparts = creep.room.find<Rampart>(FIND_MY_STRUCTURES, {
      filter: (s: Structure) => (s.structureType === STRUCTURE_RAMPART) && (s.hits < s.hitsMax) && (s.hits < (s.hitsMax * .2)),
    });
    if (ramparts.length) {
      repairStructure(creep, creepActions.sortMostNeedingRepair(ramparts)[0]);
      return;
    }

    // Find roads with less than 20% hp remaining
    const roadStructures = creep.room.find<StructureRoad>(FIND_STRUCTURES, {
      filter: (s: Structure) => (s.structureType === STRUCTURE_ROAD) && (s.hits < (s.hitsMax * .2)),
    });
    if (roadStructures.length > 0) {
      repairStructure(creep, creepActions.sortMostNeedingRepair(roadStructures)[0]);
      return;
    }

    // Find structures with less than 20% hp remaining
    const hitStructures = creep.room.find<Structure>(FIND_MY_STRUCTURES, {
      filter: (s: Structure) => (s.hits < s.hitsMax) && (s.hits < (s.hitsMax * .2)),
    });
    if (hitStructures.length) {
      repairStructure(creep, creepActions.sortMostNeedingRepair(hitStructures)[0]);
      return;
    }

    // Find decaying structures
    const decayingStructures = creep.room.find<Structure>(FIND_MY_STRUCTURES, {
      filter: (s: Structure) => creepActions.structureIsDecaying(s),
    });
    if (decayingStructures.length) {
      replenishStructure(creep, creepActions.sortMostNeedingEnergy(decayingStructures)[0]);
      return;
    }

    // Fall back to helping in construction
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES) as ConstructionSite;
    if (site) {
      construct(creep, site);
      return;
    }

    log.warning(`idle repairer ${creep.name}`);
  } else {
    creepActions.gatherEnergy(creep);
  }
}

/**
 * Get the repairer's body given the room size
 * @param room
 */
export function getBody(room: Room): string[] {
  const controllerLevel = (room.controller ? room.controller.level : 0);
  switch (controllerLevel) {
    default:
    case 0: return [WORK, CARRY, MOVE];
    case 1: return [WORK, WORK, CARRY, MOVE];
    case 2: return [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
  }
}
