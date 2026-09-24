import React from 'react';

export interface HeadlineProps {
  text: string;
  subline?: string;
  size?: 'hero' | 'chapter';
  id?: string;
}

const SIZE: Record<NonNullable<HeadlineProps['size']>, string> = {
  hero: 'text-5xl sm:text-6xl lg:text-7xl',
  chapter: 'text-4xl sm:text-5xl lg:text-6xl',
};

const Headline: React.FC<HeadlineProps> = ({ text, subline, size = 'chapter', id }) => {
  const words = text.split(' ');
  return (
    <div className="flex max-w-(--guide-prose-w) flex-col gap-5">
      <h2
        id={id}
        aria-label={text}
        className={`guide-headline ${SIZE[size]} font-semibold leading-none tracking-tight text-balance text-neutral-900`}
      >
        {words.map((word, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="inline-block"
            style={{ '--guide-i': index } as React.CSSProperties}
          >
            {word}
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </h2>
      {subline ? (
        <p
          className="guide-subline max-w-prose text-lg leading-relaxed text-pretty text-neutral-600"
          style={{ '--guide-i': words.length } as React.CSSProperties}
        >
          {subline}
        </p>
      ) : null}
    </div>
  );
};

export default Headline;
