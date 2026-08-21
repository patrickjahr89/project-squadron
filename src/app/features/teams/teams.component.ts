import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { StoreService } from "../../shared/services/store.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-teams",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./teams.component.html",
  styleUrl: "./teams.component.css",
})
export class TeamsComponent {
  store = inject(StoreService);
  searchQuery = signal("");
  Math = Math;
  formOpen = signal(false);
  editingId = signal<string | null>(null);
  draft = { id: "", name: "", capacity: 1 };

  setSearchQuery(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  filteredTeams() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.store.teams();
    return this.store.teams().filter((t) => t.name.toLowerCase().includes(q));
  }

  getTeamMembers(teamId: string) {
    return this.store.people().filter((p) => p.teamId === teamId);
  }

  getArray(n: number): undefined[] {
    return new Array(n);
  }

  openForm(team?: { id: string; name: string; capacity: number }) {
    this.editingId.set(team?.id ?? null);
    this.draft = team
      ? { ...team }
      : {
          id: `T-${Math.floor(Math.random() * 900 + 100)}`,
          name: "",
          capacity: 1,
        };
    this.formOpen.set(true);
  }
  closeForm() {
    this.formOpen.set(false);
  }
  saveTeam() {
    const saved = this.editingId()
      ? this.store.updateTeam(this.draft)
      : this.store.addTeam(this.draft);
    if (saved) this.closeForm();
  }
  confirmDelete(id: string) {
    const count = this.getTeamMembers(id).length;
    if (window.confirm(`Delete this team? ${count} people will be unassigned.`))
      this.store.deleteTeam(id);
  }
}
