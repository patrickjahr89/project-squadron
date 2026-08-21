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
    return this.store.selectedDrawResult()?.teams.map((team) => team.id) ?? [];
  }

  getTeam(teamId: string) {
    return this.store
      .selectedDrawResult()
      ?.teams.find((team) => team.id === teamId);
  }

  getAllMembers(teamId: string) {
    return (
      this.store
        .selectedDrawResult()
        ?.people.filter((person) => person.teamId === teamId) ?? []
    );
  }

  getNewAssignmentsForTeam(teamId: string) {
    return (
      this.store
        .selectedDrawResult()
        ?.assignments.filter((assignment) => assignment.teamId === teamId)
        .map((assignment) => assignment.personId) ?? []
    );
  }

  selectDraw(event: Event) {
    this.store.selectDrawResult((event.target as HTMLSelectElement).value);
  }

  getArray(n: number) {
    return new Array(Math.max(0, n));
  }
}
