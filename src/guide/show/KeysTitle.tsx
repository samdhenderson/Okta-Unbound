import React, { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../sidepanel/hooks/useReducedMotion';
import { motionAvailable, readDurToken } from './motion';
import {
  KEY_PATH,
  N,
  PX,
  PY,
  RUN,
  S,
  WORD_X,
  WORD_Y,
  cameraAt,
  leadOutAt,
  passageAt,
  posesAt,
  restCentredAt,
  sentenceAt,
  settledPoses,
  type KeyPose,
} from './keysGeometry';

const TITLE_CX = 1014;
const TITLE_CY = 540;

const FRAME_MIN_W = 1180;
const FRAME_MIN_H = 1080;

function frameFor(aspect: number): string {
  const w = Math.max(FRAME_MIN_W, FRAME_MIN_H * aspect);
  const h = w / aspect;
  return `${TITLE_CX - w / 2} ${TITLE_CY - h / 2} ${w} ${h}`;
}

const START_RATIO = 0.5;

const transformOf = (pose: KeyPose): string =>
  `translate(${pose.x.toFixed(2)} ${pose.y.toFixed(2)}) rotate(${pose.deg.toFixed(3)}) scale(${S}) translate(${-PX} ${-PY})`;

export interface KeysTitleProps {
  text: string;
  passage: React.ReactNode;
}

const KeysTitle: React.FC<KeysTitleProps> = ({ text, passage }) => {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cameraRef = useRef<SVGGElement | null>(null);
  const leadRef = useRef<SVGTextElement | null>(null);
  const restRef = useRef<SVGTextElement | null>(null);
  const refRestRef = useRef<SVGTSpanElement | null>(null);
  const keyRefs = useRef<Array<SVGPathElement | null>>([]);

  const comma = text.indexOf(',');
  const lead = comma === -1 ? text : text.slice(0, comma + 1);
  const rest = (comma === -1 ? '' : text.slice(comma + 1)).trim();

  const places = useRef({ restX: WORD_X, restCentredX: TITLE_CX });

  const measure = useCallback(() => {
    const restEl = refRestRef.current;
    if (!restEl || !rest) return;
    if (!restEl.getClientRects().length) return;
    const width = restEl.getSubStringLength(1, rest.length);
    if (!width) return;
    places.current = {
      restX: restEl.getStartPositionOfChar(1).x,
      restCentredX: TITLE_CX - width / 2,
    };
  }, [rest]);

  const paint = useCallback((t: number | null) => {
    (t === null ? settledPoses() : posesAt(t)).forEach((pose, index) => {
      keyRefs.current[index]?.setAttribute('transform', transformOf(pose));
    });

    const { opacity, dx } = t === null ? { opacity: 1, dx: 0 } : sentenceAt(t);
    const leadEl = leadRef.current;
    if (leadEl) {
      leadEl.setAttribute('x', String(WORD_X + dx + (t === null ? 0 : leadOutAt(t))));
      leadEl.setAttribute('opacity', opacity.toFixed(3));
    }
    const restEl = restRef.current;
    if (restEl) {
      const { restX, restCentredX } = places.current;
      const centred = t === null ? 0 : restCentredAt(t);
      restEl.setAttribute('x', String(restX + dx + (restCentredX - restX) * centred));
      restEl.setAttribute('opacity', opacity.toFixed(3));
    }

    const camera = cameraRef.current;
    if (camera) {
      const scale = t === null ? 1 : cameraAt(t);
      camera.setAttribute(
        'transform',
        `translate(${TITLE_CX} ${TITLE_CY}) scale(${scale.toFixed(5)}) translate(${-TITLE_CX} ${-TITLE_CY})`,
      );
    }

    const wrap = wrapRef.current;
    if (wrap) {
      wrap.setAttribute('data-passage', (t === null ? 1 : passageAt(t)) > 0 ? 'in' : 'waiting');
      const alone = t !== null && restCentredAt(t) > 0.5;
      wrap.setAttribute('data-word', alone ? 'alone' : 'paired');
    }
  }, []);

  const settle = useCallback(() => paint(null), [paint]);

  useEffect(() => {
    measure();
    settle();
  }, [measure, settle]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box || box.width <= 0 || box.height <= 0) return;
      svg.setAttribute('viewBox', frameFor(box.width / box.height));
      measure();
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (reduced || !motionAvailable() || typeof IntersectionObserver !== 'function') return;
    const tell = readDurToken('--dur-tell');
    if (tell <= 0) return;

    let raf = 0;
    let origin = 0;
    let spent = false;

    const frame = (now: number) => {
      if (!origin) origin = now;
      const t = (now - origin) / tell;
      if (t >= RUN) {
        spent = true;
        raf = 0;
        paint(RUN);
        return;
      }
      paint(t);
      raf = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
      origin = 0;
      settle();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || spent) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= START_RATIO;
        if (visible && !raf) raf = window.requestAnimationFrame(frame);
        else if (!visible) stop();
      },
      { threshold: [0, START_RATIO, 1] },
    );
    observer.observe(svg);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [reduced, paint, settle]);

  return (
    <div ref={wrapRef} className="guide-card" data-passage="in">
      <svg
        ref={svgRef}
        className="guide-keys-title"
        viewBox={frameFor(16 / 9)}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <g ref={cameraRef}>
          {Array.from({ length: N }, (_, index) => (
            <path
              key={index}
              ref={(node) => {
                keyRefs.current[index] = node;
              }}
              d={KEY_PATH}
              fill="currentColor"
            />
          ))}
          <text
            y={WORD_Y}
            x={WORD_X}
            fontSize={104}
            letterSpacing={-2.4}
            visibility="hidden"
            aria-hidden="true"
          >
            <tspan fontWeight={600}>{lead}</tspan>
            <tspan ref={refRestRef} fontWeight={400}>
              {` ${rest}`}
            </tspan>
          </text>
          <text
            ref={leadRef}
            y={WORD_Y}
            fontSize={104}
            letterSpacing={-2.4}
            fontWeight={600}
            fill="currentColor"
            className="guide-keys-title-half"
          >
            {lead}
          </text>
          <text
            ref={restRef}
            y={WORD_Y}
            fontSize={104}
            letterSpacing={-2.4}
            fontWeight={400}
            className="guide-keys-title-half guide-keys-title-rest"
          >
            {rest}
          </text>
        </g>
      </svg>
      <div className="guide-card-passage">{passage}</div>
    </div>
  );
};

export default KeysTitle;
