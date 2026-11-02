import React, { useState } from 'react';

import { SCHEMAS } from '../lib/contentSchema.js';
import { blankItem, getIn, moveItem, newId, updateItem, updateList } from './editing.js';
import FilesEditor from './FilesEditor.jsx';
import ItemForm from './ItemForm.jsx';
import PageText from './PageText.jsx';
import { SECTIONS, listsFor } from './sections.js';

function ItemLists({ lists, edited, selected, onSelect, onChange }) {
  return (
    <div className="cp-lists">
      {lists.map((list) => {
        const items = getIn(edited[list.file], list.path);
        return (
          <div key={list.key} className="cp-list">
            {lists.length > 1 && <h2 className="cp-group-title">{list.label}</h2>}
            {list.canAdd && (
              <button
                type="button"
                className="cp-new"
                onClick={() => {
                  const fresh = { ...blankItem(SCHEMAS[list.schema]), __id: newId() };
                  onChange(list.key, (current) => [fresh, ...current]);
                  onSelect({ listKey: list.key, id: fresh.__id });
                }}
              >
                + New
              </button>
            )}
            {items.map((item) => {
              const on = selected?.listKey === list.key && selected.id === item.__id;
              const shift = (delta) => onChange(list.key, (current) => moveItem(current, item.__id, delta));
              return (
                <div key={item.__id} className={on ? 'cp-item is-on' : 'cp-item'}>
                  <button
                    type="button"
                    className="cp-item-title"
                    aria-current={on ? 'true' : undefined}
                    onClick={() => onSelect({ listKey: list.key, id: item.__id })}
                  >
                    {item.current && <span className="cp-dot" role="img" aria-label="Currently building" />}
                    {list.titleOf(item)}
                  </button>
                  {list.canMove && (
                    <span className="cp-move">
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
  const item = items?.find((candidate) => candidate.__id === selected.id);

  const changeList = (listKey, change) => {
    setEdited((current) => updateList(current, sectionId, listKey, change));
  };

  const openSection = (id) => {
    setSectionId(id);
    setSelected(null);
  };

  return (
    <div className={item ? 'cp-shell has-item' : 'cp-shell'}>
      <header className="cp-top">
        <span className="cp-brand">Site admin</span>
        <span className="cp-status" role="status">{status}</span>
        <button type="button" className="cp-link" onClick={onLogout}>Log out</button>
      </header>

      <nav className="cp-sections" aria-label="Sections">
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
          <ItemLists lists={lists} edited={edited} selected={selected} onSelect={setSelected} onChange={changeList} />
          <main className="cp-main">
            {item ? (
              <>
                <button type="button" className="cp-link cp-back" onClick={() => setSelected(null)}>← Back to list</button>
                <ItemForm
                  key={item.__id}
                  schemaName={activeList.schema}
                  item={item}
                  canDelete={activeList.canDelete}
                  onChange={(change) => {
                    const { key: listKey } = activeList;
                    const { __id: id } = item;
                    setEdited((current) => updateItem(current, sectionId, listKey, id, change));
                  }}
                  onDelete={() => {
                    const { __id: id } = item;
                    changeList(activeList.key, (current) => current.filter((it) => it.__id !== id));
                    setSelected(null);
                  }}
                  call={call}
                  previewOf={previewOf}
                  uploadPicture={uploadPicture}
                />
              </>
            ) : (
              <p className="cp-note cp-empty">Choose something from the list to edit it.</p>
            )}
          </main>
        </>
      )}

      {section.kind === 'text' && (
        <main className="cp-main cp-main-full">
          <PageText
            text={edited.site.text}
            onChange={(change) => setEdited((current) => ({
              ...current,
              site: { ...current.site, text: change(current.site.text) },
            }))}
            call={call}
          />
        </main>
      )}

      {section.kind === 'files' && (
        <main className="cp-main cp-main-full">
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
