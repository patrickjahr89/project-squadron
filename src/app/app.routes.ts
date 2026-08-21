import { Routes } from "@angular/router";
import { dashboardRoutes } from "./features/dashboard/dashboard.routes";
import { peopleRoutes } from "./features/people/people.routes";
import { teamsRoutes } from "./features/teams/teams.routes";
import { drawRoutes } from "./features/draw/draw.routes";
import { resultsRoutes } from "./features/results/results.routes";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  ...dashboardRoutes,
  ...peopleRoutes,
  ...teamsRoutes,
  ...drawRoutes,
  ...resultsRoutes,
  { path: "**", redirectTo: "dashboard" },
];
