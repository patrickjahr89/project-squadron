import { Injectable } from "@angular/core";
import {
  Assignment,
  Person,
  Team,
  validatePerson,
  validateTeam,
} from "../models/domain";

export interface RepositoryDrawResult {
  id: string;
  time: string;
  assignments: Assignment[];
  people: Person[];
  teams: Team[];
}

export interface RepositorySnapshot {
  version: number;
  people: Person[];
  teams: Team[];
  lastDrawResult: { time: string; persons: number; teams: number } | null;
  drawResults: RepositoryDrawResult[];
}

@Injectable({ providedIn: "root" })
export class RepositoryService {
  private readonly key = "team-randomizer.snapshot.v1";

  load(): RepositorySnapshot | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const parsed = JSON.parse(
        localStorage.getItem(this.key) ?? "null",
      ) as Partial<RepositorySnapshot> | null;
      if (
        !parsed ||
        parsed.version !== 1 ||
        !Array.isArray(parsed.people) ||
        !Array.isArray(parsed.teams)
      )
        return null;
      const personIds: string[] = [];
      for (const person of parsed.people) {
        const error = validatePerson(person, personIds);
        if (error) return null;
        personIds.push(person.id);
      }
      const teamIds: string[] = [];
      for (const team of parsed.teams) {
        const memberCount = parsed.people.filter(
          (person) => person.teamId === team.id,
        ).length;
        const error = validateTeam(team, teamIds, memberCount);
        if (error) return null;
        teamIds.push(team.id);
      }
      if (
        parsed.people.some(
          (person) =>
            person.teamId !== null && !teamIds.includes(person.teamId),
        )
      )
        return null;
      return {
        version: 1,
        people: parsed.people,
        teams: parsed.teams,
        lastDrawResult: parsed.lastDrawResult ?? null,
        drawResults: Array.isArray(parsed.drawResults)
          ? parsed.drawResults.slice(0, 10)
          : [],
      };
    } catch {
      return null;
    }
  }

  save(snapshot: RepositorySnapshot): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(this.key, JSON.stringify(snapshot));
    } catch {
      /* Storage can be unavailable or full. */
    }
  }
}
