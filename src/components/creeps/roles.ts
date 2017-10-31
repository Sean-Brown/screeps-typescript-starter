export class Roles {
  public static readonly Builder: "builder";
  public static readonly Harvester: "harvester";

  public static IsBuilder(creep: Creep): boolean {
    return creep.memory.role === Roles.Builder;
  }

  public static IsHarvester(creep: Creep): boolean {
    return creep.memory.role === Roles.Harvester;
  }
}
