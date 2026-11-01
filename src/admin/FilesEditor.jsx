import React, { useState } from 'react';

import { CV } from '../utils/Constants.js';
import { PictureField } from './fields.jsx';

export default function FilesEditor({ banner, onBanner, previewOf, uploadPicture, uploadCv }) {
  const [cvState, setCvState] = useState(null);

  const pickCv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCvState({ busy: true });
    try {
      await uploadCv(file);
      setCvState({ done: `${file.name} is ready. Save & publish to replace the CV.` });
    } catch (failure) {
      setCvState({ error: failure.message });
    }
  };

  return (
    <div className="ad-form ad-form-wide">
      <PictureField
        label="Banner picture"
        value={banner}
        previewOf={previewOf}
        onPick={async (file) => onBanner(await uploadPicture('banner', 'banner', file))}
      />
      <p className="ad-hint">
        The picture shown when your site is shared on LinkedIn or WhatsApp does not change with this.
        Update it from a computer with <code>npm run og</code>, then push.
      </p>

      <div className="ad-field">
        <span className="ad-label">CV (PDF, up to 3 MB)</span>
        <div className="ad-picture">
          <a className="ad-link" href={CV.href} target="_blank" rel="noopener noreferrer">Current CV</a>
          <label className="ad-secondary ad-file">
            {cvState?.busy ? 'Uploading…' : 'Replace CV'}
            <input type="file" accept="application/pdf" onChange={pickCv} disabled={cvState?.busy} />
          </label>
        </div>
        {cvState?.done && <span className="ad-note" role="status">{cvState.done}</span>}
        {cvState?.error && <span className="ad-error" role="alert">{cvState.error}</span>}
      </div>
    </div>
  );
}
