import { describe, expect, it } from 'vitest';
import {
  CX1,
  CY,
  N,
  P,
  R,
  RUN,
  WORD_X,
  arrivalPoses,
  cameraAt,
  centreAt,
  departurePoses,
  leadOutAt,
  passageAt,
  posesAt,
  restCentredAt,
  sentenceAt,
  settledPoses,
} from './keysGeometry';

const FRAMES = Array.from({ length: RUN * 10 + 1 }, (_, i) => i / 10);

const mod360 = (deg: number): number => ((deg % 360) + 360) % 360;

const sameTurn = (a: number, b: number): boolean => {
  const apart = mod360(a - b);
  return Math.min(apart, 360 - apart) < 1e-6;
};

describe('keysTitle geometry', () => {
  it('renders exactly 18 keys, with the same ids, in every frame', () => {
    const ids = Array.from({ length: N }, (_, i) => i);
    for (const t of FRAMES) {
      const poses = posesAt(t);
      expect(poses).toHaveLength(N);
      expect(poses.map((pose) => pose.id)).toEqual(ids);
    }
  });

  it('spaces the track at the circle arc pitch', () => {
    const rungs = posesAt(0.5)
      .filter((pose) => pose.deg === 90)
      .map((pose) => pose.y)
      .sort((a, b) => a - b);
    expect(rungs.length).toBeGreaterThan(2);
    for (let i = 1; i < rungs.length; i += 1) {
      expect(rungs[i]! - rungs[i - 1]!).toBeCloseTo(P, 6);
    }
    expect(P).toBeCloseTo((2 * Math.PI * R) / N, 12);
  });

  it('turns no key as it joins the circle or detaches from it', () => {
    for (let id = 0; id < N; id += 1) {
      const phi0 = (id - 8.5) * 20;

      const joins = mod360(180 - phi0);
      const onCircle = arrivalPoses(joins - 1e-9, CX1)[id]!;
      const asRung = arrivalPoses(joins, CX1)[id]!;
      expect(sameTurn(onCircle.deg, asRung.deg)).toBe(true);
      expect(onCircle.x).toBeCloseTo(asRung.x, 6);
      expect(onCircle.y).toBeCloseTo(asRung.y, 6);

      const sheds = mod360(phi0 - 90);
      const stillSpoke = departurePoses(sheds - 1e-9)[id]!;
      const asTie = departurePoses(sheds)[id]!;
      expect(sameTurn(stillSpoke.deg, asTie.deg)).toBe(true);
      expect(stillSpoke.x).toBeCloseTo(asTie.x, 6);
      expect(stillSpoke.y).toBeCloseTo(asTie.y, 6);
    }
  });

  it('settles on the mark: 18 spokes, 20 degrees apart, all at the spoke radius', () => {
    const poses = settledPoses();
    for (const pose of poses) {
      expect(Math.hypot(pose.x - CX1, pose.y - CY)).toBeCloseTo(R, 9);
    }
    const spokes = poses
      .map((pose) => ((pose.deg % 360) + 360) % 360)
      .sort((a, b) => a - b)
      .map((deg) => Math.round(deg));
    expect(new Set(spokes).size).toBe(N);
    for (let i = 1; i < spokes.length; i += 1) {
      expect(spokes[i]! - spokes[i - 1]!).toBe(20);
    }
  });

  it('opens and ends on a frame with no key in it', () => {
    for (const t of [0, RUN]) {
      for (const pose of posesAt(t)) {
        const inFrame = pose.x > -R && pose.x < 1920 + R && pose.y > -R && pose.y < 1080 + R;
        expect(inFrame).toBe(false);
      }
    }
  });
});

describe('keysTitle timeline', () => {
  it('holds the logo still while the keys arrive, then slides it left once', () => {
    expect(centreAt(0)).toBe(960);
    expect(centreAt(6.9)).toBe(960);
    expect(centreAt(RUN)).toBe(CX1);
    let previous = Infinity;
    for (const t of FRAMES) {
      const cx = centreAt(t);
      expect(cx).toBeLessThanOrEqual(previous + 1e-9);
      previous = cx;
    }
  });

  it('brings the sentence in after the logo has moved, and never takes it away', () => {
    expect(sentenceAt(0).opacity).toBe(0);
    expect(sentenceAt(7).opacity).toBe(0);
    expect(sentenceAt(10).opacity).toBe(1);
    expect(sentenceAt(RUN).opacity).toBe(1);
    expect(sentenceAt(10).dx).toBeCloseTo(0, 12);
    expect(sentenceAt(7.7).dx).toBeLessThan(0);
  });

  it('sends the lead away with the track and leaves the rest standing', () => {
    expect(leadOutAt(10)).toBeCloseTo(0, 12);
    expect(restCentredAt(10)).toBe(0);
    expect(leadOutAt(RUN - 1)).toBeLessThan(0);
    expect(leadOutAt(RUN)).toBeLessThan(-1920);
    expect(restCentredAt(RUN)).toBe(1);
    let previous = -1;
    for (const t of FRAMES) {
      const centred = restCentredAt(t);
      expect(centred).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = centred;
    }
  });

  it('never walks the lead into a key that is still on the circle', () => {
    const rim = CX1 + R;
    for (const t of FRAMES) {
      const onCircle = posesAt(t).some((pose) => pose.deg !== -180 && pose.deg !== 90);
      if (!onCircle) continue;
      expect(WORD_X + leadOutAt(t), `lead has reached the circle at ${t}`).toBeGreaterThan(rim);
    }
  });

  it('holds the passage back until the track has gone and the word has moved', () => {
    expect(passageAt(0)).toBe(0);
    expect(passageAt(13)).toBe(0);
    expect(restCentredAt(17)).toBe(1);
    expect(passageAt(RUN)).toBe(1);
  });

  it('keeps the camera within a hair of 1 and settles it by the title', () => {
    expect(cameraAt(0)).toBeCloseTo(1.012, 6);
    expect(cameraAt(11)).toBe(1);
    for (const t of FRAMES) {
      expect(cameraAt(t)).toBeGreaterThanOrEqual(1);
      expect(cameraAt(t)).toBeLessThanOrEqual(1.012);
    }
  });

  it('runs for whole tells, so the card can be timed from the motion scale alone', () => {
    expect(RUN).toBe(20);
    expect(Number.isInteger(RUN)).toBe(true);
  });
});
