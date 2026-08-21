import { RepositorySnapshot, RepositoryService } from "./repository.service";

describe("RepositoryService", () => {
  const repository = new RepositoryService();

  beforeEach(() => localStorage.clear());

  it("loads at most the ten newest draw results", () => {
    const snapshot: RepositorySnapshot = {
      version: 1,
      people: [],
      teams: [],
      lastDrawResult: null,
      drawResults: Array.from({ length: 12 }, (_, index) => ({
        id: `draw-${index}`,
        time: new Date(2026, 0, index + 1).toISOString(),
        assignments: [],
        people: [],
        teams: [],
      })),
    };

    repository.save(snapshot);

    expect(repository.load()?.drawResults).toHaveLength(10);
    expect(repository.load()?.drawResults.at(-1)?.id).toBe("draw-9");
  });

  it("loads existing snapshots without a draw history", () => {
    localStorage.setItem(
      "team-randomizer.snapshot.v1",
      JSON.stringify({
        version: 1,
        people: [],
        teams: [],
        lastDrawResult: null,
      }),
    );

    expect(repository.load()?.drawResults).toEqual([]);
  });
});
