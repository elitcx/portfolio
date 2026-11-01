import React from 'react';

import { parseRichText } from '../lib/richText.js';
import { BIRTH_DATE, computeAge, yearsCoding } from '../utils/Constants.js';

const STRONG = { color: 'var(--fg)', fontWeight: 600 };

export default function RichText({ value, vars }) {
  const segments = parseRichText(value, {
    age: computeAge(BIRTH_DATE),
    years: yearsCoding(),
    ...vars,
  });

  return segments.map((segment, i) => {
    if (segment.type === 'br') return <br key={i} />;
    if (segment.type === 'bold') return <strong key={i} style={STRONG}>{segment.value}</strong>;
    return <React.Fragment key={i}>{segment.value}</React.Fragment>;
  });
}
