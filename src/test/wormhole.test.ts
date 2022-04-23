import Wormhole from "../lib/wormhole";

class TrueWormhole {
  private stageToMass: { 1: number, 2: number, 3: number }

  constructor(
    public mass,
    public stage
  ) {
    this.stageToMass =  {
      1: 1 * mass,
      2: 0.5 * mass,
      3: 0.1 * mass
    }
  }

  logShipPassage(shipMass) {
    this.mass -= shipMass;
    if(this.stage != 3 && this.mass < this.stageToMass[this.stage + 1]) {
      this.stage++;
    }
  }
}

describe("Wormhole Class", () => {

  it("can create a simple Wormhole", () => {
    const wh = new Wormhole(2000, 1, 0, false);
    expect(wh.stage).toBe(1);
    expect(wh.maxMass).toBe(2200);
    expect(wh.minMass).toBe(900);
  })

  it("can create a simple fresh Wormhole", () => {
    const wh = new Wormhole(2000, 1, 0, true);
    expect(wh.stage).toBe(1);
    expect(wh.maxMass).toBe(2200);
    expect(wh.minMass).toBe(1800);
  })

  it("can create a simple Wormhole with a ship that's already passed through", () => {
    const wh = new Wormhole(2000, 1, 300, false);
    expect(wh.stage).toBe(1);
    expect(wh.maxMass).toBe(1900);
    expect(wh.minMass).toBe(900);
  })

  it("can create a simple fresh Wormhole with a ship that's already passed through", () => {
    const wh = new Wormhole(2000, 1, 500, true);
    expect(wh.stage).toBe(1);
    expect(wh.maxMass).toBe(1700);
    expect(wh.minMass).toBe(1300);
  })

  it("can log four ships into a simple Wormhole", () => {
    const wh = new Wormhole(2000, 1, 0, true);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(200);
    wh.logShipPassage(200);
    expect(wh.stage).toBe(1);
    expect(wh.maxMass).toBe(1200);
    expect(wh.minMass).toBe(900);
  });

  it("can logs shrink a Wormhole N766", () => {
    const wh = new Wormhole(2000, 1, 0, true);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(200);
    wh.logShipPassage(200);
    wh.logShrink();
    expect(wh.stage).toBe(2);
    expect(wh.maxMass).toBe(1100);
    expect(wh.minMass).toBe(800);
  });

  it("can log a double shrink")
  
  it("can logs the collapsing of a H900", () => {
    const wh = new Wormhole(3000, 1, 0, true);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(122);
    wh.logShrink();
    wh.logShipPassage(122);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShipPassage(300);
    wh.logShrink();
    wh.logShipPassage(300);
    expect(wh.stage).toBe(3);
    expect(wh.maxMass).toBe(1100);
    expect(wh.minMass).toBe(800);
  });

})