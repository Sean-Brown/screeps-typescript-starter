import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  if (creepActions.needsRenew(creep)) {
    creepActions.moveToRenew(creep, spawn);
  } else if (_.sum(creep.carry) === creep.carryCapacity) {
    if (spawn.energy < spawn.energyCapacity) {
      _moveToDropEnergy(creep, spawn);
    } else {
      const structures = creep.room.find<Structure>(FIND_MY_STRUCTURES);
      if (structures.length) {
        _moveToDropEnergy(creep, structures[0]);
      } else {
        let constructionSites = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length) {
          // Find the closest construction site
          constructionSites = constructionSites.sort((siteA, siteB) => {
            const lenA = creep.room.findPath(creep.pos, siteA.pos).length;
            const lenB = creep.room.findPath(creep.pos, siteB.pos).length;
            return lenA > lenB ? 1 : lenA < lenB ? -1 : 0;
          });
          _moveToConstructionSite(creep, constructionSites[0]);
        }
      }
    }
  } else {
    const energySources = creep.room.find<Source>(FIND_SOURCES_ACTIVE);
    if (energySources.length) {
      _moveToHarvest(creep, energySources[0]);
    }
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, target.pos);
  }
}

function _tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

function _moveToDropEnergy(creep: Creep, target: Spawn | Structure): void {
  if (_tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, target.pos);
  }
}

function _moveToConstructionSite(creep: Creep, target: ConstructionSite): void {
  if (creep.build(target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}
