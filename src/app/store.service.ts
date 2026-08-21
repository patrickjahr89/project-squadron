import { Injectable, signal, computed } from '@angular/core';

export type ViewState = 'dashboard' | 'people' | 'teams' | 'draw_config' | 'draw_anim' | 'draw_result';

export interface Person {
  id: string;
  name: string;
  role: string;
  skills: string[];
  teamId: string | null;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  capacity: number;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  view = signal<ViewState>('dashboard');
  errorMessage = signal<string | null>(null);
  
  people = signal<Person[]>([
    { id: 'OP-7721', name: 'Max Mustermann', role: 'SENIOR_ENGINEER', skills: ['REACT', 'NODE'], teamId: 'T-ALPHA', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgKGffORI1YJbfnXZOdpJkt-BkwlbORMm000qKI8QK-tva9YaRpiqz-3BRU9WojwH_x04Z0ZHHVh4zdvn04dsWERL-w4TQxbORoA8ovRrt6Jxgbo3vNUh1hqlggRhktrDofJslbbh7fNsQToiV5zZE4JeZeTYP9e-9rWWIdtKKtGlaHF2E9c5Tnf54UP5HWy9z2crPvFI9ornRZ3FpmKiEm8V79XjIouUoXYLnLCE4bbJk4lIQ75xI' },
    { id: 'OP-3309', name: 'Elena Rostova', role: 'DATA_SCIENTIST', skills: ['PYTHON'], teamId: null, avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwsbgmDRMT8caTnZBL3q2wyBfkWwsuc9eP7qvkc3K54905qaKRxiqFPSuHf9LYNB8_BIM0p11XV_MV1AYh66m2X1Zus1AqpSe_UdjIxdaHob3-vMSdbGqu73qS14X_yGERPLvxH9fJhd4su_9-xfS1HdpvT2mVoNwZlE3vY3gv7UUCoeHUJLQRXqwTZFnfuX_vw4pHbAG_88gMiGl0Dhhz-sixnNdl2owFuzidwJr3bjgLnIRMaTEt' },
    { id: 'OP-1142', name: 'Samira Chen', role: 'UX_ARCHITECT', skills: ['FIGMA', 'CSS'], teamId: 'T-BRAVO', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAizIR3NN9dftAkujRnJS_TQfA78dn-rrc4PhA6AT4o3Cc2SemEjWzJbhq0J40QyAiB8PNToSyFSKZ4V0NRQ_QRKloJujy04QBP7pJ3WNwmyivcr2bcI9UkDio9IGCcaj73lKuN9VbV03rArhanTyiPrGHcgD_Mp6em4Qa_Kq3uPOE6g5UnX5ouj-Us9IFmp8W2XWFPv9N4GITGYX5DMOXVvO4SdkszY0aLoA6tHGdyZRtUk7W9YEhu' },
    { id: 'OP-9923', name: 'John Doe', role: 'SECURITY_OPS', skills: ['BASH', 'NETWORK'], teamId: null }
  ]);
  
  teams = signal<Team[]>([
    { id: 'T-ALPHA', name: 'TEAM ALPHA', capacity: 5 },
    { id: 'T-BRAVO', name: 'TEAM BRAVO', capacity: 4 },
    { id: 'T-CHARLIE', name: 'TEAM CHARLIE', capacity: 3 }
  ]);

  totalPersons = computed(() => this.people().length);
  totalTeams = computed(() => this.teams().length);
  availableSlots = computed(() => this.teams().reduce((sum, t) => sum + t.capacity, 0));
  assignedPersonsCount = computed(() => this.people().filter(p => p.teamId !== null).length);

  selectedPeopleIds = signal<Set<string>>(new Set());
  selectedTeamIds = signal<Set<string>>(new Set());
  
  lastDrawResult = signal<{ time: Date, persons: number, teams: number } | null>(null);
  currentDrawResults = signal<Map<string, string>>(new Map());

  addPerson(p: Person) { this.people.update(arr => [...arr, p]); }
  updatePerson(p: Person) { this.people.update(arr => arr.map(x => x.id === p.id ? p : x)); }
  deletePerson(id: string) { this.people.update(arr => arr.filter(x => x.id !== id)); }

  addTeam(t: Team) { this.teams.update(arr => [...arr, t]); }
  updateTeam(t: Team) { this.teams.update(arr => arr.map(x => x.id === t.id ? t : x)); }
  deleteTeam(id: string) {
    this.teams.update(arr => arr.filter(x => x.id !== id));
    this.people.update(arr => arr.map(p => p.teamId === id ? { ...p, teamId: null } : p));
  }
  
  unassignPerson(personId: string) {
      this.people.update(arr => arr.map(p => p.id === personId ? { ...p, teamId: null } : p));
  }

  initiateDrawConfig() {
    this.errorMessage.set(null);
    const availablePeople = this.people().filter(p => p.teamId === null);
    if (availablePeople.length === 0) {
      this.errorMessage.set("No available people for draw.");
      return;
    }
    this.selectedPeopleIds.set(new Set(availablePeople.map(p => p.id)));
    
    const availableTeams = this.teams().filter(t => {
       const members = this.people().filter(p => p.teamId === t.id).length;
       return members < t.capacity;
    });
    if (availableTeams.length === 0) {
      this.errorMessage.set("No available teams for draw.");
      return;
    }
    this.selectedTeamIds.set(new Set(availableTeams.map(t => t.id)));
    this.view.set('draw_config');
  }

  executeDraw() {
    this.errorMessage.set(null);
    const result = new Map<string, string>();
    const peopleToAssign = Array.from(this.selectedPeopleIds()).map(id => this.people().find(p => p.id === id)!).filter(Boolean);
    const teamsToFill = Array.from(this.selectedTeamIds()).map(id => this.teams().find(t => t.id === id)!).filter(Boolean);
    
    if (peopleToAssign.length === 0 || teamsToFill.length === 0) {
        this.errorMessage.set("Must select at least one person and one team.");
        return;
    }

    const shuffledPeople = [...peopleToAssign].sort(() => Math.random() - 0.5);
    
    const teamCapacities = new Map<string, number>();
    for (const team of teamsToFill) {
       const currentMembers = this.people().filter(p => p.teamId === team.id).length;
       teamCapacities.set(team.id, team.capacity - currentMembers);
    }
    
    let personIdx = 0;
    let distributed = true;
    while (personIdx < shuffledPeople.length && distributed) {
       distributed = false;
       for (const team of teamsToFill) {
           if (personIdx >= shuffledPeople.length) break;
           const cap = teamCapacities.get(team.id) || 0;
           if (cap > 0) {
               result.set(shuffledPeople[personIdx].id, team.id);
               teamCapacities.set(team.id, cap - 1);
               personIdx++;
               distributed = true;
           }
       }
    }
    
    this.currentDrawResults.set(result);
    this.view.set('draw_anim');
  }
  
  applyDrawResults() {
      const results = this.currentDrawResults();
      if (results.size > 0) {
          this.people.update(arr => arr.map(p => {
              if (results.has(p.id)) {
                  return { ...p, teamId: results.get(p.id)! };
              }
              return p;
          }));
          
          this.lastDrawResult.set({
              time: new Date(),
              persons: results.size,
              teams: new Set(results.values()).size
          });
      }
      this.view.set('draw_result');
  }
}
