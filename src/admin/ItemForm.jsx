import React, { useState } from 'react';

import { SCHEMAS } from '../lib/contentSchema.js';
import {
  LinkField,
  LocalizedField,
  NumberField,
  PictureField,
  SelectField,
  SwitchField,
  TagsField,
  TextField,
} from './fields.jsx';

export default function ItemForm({ schemaName, item, canDelete, onChange, onDelete, call, previewOf, uploadPicture }) {
  const [confirming, setConfirming] = useState(false);

  const fields = Object.entries(SCHEMAS[schemaName]).map(([key, field]) => {
    const props = { key, field, value: item[key], onChange: (value) => onChange((it) => ({ ...it, [key]: value })) };
    const update = (change) => onChange((it) => ({ ...it, [key]: change(it[key]) }));

    switch (field.type) {
      case 'text': return <TextField {...props} />;
      case 'loc': return <LocalizedField key={key} field={field} value={item[key]} update={update} call={call} />;
      case 'locLong': return <LocalizedField key={key} field={field} value={item[key]} update={update} call={call} long rich />;
      case 'link': return <LinkField {...props} />;
      case 'number': return <NumberField {...props} />;
      case 'select': return <SelectField {...props} />;
      case 'tags': return <TagsField {...props} />;
      case 'bool': return <SwitchField {...props} />;
      case 'image':
        return (
          <PictureField
            key={key}
            label={field.label}
            value={item[key]}
            previewOf={previewOf}
            onPick={async (file) => {
              const path = await uploadPicture(field.upload, item.title, file);
              onChange((it) => ({ ...it, [key]: path }));
            }}
            onClear={() => onChange((it) => ({ ...it, [key]: '' }))}
          />
        );
      // `fixed` and `list` fields are kept as they are, not edited in this form.
      default: return null;
    }
  });

  return (
    <div className="cp-form">
      {fields}
      {canDelete && (
        <div className="cp-delete">
          {confirming ? (
            <>
              <span className="cp-note">Delete this?</span>
              <button type="button" className="cp-secondary" onClick={onDelete}>Yes, delete</button>
              <button type="button" className="cp-link" onClick={() => setConfirming(false)}>Keep it</button>
            </>
          ) : (
            <button type="button" className="cp-link" onClick={() => setConfirming(true)}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
}
