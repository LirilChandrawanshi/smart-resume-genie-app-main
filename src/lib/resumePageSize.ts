/**
 * Resume page = US Letter (8.5 × 11 in) = 21.59 × 27.94 cm
 * Used for live preview, print capture, and PDF export.
 */

export const RESUME_PAGE_WIDTH_CM = 21.59;
export const RESUME_PAGE_HEIGHT_CM = 27.94;

/** jsPDF / physical size (mm) */
export const RESUME_PAGE_WIDTH_MM = 215.9;
export const RESUME_PAGE_HEIGHT_MM = 279.4;

/** Pixel size at 96 dpi (CSS / html2canvas) */
export const RESUME_PAGE_WIDTH_PX = Math.round((RESUME_PAGE_WIDTH_MM / 25.4) * 96); // 816
export const RESUME_PAGE_HEIGHT_PX = Math.round((RESUME_PAGE_HEIGHT_MM / 25.4) * 96); // 1056

/** Label for UI */
export const RESUME_PAGE_SIZE_LABEL = `Letter · ${RESUME_PAGE_WIDTH_CM} × ${RESUME_PAGE_HEIGHT_CM} cm`;
