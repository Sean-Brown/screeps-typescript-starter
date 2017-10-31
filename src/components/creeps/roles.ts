class CreepRoles {
  public get Builder() { return "builder"; }
  public get Harvester() { return "harvester"; }

  public IsBuilder(creep: Creep): boolean {
    return creep.memory.role === this.Builder;
  }

  public IsHarvester(creep: Creep): boolean {
    return creep.memory.role === this.Harvester;
  }
}
export const Roles = new CreepRoles();
