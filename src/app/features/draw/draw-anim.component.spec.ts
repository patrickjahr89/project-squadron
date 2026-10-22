import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Assignment } from "../../shared/models/domain";
import { StoreService } from "../../shared/services/store.service";
import { DrawAnimComponent } from "./draw-anim.component";

describe("DrawAnimComponent transfer", () => {
  const assignments: Assignment[] = [
    { personId: "person-1", teamId: "team-1" },
    { personId: "person-2", teamId: "team-1" },
  ];
  const originalTransition = Object.getOwnPropertyDescriptor(
    document,
    "startViewTransition",
  );
  const originalMatchMedia = Object.getOwnPropertyDescriptor(
    window,
    "matchMedia",
  );
  let fixture: ComponentFixture<DrawAnimComponent>;
  let component: DrawAnimComponent;
  let store: {
    drawPlan: ReturnType<typeof signal<{ assignments: Assignment[] }>>;
    drawPlaybackMode: ReturnType<typeof signal<"automatic" | "manual">>;
    applyDrawResults: ReturnType<typeof vi.fn>;
    abortDraw: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    });
    store = {
      drawPlan: signal({ assignments }),
      drawPlaybackMode: signal<"automatic" | "manual">("manual"),
      applyDrawResults: vi.fn(),
      abortDraw: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [DrawAnimComponent],
      providers: [
        {
          provide: StoreService,
          useValue: {
            ...store,
            people: signal(
              assignments.map((assignment) => ({
                id: assignment.personId,
                name: assignment.personId,
                role: "Developer",
                skills: [],
                teamId: null,
              })),
            ),
            teams: signal([{ id: "team-1", name: "Team One", capacity: 2 }]),
            selectedTeamOrder: signal(["team-1"]),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DrawAnimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
    if (originalTransition)
      Object.defineProperty(
        document,
        "startViewTransition",
        originalTransition,
      );
    else Reflect.deleteProperty(document, "startViewTransition");
    if (originalMatchMedia)
      Object.defineProperty(window, "matchMedia", originalMatchMedia);
    else Reflect.deleteProperty(window, "matchMedia");
  });

  function mockTransition(ready: Promise<void> = Promise.resolve()) {
    let finish!: () => void;
    const transition = {
      ready,
      finished: new Promise<void>((resolve) => {
        finish = resolve;
      }),
      skipTransition: vi.fn(),
    };
    const start = vi.fn((update: () => void) => {
      update();
      return transition;
    });
    Object.defineProperty(document, "startViewTransition", { value: start });
    return { start, finish, transition };
  }

  it("keeps the existing announcement delay", () => {
    component.announceCurrent();

    vi.advanceTimersByTime(1499);
    expect(component.revealedAssignments()).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(component.revealedAssignments()).toEqual([assignments[0]]);
  });

  it.each(["matching", "announced", "moving"] as const)(
    "does not disclose the assigned team in the %s preview",
    (phase) => {
      component.phase.set(phase);
      fixture.detectChanges();

      const preview = fixture.nativeElement.querySelector("section");
      expect(preview.textContent).not.toContain("Team One");
      expect(preview.textContent).not.toContain("team-1");
      if (phase === "announced")
        expect(preview.textContent).toContain("person-1");
      // Team names remain visible as list headings, without revealing a match.
      expect(fixture.nativeElement.textContent.match(/Team One/g)).toHaveLength(
        1,
      );
    },
  );

  it("reveals the team through the person's entry in the team list", async () => {
    const { finish } = mockTransition();
    component.phase.set("announced");
    fixture.detectChanges();
    const teamList = fixture.nativeElement.querySelectorAll("section")[1];
    expect(teamList.textContent).toContain("Team One");
    expect(teamList.textContent).not.toContain("person-1");

    component.moveCurrentToTeam();
    finish();
    await vi.advanceTimersByTimeAsync(0);

    expect(teamList.textContent).toContain("Team One");
    expect(teamList.textContent).toContain("person-1");
  });

  it("waits for the transfer to finish before starting the next assignment", async () => {
    const { finish } = mockTransition();
    store.drawPlaybackMode.set("automatic");
    component.phase.set("announced");
    component.moveCurrentToTeam();

    expect(component.phase()).toBe("moving");
    expect(component.currentIndex()).toBe(0);
    expect(component.revealedAssignments()).toEqual([assignments[0]]);
    expect(
      fixture.nativeElement.querySelectorAll(
        '[style*="view-transition-name: assigned-person"]',
      ),
    ).toHaveLength(1);
    component.beginCurrent();
    await vi.advanceTimersByTimeAsync(3000);
    expect(component.phase()).toBe("moving");

    finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(component.phase()).toBe("ready");
    expect(component.currentIndex()).toBe(1);
    await vi.advanceTimersByTimeAsync(499);
    expect(component.phase()).toBe("ready");
    await vi.advanceTimersByTimeAsync(1);
    expect(component.phase()).toBe("matching");
  });

  it("only applies the final results after the last transfer and pause", async () => {
    const { finish } = mockTransition();
    component.currentIndex.set(1);
    component.phase.set("announced");
    component.moveCurrentToTeam();

    await vi.advanceTimersByTimeAsync(3000);
    expect(store.applyDrawResults).not.toHaveBeenCalled();
    finish();
    await vi.advanceTimersByTimeAsync(899);
    expect(component.phase()).toBe("finished");
    expect(store.applyDrawResults).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(store.applyDrawResults).toHaveBeenCalledOnce();
  });

  it("continues if the browser skips the animation", async () => {
    const { finish } = mockTransition(Promise.reject(new Error("Skipped")));
    component.phase.set("announced");
    component.moveCurrentToTeam();
    finish();

    await vi.advanceTimersByTimeAsync(0);
    expect(component.phase()).toBe("ready");
    expect(component.currentIndex()).toBe(1);
  });

  it("works without the View Transitions API", () => {
    component.phase.set("announced");
    component.moveCurrentToTeam();

    expect(component.revealedAssignments()).toEqual([assignments[0]]);
    expect(component.phase()).toBe("ready");
    expect(component.currentIndex()).toBe(1);
  });

  it("skips the transfer animation for reduced motion", () => {
    const { start } = mockTransition();
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn(() => ({ matches: true })),
    });
    component.phase.set("announced");
    component.moveCurrentToTeam();

    expect(start).not.toHaveBeenCalled();
    expect(component.phase()).toBe("ready");
    expect(component.revealedAssignments()).toEqual([assignments[0]]);
  });

  it("does not continue an aborted transfer", async () => {
    const { finish, transition } = mockTransition();
    store.drawPlaybackMode.set("automatic");
    component.phase.set("announced");
    component.moveCurrentToTeam();
    component.abort();
    finish();

    await vi.advanceTimersByTimeAsync(5000);
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    expect(store.abortDraw).toHaveBeenCalledOnce();
    expect(component.currentIndex()).toBe(0);
    expect(store.applyDrawResults).not.toHaveBeenCalled();
  });
});
