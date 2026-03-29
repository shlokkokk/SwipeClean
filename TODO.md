# SwipeClean TODO

## In Progress

### Core Features
- [ ] **Undo Feature - Full Restoration**
  - Currently: Undo reverts stats and takes you back to file, but deleted files stay in trash
  - Task: Implement file restoration from trash when undoing a delete action
  - Files to modify: `src/renderer/pages/Session.tsx`
  - Details: Add `window.electronAPI.restoreFromTrash()` call in handleUndo for deleted files
  - Priority: HIGH - Makes undo truly functional

## Completed

### UI/UX Polish (Session Page)
- [x] Fixed SwipeCard animations and keyboard controls
- [x] Display full file path instead of breadcrumb
- [x] Debounce keyboard swipes to prevent multi-fire
- [x] Remove layered text/button blur on stacked cards
- [x] Back-stack cards as opaque placeholders only
- [x] Stack animation from top corners (3D deck effect)
- [x] Keep Undo/Open buttons equally visible
- [x] Equal button visibility regardless of undo state

### Settings Page
- [x] Remove rounded corners on modals
- [x] Add sharp/angular geometric design
- [x] Implement glow effects on all sections
- [x] Add keyboard shortcut badges with proper alignment
- [x] Restructure Nuke button with alignment layout
- [x] Add spacing between options and buttons

### Sorting Modal
- [x] Sharp geometric design (no rounded corners)
- [x] Proper spacing between last option and buttons
- [x] Angle clipping for all UI elements

## Notes
- Undo architecture is solid, just needs trash restoration API call
- All input debouncing in place for stable animations
- Stack visual effect working as intended
