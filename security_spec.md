# MindQuest Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: All unspecified paths under `/databases/{database}/documents` are strictly denied.
2. **Strict Verified Parent Identity**: All reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Owner-Only PII Isolation**: Parent accounts (`/parents/{parentId}`) store guardian PII (`name`, `email`, `pin`) and only allow `get`, `create`, `update`, and `delete` where `request.auth.uid == parentId`. Blanket `list` on `/parents` is strictly forbidden.
4. **Master Gate Relational Sync**: Every sub-collection (`/parents/{parentId}/children/{childId}` and `/parents/{parentId}/sessions/{sessionId}`) verifies the existence and ownership of the parent `/parents/{parentId}` document via `get()` / `exists()` on single-document operations, and validates `resource.data.parentId == request.auth.uid` on `list` queries without invoking `get()`/`exists()` inside `allow list`.
5. **Immutable Ownership & Timestamps**: `uid`, `parentId`, and `createdAt` are immutable after creation. All `createdAt` and `updatedAt` timestamps must equal `request.time`.
6. **Child Safety & Resource Bounds**: Every string field has strict `.size()` bounds, IDs match `^[a-zA-Z0-9_\-]+$`, arrays (`streakBadges`, `achievements`, `allowedFocusAreas`) enforce strict upper bounds, and shadow/ghost fields are blocked via `keys().hasOnly(...)`.

## 2. Adversarial "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Cross-Parent Read Spoofing**: User B (`uid: "userB"`) tries `get(/parents/userA)` -> DENIED (`uid != parentId`).
2. **Unverified Email Bypass**: User with `email_verified: false` attempts `create` on `/parents/{uid}` -> DENIED.
3. **Collection Scraping List**: Authenticated user runs `list` on `/parents` -> DENIED (`allow list: if false`).
4. **UID Hijacking on Create**: User B sets `parentId: "userA"` in `/parents/userB/children/c1` -> DENIED (`data.parentId == request.auth.uid` fails).
5. **Ghost Field / Privilege Escalation**: Payload includes `isAdmin: true` or `role: "superadmin"` -> DENIED (`keys().hasOnly(...)` fails).
6. **PIN Pattern Injection**: Parent profile sets `pin: "abc"` or 50-char string -> DENIED (`pin.matches('^[0-9]{4,6}$')` fails).
7. **Timestamp Backdating**: Client supplies `createdAt: Timestamp(2020-01-01)` instead of `request.time` -> DENIED (`data.createdAt == request.time` fails).
8. **ID Poisoning Attack**: Attacker creates `/parents/{uid}/children/invalid$$id_1500_chars` -> DENIED (`isValidId(childId)` fails).
9. **Immutable Ownership Tampering**: Parent updates `parentId` or `createdAt` on an existing child doc -> DENIED.
10. **Unbounded Array Exhaustion**: Client sends 50 items inside `allowedFocusAreas` or `streakBadges` -> DENIED (`size() <= 3` / `<= 20` fails).
11. **Session Tampering**: Parent attempts `update` on `/parents/{uid}/sessions/{sessionId}` -> DENIED (`allow update: if false`).
12. **Orphaned Session Write**: Client writes `/parents/{uid}/sessions/s1` referencing a non-existent `childId` -> DENIED (`exists(/parents/$(parentId)/children/$(incoming().childId))` fails).
