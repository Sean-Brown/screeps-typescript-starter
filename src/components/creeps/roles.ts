class CreepRoles {
  public get Builder() { return "builder"; }
  public get Harvester() { return "harvester"; }
  public get Repairer() { return "repairer"; }

  public IsBuilder(creep: Creep): boolean {
    return creep.memory.role === this.Builder;
  }

  public IsHarvester(creep: Creep): boolean {
    return creep.memory.role === this.Harvester;
  }

  public IsRepairer(creep: Creep): boolean {
    return creep.memory.role === this.Repairer;
  }
}
export const Roles = new CreepRoles();
