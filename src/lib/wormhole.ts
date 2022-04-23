type wormholeStage = 1 | 2 | 3
interface Settings {
  masseInsertitude?: number;
}

export default class Wormhole {

  public maxMass: number;
  public minMass: number;
  private initMass: number;
  private lastWormholeState: { minMass: number, maxMass: number };
  private lastShipMass: number = 0;
  private maxMassByStage: { 1: number, 2: number, 3: number };
  private minMassByStage: { 1: number, 2: number, 3: number };
  
  constructor(
    mass: number,  // total mass in kT
    public stage: wormholeStage = 1, // 1 for initia, 2 for shink, 3 for verge
    alredyPassedShip: number = 0,  // in kT
    massPassedKnown: boolean = false,  // if we are sure that no other ship passed through
    settings: Settings = {
      masseInsertitude: 0.1,  // mass isertitude for the initial mass the wormhole
    }
  ) {
    this.initMass = mass;
    this.maxMassByStage = {
      1: this.initMass * (1 + (settings.masseInsertitude ?? 0.1)),
      2: this.initMass * 0.5 * (1 + (settings.masseInsertitude ?? 0.1)),
      3: this.initMass * 0.1 * (1 + (settings.masseInsertitude ?? 0.1))
    };
    this.minMassByStage = {
      1: this.initMass * (1 - (settings.masseInsertitude ?? 0.1)),
      2: this.initMass * 0.5 * (1 - (settings.masseInsertitude ?? 0.1)),
      3: this.initMass * 0.1 * (1 - (settings.masseInsertitude ?? 0.1))
    };

    // check consistenty of 'mass', 'alredyPassedShip' and 'stage' of the Wormhole
    if(
      alredyPassedShip < 0 ||
      (stage == 1 && this.maxMassByStage[1] - alredyPassedShip < this.maxMassByStage[2]) ||
      (stage == 2 && this.maxMassByStage[1] - alredyPassedShip < this.maxMassByStage[3] && this.maxMassByStage[1] - alredyPassedShip > this.maxMassByStage[2]) ||
      (stage == 3 && this.maxMassByStage[1] - alredyPassedShip < 0.001 && this.maxMassByStage[1] - alredyPassedShip > this.maxMassByStage[3])
    ) {
      return null;
    }
    
    if(massPassedKnown) {
      switch(stage) {
        case 1:
          this.maxMass = this.maxMassByStage[1] - alredyPassedShip;
          this.minMass = Math.max(
            this.minMassByStage[1] - alredyPassedShip,
            this.minMassByStage[2]
          );
          break;
        case 2:
          this.maxMass = Math.min(
            this.maxMassByStage[1] - alredyPassedShip,
            this.maxMassByStage[2]
          );
          this.minMass = Math.max(
            this.minMassByStage[1] - alredyPassedShip,
            this.minMassByStage[3]
          );
          break;
        case 3:
          this.maxMass = Math.min(
            this.maxMassByStage[1] - alredyPassedShip,
            this.maxMassByStage[3]
          );
          this.minMass = 0.001;
          break;
      }
    }
    else {
      switch (stage) {
        case 1:
          this.maxMass = this.maxMassByStage[1] - alredyPassedShip;
          this.minMass = this.minMassByStage[2];
          break;
        case 2:
          this.maxMass = Math.min(
            this.maxMassByStage[2],
            this.maxMassByStage[1] - alredyPassedShip
          );
          this.minMass = this.minMassByStage[3];
          break;
        case 3:
          this.maxMass = Math.min(
            this.maxMassByStage[3],
            this.maxMassByStage[1] - alredyPassedShip
          );
          this.minMass = 0.001;
          break;
      }
    }

    this.lastWormholeState = { minMass: this.minMass, maxMass: this.maxMass };
  }

  logShipPassage(shipMass: number) {
    if(shipMass <= 0) {
      return null;
    }

    this.lastWormholeState = { minMass: this.minMass, maxMass: this.maxMass };
    this.lastShipMass = shipMass;

    if(this.stage != 3) {
      this.maxMass = Math.max(
        this.maxMass - shipMass,
        this.minMassByStage[this.stage + 1] + 0.001
      );
      this.minMass = Math.max(
        this.minMass - shipMass,
        this.minMassByStage[this.stage + 1]
      );
    }
    else {
      this.maxMass = this.maxMass - shipMass;
      this.minMass = this.minMass - shipMass;
    }
  }

  logShrink() {
    if(this.stage > 2) {
      return null
    }

    this.stage++;
    this.maxMass = Math.min(
      this.lastWormholeState.maxMass - this.lastShipMass,
      this.maxMassByStage[this.stage]
    );
    this.minMass = Math.min(
      this.lastWormholeState.minMass - this.lastShipMass,
      this.maxMassByStage[this.stage] - 0.001
    );
    this.lastShipMass = 0;
    this.lastWormholeState = { minMass: this.minMass, maxMass: this.maxMass };

    if(this.stage != 3 && this.minMass < this.minMassByStage[this.stage + 1]) {
      this.minMass = this.minMassByStage[this.stage + 1]
    }
  }

}