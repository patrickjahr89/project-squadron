import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from "@angular/core";
import { StoreService } from "../../shared/services/store.service";
import { CommonModule } from "@angular/common";

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

  phase = signal(0);
  scrambleCode = signal("");
  bigScramble = signal("HUNTING...");
  progress = signal(0);

  private intervals: ReturnType<typeof setInterval>[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  private chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  private teamNames: string[] = [];

  ngOnInit() {
    this.teamNames = Array.from(this.store.selectedTeamIds()).map(
      (id) => this.store.teams().find((t) => t.id === id)?.name || id,
    );
    if (this.teamNames.length === 0)
      this.teamNames = ["ALPHA", "BETA", "GAMMA"];

    this.timeouts.push(setTimeout(() => this.phase.set(1), 500));
    this.timeouts.push(setTimeout(() => this.phase.set(2), 1500));
    this.timeouts.push(
      setTimeout(() => {
        this.phase.set(3);
        this.startScrambles();
      }, 2500),
    );

    this.intervals.push(
      setInterval(() => {
        const next = Math.min(100, this.progress() + 2.5);
        this.progress.set(next);
        if (next === 100) this.finishAnimation();
      }, 200),
    );
  }

  startScrambles() {
    this.intervals.push(
      setInterval(() => {
        let res = "";
        for (let i = 0; i < 8; i++)
          res += this.chars.charAt(
            Math.floor(Math.random() * this.chars.length),
          );
        this.scrambleCode.set(res);
      }, 50),
    );

    let cycles = 0;
    this.intervals.push(
      setInterval(() => {
        if (cycles % 5 === 0) {
          this.bigScramble.set(
            this.teamNames[Math.floor(Math.random() * this.teamNames.length)],
          );
        } else {
          let res = "";
          for (let i = 0; i < 8; i++)
            res += this.chars.charAt(
              Math.floor(Math.random() * this.chars.length),
            );
          this.bigScramble.set(res);
        }
        cycles++;
      }, 80),
    );
  }

  finishAnimation() {
    this.clearTimers();
    this.phase.set(5);
    this.scrambleCode.set("COMPLETE");
    this.bigScramble.set("COMPLETE");

    this.timeouts.push(
      setTimeout(() => {
        this.store.applyDrawResults();
      }, 1500),
    );
  }

  abort() {
    this.clearTimers();
    this.store.abortDraw();
  }

  clearTimers() {
    this.intervals.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
    this.intervals = [];
    this.timeouts = [];
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}
