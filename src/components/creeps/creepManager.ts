import * as Config from "../../config/config";

import * as creepActions from "./creepActions";
import * as builder from "./roles/builder";
import * as harvester from "./roles/harvester";
import * as repairer from "./roles/repairer";

import { Roles } from "./roles";

import { log } from "../../lib/logger/log";

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
  const creeps = room.find<Creep>(FIND_MY_CREEPS);
  const creepCount = _.size(creeps);

  if (Config.ENABLE_DEBUG_MODE) {
    log.debug(`${creepCount} creeps found in the playground.`);
  }

  _buildMissingCreeps(room, creeps);

  _.each(creeps, (creep: Creep) => {
    if (Roles.IsHarvester(creep)) {
      harvester.run(creep);
    } else if (Roles.IsBuilder(creep)) {
      builder.run(creep);
    } else if (Roles.IsRepairer(creep)) {
      repairer.run(creep);
    }
  });
}

/**
 * Calculate the cost of the given creep body
 * @param {string[]} bodyParts
 */
function _calcBodyCost(bodyParts: string[]): number {
  return bodyParts.reduce((cost: number, part: string) => cost + BODYPART_COST[part], 0);
}

/**
 * Get the maximum number of harvesters there should be based on the controller level
 * @param room
 */
function getMaxHarvesters(room: Room): number {
  const controllerLevel = (room.controller ? room.controller.level : 0);
  switch (controllerLevel) {
    default:
    case 0: return Config.BUILD_LEVELS.LEVEL_0.HARVESTERS;
    case 1: return Config.BUILD_LEVELS.LEVEL_1.HARVESTERS;
    case 2: return Config.BUILD_LEVELS.LEVEL_2.HARVESTERS;
  }
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */
function _buildMissingCreeps(room: Room, creeps: Creep[]) {
  // Iterate through each creep and push them into the role array.
  const harvesters = _.filter(creeps, (creep) => Roles.IsHarvester(creep));
  const builders = _.filter(creeps, (creep) => Roles.IsBuilder(creep));
  const repairers = _.filter(creeps, (creep) => Roles.IsRepairer(creep));

  const spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (spawn: Spawn) => {
      return spawn.spawning === null;
    },
  });

  if (Config.ENABLE_DEBUG_MODE) {
    if (spawns[0]) {
      log.debug(`Spawn: ${spawns[0].name}`);
    }
  }

  // Check if we should build more units
  if (
    !creeps.some((creep: Creep) => creepActions.needsRenew(creep)) ||
    spawns.some((s: Spawn) => s.energy === s.energyCapacity)
  ) {
    const available = room.energyAvailable;
    // Check if we need more harvesters
    const numHarvesters = harvesters.length;
    if (numHarvesters < getMaxHarvesters(room)) {
      const body = harvester.getBody(room);
      const cost = _calcBodyCost(body);
      if (available >= cost) {
        _.each(spawns, (spawn: Spawn) => {
          _spawnCreep(spawn, body, Roles.Harvester);
        });
      }
    }
    // Check if we need more builders
    if (builders.length < (numHarvesters * .5)) {
      const body = builder.getBody(room);
      const cost = _calcBodyCost(body);
      if (available >= cost) {
        _.each(spawns, (spawn: Spawn) => {
          _spawnCreep(spawn, body, Roles.Builder);
        });
      }
    }
    // Check if we need more repairers
    if (repairers.length < builders.length) {
      const body = repairer.getBody(room);
      const cost = _calcBodyCost(body);
      if (available >= cost) {
        _.each(spawns, (spawn: Spawn) => {
          _spawnCreep(spawn, body, Roles.Repairer);
        });
      }
    }
  }
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {string[]} bodyParts
 * @param {string} role
 * @returns
 */
function _spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
  const uuid: number = Memory.uuid;
  let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

  const properties: { [key: string]: any } = {
    role,
    room: spawn.room.name,
  };

  status = _.isString(status) ? OK : status;
  if (status === OK) {
    Memory.uuid = uuid + 1;
    const creepName: string = `${spawn.room.name} - ${role} ${uuid}`;

    log.debug(`Started creating new creep: ${creepName}`);
    if (Config.ENABLE_DEBUG_MODE) {
      log.debug(`Body: ${bodyParts}`);
    }

    status = spawn.createCreep(bodyParts, creepName, properties);

    return _.isString(status) ? OK : status;
  } else {
    if (Config.ENABLE_DEBUG_MODE) {
      log.debug(`Failed creating new creep: ${status}`);
    }

    return status;
  }
}
