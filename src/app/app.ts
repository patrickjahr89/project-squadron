import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './store.service';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { DashboardComponent } from './dashboard.component';
import { PeopleComponent } from './people.component';
import { TeamsComponent } from './teams.component';
import { DrawConfigComponent } from './draw-config.component';
import { DrawAnimComponent } from './draw-anim.component';
import { DrawResultComponent } from './draw-result.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent, 
    HeaderComponent, 
    DashboardComponent, 
    PeopleComponent, 
    TeamsComponent, 
    DrawConfigComponent, 
    DrawAnimComponent, 
    DrawResultComponent
  ],
  template: `
    <div class="flex h-screen w-full overflow-hidden bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
        <app-sidebar></app-sidebar>
        
        <div class="flex-1 flex flex-col h-full relative overflow-hidden">
            @if (store.view() !== 'draw_anim') {
                <app-header></app-header>
            }
            
            <main class="flex-1 h-full overflow-hidden flex flex-col relative z-0">
                @switch (store.view()) {
                    @case ('dashboard') { <app-dashboard class="h-full"></app-dashboard> }
                    @case ('people') { <app-people class="h-full"></app-people> }
                    @case ('teams') { <app-teams class="h-full"></app-teams> }
                    @case ('draw_config') { <app-draw-config class="h-full"></app-draw-config> }
                    @case ('draw_anim') { <app-draw-anim class="h-full absolute inset-0 z-50"></app-draw-anim> }
                    @case ('draw_result') { <app-draw-result class="h-full"></app-draw-result> }
                }
            </main>
        </div>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  store = inject(StoreService);
}

