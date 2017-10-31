export class Roles {
  static readonly Builder: "builder";
  static readonly Harvester: "harvester";

  static IsBuilder(creep: Creep): boolean {
    return creep.memory.role === Roles.Builder;
  }

  static IsHarvester(creep: Creep): boolean {
    return creep.memory.role === Roles.Harvester;
  }
};
