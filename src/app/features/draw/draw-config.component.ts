import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
} from "@angular/core";
import { StoreService } from "../../shared/services/store.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-draw-config",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./draw-config.component.html",
  styleUrl: "./draw-config.component.css",
})
export class DrawConfigComponent {
  store = inject(StoreService);

  totalSelectedSlots = computed(() => {
    let slots = 0;
    for (const teamId of Array.from(this.store.selectedTeamIds())) {
      const team = this.store.teams().find((t) => t.id === teamId);
      if (team) {
        const members = this.store
          .people()
          .filter((p) => p.teamId === team.id).length;
        slots += team.capacity - members;
      }
    }
    return slots;
  });

  getTeamMembers(teamId: string) {
    return this.store.people().filter((p) => p.teamId === teamId);
  }

  getArray(n: number): undefined[] {
    return new Array(Math.max(0, n));
  }

  togglePersonSelection(id: string) {
    this.store.selectedPeopleIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  toggleTeamSelection(id: string) {
    this.store.selectedTeamIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  selectAllPeople() {
    const available = this.store
      .people()
      .filter((p) => p.teamId === null)
      .map((p) => p.id);
    this.store.selectedPeopleIds.set(new Set(available));
  }

  deselectAllPeople() {
    this.store.selectedPeopleIds.set(new Set());
  }

  selectAllTeams() {
    const available = this.store
      .teams()
      .filter((t) => {
        const members = this.store
          .people()
          .filter((p) => p.teamId === t.id).length;
        return members < t.capacity;
      })
      .map((t) => t.id);
    this.store.selectedTeamIds.set(new Set(available));
  }

  deselectAllTeams() {
    this.store.selectedTeamIds.set(new Set());
  }
}
