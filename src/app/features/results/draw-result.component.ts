import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { StoreService, Person } from "../../shared/services/store.service";
import { CommonModule } from "@angular/common";
import { avatarUrlForPerson } from "../../shared/models/domain";

@Component({
  selector: "app-draw-result",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./draw-result.component.html",
  styleUrl: "./draw-result.component.css",
})
export class DrawResultComponent {
  store = inject(StoreService);

  getAvatarUrl(person: Person) {
    return avatarUrlForPerson(person);
  }

  getTeamsInResult() {
    // Return teams that were involved in the selected teams for the draw
    return [
      ...new Set([
        ...this.store.currentDrawResults().values(),
        ...this.store
          .people()
          .filter(
            (person) =>
              person.teamId && this.store.selectedTeamIds().has(person.teamId),
          )
          .map((person) => person.teamId!),
      ]),
    ].filter((teamId) => this.store.teams().some((team) => team.id === teamId));
  }

  getTeam(teamId: string) {
    return this.store.teams().find((t) => t.id === teamId);
  }

  getAllMembers(teamId: string) {
    return this.store.people().filter((p) => p.teamId === teamId);
  }

  getNewAssignmentsForTeam(teamId: string) {
    const newAssignedIds: string[] = [];
    const results = this.store.currentDrawResults();
    results.forEach((assignedTeamId, personId) => {
      if (assignedTeamId === teamId) {
        newAssignedIds.push(personId);
      }
    });
    return newAssignedIds;
  }

  getOldAssignmentsForTeam(teamId: string) {
    // People in this team that were NOT part of the recent result map
    const results = this.store.currentDrawResults();
    return this.store
      .people()
      .filter((p) => p.teamId === teamId && !results.has(p.id))
      .map((p) => p.id);
  }

  getArray(n: number) {
    return new Array(Math.max(0, n));
  }
}
