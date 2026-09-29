# FANORONA — RULESET GAME 09

> Digital ruleset for **Fanoron-Tsivy**, the 5×9 form of Fanorona from Madagascar.

## 1. Scope
- 2 players.
- Board: **5 rows × 9 columns = 45 intersections**.
- 22 pieces per side; only the exact center point starts empty.
- Light pieces move first.
- Project modes: Local 2 players + AI Easy / Medium / Hard.

## 2. Board connections
- A piece moves one step to an adjacent empty intersection along a drawn line.
- Orthogonal links exist throughout the board.
- Diagonal links exist only through the strong intersections shown by the board line pattern.

## 3. Mandatory capture
- At the start of a turn, if at least one capture exists, the player **must capture**.
- A non-capturing move (paika) is legal only when no capture exists anywhere for the current player.

## 4. Capture by approach
Move one piece toward an enemy line.
If the point immediately beyond the destination in the movement direction contains an enemy piece, capture that piece and every contiguous enemy piece behind it on the same line until the line is interrupted by an empty point, own piece, or board edge.

## 5. Capture by withdrawal
Move one piece away from an adjacent enemy line.
Capture the adjacent enemy piece behind the starting point and every contiguous enemy piece behind it on the same line until interrupted.

## 6. Dual capture choice
A single movement can sometimes create both an approach capture and a withdrawal capture.
The player must choose **one** capture mode; the two enemy lines are not captured together.

## 7. Capture sequence
After a capture, the same piece may continue capturing during the same turn.
Continuation is **optional** after each completed capture.

Restrictions inside one sequence:
- the moving piece may not arrive at a point it already reached earlier in that sequence;
- it may not make two consecutive capture steps in the same direction;
- every continuation step must itself capture.

Captured pieces are removed immediately after each capture step.

## 8. End conditions
Traditional core objective: eliminate the opponent's pieces.

Project digital conventions for v0.1:
- a player with no legal move loses;
- same board position + same player to move occurring three times is a draw.

These two conventions are stated explicitly in UI and are not presented as universal historical Fanorona rules.

## 9. Initial position used
Coordinates are rows top→bottom and columns left→right.

- Top two rows: Dark.
- Bottom two rows: Light.
- Middle row: **Dark · Light · Dark · Light · empty · Dark · Light · Dark · Light**.

This gives 22 pieces to each player and the center empty.

## 10. Presentation lock v0.1
- 2.5D board, not WebGL.
- Warm carved-wood board with clearly drawn Fanorona connections.
- Light pieces: ivory/stone.
- Dark pieces: basalt/charcoal stone.
- Legal source pieces glow.
- Destination markers distinguish normal targets and capture targets.
- If one destination supports both capture modes, UI must ask explicitly **Tiến ăn / Lùi ăn**.
- Captured line pulses before removal.
- During a capture chain, only the chaining piece remains active and a **Dừng chuỗi** control is available.

## Sources checked
- Mindsports Fanorona rules: https://mindsports.nl/index.php/the-pit/528-fanorona
- Oliver Merkel Fanorona rules / implementation notes: https://github.com/OMerkel/Fanorona
- ICGA Fanorona overview: https://icga.org/icga/games/Fanorona/
- Schadd et al., *Best Play in Fanorona Leads to Draw*.
- Ludii Fanorona rules/setup were cross-checked for the standard Tsivy initial arrangement.

## Status
Ruleset locked for Game 09 implementation on 2026-09-29.
