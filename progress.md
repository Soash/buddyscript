# BuddyScript — Progress

## Current focus
- Inline comments preview UX: default show 1 latest comment; expand to show latest 5; collapse back to 1.

## Latest changes (2026-04-05)
- Fixed duplicated expand button UI and no-op behavior in comment preview.
- Updated inline Feed cards UX: default shows 1 latest comment; “View latest comments” expands to 5; “View less comments” collapses back to 1.
- Updated comment ordering: newest comments now render at the top.
- Added delete/edit icons in the post dropdown menu.

## Files touched
- buddyscript-ui/src/components/postcard/PostCardComments.jsx
  - Removed duplicate “View previous comments” blocks.
  - Expand button now reads “View latest comments” and expands to latest 5.
- buddyscript-ui/src/components/PostCard.jsx
  - Inline `PostCardComments` preview limits set to 1 (collapsed) / 5 (expanded).

## Status
- ✅ Default shows exactly 1 latest comment.
- ✅ “View latest comments” expands to 5, “View less comments” collapses to 1.

## Next checks
- Manually verify in UI:
  - Feed: inline shows 1 latest comment by default.
  - Click “View latest comments” → inline shows latest 5.
  - Click “View less comments” → back to 1.
