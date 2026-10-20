export type EventLevel = "info" | "warning" | "error";

export type WebhookEvent = {
  id: string;
  label: string;
  description: string;
  level: EventLevel;
};

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    id: "error",
    label: "Error detected",
    description: "An error shows up in the server log.",
    level: "error",
  },
  {
    id: "tps",
    label: "TPS dropped",
    description: "The server runs below its target TPS.",
    level: "warning",
  },
  {
    id: "crash",
    label: "Server crashed",
    description: "The server went down unexpectedly.",
    level: "error",
  },
  {
    id: "start",
    label: "Server started",
    description: "The server finished starting up.",
    level: "info",
  },
  {
    id: "stop",
    label: "Server stopped",
    description: "The server shut down on purpose.",
    level: "info",
  },
  {
    id: "custom",
    label: "Custom alert",
    description: "Anything one of your scripts sends.",
    level: "info",
  },
];

export const ALL_EVENT_IDS = WEBHOOK_EVENTS.map((event) => event.id);

export function eventById(id: string): WebhookEvent | null {
  return WEBHOOK_EVENTS.find((event) => event.id === id) ?? null;
}

export function isLevel(value: unknown): value is EventLevel {
  return value === "info" || value === "warning" || value === "error";
}
