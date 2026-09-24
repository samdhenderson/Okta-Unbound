import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import KeysTitle from './KeysTitle';

describe('KeysTitle where the browser draws nothing', () => {
  it('mounts without reaching for metrics that do not exist', () => {
    expect(() =>
      render(<KeysTitle text="Okta, unbound." passage={<p>A passage.</p>} />),
    ).not.toThrow();
  });

  it('still renders the sentence, so the still is not lost with the measuring', () => {
    const { container } = render(<KeysTitle text="Okta, unbound." passage={<p>A passage.</p>} />);
    expect(container.textContent).toContain('unbound');
  });
});
