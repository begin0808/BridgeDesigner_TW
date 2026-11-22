/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { EventBrokerService } from '../../shared/services/event-broker.service';
import { PdfFontService } from '../../shared/services/pdf-font.service';
import { BridgePdfRenderingService } from './bridge-pdf-rendering.service';
import { MemberTablePdfRenderingService } from './member-table-pdf-rendering.service';
import { TitleBlockPdfRenderingService } from './title-block-pdf-rendering.service';

export const DRAWING_MARGIN_MM = 25.4 * 0.5;
export const DRAWING_LINE_WIDTH_MM = 0.1;
const DRAWING_SEPARATION = 25.4 * 0.3;

@Injectable({ providedIn: 'root' })
export class DrawingsService {
  constructor(
    private readonly bridgePdfRenderingService: BridgePdfRenderingService,
    eventBrokerService: EventBrokerService,
    private readonly memberTablePdfRenderingService: MemberTablePdfRenderingService,
    private readonly pdfFontService: PdfFontService,
    private readonly titleBlockPdfRenderingService: TitleBlockPdfRenderingService,
  ) {
    eventBrokerService.printRequest.subscribe(() => {
      void this.createPDF();
    });
  }

  public async createPDF(): Promise<jsPDF> {
    const previewWindow = this.pdfFontService.openPreviewPlaceholder();
    const doc = new jsPDF({ format: 'letter', orientation: 'landscape' });
    await this.pdfFontService.applyFont(doc);
    // Becomes title of PDF preview window.
    doc.setProperties({ title: '橋梁工程設計圖' });

    // Render the first sheet.
    const drawingBottomY = this.bridgePdfRenderingService.draw(doc);
    const titleBlockTopY = this.titleBlockPdfRenderingService.draw(doc);
    let remainingRows = this.memberTablePdfRenderingService.drawFirstSheet(
      doc,
      drawingBottomY + DRAWING_SEPARATION,
      titleBlockTopY,
    );

    // Render continuations of the member table while data still remains.
    let sheetNumber = 2;
    while (remainingRows.length > 0) {
      doc.addPage();
      const titleBlockTopY = this.titleBlockPdfRenderingService.draw(doc, '主桁架立面圖（公尺）－續頁', sheetNumber);
      remainingRows = this.memberTablePdfRenderingService.drawContinuationSheet(doc, remainingRows, titleBlockTopY);
      sheetNumber++;
    }

    // Build a PDF file and preview it. Assumes the browser has a PDF viewer linked to the MIME type.
    this.pdfFontService.displayPdf(doc, previewWindow);
    return doc;
  }
}
