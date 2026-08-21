import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StoreService, Person } from './store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-people',
  standalone: true,
   imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto p-margin relative z-0 scanline-fx h-full">
        <div class="max-w-container-max mx-auto w-full h-full flex flex-col gap-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h2 class="font-headline-lg text-headline-lg text-primary mb-2 uppercase">PERSONNEL_DATA</h2>
                    <p class="font-code-md text-code-md text-on-surface-variant uppercase">TOTAL ENTITIES: {{ filteredPeople().length | number:'2.0-0' }} // FILTER: NONE</p>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div class="relative flex items-center border border-outline-variant bg-surface-dim h-10 w-full sm:w-64 lg:w-80 overflow-hidden focus-within:border-primary-container focus-within:shadow-[0_0_8px_rgba(0,255,194,0.2)] transition-all">
                        <span class="font-code-md text-code-md text-primary-container pl-3 pr-2 select-none">$</span>
                        <input [value]="searchQuery()" (input)="setSearchQuery($event)" class="bg-transparent border-none outline-none text-primary font-code-md text-code-md w-full h-full placeholder:text-on-surface-variant/50 focus:ring-0 px-0" placeholder="query_database..." type="text">
                        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-10 pointer-events-none"></div>
                    </div>
                     <button (click)="openForm()" class="h-10 px-4 border border-primary-container bg-surface-container-lowest text-primary-container hover:bg-primary-container hover:text-on-primary-container font-label-sm text-label-sm uppercase flex justify-center items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,255,194,0)] hover:shadow-[0_0_15px_rgba(0,255,194,0.3)] shrink-0">
                        <span class="material-symbols-outlined text-[18px]">add</span>
                        ADD PERSON
                    </button>
             </div>

             @if (formOpen()) {
                 <form (ngSubmit)="savePerson()" class="border border-primary-container bg-surface-container p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                     <input name="id" [(ngModel)]="draft.id" [disabled]="!!editingId()" required placeholder="ID" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                     <input name="name" [(ngModel)]="draft.name" required placeholder="NAME" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                     <input name="role" [(ngModel)]="draft.role" placeholder="ROLE" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                     <input name="skills" [(ngModel)]="skillsText" placeholder="SKILLS, COMMA SEPARATED" class="bg-surface-dim border border-outline-variant p-2 font-code-md text-code-md text-primary">
                     <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" (change)="setAvatar($event)" class="font-code-md text-code-md text-on-surface-variant md:col-span-2">
                     <div class="flex gap-2 md:col-span-2 justify-end"><button type="button" (click)="closeForm()" class="border border-outline-variant px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">CANCEL</button><button type="submit" class="border border-primary-container px-3 py-2 font-label-sm text-label-sm text-primary-container">SAVE</button></div>
                 </form>
             }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (person of filteredPeople(); track person.id) {
                    <div class="group relative bg-surface border border-outline-variant hover:border-primary-container/50 transition-colors duration-300 flex flex-col min-h-[160px]" [class.opacity-80]="person.teamId === null" [class.hover:opacity-100]="person.teamId === null">
                        <div class="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-primary-container opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                        <div class="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-primary-container opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                        
                        <div class="h-8 border-b border-outline-variant flex justify-between items-center px-3" [ngClass]="person.teamId ? 'bg-surface-container-highest' : 'bg-surface-container'">
                            <span class="font-code-md text-[11px] text-on-surface-variant tracking-wider uppercase">ID: {{ person.id }}</span>
                            <div class="flex items-center gap-2">
                                @if (person.teamId) {
                                    <span class="font-code-md text-[10px] text-primary-container uppercase tracking-widest drop-shadow-[0_0_2px_rgba(0,255,194,0.5)]">ASSIGNED -> {{ getTeamName(person.teamId) }}</span>
                                    <div class="w-1.5 h-1.5 rounded-none bg-primary-container shadow-[0_0_6px_rgba(0,255,194,0.8)] animate-pulse"></div>
                                } @else {
                                    <span class="font-code-md text-[10px] text-on-surface-variant uppercase tracking-widest">UNASSIGNED</span>
                                    <div class="w-1.5 h-1.5 rounded-none bg-outline-variant"></div>
                                }
                            </div>
                        </div>

                        <div class="p-4 flex gap-4 flex-1 items-start">
                            <div class="w-16 h-16 shrink-0 border border-outline-variant p-1 bg-surface-container-lowest relative overflow-hidden">
                                @if (person.avatarUrl) {
                                    <img [src]="person.avatarUrl" alt="Avatar" class="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                } @else {
                                    <div class="w-full h-full bg-surface-container flex items-center justify-center text-outline-variant">
                                        <span class="material-symbols-outlined">person</span>
                                    </div>
                                }
                                <div class="absolute inset-0 bg-primary-container mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-headline-md text-[20px] text-primary truncate uppercase tracking-tight">{{ person.name }}</h3>
                                <div class="flex flex-col gap-1 mt-2" [class.opacity-70]="!person.teamId">
                                    <div class="flex items-center gap-2">
                                        <span class="font-code-md text-[10px] text-on-surface-variant w-12 shrink-0 uppercase">ROLE:</span>
                                        <span class="font-code-md text-code-md text-on-surface truncate uppercase">{{ person.role }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="font-code-md text-[10px] text-on-surface-variant w-12 shrink-0 uppercase">SKILL:</span>
                                        <div class="flex gap-1 flex-wrap">
                                            @for (skill of person.skills; track skill) {
                                                <span class="px-1 py-0.5 border border-outline-variant text-[10px] text-on-surface font-code-md uppercase">{{ skill }}</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="absolute right-0 top-8 bottom-0 w-12 border-l border-outline-variant bg-surface-container flex flex-col justify-center items-center gap-2 translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 z-10 overflow-hidden">
                             <button (click)="openForm(person)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:bg-surface-container-highest border border-transparent hover:border-outline-variant transition-colors group/btn">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            @if (person.teamId) {
                                <button (click)="store.unassignPerson(person.id)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-secondary-container hover:bg-surface-container-highest border border-transparent hover:border-outline-variant transition-colors group/btn" title="Unassign">
                                    <span class="material-symbols-outlined text-[18px]">person_remove</span>
                                </button>
                            }
                             <button (click)="confirmDelete(person.id)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-surface-container-highest border border-transparent hover:border-error/50 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                        
                        <div class="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-primary-container opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                        <div class="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-primary-container opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    </div>
                }

                <div class="group border border-dashed border-outline-variant bg-surface-container-lowest flex flex-col min-h-[160px] justify-center items-center cursor-pointer hover:border-primary-container/50 hover:bg-surface/50 transition-all duration-300 p-4">
                    <div class="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-outline-variant group-hover:text-primary-container group-hover:border-primary-container/50 mb-3 transition-colors">
                        <span class="material-symbols-outlined text-[24px]">person_add</span>
                    </div>
                    <span class="font-code-md text-code-md text-on-surface-variant group-hover:text-primary-container transition-colors tracking-widest uppercase">AWAITING_INPUT...</span>
                </div>
            </div>
            
            <div class="h-16"></div>
        </div>
    </div>
  `
})
export class PeopleComponent {
  store = inject(StoreService);
  searchQuery = signal('');
  formOpen = signal(false);
  editingId = signal<string | null>(null);
  skillsText = '';
  draft: Person = { id: '', name: '', role: '', skills: [], teamId: null };

  setSearchQuery(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  filteredPeople() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.store.people();
    return this.store.people().filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }
  
  getTeamName(teamId: string) {
      return this.store.teams().find(t => t.id === teamId)?.name || teamId;
  }

  openForm(person?: Person) {
    this.editingId.set(person?.id ?? null);
    this.draft = person ? { ...person, skills: [...person.skills] } : { id: `OP-${Math.floor(Math.random() * 9000 + 1000)}`, name: '', role: '', skills: [], teamId: null };
    this.skillsText = this.draft.skills.join(', ');
    this.formOpen.set(true);
  }

  closeForm() { this.formOpen.set(false); }

  savePerson() {
    const person = { ...this.draft, skills: this.skillsText.split(',').map(skill => skill.trim().toUpperCase()).filter(Boolean) };
    const saved = this.editingId() ? this.store.updatePerson(person) : this.store.addPerson(person);
    if (saved) this.closeForm();
  }

  confirmDelete(id: string) {
    if (window.confirm('Delete this person and clear all references?')) this.store.deletePerson(id);
  }

  setAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { this.store.errorMessage.set('Image must be PNG, JPEG or WEBP and smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => this.draft = { ...this.draft, avatarUrl: String(reader.result) };
    reader.readAsDataURL(file);
  }
}
