import { computed, effect, inject } from "@angular/core";
import { Router } from "@angular/router";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  DrawPlan,
  DrawResult,
  DrawStatus,
  Person,
  Team,
  createDrawPlan,
  freeCapacity,
  teamMembers,
  validateDraw,
  validateDrawPlan,
  validatePerson,
  validateTeam,
} from "../models/domain";
import { RepositoryService } from "./repository.service";

export type ViewState =
  | "dashboard"
  | "people"
  | "teams"
  | "draw_config"
  | "draw_anim"
  | "draw_result";

const routesByView: Record<ViewState, string> = {
  dashboard: "/dashboard",
  people: "/people",
  teams: "/teams",
  draw_config: "/draw/config",
  draw_anim: "/draw/animation",
  draw_result: "/results",
};
export type {
  Assignment,
  DrawPlan,
  DrawResult,
  DrawStatus,
  Person,
  Team,
} from "../models/domain";

interface StoreState {
  workflow: DrawStatus;
  errorMessage: string | null;
  dataVersion: number;
  people: Person[];
  teams: Team[];
  selectedPeopleIds: Set<string>;
  selectedTeamIds: Set<string>;
  lastDrawResult: { time: Date; persons: number; teams: number } | null;
  currentDrawResults: Map<string, string>;
  drawResults: DrawResult[];
  selectedDrawResultId: string | null;
  drawPlan: DrawPlan | null;
}

const initialState: StoreState = {
  workflow: "idle",
  errorMessage: null,
  dataVersion: 1,
  people: [],
  teams: [],
  selectedPeopleIds: new Set(),
  selectedTeamIds: new Set(),
  lastDrawResult: null,
  currentDrawResults: new Map(),
  drawResults: [],
  selectedDrawResultId: null,
  drawPlan: null,
};

