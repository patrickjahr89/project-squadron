import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './store.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="w-full h-16 border-b border-outline-variant bg-surface-container shadow-[0_0_10px_rgba(0,255,194,0.1)] flex justify-between items-center px-margin shrink-0 z-40 relative">
      <div class="flex items-center gap-4">
        <button class="md:hidden text-on-surface-variant hover:text-primary-fixed-dim transition-colors cursor-pointer active:opacity-80">
            <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="font-headline-md text-headline-md text-primary-container font-bold tracking-tight uppercase">TEAM_RANDOMIZER_OS</div>
      </div>
      
      <div class="hidden lg:flex items-center gap-8">
        <div class="text-primary-container font-bold font-code-md text-code-md cursor-pointer active:opacity-80 flex items-center gap-2">
            <div class="w-2 h-2 bg-primary-container rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,194,0.8)]"></div>
            SESSION: {{ now | date:'HH:mm:ss' }}
        </div>
        <div class="text-on-surface-variant font-code-md text-code-md hover:text-primary-fixed-dim transition-colors cursor-pointer active:opacity-80">
            STATUS: SYSTEM READY
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <button class="text-on-surface-variant hover:text-primary-fixed-dim transition-colors cursor-pointer active:opacity-80 relative">
            <span class="material-symbols-outlined">notifications_active</span>
            <span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface-container"></span>
        </button>
        <button class="text-on-surface-variant hover:text-primary-fixed-dim transition-colors cursor-pointer active:opacity-80 hidden sm:block">
            <span class="material-symbols-outlined">help_outline</span>
        </button>
        
        <div class="w-px h-6 bg-outline-variant mx-2"></div>
        
        <button class="font-label-sm text-label-sm uppercase text-background bg-primary-container hover:bg-primary-fixed px-3 py-1.5 transition-colors border border-primary-container shadow-[0_0_10px_rgba(0,255,194,0.2)]">
            NEW SESSION
        </button>
        
        <div class="w-8 h-8 ml-2 border border-outline-variant p-0.5 cursor-pointer hover:border-primary-container transition-colors shrink-0 overflow-hidden">
            <img alt="User Profile" class="w-full h-full object-cover grayscale opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArRO-VyQxll1dzS5OKN7EiTmY2nyZ8OD1visx3TLC1nI78Cr3pERDN2hRKHHSnh25RW_IWuljTPmCW9AqX2zEDQuADu6Hp2TTB6K55qwJqms5PPtCM1iXfKX6Pkjog6wg8HE3dCXDnMH9_snvd_KKl97yoVxqFH9QEABZ6QrcXTtGUXomMYT4GOhj0ace5YU4k5rRovluUb28SdM_u-Nq36NQXoAb7UFhO_bOURUrQ3FRXRF2gLHhG"/>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  store = inject(StoreService);
  now = new Date();
  
  constructor() {
    setInterval(() => {
        this.now = new Date();
    }, 1000);
  }
}
