import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Assignment, Person } from "../../shared/models/domain";
import { StoreService } from "../../shared/services/store.service";

type PlaybackPhase = "ready" | "matching" | "announced" | "finished";

@Component({
  selector: "app-draw-anim",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./draw-anim.component.html",
  styleUrl: "./draw-anim.component.css",
})
export class DrawAnimComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  private cdr = inject(ChangeDetectorRef);

  phase = signal<PlaybackPhase>("ready");
  currentIndex = signal(0);
  scrambleCode = signal("SEARCHING...");
  revealedAssignments = signal<Assignment[]>([]);

  private intervals: ReturnType<typeof setInterval>[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private readonly chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

  get assignments(): Assignment[] {
    return this.store.drawPlan()?.assignments ?? [];
  }

  get currentAssignment(): Assignment | undefined {
    return this.assignments[this.currentIndex()];
  }

  get currentPerson(): Person | undefined {
    const assignment = this.currentAssignment;
    return assignment
      ? this.store.people().find((person) => person.id === assignment.personId)
      : undefined;
  }

  get currentTeamName(): string {
    const assignment = this.currentAssignment;
    return assignment
      ? (this.store.teams().find((team) => team.id === assignment.teamId)?.name ??
          assignment.teamId)
      : "";
  }

  ngOnInit() {
    if (!this.assignments.length) {
      this.store.abortDraw();
      return;
    }
    if (this.store.drawPlaybackMode() === "automatic") this.beginCurrent();
  }

  beginCurrent() {
    if (this.phase() !== "ready" || !this.currentAssignment) return;
    this.phase.set("matching");
    this.startScramble();
    this.timeouts.push(setTimeout(() => this.announceCurrent(), 1300));
  }

  announceCurrent() {
    this.clearIntervals();
    this.scrambleCode.set("MATCH CONFIRMED");
    this.phase.set("announced");
    this.timeouts.push(setTimeout(() => this.moveCurrentToTeam(), 3000));
  }

  moveCurrentToTeam() {
    if (this.phase() !== "announced" || !this.currentAssignment) return;
    const assignment = this.currentAssignment;
    const completedIndex = this.currentIndex();
    const move = () => {
      this.revealedAssignments.update((assignments) => [...assignments, assignment]);
      this.currentIndex.set(completedIndex + 1);
      this.phase.set(
        completedIndex + 1 === this.assignments.length ? "finished" : "ready",
      );
      this.cdr.detectChanges();
    };
    const documentWithTransition = document as Document & {
      startViewTransition?: (update: () => void) => unknown;
    };
    if (documentWithTransition.startViewTransition) {
      documentWithTransition.startViewTransition(move);
    } else {
      move();
    }

    if (completedIndex + 1 === this.assignments.length) {
      this.timeouts.push(setTimeout(() => this.store.applyDrawResults(), 900));
    } else if (this.store.drawPlaybackMode() === "automatic") {
      this.timeouts.push(setTimeout(() => this.beginCurrent(), 500));
    }
  }

  teamMembers(teamId: string): Person[] {
    const existing = this.store.people().filter((person) => person.teamId === teamId);
    const revealedIds = this.revealedAssignments()
      .filter((assignment) => assignment.teamId === teamId)
      .map((assignment) => assignment.personId);
    return [
      ...existing,
      ...revealedIds
        .map((id) => this.store.people().find((person) => person.id === id))
        .filter((person): person is Person => !!person),
    ];
  }

  revealedIndex(personId: string): number {
    return this.revealedAssignments().findIndex(
      (assignment) => assignment.personId === personId,
    );
  }

  currentTransitionName(): string {
    return `assigned-person-${this.currentIndex()}`;
  }

  private startScramble() {
    this.clearIntervals();
    this.intervals.push(
      setInterval(() => {
        let value = "";
        for (let index = 0; index < 10; index++)
          value += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
        this.scrambleCode.set(value);
      }, 65),
    );
  }

  abort() {
    this.clearTimers();
    this.store.abortDraw();
  }

  private clearIntervals() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  private clearTimers() {
    this.clearIntervals();
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}
