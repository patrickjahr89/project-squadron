import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { StoreService } from './store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draw-anim',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 w-full h-full flex flex-col items-center justify-center p-margin relative overflow-hidden bg-background crt-flicker z-0">
        <div class="absolute inset-0 bg-tech-grid z-0 opacity-30 pointer-events-none"></div>
        <div class="absolute inset-0 scanline-fx z-10 mix-blend-overlay pointer-events-none"></div>
        
        <div class="absolute top-margin left-margin right-margin flex justify-between items-center z-20">
            <div class="flex items-center gap-2 text-primary-container font-label-sm text-label-sm uppercase">
                <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span class="tracking-widest neon-glow-primary">PROCESS: TR_RANDOMIZE_EXEC</span>
            </div>
            <div class="text-on-surface-variant font-code-md text-code-md uppercase">
                SEC_LVL: ALPHA
            </div>
        </div>

        <div class="w-full max-w-4xl bg-[#121214]/90 backdrop-blur-md border border-outline-variant p-1 rounded-sm neon-box-primary relative overflow-hidden flex flex-col h-[614px] max-h-[600px] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-20">
            
            <div class="h-[24px] bg-surface-container-highest flex items-center justify-between px-4 border-b border-outline-variant shrink-0">
                <span class="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">CONSOLE OUTPUT</span>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_5px_rgba(0,255,194,0.8)]"></div>
                    <span class="font-label-sm text-label-sm text-primary-container uppercase">ACTIVE</span>
                </div>
            </div>

            <div class="p-6 font-code-md text-code-md text-on-surface-variant flex-grow flex flex-col relative z-10">
                <div class="opacity-50 mb-4">&gt; root&#64;TR_OS:~# ./init_draw.sh</div>
                <div class="space-y-3 mb-8">
                    @if (phase() >= 1) { <div class="flex"><span class="text-primary-container mr-2">&gt;</span> INITIALIZING DRAW... [OK]</div> }
                    @if (phase() >= 2) { <div class="flex"><span class="text-primary-container mr-2">&gt;</span> LOADING PARTICIPANTS... {{ store.selectedPeopleIds().size | number:'2.0-0' }} [OK]</div> }
                    @if (phase() >= 3) { 
                        <div class="flex text-primary-container font-bold neon-glow-primary">
                            <span class="mr-2">&gt;</span> RANDOMIZING... <span>{{ scrambleCode() }}</span>
                        </div>
                    }
                </div>

                <div class="flex-grow flex flex-col items-center justify-center border border-outline-variant bg-surface-container-lowest/50 relative overflow-hidden">
                    <div class="absolute top-2 left-2 text-[10px] text-outline tracking-widest uppercase">MEM_ALLOC_0x9F2</div>
                    <div class="absolute bottom-2 right-2 text-[10px] text-outline tracking-widest uppercase">CYCLES: {{ progress() | number:'1.1-1' }}%</div>
                    
                    <div class="font-headline-lg text-headline-lg font-bold tracking-widest uppercase"
                         [ngClass]="phase() === 5 ? 'text-secondary-container drop-shadow-[0_0_15px_rgba(207,92,255,0.5)]' : 'text-primary-container neon-glow-primary drop-shadow-[0_0_15px_rgba(0,255,194,0.5)]'">
                        {{ bigScramble() }}
                    </div>
                    
                    <div class="mt-4 font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">
                        {{ phase() === 5 ? 'DRAW FINALIZED' : 'MATCHING ENTITIES TO GROUPS' }}
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-outline-variant bg-[#0a0a0b] shrink-0">
                <div class="flex justify-between mb-2 font-label-sm text-label-sm text-primary-container uppercase">
                    <span>EXECUTION PROGRESS</span>
                    <span>{{ progress() | number:'1.0-0' }}%</span>
                </div>
                <div class="h-4 w-full border border-outline-variant bg-surface p-[2px] flex gap-[2px]">
                    <div class="h-full bg-primary-container/80 shadow-[0_0_10px_rgba(0,255,194,0.5)] transition-all duration-200" [style.width.%]="progress()"></div>
                </div>
            </div>
            
            <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-container"></div>
            <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-container"></div>
            <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-container"></div>
            <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-container"></div>
        </div>

        <div class="absolute bottom-margin z-20">
            <button (click)="abort()" class="bg-[#121214] border border-error text-error font-label-sm text-label-sm px-6 py-2 hover:bg-error hover:text-on-error hover:shadow-[0_0_15px_rgba(255,180,171,0.5)] transition-all duration-200 flex items-center gap-2 group uppercase">
                <span class="material-symbols-outlined text-[16px]">cancel</span>
                ABORT SEQUENCE
            </button>
        </div>
    </div>
  `,
  styles: [`
    .neon-box-primary {
        box-shadow: 0 0 15px rgba(0, 255, 194, 0.2), inset 0 0 15px rgba(0, 255, 194, 0.1);
    }
  `]
})
export class DrawAnimComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  
  phase = signal(0);
  scrambleCode = signal('');
  bigScramble = signal('HUNTING...');
  progress = signal(0);

  private intervals: ReturnType<typeof setInterval>[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  
  private chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  private teamNames: string[] = [];

  ngOnInit() {
      this.teamNames = Array.from(this.store.selectedTeamIds()).map(id => this.store.teams().find(t => t.id === id)?.name || id);
      if (this.teamNames.length === 0) this.teamNames = ['ALPHA', 'BETA', 'GAMMA'];

      this.timeouts.push(setTimeout(() => this.phase.set(1), 500));
      this.timeouts.push(setTimeout(() => this.phase.set(2), 1500));
      this.timeouts.push(setTimeout(() => {
          this.phase.set(3);
          this.startScrambles();
      }, 2500));
      
       this.intervals.push(setInterval(() => {
           const next = Math.min(100, this.progress() + 2.5);
           this.progress.set(next);
           if (next === 100) this.finishAnimation();
       }, 200));
  }

  startScrambles() {
      this.intervals.push(setInterval(() => {
          let res = '';
          for(let i=0; i<8; i++) res += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
          this.scrambleCode.set(res);
      }, 50));

      let cycles = 0;
      this.intervals.push(setInterval(() => {
          if (cycles % 5 === 0) {
              this.bigScramble.set(this.teamNames[Math.floor(Math.random() * this.teamNames.length)]);
          } else {
              let res = '';
              for(let i=0; i<8; i++) res += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
              this.bigScramble.set(res);
          }
          cycles++;
      }, 80));
  }

  finishAnimation() {
      this.clearTimers();
      this.phase.set(5);
      this.scrambleCode.set('COMPLETE');
      this.bigScramble.set('COMPLETE');
      
      this.timeouts.push(setTimeout(() => {
          this.store.applyDrawResults();
      }, 1500));
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
