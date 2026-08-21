import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { StoreService } from "../../shared/services/store.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent {
  store = inject(StoreService);
}