export const StoreService = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((store) => ({
    totalPersons: computed(() => store.people().length),
    totalTeams: computed(() => store.teams().length),
    totalCapacity: computed(() =>
      store.teams().reduce((sum, team) => sum + team.capacity, 0),
    ),
    assignedPersonsCount: computed(
      () => store.people().filter((person) => person.teamId !== null).length,
    ),
    availableSlots: computed(() =>
      store
        .teams()
        .reduce((sum, team) => sum + freeCapacity(store.people(), team), 0),
    ),
    canInitiateDraw: computed(
      () =>
        store.people().some((person) => person.teamId === null) &&
        store.teams().some((team) => freeCapacity(store.people(), team) > 0),
    ),
    canShowResults: computed(() => store.drawResults().length > 0),
    selectedDrawResult: computed(() =>
      store
        .drawResults()
        .find((result) => result.id === store.selectedDrawResultId()),
    ),
    selectedFreeSlots: computed(() =>
      [...store.selectedTeamIds()].reduce((sum, id) => {
        const team = store.teams().find((item) => item.id === id);
        return sum + (team ? freeCapacity(store.people(), team) : 0);
      }, 0),
    ),
    drawValidation: computed(() =>
      validateDraw({
        people: store.people(),
        teams: store.teams(),
        selectedPersonIds: [...store.selectedPeopleIds()],
        selectedTeamIds: [...store.selectedTeamIds()],
      }),
    ),
  })),
  withMethods((store, router = inject(Router)) => {
    const fail = (message: string): false => {
      patchState(store, { errorMessage: message });
      return false;
    };
    const bumpVersion = () =>
      patchState(store, { dataVersion: store.dataVersion() + 1 });
    const ensureEditable = () =>
      store.workflow() !== "animating" ||
      fail("Changes are locked while the draw is running.");
    return {
      setErrorMessage(errorMessage: string | null): void {
        patchState(store, { errorMessage });
      },
      togglePersonSelection(id: string): void {
        const selectedPeopleIds = new Set(store.selectedPeopleIds());
        if (selectedPeopleIds.has(id)) {
          selectedPeopleIds.delete(id);
        } else {
          selectedPeopleIds.add(id);
        }
        patchState(store, { selectedPeopleIds });
      },
      toggleTeamSelection(id: string): void {
        const selectedTeamIds = new Set(store.selectedTeamIds());
        if (selectedTeamIds.has(id)) {
          selectedTeamIds.delete(id);
        } else {
          selectedTeamIds.add(id);
        }
        patchState(store, { selectedTeamIds });
      },
      setSelectedPeople(ids: Iterable<string>): void {
        patchState(store, { selectedPeopleIds: new Set(ids) });
      },
      setSelectedTeams(ids: Iterable<string>): void {
        patchState(store, { selectedTeamIds: new Set(ids) });
      },
      navigate(view: ViewState): void {
        if (store.workflow() === "animating") {
          fail("Navigation is locked while the draw is running.");
          return;
        }
        if (view === "draw_anim" && store.workflow() !== "prepared") {
          fail("Prepare a valid draw before starting the animation.");
          return;
        }
        if (view === "draw_result" && !store.canShowResults()) {
          fail("No completed draw result is available.");
          return;
        }
        patchState(store, { errorMessage: null });
        void router.navigateByUrl(routesByView[view]);
      },
      selectDrawResult(id: string): void {
        if (store.drawResults().some((result) => result.id === id)) {
          patchState(store, { selectedDrawResultId: id });
        }
      },
      addPerson(person: Person): boolean {
        if (!ensureEditable()) return false;
        const error = validatePerson(
          person,
          store.people().map((item) => item.id),
        );
        if (error) return fail(error);
        if (person.teamId !== null) {
          const team = store.teams().find((item) => item.id === person.teamId);
          if (!team) return fail("Assigned team does not exist.");
          if (teamMembers(store.people(), team.id).length >= team.capacity)
            return fail("Assigned team has no free capacity.");
        }
        patchState(store, {
          people: [...store.people(), { ...person, name: person.name.trim() }],
        });
        bumpVersion();
        return true;
      },
      updatePerson(person: Person): boolean {
        if (!ensureEditable()) return false;
        if (!store.people().some((item) => item.id === person.id))
          return fail("Person does not exist.");
        const error = validatePerson(person);
        if (error) return fail(error);
        if (person.teamId !== null) {
          const team = store.teams().find((item) => item.id === person.teamId);
          if (!team) return fail("Assigned team does not exist.");
          const currentMembers = teamMembers(store.people(), team.id).filter(
            (member) => member.id !== person.id,
          ).length;
          if (currentMembers >= team.capacity)
            return fail("Assigned team has no free capacity.");
        }
        patchState(store, {
          people: store
            .people()
            .map((item) =>
              item.id === person.id
                ? { ...person, name: person.name.trim() }
                : item,
            ),
        });
        bumpVersion();
        return true;
      },
      deletePerson(id: string): boolean {
        if (!ensureEditable()) return false;
        if (!store.people().some((person) => person.id === id))
          return fail("Person does not exist.");
        const selectedPeopleIds = new Set(store.selectedPeopleIds());
        const currentDrawResults = new Map(store.currentDrawResults());
        selectedPeopleIds.delete(id);
        currentDrawResults.delete(id);
        patchState(store, {
          people: store.people().filter((person) => person.id !== id),
          selectedPeopleIds,
          currentDrawResults,
        });
        bumpVersion();
        return true;
      },
      addTeam(team: Team): boolean {
        if (!ensureEditable()) return false;
        const error = validateTeam(
          team,
          store.teams().map((item) => item.id),
        );
        if (error) return fail(error);
        patchState(store, {
          teams: [...store.teams(), { ...team, name: team.name.trim() }],
        });
        bumpVersion();
        return true;
      },
      updateTeam(team: Team): boolean {
        if (!ensureEditable()) return false;
        if (!store.teams().some((item) => item.id === team.id))
          return fail("Team does not exist.");
        const error = validateTeam(
          team,
          [],
          teamMembers(store.people(), team.id).length,
        );
        if (error) return fail(error);
        patchState(store, {
          teams: store
            .teams()
            .map((item) =>
              item.id === team.id ? { ...team, name: team.name.trim() } : item,
            ),
        });
        bumpVersion();
        return true;
      },
      deleteTeam(id: string): boolean {
        if (!ensureEditable()) return false;
        if (!store.teams().some((team) => team.id === id))
          return fail("Team does not exist.");
        const selectedTeamIds = new Set(store.selectedTeamIds());
        selectedTeamIds.delete(id);
        patchState(store, {
          teams: store.teams().filter((team) => team.id !== id),
          people: store
            .people()
            .map((person) =>
              person.teamId === id ? { ...person, teamId: null } : person,
            ),
          selectedTeamIds,
          currentDrawResults: new Map(
            [...store.currentDrawResults()].filter(
              ([, teamId]) => teamId !== id,
            ),
          ),
        });
        bumpVersion();
        return true;
      },
      unassignPerson(personId: string): boolean {
        if (!ensureEditable()) return false;
        patchState(store, {
          people: store
            .people()
            .map((person) =>
              person.id === personId ? { ...person, teamId: null } : person,
            ),
        });
        bumpVersion();
        return true;
      },
      initiateDrawConfig(): void {
        const people = store
          .people()
          .filter((person) => person.teamId === null);
        const teams = store
          .teams()
          .filter((team) => freeCapacity(store.people(), team) > 0);
        if (!people.length) {
          patchState(store, { workflow: "failed" });
          fail("No available people for draw.");
          return;
        }
        if (!teams.length) {
          patchState(store, { workflow: "failed" });
          fail("No available teams for draw.");
          return;
        }
        patchState(store, {
          errorMessage: null,
          selectedPeopleIds: new Set(people.map((person) => person.id)),
          selectedTeamIds: new Set(teams.map((team) => team.id)),
          workflow: "configuring",
        });
        void router.navigateByUrl("/draw/config");
      },
      prepareDraw(seed = Date.now()): boolean {
        const validation = store.drawValidation();
        if (!validation.valid)
          return fail(validation.message ?? "Invalid draw.");
        try {
          patchState(store, {
            drawPlan: createDrawPlan(
              {
                people: store.people(),
                teams: store.teams(),
                selectedPersonIds: [...store.selectedPeopleIds()],
                selectedTeamIds: [...store.selectedTeamIds()],
              },
              seed,
              store.dataVersion(),
            ),
            workflow: "prepared",
          });
          return true;
        } catch (error) {
          return fail(
            error instanceof Error ? error.message : "Unable to prepare draw.",
          );
        }
      },
      executeDraw(): void {
        if (this.prepareDraw()) {
          patchState(store, {
            workflow: "animating",
            currentDrawResults: new Map(),
          });
          void router.navigateByUrl("/draw/animation");
        }
      },
      applyDrawResults(): boolean {
        const plan = store.drawPlan();
        if (!plan) return fail("No prepared draw is available.");
        const validation = validateDrawPlan(plan, {
          people: store.people(),
          teams: store.teams(),
          selectedPersonIds: plan.personIds,
          selectedTeamIds: plan.teamIds,
        });
        if (!validation.valid || plan.dataVersion !== store.dataVersion()) {
          patchState(store, { workflow: "failed" });
          return fail(
            validation.message ??
              "Draw data changed while the draw was running.",
          );
        }
        const result = new Map(
          plan.assignments.map((assignment) => [
            assignment.personId,
            assignment.teamId,
          ]),
        );
        const people = store
          .people()
          .map((person) =>
            result.has(person.id)
              ? { ...person, teamId: result.get(person.id)! }
              : person,
          );
        const teamIds = new Set(plan.teamIds);
        const time = new Date();
        const drawResult: DrawResult = {
          id: `${time.toISOString()}-${plan.seed}`,
          time,
          assignments: plan.assignments.map((assignment) => ({
            ...assignment,
          })),
          people: people
            .filter((person) => person.teamId && teamIds.has(person.teamId))
            .map((person) => ({ ...person, skills: [...person.skills] })),
          teams: store
            .teams()
            .filter((team) => teamIds.has(team.id))
            .map((team) => ({ ...team })),
        };
        patchState(store, {
          people,
          currentDrawResults: result,
          drawResults: [drawResult, ...store.drawResults()].slice(0, 10),
          selectedDrawResultId: drawResult.id,
          lastDrawResult: {
            time,
            persons: result.size,
            teams: new Set(result.values()).size,
          },
          workflow: "completed",
        });
        void router.navigateByUrl("/results");
        return true;
      },
      abortDraw(): void {
        patchState(store, {
          drawPlan: null,
          currentDrawResults: new Map(),
          workflow: "aborted",
        });
        void router.navigateByUrl("/draw/config");
      },
    };
  }),
  withHooks((store, repository = inject(RepositoryService)) => ({
    onInit() {
      const saved = repository.load();
      if (saved) {
        patchState(store, {
          people: saved.people,
          teams: saved.teams,
          lastDrawResult: saved.lastDrawResult
            ? {
                ...saved.lastDrawResult,
                time: new Date(saved.lastDrawResult.time),
              }
            : null,
          drawResults: saved.drawResults.map((result) => ({
            ...result,
            time: new Date(result.time),
          })),
          selectedDrawResultId: saved.drawResults[0]?.id ?? null,
        });
      }
      effect(() =>
        repository.save({
          version: 1,
          people: store.people(),
          teams: store.teams(),
          lastDrawResult: store.lastDrawResult()
            ? {
                ...store.lastDrawResult()!,
                time: store.lastDrawResult()!.time.toISOString(),
              }
            : null,
          drawResults: store.drawResults().map((result) => ({
            ...result,
            time: result.time.toISOString(),
          })),
        }),
      );
    },
  })),
);
