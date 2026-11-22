/* Copyright (c) 2025-2026 Gene Ressler
   Traditional Chinese PDF font loader added for zh-Hant edition.
   SPDX-License-Identifier: GPL-3.0-or-later */

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

/** Font family name registered in jsPDF for Traditional Chinese output. */
export const PDF_ZH_FONT = 'NotoSansTC';
const FONT_FILE_NAME = 'NotoSansTC-Regular.ttf';
const FONT_ASSET_URL = 'fonts/NotoSansTC-Regular.ttf';

/**
 * Lazy-loads an open-source Traditional Chinese TrueType font (Noto Sans TC, OFL 1.1)
 * and registers it with jsPDF so exported PDF drawings and reports render Chinese text cleanly.
 */
@Injectable({ providedIn: 'root' })
export class PdfFontService {
  private fontBase64Promise: Promise<string | null> | undefined;

  /** Loads and registers the Traditional Chinese font on the given jsPDF document. */
  public async applyFont(doc: jsPDF): Promise<boolean> {
    const base64 = await this.loadFontBase64();
    if (!base64) {
      return false;
    }
    doc.addFileToVFS(FONT_FILE_NAME, base64);
    doc.addFont(FONT_FILE_NAME, PDF_ZH_FONT, 'normal');
    // Register bold style pointing to the same font so autoTable headers never fall back to Helvetica.
    doc.addFont(FONT_FILE_NAME, PDF_ZH_FONT, 'bold');
    doc.setFont(PDF_ZH_FONT, 'normal');
    return true;
  }

  /**
   * Opens a preview tab synchronously during the user's click event so browser popup blockers
   * don't block the PDF preview while the font asset is being fetched on first use.
   */
  public openPreviewPlaceholder(): Window | null {
    const win = window.open('', '_blank');
    if (win) {
      try {
        win.document.title = '正在產生 PDF…';
        win.document.body.innerHTML =
          '<div style="font-family: sans-serif; padding: 24px; color: #333;">正在載入中文字型並產生 PDF，請稍候…</div>';
      } catch {
        // Ignore cross-origin or restricted window errors.
      }
    }
    return win;
  }

  /** Displays the generated PDF blob in the pre-opened preview window (or a new tab as fallback). */
  public displayPdf(doc: jsPDF, previewWindow: Window | null): void {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }

  private loadFontBase64(): Promise<string | null> {
    if (!this.fontBase64Promise) {
      this.fontBase64Promise = (async () => {
        try {
          const response = await fetch(FONT_ASSET_URL);
          if (!response.ok) {
            console.error('Failed to load PDF Chinese font:', response.status, response.statusText);
            return null;
          }
          const buffer = await response.arrayBuffer();
          return arrayBufferToBase64(buffer);
        } catch (err) {
          console.error('Error loading PDF Chinese font:', err);
          return null;
        }
      })();
    }
    return this.fontBase64Promise;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + chunkSize)));
  }
  return btoa(chunks.join(''));
}
