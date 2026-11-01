import React from 'react';

import { RICH_TEXT_KEYS, TEXT_KEYS } from '../content/textKeys.js';
import { LocalizedField } from './fields.jsx';

const GROUPS = {
  app: 'Whole site', nav: 'Navigation', hero: 'Hero', about: 'About', skills: 'Skills', certs: 'Certificates',
  cv: 'CV button', projects: 'Projects page', contact: 'Contact page', footer: 'Footer', zoom: 'Picture viewer',
};

const prefixOf = (key) => key.split('.')[0];

// Grouped by the first part of the key, which already names the page area.
export default function PageText({ text, onChange, call }) {
  return (
    <div className="ad-form ad-form-wide">
      {Object.entries(GROUPS).map(([prefix, title]) => (
        <section key={prefix} className="ad-group">
          <h2 className="ad-group-title">{title}</h2>
          {TEXT_KEYS.filter((key) => prefixOf(key) === prefix).map((key) => (
            <LocalizedField
              key={key}
              long={RICH_TEXT_KEYS.includes(key)}
              rich={RICH_TEXT_KEYS.includes(key)}
              field={{ label: key.split('.')[1] }}
              value={text[key]}
              update={(change) => onChange((current) => ({ ...current, [key]: change(current[key]) }))}
              call={call}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
