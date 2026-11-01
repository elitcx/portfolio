import { localize } from '../lib/localize.js';

export const SECTIONS = [
  { id: 'projects', label: 'Projects', kind: 'lists' },
  { id: 'certificates', label: 'Certificates', kind: 'lists' },
  { id: 'about', label: 'About & stats', kind: 'lists' },
  { id: 'timeline', label: 'Timeline', kind: 'lists' },
  { id: 'skills', label: 'Skills', kind: 'lists' },
  { id: 'contact', label: 'Contact', kind: 'lists' },
  { id: 'text', label: 'Page text', kind: 'text' },
  { id: 'files', label: 'CV & banner', kind: 'files' },
];

const editable = { canAdd: true, canDelete: true, canMove: true };
const locked = { canAdd: false, canDelete: false, canMove: true };

const shown = (field) => localize(field, 'en') || 'Untitled';

// The lists a section edits. Each `path` is relative to its content file.
export function listsFor(sectionId, edited) {
  switch (sectionId) {
    case 'projects':
      return [{
        key: 'projects', label: 'Projects', file: 'projects', path: [], schema: 'project', ...editable,
        titleOf: (item) => item.title || 'New project',
      }];
    case 'certificates':
      return [{
        key: 'certificates', label: 'Certificates', file: 'certificates', path: [], schema: 'certificate', ...editable,
        titleOf: (item) => item.title || 'New certificate',
      }];
    case 'about':
      return [
        { key: 'facts', label: 'Fast facts', file: 'site', path: ['facts'], schema: 'fact', ...editable, titleOf: (item) => shown(item.label) },
        { key: 'stats', label: 'By the numbers', file: 'site', path: ['stats'], schema: 'stat', ...editable, titleOf: (item) => shown(item.label) },
      ];
    case 'timeline':
      return [{
        key: 'timeline', label: 'Timeline', file: 'site', path: ['timeline'], schema: 'timeline', ...editable,
        titleOf: (item) => item.year || 'New entry',
      }];
    case 'skills':
      return [
        {
          key: 'skillGroups', label: 'Skill groups', file: 'site', path: ['skillGroups'], schema: 'skillGroup', ...locked,
          titleOf: (item) => shown(item.group),
        },
        ...edited.site.skillGroups.map((group, i) => ({
          key: `skills-${group.__id}`, label: shown(group.group), file: 'site', path: ['skillGroups', i, 'items'], schema: 'skill', ...editable,
          titleOf: (item) => item.lang || 'New skill',
        })),
      ];
    case 'contact':
      return [{
        key: 'contact', label: 'Contact', file: 'site', path: ['contact'], schema: 'contact', ...locked,
        titleOf: (item) => item.label,
      }];
    default:
      return [];
  }
}
