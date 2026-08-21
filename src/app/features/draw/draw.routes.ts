import { Routes } from "@angular/router";
import { DrawAnimComponent } from "./draw-anim.component";
import { DrawConfigComponent } from "./draw-config.component";

export const drawRoutes: Routes = [
  { path: "draw/config", component: DrawConfigComponent },
  { path: "draw/animation", component: DrawAnimComponent },
];
