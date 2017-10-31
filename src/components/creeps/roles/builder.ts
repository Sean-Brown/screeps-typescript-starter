/**
 * Runs builder actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (creep.memory.building && creep.carry.energy === 0) {
    creep.memory.building = false;
    creep.say("🔄 harvest");
  }
  if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
    creep.memory.building = true;
    creep.say("🚧 build");
  }

  if (creep.memory.building) {
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  } else {
    const sources = creep.room.find(FIND_SOURCES) as Source[];
    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}
