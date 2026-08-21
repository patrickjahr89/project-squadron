import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { StoreService } from './store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draw-config',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 h-full overflow-y-auto p-margin flex flex-col gap-gutter relative z-0 scanline-fx bg-[#131314]">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight uppercase">DRAW_CONFIG.EXE</h1>
                <p class="font-code-md text-code-md text-on-surface-variant mt-1 uppercase">&gt; INITIALIZING TEAM ALLOCATION MATRIX...</p>
            </div>
        </div>
        
        @if (store.errorMessage()) {
             <div class="bg-error-container border border-error p-4 flex items-center gap-3">
                 <span class="material-symbols-outlined text-error">warning</span>
                 <span class="font-code-md text-code-md text-on-error-container uppercase">{{ store.errorMessage() }}</span>
             </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter flex-1 h-full min-h-0">
            <!-- Left Panel: Available Persons -->
            <div class="lg:col-span-4 flex flex-col bg-[#121214] border border-[#252529] rounded h-full overflow-hidden relative">
                <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,194,0)_0%,rgba(0,255,194,0.02)_50%,rgba(0,255,194,0)_100%)] bg-[length:100%_4px] pointer-events-none z-0"></div>
                
                <div class="h-8 border-b border-[#252529] bg-surface-container flex items-center justify-between px-3 shrink-0 relative z-10">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                        <span class="font-label-sm text-label-sm text-primary uppercase">AVAILABLE PERSONS</span>
                    </div>
                    <span class="font-code-md text-code-md text-on-surface-variant text-[10px] uppercase">TOTAL: {{ store.people().length }}</span>
                </div>
                
                <div class="p-3 flex justify-between gap-2 border-b border-[#252529] shrink-0 relative z-10">
                    <button (click)="selectAllPeople()" class="flex-1 bg-transparent border border-outline-variant text-on-surface font-label-sm text-label-sm py-1.5 hover:border-primary-container hover:text-primary-container transition-colors text-center text-[10px] uppercase">
                        SELECT ALL
                    </button>
                    <button (click)="deselectAllPeople()" class="flex-1 bg-transparent border border-outline-variant text-on-surface font-label-sm text-label-sm py-1.5 hover:border-error hover:text-error transition-colors text-center text-[10px] uppercase">
                        DESELECT ALL
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-2 relative z-10 flex flex-col gap-1">
                    @for (person of store.people(); track person.id) {
                        @if (person.teamId) {
                            <div class="flex items-center justify-between p-2 border border-transparent opacity-50 cursor-not-allowed">
                                <div class="flex items-center gap-3">
                                    <input checked disabled class="tech-checkbox" type="checkbox">
                                    <span class="font-code-md text-code-md text-on-surface-variant line-through decoration-outline uppercase">{{ person.name }}</span>
                                </div>
                                <span class="font-label-sm text-label-sm text-error text-[10px] border border-error px-1 uppercase">ASSIGNED</span>
                            </div>
                        } @else {
                            <label class="flex items-center justify-between p-2 border border-transparent hover:border-[#3a4a43] hover:bg-surface-container-highest cursor-pointer group transition-colors">
                                <div class="flex items-center gap-3">
                                    <input [checked]="store.selectedPeopleIds().has(person.id)" (change)="togglePersonSelection(person.id)" class="tech-checkbox" type="checkbox">
                                    <span class="font-code-md text-code-md text-on-surface uppercase">{{ person.name }}</span>
                                </div>
                                <span class="font-label-sm text-label-sm text-on-surface-variant text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase">ID:{{ person.id }}</span>
                            </label>
                        }
                    }
                </div>
            </div>

            <!-- Center Summary & Right Panel Wrapper -->
            <div class="lg:col-span-8 flex flex-col gap-gutter h-full min-h-0">
                <!-- Top Section -->
                <div class="flex flex-col md:flex-row gap-gutter shrink-0">
                    <div class="flex-1 bg-[#121214] border border-primary-container rounded p-4 relative overflow-hidden shadow-[0_0_10px_rgba(0,255,194,0.3)]">
                        <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-container"></div>
                        <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-container"></div>
                        <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-container"></div>
                        <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-container"></div>
                        
                        <h2 class="font-label-sm text-label-sm text-primary-container uppercase mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-[16px]">monitoring</span>
                            DRAW CONFIGURATION
                        </h2>
                        <div class="grid grid-cols-3 gap-4">
                            <div class="flex flex-col border-l border-[#3a4a43] pl-3">
                                <span class="font-label-sm text-label-sm text-on-surface-variant text-[10px] mb-1 uppercase">SELECTED</span>
                                <span class="font-headline-md text-headline-md text-primary">{{ store.selectedPeopleIds().size | number:'2.0-0' }}</span>
                            </div>
                            <div class="flex flex-col border-l border-[#3a4a43] pl-3">
                                <span class="font-label-sm text-label-sm text-on-surface-variant text-[10px] mb-1 uppercase">TEAMS</span>
                                <span class="font-headline-md text-headline-md text-primary">{{ store.selectedTeamIds().size | number:'2.0-0' }}</span>
                            </div>
                            <div class="flex flex-col border-l border-[#3a4a43] pl-3">
                                <span class="font-label-sm text-label-sm text-on-surface-variant text-[10px] mb-1 uppercase">TOTAL SLOTS</span>
                                <span class="font-headline-md text-headline-md text-primary">{{ totalSelectedSlots() | number:'2.0-0' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="w-full md:w-48 bg-[#121214] border border-[#252529] rounded flex flex-col items-center justify-center p-4">
                        <button (click)="store.executeDraw()" class="w-full h-full min-h-[80px] bg-[#121214] border-2 border-primary-container text-primary-container font-headline-md text-headline-md font-bold uppercase hover:bg-primary-container hover:text-on-primary transition-all shadow-[0_0_10px_rgba(0,255,194,0.3)] flex flex-col items-center justify-center group relative overflow-hidden">
                            <span class="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-10 transition-opacity"></span>
                            <span class="relative z-10 flex items-center gap-2">
                                START
                                <span class="material-symbols-outlined text-[24px]">play_arrow</span>
                            </span>
                            <span class="relative z-10 font-label-sm text-label-sm text-[10px] mt-1 opacity-70 uppercase">EXECUTE_DRAW</span>
                        </button>
                    </div>
                </div>

                <!-- Right Panel: Active Teams -->
                <div class="flex-1 bg-[#121214] border border-[#252529] rounded h-full overflow-hidden flex flex-col relative min-h-0">
                    <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,194,0)_0%,rgba(0,255,194,0.02)_50%,rgba(0,255,194,0)_100%)] bg-[length:100%_4px] pointer-events-none z-0"></div>
                    
                    <div class="h-8 border-b border-[#252529] bg-surface-container flex items-center justify-between px-3 shrink-0 relative z-10">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                            <span class="font-label-sm text-label-sm text-primary uppercase">ACTIVE TEAMS MATRIX</span>
                        </div>
                        <div class="flex gap-2">
                           <button (click)="selectAllTeams()" class="font-code-md text-code-md text-on-surface-variant text-[10px] hover:text-primary-container hover:underline uppercase">ALL</button>
                           <button (click)="deselectAllTeams()" class="font-code-md text-code-md text-on-surface-variant text-[10px] hover:text-error hover:underline uppercase">NONE</button>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-4 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                        @for (team of store.teams(); track team.id) {
                            @let members = getTeamMembers(team.id);
                            @let isFull = members.length >= team.capacity;
                            
                            @if (isFull) {
                                <div class="border border-[#252529] bg-[#0e0e0f] flex flex-col opacity-75">
                                    <div class="h-6 border-b border-[#252529] bg-[#121214] flex items-center justify-between px-2">
                                        <div class="flex items-center gap-2">
                                            <input checked disabled class="tech-checkbox" type="checkbox">
                                            <span class="font-label-sm text-label-sm text-on-surface-variant line-through uppercase">{{ team.name }}</span>
                                        </div>
                                        <span class="font-code-md text-code-md text-error text-[10px] border border-error px-1 uppercase">LOCKED ({{ members.length }}/{{ team.capacity }})</span>
                                    </div>
                                    <div class="p-2 flex flex-col gap-1">
                                        @for (member of members; track member.id; let idx = $index) {
                                            <div class="border-l-2 border-[#3a4a43] pl-2 py-0.5 bg-[#131314]">
                                                <span class="font-code-md text-code-md text-outline text-[11px] uppercase">SLOT_0{{ idx + 1 }}: {{ member.name }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            } @else {
                                <div class="border border-[#3a4a43] bg-surface flex flex-col hover:border-secondary-container transition-colors group">
                                 <div role="button" tabindex="0" (keydown.enter)="toggleTeamSelection(team.id)" class="h-6 border-b border-[#3a4a43] bg-surface-container-highest flex items-center justify-between px-2 group-hover:bg-[#201f20] transition-colors cursor-pointer" (click)="toggleTeamSelection(team.id)">
                                        <div class="flex items-center gap-2">
                                            <input [checked]="store.selectedTeamIds().has(team.id)" (click)="$event.stopPropagation()" (change)="toggleTeamSelection(team.id)" class="tech-checkbox" type="checkbox">
                                            <span class="font-label-sm text-label-sm text-on-surface uppercase">{{ team.name }}</span>
                                        </div>
                                        <span class="font-code-md text-code-md text-secondary-container text-[10px] uppercase">CAP: {{ members.length }}/{{ team.capacity }}</span>
                                    </div>
                                    <div class="p-2 flex flex-col gap-1">
                                        @for (member of members; track member.id; let idx = $index) {
                                            <div class="border-l-2 border-secondary-container pl-2 py-0.5 bg-[#1a1a1c]">
                                                <span class="font-code-md text-code-md text-on-surface-variant text-[11px] uppercase">SLOT_0{{ idx + 1 }}: {{ member.name }}</span>
                                            </div>
                                        }
                                        @for (i of getArray(team.capacity - members.length); track $index) {
                                            <div class="border border-dashed border-[#3a4a43] pl-2 py-0.5 bg-transparent opacity-50">
                                                <span class="font-code-md text-code-md text-on-surface-variant text-[10px] uppercase">READY FOR INPUT...</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class DrawConfigComponent {
  store = inject(StoreService);

  totalSelectedSlots = computed(() => {
    let slots = 0;
    for (const teamId of Array.from(this.store.selectedTeamIds())) {
      const team = this.store.teams().find(t => t.id === teamId);
      if (team) {
          const members = this.store.people().filter(p => p.teamId === team.id).length;
          slots += (team.capacity - members);
      }
    }
    return slots;
  });

  getTeamMembers(teamId: string) {
      return this.store.people().filter(p => p.teamId === teamId);
  }

   getArray(n: number): undefined[] {
      return new Array(Math.max(0, n));
  }

  togglePersonSelection(id: string) {
      this.store.selectedPeopleIds.update(set => {
          const newSet = new Set(set);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  }

  toggleTeamSelection(id: string) {
      this.store.selectedTeamIds.update(set => {
          const newSet = new Set(set);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  }

  selectAllPeople() {
      const available = this.store.people().filter(p => p.teamId === null).map(p => p.id);
      this.store.selectedPeopleIds.set(new Set(available));
  }

  deselectAllPeople() {
      this.store.selectedPeopleIds.set(new Set());
  }
  
  selectAllTeams() {
      const available = this.store.teams().filter(t => {
           const members = this.store.people().filter(p => p.teamId === t.id).length;
           return members < t.capacity;
      }).map(t => t.id);
      this.store.selectedTeamIds.set(new Set(available));
  }
  
  deselectAllTeams() {
      this.store.selectedTeamIds.set(new Set());
  }
}
