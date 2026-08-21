import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DrawPlan, DrawStatus, Person, Team, createDrawPlan, freeCapacity, teamMembers, validateDraw, validateDrawPlan, validatePerson, validateTeam } from './domain';
import { RepositoryService } from './repository.service';

export type ViewState = 'dashboard' | 'people' | 'teams' | 'draw_config' | 'draw_anim' | 'draw_result';
export type { Assignment, DrawPlan, DrawStatus, Person, Team } from './domain';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly repository = inject(RepositoryService);
  readonly view = signal<ViewState>('dashboard');
  readonly workflow = signal<DrawStatus>('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly dataVersion = signal(1);
  readonly people = signal<Person[]>([
    { id: 'OP-7721', name: 'Max Mustermann', role: 'SENIOR_ENGINEER', skills: ['REACT', 'NODE'], teamId: 'T-ALPHA', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgKGffORI1YJbfnXZOdpJkt-BkwlbORMm000qKI8QK-tva9YaRpiqz-3BRU9WojwH_x04Z0ZHHVh4zdvn04dsWERL-w4TQxbORoA8ovRrt6Jxgbo3vNUh1hqlggRhktrDofJslbbh7fNsQToiV5zZE4JeZeTYP9e-9rWWIdtKKtGlaHF2E9c5Tnf54UP5HWy9z2crPvFI9ornRZ3FpmKiEm8V79XjIouUoXYLnLCE4bbJk4lIQ75xI' },
    { id: 'OP-3309', name: 'Elena Rostova', role: 'DATA_SCIENTIST', skills: ['PYTHON'], teamId: null, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsbgmDRMT8caTnZBL3q2wyBfkWwsuc9eP7qvkc3K54905qaKRxiqFPSuHf9LYNB8_BIM0p11XV_MV1AYh66m2X1Zus1AqpSe_UdjIxdaHob3-vMSdbGqu73qS14X_yGERPLvxH9fJhd4su_9-xfS1HdpvT2mVoNwZlE3vY3gv7UUCoeHUJLQRXqwTZFnfuX_vw4pHbAG_88gMiGl0Dhhz-sixnNdl2owFuzidwJr3bjgLnIRMaTEt' },
    { id: 'OP-1142', name: 'Samira Chen', role: 'UX_ARCHITECT', skills: ['FIGMA', 'CSS'], teamId: 'T-BRAVO', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAizIR3NN9dftAkujRnJS_TQfA78dn-rrc4PhA6AT4o3Cc2SemEjWzJbhq0J40QyAiB8PNToSyFSKZ4V0NRQ_QRKloJujy04QBP7pJ3WNwmyivcr2bcI9UkDio9IGCcaj73lKuN9VbV03rArhanTyiPrGHcgD_Mp6em4Qa_Kq3uPOE6g5UnX5ouj-Us9IFmp8W2XWFPv9N4GITGYX5DMOXVvO4SdkszY0aLoA6tHGdyZRtUk7W9YEhu' },
    { id: 'OP-9923', name: 'John Doe', role: 'SECURITY_OPS', skills: ['BASH', 'NETWORK'], teamId: null }
  ]);
  readonly teams = signal<Team[]>([
    { id: 'T-ALPHA', name: 'TEAM ALPHA', capacity: 5 },
    { id: 'T-BRAVO', name: 'TEAM BRAVO', capacity: 4 },
    { id: 'T-CHARLIE', name: 'TEAM CHARLIE', capacity: 3 }
  ]);
  readonly selectedPeopleIds = signal<Set<string>>(new Set());
  readonly selectedTeamIds = signal<Set<string>>(new Set());
  readonly lastDrawResult = signal<{ time: Date; persons: number; teams: number } | null>(null);
  readonly currentDrawResults = signal<Map<string, string>>(new Map());
  readonly drawPlan = signal<DrawPlan | null>(null);

  constructor() {
    const saved = this.repository.load();
    if (saved) { this.people.set(saved.people); this.teams.set(saved.teams); this.lastDrawResult.set(saved.lastDrawResult ? { ...saved.lastDrawResult, time: new Date(saved.lastDrawResult.time) } : null); }
    effect(() => this.repository.save({ version: 1, people: this.people(), teams: this.teams(), lastDrawResult: this.lastDrawResult() ? { ...this.lastDrawResult()!, time: this.lastDrawResult()!.time.toISOString() } : null }));
  }

  readonly totalPersons = computed(() => this.people().length);
  readonly totalTeams = computed(() => this.teams().length);
  readonly totalCapacity = computed(() => this.teams().reduce((sum, team) => sum + team.capacity, 0));
  readonly assignedPersonsCount = computed(() => this.people().filter(person => person.teamId !== null).length);
  readonly availableSlots = computed(() => this.teams().reduce((sum, team) => sum + freeCapacity(this.people(), team), 0));
  readonly selectedFreeSlots = computed(() => [...this.selectedTeamIds()].reduce((sum, id) => { const team = this.teams().find(item => item.id === id); return sum + (team ? freeCapacity(this.people(), team) : 0); }, 0));
  readonly drawValidation = computed(() => validateDraw({ people: this.people(), teams: this.teams(), selectedPersonIds: [...this.selectedPeopleIds()], selectedTeamIds: [...this.selectedTeamIds()] }));

  navigate(view: ViewState): void {
    if (this.workflow() === 'animating') { this.fail('Navigation is locked while the draw is running.'); return; }
    if (view === 'draw_anim' && this.workflow() !== 'prepared') { this.fail('Prepare a valid draw before starting the animation.'); return; }
    if (view === 'draw_result' && this.workflow() !== 'completed') { this.fail('No completed draw result is available.'); return; }
    this.errorMessage.set(null); this.view.set(view);
  }

  private fail(message: string): false { this.errorMessage.set(message); return false; }
  private bumpVersion(): void { this.dataVersion.update(version => version + 1); }
  private ensureEditable(): boolean { return this.workflow() !== 'animating' || this.fail('Changes are locked while the draw is running.'); }

  addPerson(person: Person): boolean {
    if (!this.ensureEditable()) return false;
    const error = validatePerson(person, this.people().map(item => item.id));
    if (error) return this.fail(error);
    this.people.update(items => [...items, { ...person, name: person.name.trim() }]); this.bumpVersion(); return true;
  }
  updatePerson(person: Person): boolean {
    if (!this.ensureEditable()) return false;
    const existing = this.people().find(item => item.id === person.id);
    if (!existing) return this.fail('Person does not exist.');
    const error = validatePerson(person);
    if (error) return this.fail(error);
    if (person.teamId !== null && !this.teams().some(team => team.id === person.teamId)) return this.fail('Assigned team does not exist.');
    this.people.update(items => items.map(item => item.id === person.id ? { ...person, name: person.name.trim() } : item)); this.bumpVersion(); return true;
  }
  deletePerson(id: string): boolean { if (!this.ensureEditable()) return false; if (!this.people().some(person => person.id === id)) return this.fail('Person does not exist.'); this.people.update(items => items.filter(person => person.id !== id)); this.selectedPeopleIds.update(ids => { const next = new Set(ids); next.delete(id); return next; }); this.currentDrawResults.update(results => { const next = new Map(results); next.delete(id); return next; }); this.bumpVersion(); return true; }
  addTeam(team: Team): boolean { if (!this.ensureEditable()) return false; const error = validateTeam(team, this.teams().map(item => item.id)); if (error) return this.fail(error); this.teams.update(items => [...items, { ...team, name: team.name.trim() }]); this.bumpVersion(); return true; }
  updateTeam(team: Team): boolean { if (!this.ensureEditable()) return false; const existing = this.teams().find(item => item.id === team.id); if (!existing) return this.fail('Team does not exist.'); const error = validateTeam(team, [], teamMembers(this.people(), team.id).length); if (error) return this.fail(error); this.teams.update(items => items.map(item => item.id === team.id ? { ...team, name: team.name.trim() } : item)); this.bumpVersion(); return true; }
  deleteTeam(id: string): boolean { if (!this.ensureEditable()) return false; if (!this.teams().some(team => team.id === id)) return this.fail('Team does not exist.'); this.teams.update(items => items.filter(team => team.id !== id)); this.people.update(items => items.map(person => person.teamId === id ? { ...person, teamId: null } : person)); this.selectedTeamIds.update(ids => { const next = new Set(ids); next.delete(id); return next; }); this.currentDrawResults.update(results => { const next = new Map([...results].filter(([, teamId]) => teamId !== id)); return next; }); this.bumpVersion(); return true; }
  unassignPerson(personId: string): boolean { if (!this.ensureEditable()) return false; this.people.update(items => items.map(person => person.id === personId ? { ...person, teamId: null } : person)); this.bumpVersion(); return true; }

  initiateDrawConfig(): void {
    this.errorMessage.set(null); const people = this.people().filter(person => person.teamId === null); const teams = this.teams().filter(team => freeCapacity(this.people(), team) > 0);
    if (!people.length) { this.workflow.set('failed'); this.fail('No available people for draw.'); return; }
    if (!teams.length) { this.workflow.set('failed'); this.fail('No available teams for draw.'); return; }
    this.selectedPeopleIds.set(new Set(people.map(person => person.id))); this.selectedTeamIds.set(new Set(teams.map(team => team.id))); this.workflow.set('configuring'); this.view.set('draw_config');
  }
  prepareDraw(seed = Date.now()): boolean {
    const validation = this.drawValidation(); if (!validation.valid) return this.fail(validation.message ?? 'Invalid draw.');
    try { this.drawPlan.set(createDrawPlan({ people: this.people(), teams: this.teams(), selectedPersonIds: [...this.selectedPeopleIds()], selectedTeamIds: [...this.selectedTeamIds()] }, seed, this.dataVersion())); this.workflow.set('prepared'); return true; } catch (error) { return this.fail(error instanceof Error ? error.message : 'Unable to prepare draw.'); }
  }
  executeDraw(): void { if (this.prepareDraw()) { this.workflow.set('animating'); this.currentDrawResults.set(new Map()); this.view.set('draw_anim'); } }
  applyDrawResults(): boolean {
    const plan = this.drawPlan(); if (!plan) return this.fail('No prepared draw is available.');
    const validation = validateDrawPlan(plan, { people: this.people(), teams: this.teams(), selectedPersonIds: plan.personIds, selectedTeamIds: plan.teamIds });
    if (!validation.valid || plan.dataVersion !== this.dataVersion()) { this.workflow.set('failed'); return this.fail(validation.message ?? 'Draw data changed while the draw was running.'); }
    const result = new Map(plan.assignments.map(assignment => [assignment.personId, assignment.teamId])); this.people.update(items => items.map(person => result.has(person.id) ? { ...person, teamId: result.get(person.id)! } : person)); this.currentDrawResults.set(result); this.lastDrawResult.set({ time: new Date(), persons: result.size, teams: new Set(result.values()).size }); this.workflow.set('completed'); this.view.set('draw_result'); return true;
  }
  abortDraw(): void { this.drawPlan.set(null); this.currentDrawResults.set(new Map()); this.workflow.set('aborted'); this.view.set('draw_config'); }
}
