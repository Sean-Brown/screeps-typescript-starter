class CreepRoles {
  public readonly Builder: "builder";
  public readonly Harvester: "harvester";

  public IsBuilder(creep: Creep): boolean {
    return creep.memory.role === this.Builder;
  }

  public IsHarvester(creep: Creep): boolean {
    return creep.memory.role === this.Harvester;
  }
}
export const Roles = new CreepRoles();
