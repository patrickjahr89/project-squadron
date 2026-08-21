import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StoreService } from "../../services/store.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
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
