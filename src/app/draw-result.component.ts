import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StoreService } from './store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draw-result',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto relative scanline-fx p-margin md:p-8 flex flex-col items-center bg-background z-0 h-full">
        <div class="absolute inset-0 bg-tech-grid z-0 opacity-30 pointer-events-none"></div>

        <div class="w-full max-w-6xl mb-12 text-center mt-8 relative z-10">
            <div class="inline-flex items-center justify-center gap-3 mb-2 px-4 py-1 border border-primary-container bg-[#002116] rounded-full">
                <span class="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(0,255,194,0.7)] animate-pulse"></span>
                <span class="font-code-md text-code-md text-primary-container tracking-wider uppercase">PROCESS_COMPLETE</span>
            </div>
            <h1 class="font-headline-lg text-[48px] md:text-[64px] font-bold text-primary-container tracking-tighter neon-glow-primary uppercase mt-4">
                Draw Complete
            </h1>
            <p class="font-code-md text-code-md text-on-surface-variant mt-4 uppercase">&gt;&gt; ALL ENTITIES SUCCESSFULLY ASSIGNED TO CLUSTERS.</p>
        </div>

        <div class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter relative z-10">
             @if (!store.lastDrawResult()) {
                 <div class="w-full border border-error bg-error-container p-4 text-error font-code-md text-code-md uppercase">NO VALID COMPLETED DRAW</div>
             }
             @for (teamId of getTeamsInResult(); track teamId) {
                 @let team = getTeam(teamId);
                @let newAssignments = getNewAssignmentsForTeam(teamId);
                @let allMembers = getAllMembers(teamId);
                
                  <div class="bg-[#121214] border border-primary-container crosshair-container flex flex-col relative overflow-hidden shadow-[0_0_10px_rgba(0,255,194,0.2)] h-full">
                    <div class="h-10 border-b border-primary-container bg-[#002116] flex items-center justify-between px-4">
                        <span class="font-label-sm text-label-sm text-primary-container tracking-widest font-bold uppercase">{{ team?.name }}</span>
                        <span class="material-symbols-outlined text-primary-container text-sm">verified</span>
                 </div>
                     <div class="p-4 flex-1 flex flex-col gap-3">
                        @for (member of allMembers; track member.id; let idx = $index) {
                            @let isNew = newAssignments.includes(member.id);
                            
                            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant animate-in slide-in-from-top-2 fade-in duration-500 fill-mode-both"
                                 [style.animation-delay.ms]="idx * 200">
                                <div class="w-8 h-8 bg-surface-container-highest border border-outline flex items-center justify-center rounded-sm shrink-0 overflow-hidden p-0.5">
                                    @if (member.avatarUrl) {
                                         <img [src]="member.avatarUrl" [alt]="member.name" class="w-full h-full object-cover grayscale opacity-80" />
                                    } @else {
                                         <span class="material-symbols-outlined text-on-surface text-sm">person</span>
                                    }
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-code-md text-code-md text-on-surface truncate uppercase">{{ member.name }}</div>
                                    <div class="font-label-sm text-[10px] text-on-surface-variant truncate uppercase">ID: {{ member.id }}</div>
                                </div>
                                @if (isNew) {
                                    <span class="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(0,255,194,0.7)] animate-pulse shrink-0" title="New Assignment"></span>
                                }
                 </div>
             }
                        
                        @for (i of getArray(team!.capacity - allMembers.length); track $index) {
                            <div class="flex items-center gap-3 p-3 border border-dashed border-outline-variant mt-auto opacity-50">
                                <div class="font-code-md text-code-md text-on-surface-variant flex-1 text-center text-xs uppercase">
                                    [ SLOT_AVAILABLE ]
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    </div>
  `
})
export class DrawResultComponent {
  store = inject(StoreService);

  getTeamsInResult() {
      // Return teams that were involved in the selected teams for the draw
      return [...new Set([...this.store.currentDrawResults().values(), ...this.store.people().filter(person => person.teamId && this.store.selectedTeamIds().has(person.teamId)).map(person => person.teamId!)])].filter(teamId => this.store.teams().some(team => team.id === teamId));
  }

  getTeam(teamId: string) {
      return this.store.teams().find(t => t.id === teamId);
  }

  getAllMembers(teamId: string) {
      return this.store.people().filter(p => p.teamId === teamId);
  }

  getNewAssignmentsForTeam(teamId: string) {
      const newAssignedIds: string[] = [];
      const results = this.store.currentDrawResults();
      results.forEach((assignedTeamId, personId) => {
          if (assignedTeamId === teamId) {
              newAssignedIds.push(personId);
          }
      });
      return newAssignedIds;
  }

  getOldAssignmentsForTeam(teamId: string) {
       // People in this team that were NOT part of the recent result map
       const results = this.store.currentDrawResults();
       return this.store.people().filter(p => p.teamId === teamId && !results.has(p.id)).map(p => p.id);
  }
  
  getArray(n: number) {
      return new Array(Math.max(0, n));
  }
}
