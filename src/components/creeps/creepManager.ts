import * as Config from "../../config/config";

import * as builder from "./roles/builder";
import * as harvester from "./roles/harvester";

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
    log.info(creepCount + " creeps found in the playground.");
  }

  _buildMissingCreeps(room, creeps);

  _.each(creeps, (creep: Creep) => {
    if (creep.memory.role === "harvester") {
      harvester.run(creep);
    } else if (creep.memory.role === "builder") {
      builder.run(creep);
    }
  });
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */
function _buildMissingCreeps(room: Room, creeps: Creep[]) {
  let bodyParts: string[];

  // Iterate through each creep and push them into the role array.
  const harvesters = _.filter(creeps, (creep) => creep.memory.role === "harvester");
  const builders = _.filter(creeps, (creep) => creep.memory.role === "builder");

  const spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (spawn: Spawn) => {
      return spawn.spawning === null;
    },
  });

  if (Config.ENABLE_DEBUG_MODE) {
    if (spawns[0]) {
      log.info("Spawn: " + spawns[0].name);
    }
  }

  if (harvesters.length < 2) {
    if (harvesters.length < 1 || room.energyCapacityAvailable <= 800) {
      bodyParts = [WORK, WORK, CARRY, MOVE];
    } else if (room.energyCapacityAvailable > 800) {
      bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    }

    _.each(spawns, (spawn: Spawn) => {
      _spawnCreep(spawn, bodyParts, "harvester");
    });
  }
  if (builders.length < 1) {
    bodyParts = [WORK, WORK, MOVE];
    _.each(spawns, (spawn: Spawn) => {
      _spawnCreep(spawn, bodyParts, "builder");
    });
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
    const creepName: string = spawn.room.name + " - " + role + uuid;

    log.info("Started creating new creep: " + creepName);
    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Body: " + bodyParts);
    }

    status = spawn.createCreep(bodyParts, creepName, properties);

    return _.isString(status) ? OK : status;
  } else {
    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Failed creating new creep: " + status);
    }

    return status;
  }
}
