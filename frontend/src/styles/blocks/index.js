/*
 * =========================================================
 * MentorXn Learning Block Style Registry
 * =========================================================
 *
 * Automatically imports every CSS file in this folder.
 *
 * Adding a new learning block CSS file requires no
 * additional registration.
 * =========================================================
 */

import.meta.glob("./*.css", {
  eager: true,
});