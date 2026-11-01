import React, { useState } from 'react';

import { SCHEMAS } from '../lib/contentSchema.js';
import { blankItem, getIn, move, setIn } from './editing.js';
import FilesEditor from './FilesEditor.jsx';
import ItemForm from './ItemForm.jsx';
import PageText from './PageText.jsx';
import { SECTIONS, listsFor } from './sections.js';

function ItemLists({ lists, edited, selected, onSelect, onReplace }) {
  return (
    <div className="ad-lists">
      {lists.map((list) => {
        const items = getIn(edited[list.file], list.path);
        return (
          <div key={list.key} className="ad-list">
            {lists.length > 1 && <h2 className="ad-group-title">{list.label}</h2>}
            {list.canAdd && (
              <button
                type="button"
                className="ad-new"
                onClick={() => {
                  onReplace(list, [blankItem(SCHEMAS[list.schema]), ...items]);
                  onSelect({ listKey: list.key, index: 0 });
                }}
              >
                + New
              </button>
            )}
            {items.map((item, index) => {
              const on = selected?.listKey === list.key && selected.index === index;
              const shift = (delta) => {
                const next = move(items, index, delta);
                if (next === items) return;
                onReplace(list, next);
                if (on) onSelect({ listKey: list.key, index: index + delta });
              };
              return (
                <div key={index} className={on ? 'ad-item is-on' : 'ad-item'}>
                  <button
                    type="button"
                    className="ad-item-title"
                    aria-current={on ? 'true' : undefined}
                    onClick={() => onSelect({ listKey: list.key, index })}
                  >
                    {item.current && <span className="ad-dot" role="img" aria-label="Currently building" />}
                    {list.titleOf(item)}
                  </button>
                  {list.canMove && (
                    <span className="ad-move">
                      <button type="button" aria-label={`Move ${list.titleOf(item)} up`} onClick={() => shift(-1)}>↑</button>
                      <button type="button" aria-label={`Move ${list.titleOf(item)} down`} onClick={() => shift(1)}>↓</button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function Shell({ edited, setEdited, status, onLogout, call, previewOf, uploadPicture, uploadCv, footer }) {
  const [sectionId, setSectionId] = useState('projects');
  const [selected, setSelected] = useState(null);

  const section = SECTIONS.find((s) => s.id === sectionId);
  const lists = section.kind === 'lists' ? listsFor(sectionId, edited) : [];
  const activeList = lists.find((list) => list.key === selected?.listKey);
  const items = activeList ? getIn(edited[activeList.file], activeList.path) : null;
  const item = items?.[selected.index];

  const replaceList = (list, next) => {
    setEdited((current) => ({
      ...current,
      [list.file]: list.path.length ? setIn(current[list.file], list.path, next) : next,
    }));
  };

  const openSection = (id) => {
    setSectionId(id);
    setSelected(null);
  };

  return (
    <div className={item ? 'ad-shell has-item' : 'ad-shell'}>
      <header className="ad-top">
        <span className="ad-brand">Site admin</span>
        <span className="ad-status" role="status">{status}</span>
        <button type="button" className="ad-link" onClick={onLogout}>Log out</button>
      </header>

      <nav className="ad-sections" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === sectionId ? 'is-on' : undefined}
            aria-current={s.id === sectionId ? 'page' : undefined}
            onClick={() => openSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {section.kind === 'lists' && (
        <>
          <ItemLists lists={lists} edited={edited} selected={selected} onSelect={setSelected} onReplace={replaceList} />
          <main className="ad-main">
            {item ? (
              <>
                <button type="button" className="ad-link ad-back" onClick={() => setSelected(null)}>← Back to list</button>
                <ItemForm
                  key={`${activeList.key}-${selected.index}`}
                  schemaName={activeList.schema}
                  item={item}
                  canDelete={activeList.canDelete}
                  onChange={(next) => replaceList(activeList, items.map((it, i) => (i === selected.index ? next : it)))}
                  onDelete={() => {
                    replaceList(activeList, items.filter((_, i) => i !== selected.index));
                    setSelected(null);
                  }}
                  call={call}
                  previewOf={previewOf}
                  uploadPicture={uploadPicture}
                />
              </>
            ) : (
              <p className="ad-note ad-empty">Choose something from the list to edit it.</p>
            )}
          </main>
        </>
      )}

      {section.kind === 'text' && (
        <main className="ad-main ad-main-full">
          <PageText
            text={edited.site.text}
            onChange={(text) => setEdited((current) => ({ ...current, site: { ...current.site, text } }))}
            call={call}
          />
        </main>
      )}

      {section.kind === 'files' && (
        <main className="ad-main ad-main-full">
          <FilesEditor
            banner={edited.site.banner}
            onBanner={(banner) => setEdited((current) => ({ ...current, site: { ...current.site, banner } }))}
            previewOf={previewOf}
            uploadPicture={uploadPicture}
            uploadCv={uploadCv}
          />
        </main>
      )}

      {footer}
    </div>
  );
}
