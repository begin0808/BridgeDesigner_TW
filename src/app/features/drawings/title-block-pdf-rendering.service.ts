/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { Injectable } from '@angular/core';
import { BridgeService } from '../../shared/services/bridge.service';
import jsPDF from 'jspdf';
import autoTable, { RowInput, Styles } from 'jspdf-autotable';
import { DRAWING_LINE_WIDTH_MM, DRAWING_MARGIN_MM } from './drawings.service';
import { BridgeCostService } from '../../shared/services/bridge-cost.service';
import { DOLLARS_FORMATTER, Utility } from '../../shared/classes/utility';
import { SaveMarkService } from '../save-load/save-mark.service';
import { AnalysisService } from '../../shared/services/analysis.service';
import { AnalysisValidityService } from '../controls/management/analysis-validity.service';
import { PDF_ZH_FONT } from '../../shared/services/pdf-font.service';

const ANALYSIS_STATUS_DESCRIPTIONS: string[] = [
  '（未測試）',
  '部分桿件細長比超過上限',
  '結構不穩定',
  '未通過載重測試',
  '通過所有檢核測試',
];

@Injectable({ providedIn: 'root' })
export class TitleBlockPdfRenderingService {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly analysisValidityService: AnalysisValidityService,
    private readonly bridgeCostService: BridgeCostService,
    private readonly bridgeService: BridgeService,
    private readonly saveMarkService: SaveMarkService,
  ) {}

  /** Draws the title block and returns the y-coordinate of its top edge. */
  public draw(doc: jsPDF, sheetName: string = '主桁架立面圖（公尺）', sheetNumber: number = 1): number {
    const projectName = this.bridgeService.bridge.projectName;
    const designedBy = this.bridgeService.bridge.designedBy;
    const savedFileName = this.saveMarkService.savedFileName;
    const status = this.analysisService.status;
    const body: RowInput[] = [
      /\S/.test(projectName)
        ? [
            {
              content: projectName,
              colSpan: 4,
              styles: { halign: 'center' } satisfies Partial<Styles>,
            },
          ]
        : null,
      [
        {
          content: sheetName,
          colSpan: 3,
        },
        `圖號：${sheetNumber}`,
      ],
      [
        {
          content: `成本：${DOLLARS_FORMATTER.format(this.bridgeCostService.allCosts)}`,
          colSpan: 2,
        },
        `日期：${Utility.getStandardDate()}`,
        `版本：${this.bridgeService.bridge.iterationNumber}`,
      ],
      /\S/.test(designedBy)
        ? [
            '設計者：',
            {
              content: designedBy,
              colSpan: 3,
            },
          ]
        : null,
      [
        '專案編號：',
        {
          content: this.bridgeService.bridge.taggedProjectId,
          colSpan: 3,
        },
      ],
      savedFileName !== undefined
        ? [
            '檔案名稱：',
            {
              content: savedFileName,
              colSpan: 3,
            },
          ]
        : null,
      [
        '測試狀態：',
        {
          content: this.analysisValidityService.isLastAnalysisValid
            ? ANALYSIS_STATUS_DESCRIPTIONS[status]
            : '尚未執行有效載重測試',
          colSpan: 3,
        },
      ],
    ].filter((item): item is NonNullable<typeof item> => item !== null); // remove nulls and adjust type

    const fontSize = 8;
    const horizontalPadding = 0.8;
    const verticalPadding = 0.5;
    const textHeight = doc.getTextDimensions('主桁架立面圖0', { fontSize }).h * doc.getLineHeightFactor();
    const rowHeightMm = textHeight + 2 * verticalPadding + DRAWING_LINE_WIDTH_MM;
    const blockHeight = rowHeightMm * body.length;
    const pageSize = doc.internal.pageSize;
    const startY = pageSize.getHeight() - blockHeight - DRAWING_MARGIN_MM;
    const width0 = 20;
    const width1 = 12;
    const width2 = 28;
    const width3 = 20;
    const blockWidth = width0 + width1 + width2 + width3 + 4 * DRAWING_LINE_WIDTH_MM;
    autoTable(doc, {
      startY,
      margin: { left: pageSize.getWidth() - DRAWING_MARGIN_MM - blockWidth, bottom: DRAWING_MARGIN_MM },
      theme: 'plain',
      tableWidth: 'wrap',
      tableLineColor: 'black',
      tableLineWidth: DRAWING_LINE_WIDTH_MM,
      styles: {
        font: PDF_ZH_FONT,
        textColor: 'black',
        lineColor: 'black',
        lineWidth: DRAWING_LINE_WIDTH_MM,
        cellPadding: { horizontal: horizontalPadding, vertical: verticalPadding },
        fontSize,
      },
      columnStyles: {
        0: { cellWidth: width0, lineWidth: { bottom: DRAWING_LINE_WIDTH_MM } },
        1: { cellWidth: width1, lineWidth: { bottom: DRAWING_LINE_WIDTH_MM } },
        2: { cellWidth: width2 },
        3: { cellWidth: width3 },
      },
      body,
    });
    return startY;
  }
}
