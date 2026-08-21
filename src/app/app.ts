import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "./shared/components/header/header.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterOutlet],
  template: `
    <div
      class="flex h-screen w-full overflow-hidden bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container"
    >
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-full relative overflow-hidden">
        <app-header></app-header>

        <main class="flex-1 h-full overflow-hidden flex flex-col relative z-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrl: "./app.css",
})
export class App {}
