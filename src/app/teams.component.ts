import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StoreService } from './store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
   imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto p-margin relative z-0 scanline-fx h-full">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-outline-variant">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary uppercase mb-2 flex items-center">
                    <span class="text-primary-container mr-3 font-normal">&gt;_</span>TEAM DIRECTORY
                </h1>
                <p class="font-code-md text-code-md text-on-surface-variant opacity-80 uppercase">
                    Total active clusters: {{ store.totalTeams() }} | Operatives assigned: {{ store.assignedPersonsCount() }}/{{ store.availableSlots() + store.assignedPersonsCount() }}
                </p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center space-x-4">
                <div class="relative flex items-center border border-outline-variant bg-surface-dim h-10 w-full sm:w-64 overflow-hidden focus-within:border-primary-container focus-within:shadow-[0_0_8px_rgba(0,255,194,0.2)] transition-all">
                    <span class="font-code-md text-code-md text-primary-container pl-3 pr-2 select-none">$</span>
                    <input [value]="searchQuery()" (input)="setSearchQuery($event)" class="bg-transparent border-none outline-none text-on-surface font-code-md text-code-md w-full h-full placeholder:text-on-surface-variant/50 focus:ring-0 px-0" placeholder="grep 'team_name'" type="text">
                    <span class="material-symbols-outlined text-on-surface-variant text-sm ml-2 pr-3">search</span>
                </div>
                 <button (click)="openForm()" class="h-10 px-4 border border-primary-container bg-[#121214] text-primary-container hover:bg-primary-container hover:text-on-primary-container font-label-sm text-label-sm uppercase flex justify-center items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,255,194,0)] hover:shadow-[0_0_15px_rgba(0,255,194,0.3)] shrink-0 whitespace-nowrap">
                    <span class="material-symbols-outlined text-sm">add_box</span>
                    CREATE NEW TEAM
                </button>
             </div>

        @if (formOpen()) {
            <form (ngSubmit)="saveTeam()" class="mb-6 border border-primary-container bg-surface-container p-4 flex flex-wrap gap-3">
                <input name="id" [(ngModel)]="draft.id" [disabled]="!!editingId()" required placeholder="TEAM ID" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                <input name="name" [(ngModel)]="draft.name" required placeholder="TEAM NAME" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                <input name="capacity" [(ngModel)]="draft.capacity" required min="1" type="number" placeholder="CAPACITY" class="w-28 bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                <button type="submit" class="border border-primary-container px-3 py-2 font-label-sm text-label-sm text-primary-container">SAVE</button>
                <button type="button" (click)="closeForm()" class="border border-outline-variant px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">CANCEL</button>
            </form>
        }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            @for (team of filteredTeams(); track team.id) {
                @let members = getTeamMembers(team.id);
                @let isFull = members.length >= team.capacity;
                @let isEmpty = members.length === 0;

                <div class="bg-[#121214] border border-outline-variant crosshair-container flex flex-col min-h-[320px] hover:border-primary-container transition-colors group relative"
                     [class.opacity-80]="isEmpty" [class.hover:opacity-100]="isEmpty">
                    
                    <div class="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-outline-variant group-hover:border-primary-container transition-colors z-10"></div>
                    <div class="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-outline-variant group-hover:border-primary-container transition-colors z-10"></div>
                    
                    <div class="h-8 border-b border-outline-variant bg-surface-container-low flex justify-between items-center px-3 group-hover:bg-[#1c1c1f] transition-colors">
                        <span class="font-label-sm text-label-sm text-primary uppercase tracking-widest">{{ team.name }}</span>
                        <div class="flex items-center space-x-2">
                            @if (isFull) {
                                <span class="font-code-md text-[10px] text-error font-bold tracking-wider">FULL</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse shadow-[0_0_10px_rgba(255,180,171,0.5)]"></span>
                            } @else if (isEmpty) {
                                <span class="font-code-md text-[10px] text-secondary tracking-wider">FORMING</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            } @else {
                                <span class="font-code-md text-[10px] text-primary-container tracking-wider">ACTIVE</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                            }
                        </div>
                    </div>

                    <div class="p-4 flex-1 flex flex-col">
                        <div class="flex justify-between items-end mb-2">
                            <span class="font-code-md text-code-md text-on-surface-variant uppercase">MEMBER COUNT</span>
                            <span class="font-headline-md text-body-lg font-bold uppercase"
                                  [class.text-primary]="!isEmpty" [class.text-on-surface-variant]="isEmpty">
                                {{ members.length }} / {{ team.capacity }}
                            </span>
                        </div>
                        
                        <div class="flex w-full mb-6">
                            @for (i of getArray(team.capacity); track $index) {
                                <div class="flex-1 h-2 mr-[2px] border border-outline-variant bg-transparent"
                                     [class.last:mr-0]="true"
                                     [class.bg-error]="$index < members.length && isFull"
                                     [class.border-error]="$index < members.length && isFull"
                                     [class.shadow-[0_0_5px_rgba(255,180,171,0.5)]]="$index < members.length && isFull"
                                     [class.bg-primary-container]="$index < members.length && !isFull && !isEmpty"
                                     [class.border-primary-container]="$index < members.length && !isFull && !isEmpty"
                                     [class.shadow-[0_0_5px_rgba(0,255,194,0.5)]]="$index < members.length && !isFull && !isEmpty"
                                     [class.bg-secondary]="$index < members.length && isEmpty"
                                     [class.border-secondary]="$index < members.length && isEmpty"
                                     [class.shadow-[0_0_5px_rgba(236,178,255,0.3)]]="$index < members.length && isEmpty"
                                ></div>
                            }
                        </div>

                        <div class="space-y-2 mt-auto">
                            <div class="text-[10px] font-label-sm text-on-surface-variant border-b border-outline-variant pb-1 mb-2 uppercase">OPERATIVES LIST</div>
                            @for (member of members.slice(0, 3); track member.id; let idx = $index) {
                                <div class="flex items-center space-x-2 font-code-md text-code-md text-on-surface">
                                    <span [class.text-primary-container]="!isEmpty && !isFull" [class.text-error]="isFull" [class.text-secondary]="isEmpty">0{{ idx + 1 }}</span>
                                    <span class="uppercase truncate">{{ member.name }}</span>
                                    <button (click)="store.unassignPerson(member.id)" class="ml-auto opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-opacity">
                                        <span class="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            }
                            @if (members.length > 3) {
                                <div class="flex items-center space-x-2 font-code-md text-code-md text-on-surface opacity-50">
                                    <span class="text-on-surface-variant">...</span><span class="uppercase">+{{ members.length - 3 }} MORE</span>
                                </div>
                            }
                            @for (i of getArray(Math.min(2, team.capacity - members.length)); track $index) {
                                <div class="border border-dashed border-outline-variant p-1 text-center mt-2">
                                    <span class="font-code-md text-[10px] text-on-surface-variant opacity-50 uppercase">READY FOR INPUT...</span>
                                </div>
                            }
                        </div>
                    </div>

                    <div class="border-t border-outline-variant p-2 flex justify-between bg-surface-container-lowest">
                         <button (click)="confirmDelete(team.id)" class="text-on-surface-variant hover:text-error font-label-sm text-label-sm uppercase p-1 transition-colors flex items-center">
                            <span class="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                         <button (click)="openForm(team)" class="text-on-surface-variant hover:text-primary-container font-label-sm text-label-sm uppercase p-1 transition-colors flex items-center">
                            MANAGE <span class="material-symbols-outlined text-[14px] ml-1">chevron_right</span>
                        </button>
                    </div>
                    
                    <div class="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-outline-variant group-hover:border-primary-container transition-colors z-10"></div>
                    <div class="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-outline-variant group-hover:border-primary-container transition-colors z-10"></div>
                </div>
            }

             <button (click)="openForm()" class="bg-[#131314] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center h-full min-h-[320px] hover:border-primary-container hover:bg-surface-container-low transition-all duration-300 group">
                <span class="material-symbols-outlined text-4xl text-outline-variant group-hover:text-primary-container mb-4 transition-colors">add_circle</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary-container uppercase tracking-widest transition-colors">INITIALIZE NEW TEAM</span>
            </button>
        </div>
    </div>
  `
})
export class TeamsComponent {
  store = inject(StoreService);
  searchQuery = signal('');
  Math = Math;
  formOpen = signal(false);
  editingId = signal<string | null>(null);
  draft = { id: '', name: '', capacity: 1 };

  setSearchQuery(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  filteredTeams() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.store.teams();
    return this.store.teams().filter(t => t.name.toLowerCase().includes(q));
  }
  
  getTeamMembers(teamId: string) {
      return this.store.people().filter(p => p.teamId === teamId);
  }
  
  getArray(n: number): any[] {
      return new Array(n);
  }

  openForm(team?: { id: string; name: string; capacity: number }) { this.editingId.set(team?.id ?? null); this.draft = team ? { ...team } : { id: `T-${Math.floor(Math.random() * 900 + 100)}`, name: '', capacity: 1 }; this.formOpen.set(true); }
  closeForm() { this.formOpen.set(false); }
  saveTeam() { const saved = this.editingId() ? this.store.updateTeam(this.draft) : this.store.addTeam(this.draft); if (saved) this.closeForm(); }
  confirmDelete(id: string) { const count = this.getTeamMembers(id).length; if (window.confirm(`Delete this team? ${count} people will be unassigned.`)) this.store.deleteTeam(id); }
}
