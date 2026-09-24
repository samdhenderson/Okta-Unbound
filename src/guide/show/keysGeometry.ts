export const KEY_PATH =
  'm19.8.26-.74 9.12c-.35-.04-.7-.06-1.06-.06-.45 0-.89.03-1.32.1L16.26 5c-.01-.14.1-.26.24-.26h.75L16.89.27c-.01-.14.1-.26.23-.26h2.45c.14 0 .25.12.23.26Z';

export const N = 18;

export const S = 10;

export const PX = 18;
export const PY = 4.715;

export const R = (PX - PY) * S;

export const P = (2 * Math.PI * R) / N;

export const CY = 540;
export const CX0 = 960;
export const CX1 = 640;

const D2R = Math.PI / 180;

const SWEEP = 760;

const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

const easeInQuad = (t: number): number => t * t;

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const ARRIVE = 7;
const TITLE = 4;
const RAILROAD = 6;

const SETTLE = 3;

const AT_TITLE = ARRIVE;
const AT_RAILROAD = AT_TITLE + TITLE;
const AT_SETTLE = AT_RAILROAD + RAILROAD;

export const RUN = ARRIVE + TITLE + RAILROAD + SETTLE;

const cue = (at: number, length: number, from: number, to: number): [number, number] => [
  at + from * length,
  at + to * length,
];

const BETA_IN = cue(0, ARRIVE, 0.1 / 4.0, 3.7 / 4.0);
const SHIFT = cue(AT_TITLE, TITLE, 0, 0.9 / 2.6);
const WORD_IN = cue(AT_TITLE, TITLE, 0.45 / 2.6, 1.2 / 2.6);
const BETA_OUT = cue(AT_RAILROAD, RAILROAD, 0.2 / 4.0, 3.8 / 4.0);

const LEAD_OUT = cue(AT_RAILROAD, RAILROAD, 0.6, 1);
const REST_CENTRE = cue(AT_RAILROAD, RAILROAD, 0.45, 1);
const PASSAGE_IN = cue(AT_SETTLE, SETTLE, 0, 0.55);

function ramp(t: number, [start, end]: [number, number], ease: (x: number) => number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return ease((t - start) / (end - start));
}

export interface KeyPose {
  id: number;
  x: number;
  y: number;
  deg: number;
}

const mod360 = (deg: number): number => ((deg % 360) + 360) % 360;

const baseAngle = (j: number): number => (j - 8.5) * 20;

function onCircle(id: number, phi: number, cx: number): KeyPose {
  const rad = phi * D2R;
  return { id, x: cx - R * Math.cos(rad), y: CY + R * Math.sin(rad), deg: -90 - phi };
}

export function arrivalPoses(beta: number, cx: number): KeyPose[] {
  const poses: KeyPose[] = [];
  for (let id = 0; id < N; id += 1) {
    const phi0 = baseAngle(id);
    const joins = mod360(180 - phi0);
    if (beta < joins) poses.push(onCircle(id, phi0 + beta, cx));
    else poses.push({ id, x: cx + R, y: CY - (beta - joins) * D2R * R, deg: 90 });
  }
  return poses;
}

export function departurePoses(beta: number): KeyPose[] {
  const poses: KeyPose[] = [];
  for (let id = 0; id < N; id += 1) {
    const phi0 = baseAngle(id);
    const sheds = mod360(phi0 - 90);
    if (beta < sheds) poses.push(onCircle(id, phi0 - beta, CX1));
    else poses.push({ id, x: CX1 - (beta - sheds) * D2R * R, y: CY + R, deg: -180 });
  }
  return poses;
}

export function centreAt(t: number): number {
  return CX0 + (CX1 - CX0) * ramp(t, SHIFT, easeInOutCubic);
}

export function posesAt(t: number): KeyPose[] {
  if (t < AT_RAILROAD) {
    return arrivalPoses(SWEEP * (1 - ramp(t, BETA_IN, easeOutQuad)), centreAt(t));
  }
  return departurePoses(SWEEP * ramp(t, BETA_OUT, easeInQuad));
}

export function settledPoses(): KeyPose[] {
  return arrivalPoses(0, CX1);
}

export function sentenceAt(t: number): { opacity: number; dx: number } {
  const landed = ramp(t, WORD_IN, easeOutCubic);
  return { opacity: landed, dx: (1 - landed) * -28 };
}

export function leadOutAt(t: number): number {
  return -LEAD_TRAVEL * ramp(t, LEAD_OUT, easeInQuad);
}

const LEAD_TRAVEL = 2600;

export function restCentredAt(t: number): number {
  return ramp(t, REST_CENTRE, easeInOutCubic);
}

export function passageAt(t: number): number {
  return ramp(t, PASSAGE_IN, easeOutCubic);
}

export const WORD_X = CX1 + R + 150;
export const WORD_Y = CY + 34;

export function cameraAt(t: number): number {
  return 1.012 + (1 - 1.012) * ramp(t, [0, AT_RAILROAD], easeOutCubic);
}
