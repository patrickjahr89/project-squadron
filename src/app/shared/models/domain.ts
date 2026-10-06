export type DrawStatus =
  | "idle"
  | "configuring"
  | "prepared"
  | "animating"
  | "completed"
  | "aborted"
  | "failed";

export interface Person {
  id: string;
  name: string;
  role: string;
  skills: string[];
  teamId: string | null;
  avatarUrl?: string;
}

const placeholderAvatarCount = 10;

export function avatarUrlForPerson(
  person: Pick<Person, "id" | "avatarUrl">,
): string {
  if (person.avatarUrl) return person.avatarUrl;

  let hash = 0;
  for (const character of person.id)
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  const placeholderNumber = (Math.abs(hash) % placeholderAvatarCount) + 1;
  return `assets/people/${placeholderNumber}.png`;
}

export interface Team {
  id: string;
  name: string;
  capacity: number;
}

export interface Assignment {
  personId: string;
  teamId: string;
}

export interface DrawPlan {
  seed: number;
  dataVersion: number;
  personIds: string[];
  teamIds: string[];
  capacities: Record<string, number>;
  assignments: Assignment[];
}

export interface DrawResult {
  id: string;
  time: Date;
  assignments: Assignment[];
  people: Person[];
  teams: Team[];
}

export interface DrawSnapshot {
  people: readonly Person[];
  teams: readonly Team[];
  selectedPersonIds: readonly string[];
  selectedTeamIds: readonly string[];
}

export interface DrawValidation {
  valid: boolean;
  message: string | null;
}

export function teamMembers(
  people: readonly Person[],
  teamId: string,
): Person[] {
  return people.filter((person) => person.teamId === teamId);
}

export function freeCapacity(people: readonly Person[], team: Team): number {
  return Math.max(0, team.capacity - teamMembers(people, team.id).length);
}

export function validatePerson(
  person: Person,
  existingIds: readonly string[] = [],
): string | null {
  if (!person.id.trim()) return "Person ID is required.";
  if (existingIds.includes(person.id))
    return `Person ID ${person.id} already exists.`;
  if (!person.name.trim()) return "Person name is required.";
  if (!Array.isArray(person.skills)) return "Person skills must be a list.";
  return null;
}

export function validateTeam(
  team: Team,
  existingIds: readonly string[] = [],
  memberCount = 0,
): string | null {
  if (!team.id.trim()) return "Team ID is required.";
  if (existingIds.includes(team.id))
    return `Team ID ${team.id} already exists.`;
  if (!team.name.trim()) return "Team name is required.";
  if (!Number.isInteger(team.capacity) || team.capacity < 1)
    return "Team capacity must be a positive integer.";
  if (team.capacity < memberCount)
    return `Team capacity cannot be below its current membership (${memberCount}).`;
  return null;
}

export function validateDraw(snapshot: DrawSnapshot): DrawValidation {
  const people = new Map(snapshot.people.map((person) => [person.id, person]));
  const teams = new Map(snapshot.teams.map((team) => [team.id, team]));
  const selectedPeople = snapshot.selectedPersonIds
    .map((id) => people.get(id))
    .filter((person): person is Person => !!person);
  const selectedTeams = snapshot.selectedTeamIds
    .map((id) => teams.get(id))
    .filter((team): team is Team => !!team);
  if (!selectedPeople.length)
    return { valid: false, message: "Select at least one available person." };
  if (!selectedTeams.length)
    return {
      valid: false,
      message: "Select at least one team with free capacity.",
    };
  if (selectedPeople.some((person) => person.teamId !== null))
    return {
      valid: false,
      message: "Assigned people cannot participate in a draw.",
    };
  if (selectedTeams.some((team) => freeCapacity(snapshot.people, team) === 0))
    return {
      valid: false,
      message: "Full teams cannot participate in a draw.",
    };
  const capacity = selectedTeams.reduce(
    (sum, team) => sum + freeCapacity(snapshot.people, team),
    0,
  );
  if (selectedPeople.length > capacity)
    return {
      valid: false,
      message: `Not enough free slots: ${selectedPeople.length} people, ${capacity} slots.`,
    };
  return { valid: true, message: null };
}

function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], next: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(next() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createDrawPlan(
  snapshot: DrawSnapshot,
  seed = Date.now(),
  dataVersion = 1,
): DrawPlan {
  const validation = validateDraw(snapshot);
  if (!validation.valid) throw new Error(validation.message ?? "Invalid draw.");
  const next = random(seed);
  const people = shuffle(snapshot.selectedPersonIds, next);
  const teams = [...snapshot.selectedTeamIds];
  const capacities = Object.fromEntries(
    teams.map((id) => [
      id,
      freeCapacity(
        snapshot.people,
        snapshot.teams.find((team) => team.id === id)!,
      ),
    ]),
  );
  const assignments: Assignment[] = [];
  for (const personId of people) {
    const availableTeams = teams.filter((teamId) => capacities[teamId] > 0);
    const teamId = availableTeams[Math.floor(next() * availableTeams.length)];
    assignments.push({ personId, teamId });
    capacities[teamId]--;
  }
  return Object.freeze({
    seed,
    dataVersion,
    personIds: [...snapshot.selectedPersonIds],
    teamIds: [...snapshot.selectedTeamIds],
    capacities: { ...capacities },
    assignments: [...assignments],
  });
}

export function validateDrawPlan(
  plan: DrawPlan,
  snapshot: DrawSnapshot,
): DrawValidation {
  const current = validateDraw({
    ...snapshot,
    selectedPersonIds: plan.personIds,
    selectedTeamIds: plan.teamIds,
  });
  if (!current.valid) return current;
  if (plan.assignments.length !== plan.personIds.length)
    return { valid: false, message: "Draw plan is incomplete." };
  const validPeople = new Set(plan.personIds);
  const validTeams = new Set(plan.teamIds);
  const assignedPeople = new Set<string>();
  const used = new Map<string, number>();
  for (const assignment of plan.assignments) {
    if (
      !validPeople.has(assignment.personId) ||
      !validTeams.has(assignment.teamId) ||
      assignedPeople.has(assignment.personId)
    )
      return {
        valid: false,
        message: "Draw plan contains an invalid assignment.",
      };
    assignedPeople.add(assignment.personId);
    used.set(assignment.teamId, (used.get(assignment.teamId) ?? 0) + 1);
  }
  for (const teamId of plan.teamIds)
    if (
      (used.get(teamId) ?? 0) >
      freeCapacity(
        snapshot.people,
        snapshot.teams.find((team) => team.id === teamId)!,
      )
    )
      return { valid: false, message: "Draw plan exceeds team capacity." };
  return { valid: true, message: null };
}
