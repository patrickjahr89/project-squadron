import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="hidden md:flex flex-col h-full py-margin bg-surface-container-lowest border-r border-outline-variant w-64 shrink-0 transition-all duration-200 ease-in-out relative z-20">
      <div class="px-margin mb-8 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 border border-outline-variant rounded overflow-hidden p-0.5">
            <img alt="System Operator Avatar" class="w-full h-full object-cover grayscale opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrsinqkYV7pDibgTe_zeYGFwM-THt_6PKfmRUDe3oLXyq7nBW5zn_j3n5lWRJ8AJIiYvXFMXq-ljzx3ZcL0l_zfyztaIoKtBKr82dONXrzl_529Z4pJPcw3JM-L0KyAtuw8-PkxAwLir7hbxAru3W9FXZumwRGfL_wrntjcvJHb1dLmI9F2bRhwokQTAWm3U2v2zJp9OQRlalrr2fAIR-jTN5yWOCo2Tn7rtEQT8QaLUsWfCjkYuqW" />
          </div>
          <div>
            <div class="font-headline-md text-headline-md font-bold text-primary tracking-tighter uppercase text-sm">CMD_CENTER</div>
            <div class="font-label-sm text-label-sm text-on-surface-variant font-code-md">v2.0.4-stable</div>
          </div>
        </div>
      </div>
      
      <nav class="flex-1 overflow-y-auto overflow-x-hidden w-full flex flex-col gap-1 px-4">
        <button (click)="store.navigate('dashboard')" 
                [ngClass]="store.view() === 'dashboard' ? 'text-primary font-bold border-l-2 border-primary-container bg-surface-container-low fill-icon' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary border-l-2 border-transparent'" 
                class="group flex items-center gap-3 py-3 px-3 pl-4 transition-all duration-200 ease-in-out font-label-sm text-label-sm rounded w-full text-left">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" [ngClass]="store.view() === 'dashboard' ? 'text-primary-container' : ''">dashboard</span>
          <span class="tracking-widest uppercase" [ngClass]="store.view() === 'dashboard' ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.4)]' : ''">Dashboard</span>
        </button>
        <button (click)="store.navigate('people')" 
                [ngClass]="store.view() === 'people' ? 'text-primary font-bold border-l-2 border-primary-container bg-surface-container-low fill-icon' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary border-l-2 border-transparent'" 
                class="group flex items-center gap-3 py-3 px-3 pl-4 transition-all duration-200 ease-in-out font-label-sm text-label-sm rounded w-full text-left">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" [ngClass]="store.view() === 'people' ? 'text-primary-container' : ''">groups</span>
          <span class="tracking-widest uppercase" [ngClass]="store.view() === 'people' ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.4)]' : ''">People</span>
        </button>
        <button (click)="store.navigate('teams')" 
                [ngClass]="store.view() === 'teams' ? 'text-primary font-bold border-l-2 border-primary-container bg-surface-container-low fill-icon' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary border-l-2 border-transparent'" 
                class="group flex items-center gap-3 py-3 px-3 pl-4 transition-all duration-200 ease-in-out font-label-sm text-label-sm rounded w-full text-left">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" [ngClass]="store.view() === 'teams' ? 'text-primary-container' : ''">hub</span>
          <span class="tracking-widest uppercase" [ngClass]="store.view() === 'teams' ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.4)]' : ''">Teams</span>
        </button>
        <button (click)="store.initiateDrawConfig()" 
                [ngClass]="store.view() === 'draw_config' ? 'text-primary font-bold border-l-2 border-primary-container bg-surface-container-low fill-icon' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary border-l-2 border-transparent'" 
                class="group flex items-center gap-3 py-3 px-3 pl-4 transition-all duration-200 ease-in-out font-label-sm text-label-sm rounded w-full text-left">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" [ngClass]="store.view() === 'draw_config' ? 'text-primary-container' : ''">shuffle</span>
          <span class="tracking-widest uppercase" [ngClass]="store.view() === 'draw_config' ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.4)]' : ''">Draw</span>
        </button>
        <button (click)="store.navigate('draw_result')" 
                [ngClass]="store.view() === 'draw_result' ? 'text-primary font-bold border-l-2 border-primary-container bg-surface-container-low fill-icon' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary border-l-2 border-transparent'" 
                class="group flex items-center gap-3 py-3 px-3 pl-4 transition-all duration-200 ease-in-out font-label-sm text-label-sm rounded w-full text-left">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" [ngClass]="store.view() === 'draw_result' ? 'text-primary-container' : ''">analytics</span>
          <span class="tracking-widest uppercase" [ngClass]="store.view() === 'draw_result' ? 'drop-shadow-[0_0_8px_rgba(0,255,194,0.4)]' : ''">Results</span>
        </button>
      </nav>
      
      <div class="px-margin mt-auto pt-6 flex flex-col gap-4">
        <button (click)="store.initiateDrawConfig()" class="w-full border border-primary-container bg-surface-container-lowest text-primary-container hover:bg-primary-container hover:text-background py-2 px-4 font-label-sm text-label-sm uppercase transition-all duration-200 shadow-[0_0_10px_rgba(0,255,194,0)] hover:shadow-[0_0_15px_rgba(0,255,194,0.4)] flex justify-center items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">terminal</span>
            INITIATE_DRAW
        </button>
        <div class="w-full h-px bg-outline-variant"></div>
        <nav class="flex flex-col gap-1 w-full mt-2">
            <button class="group flex items-center gap-3 py-2 pl-2 text-on-surface-variant transition-all duration-200 ease-in-out hover:bg-surface-container-highest hover:text-primary w-full text-left">
                <span class="material-symbols-outlined text-[18px]">settings</span>
                <span class="font-label-sm text-label-sm tracking-widest uppercase">Settings</span>
            </button>
            <button class="group flex items-center gap-3 py-2 pl-2 text-on-surface-variant transition-all duration-200 ease-in-out hover:bg-surface-container-highest hover:text-primary w-full text-left">
                <span class="material-symbols-outlined text-[18px]">terminal</span>
                <span class="font-label-sm text-label-sm tracking-widest uppercase">System Status</span>
            </button>
        </nav>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  store = inject(StoreService);
}
