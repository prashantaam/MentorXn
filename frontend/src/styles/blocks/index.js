/**
 * =========================================================
 * MentorXn Learning Block Style Registry
 * =========================================================
 *
 * Automatically imports every CSS file inside the blocks
 * directory, including CSS files inside subfolders such as:
 *
 * shared/
 *
 * Adding a new learning block CSS file or shared CSS file
 * requires no additional registration.
 *
 * =========================================================
 */

import.meta.glob("./**/*.css", {
  eager: true,
});