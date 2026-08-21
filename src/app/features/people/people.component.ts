import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { StoreService, Person } from "../../shared/services/store.service";
import { avatarUrlForPerson } from "../../shared/models/domain";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-people",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./people.component.html",
  styleUrl: "./people.component.css",
})
export class PeopleComponent {
  store = inject(StoreService);
  searchQuery = signal("");
  formOpen = signal(false);
  editingId = signal<string | null>(null);
  skillsText = "";
  draft: Person = { id: "", name: "", role: "", skills: [], teamId: null };

  getAvatarUrl(person: Person) {
    return avatarUrlForPerson(person);
  }

  setSearchQuery(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  filteredPeople() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.store.people();
    return this.store
      .people()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q),
      );
  }

  getTeamName(teamId: string) {
    return this.store.teams().find((t) => t.id === teamId)?.name || teamId;
  }

  openForm(person?: Person) {
    this.editingId.set(person?.id ?? null);
    this.draft = person
      ? { ...person, skills: [...person.skills] }
      : {
          id: `OP-${Math.floor(Math.random() * 9000 + 1000)}`,
          name: "",
          role: "",
          skills: [],
          teamId: null,
        };
    this.skillsText = this.draft.skills.join(", ");
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
  }

  savePerson() {
    const person = {
      ...this.draft,
      skills: this.skillsText
        .split(",")
        .map((skill) => skill.trim().toUpperCase())
        .filter(Boolean),
    };
    const saved = this.editingId()
      ? this.store.updatePerson(person)
      : this.store.addPerson(person);
    if (saved) this.closeForm();
  }

  confirmDelete(id: string) {
    if (window.confirm("Delete this person and clear all references?"))
      this.store.deletePerson(id);
  }

  setAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (
      file.size > 2 * 1024 * 1024 ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    ) {
      this.store.setErrorMessage(
        "Image must be PNG, JPEG or WEBP and smaller than 2 MB.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      (this.draft = { ...this.draft, avatarUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }
}
