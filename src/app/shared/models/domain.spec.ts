import { createDrawPlan, Person, Team } from "./domain";

describe("createDrawPlan", () => {
  it("assigns people only to teams with capacity", () => {
    const people: Person[] = [
      { id: "p1", name: "One", role: "", skills: [], teamId: null },
      { id: "p2", name: "Two", role: "", skills: [], teamId: null },
      { id: "p3", name: "Three", role: "", skills: [], teamId: null },
      { id: "p4", name: "Four", role: "", skills: [], teamId: null },
      { id: "p5", name: "Five", role: "", skills: [], teamId: null },
    ];
    const teams: Team[] = [
      { id: "first", name: "First", capacity: 2 },
      { id: "second", name: "Second", capacity: 3 },
    ];

    const plan = createDrawPlan(
      {
        people,
        teams,
        selectedPersonIds: people.map((person) => person.id),
        selectedTeamIds: ["second", "first"],
      },
      42,
    );

    expect(plan.assignments.filter((assignment) => assignment.teamId === "first")).toHaveLength(2);
    expect(plan.assignments.filter((assignment) => assignment.teamId === "second")).toHaveLength(3);
  });
});
