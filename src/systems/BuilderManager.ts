import {BuildingState} from '../core/GameState';
import {getEvolvableBuildingById} from '../data/buildings';

export interface BuilderAssignmentResult {
  success: boolean;
  message: string;
  newAvailableBuilders: number;
  updatedBuilding?: BuildingState;
}

export class BuilderManager {
  private totalBuilders: number;
  private availableBuilders: number;
  private buildings: Map<string, BuildingState>;

  constructor(totalBuilders: number = 30) {
    this.totalBuilders = totalBuilders;
    this.availableBuilders = totalBuilders;
    this.buildings = new Map();
  }

  getTotalBuilders(): number {
    return this.totalBuilders;
  }

  getAvailableBuilders(): number {
    return this.availableBuilders;
  }

  getAssignedBuilders(): number {
    return this.totalBuilders - this.availableBuilders;
  }

  addBuilders(count: number): void {
    this.totalBuilders += count;
    this.availableBuilders += count;
  }

  registerBuilding(building: BuildingState): void {
    this.buildings.set(building.id, building);
  }

  unregisterBuilding(buildingId: string): void {
    const building = this.buildings.get(buildingId);
    if (building) {
      this.availableBuilders += building.assignedBuilders;
      this.buildings.delete(buildingId);
    }
  }

  assignBuilder(buildingId: string): BuilderAssignmentResult {
    if (this.availableBuilders <= 0) {
      return {
        success: false,
        message: 'No available builders',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    const building = this.buildings.get(buildingId);
    if (!building) {
      return {
        success: false,
        message: 'Building not found',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    if (!building.isUnlocked) {
      return {
        success: false,
        message: 'Building is locked',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    const evolvableBuilding = getEvolvableBuildingById(building.typeId);

    // Check if building doesn't use workers (static effect building)
    if (evolvableBuilding?.noWorkers) {
      return {
        success: false,
        message: 'This building has a static effect and does not use workers',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    if (evolvableBuilding && building.assignedBuilders >= evolvableBuilding.maxBuilders) {
      return {
        success: false,
        message: 'Building at max capacity',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    building.assignedBuilders += 1;
    this.availableBuilders -= 1;

    return {
      success: true,
      message: 'Builder assigned',
      newAvailableBuilders: this.availableBuilders,
      updatedBuilding: {...building},
    };
  }

  unassignBuilder(buildingId: string): BuilderAssignmentResult {
    const building = this.buildings.get(buildingId);
    if (!building) {
      return {
        success: false,
        message: 'Building not found',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    if (building.assignedBuilders <= 0) {
      return {
        success: false,
        message: 'No builders to unassign',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    building.assignedBuilders -= 1;
    this.availableBuilders += 1;

    return {
      success: true,
      message: 'Builder unassigned',
      newAvailableBuilders: this.availableBuilders,
      updatedBuilding: {...building},
    };
  }

  reassignBuilder(fromBuildingId: string, toBuildingId: string): BuilderAssignmentResult {
    const unassignResult = this.unassignBuilder(fromBuildingId);
    if (!unassignResult.success) {
      return unassignResult;
    }

    const assignResult = this.assignBuilder(toBuildingId);
    if (!assignResult.success) {
      this.assignBuilder(fromBuildingId);
      return assignResult;
    }

    return assignResult;
  }

  assignMultiple(buildingId: string, count: number): BuilderAssignmentResult {
    let lastResult: BuilderAssignmentResult = {
      success: false,
      message: 'No builders assigned',
      newAvailableBuilders: this.availableBuilders,
    };

    for (let i = 0; i < count; i++) {
      lastResult = this.assignBuilder(buildingId);
      if (!lastResult.success) {
        break;
      }
    }

    return lastResult;
  }

  unassignAll(buildingId: string): BuilderAssignmentResult {
    const building = this.buildings.get(buildingId);
    if (!building) {
      return {
        success: false,
        message: 'Building not found',
        newAvailableBuilders: this.availableBuilders,
      };
    }

    const buildersToUnassign = building.assignedBuilders;
    this.availableBuilders += buildersToUnassign;
    building.assignedBuilders = 0;

    return {
      success: true,
      message: `Unassigned ${buildersToUnassign} builders`,
      newAvailableBuilders: this.availableBuilders,
      updatedBuilding: {...building},
    };
  }

  resetAllAssignments(): void {
    this.buildings.forEach(building => {
      building.assignedBuilders = 0;
    });
    this.availableBuilders = this.totalBuilders;
  }

  getBuilderCountForBuilding(buildingId: string): number {
    return this.buildings.get(buildingId)?.assignedBuilders ?? 0;
  }

  validateConsistency(): boolean {
    let assignedTotal = 0;
    this.buildings.forEach(building => {
      assignedTotal += building.assignedBuilders;
    });
    return assignedTotal + this.availableBuilders === this.totalBuilders;
  }
}
