/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { jqxWindowComponent, jqxWindowModule } from 'jqwidgets-ng/jqxwindow';
import { jqxButtonModule } from 'jqwidgets-ng/jqxbuttons';
import { BridgeService } from '../../../shared/services/bridge.service';
import { EventBrokerService, EventOrigin } from '../../../shared/services/event-broker.service';
import jsPDF from 'jspdf';
import { autoTable, HookData } from 'jspdf-autotable';
import { Member } from '../../../shared/classes/member.model';
import { WidgetHelper } from '../../../shared/classes/widget-helper';
import { PDF_ZH_FONT, PdfFontService } from '../../../shared/services/pdf-font.service';

@Component({
  selector: 'load-test-report-dialog',
  imports: [CommonModule, jqxWindowModule, jqxButtonModule],
  templateUrl: './load-test-report-dialog.component.html',
  styleUrl: './load-test-report-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadTestReportDialogComponent implements AfterViewInit{
  @ViewChild('dialog') dialog!: jqxWindowComponent;
  private changeToken: string = '';

  constructor(
    readonly bridgeService: BridgeService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly eventBrokerService: EventBrokerService,
    private readonly pdfFontService: PdfFontService,
  ) {}

  async handleCopy(): Promise<void> {
    WidgetHelper.copyToClipboard(
      () => getLoadTestReportText(this.bridgeService.bridge.members),
      this.eventBrokerService,
      EventOrigin.LOAD_TEST_REPORT_DIALOG,
    );
  }

  handleDialogOpen(): void {
    this.changeToken += 'change';
    this.changeDetector.detectChanges();
    this.changeToken = '';
  }

  async handlePrint(): Promise<void> {
    const previewWindow = this.pdfFontService.openPreviewPlaceholder();
    const doc = new jsPDF({ format: 'letter', orientation: 'portrait' });
    await this.pdfFontService.applyFont(doc);
    doc.setProperties({ title: '載重測試結果' });
    autoTable(doc, {
      html: '.test-report-member-table',
      styles: { font: PDF_ZH_FONT, fontSize: 8 },
      headStyles: { font: PDF_ZH_FONT },
      useCss: true,
      didDrawPage: (data: HookData) => {
        doc.setFont(PDF_ZH_FONT, 'normal');
        doc.setFontSize(8);
        var pageHeight = doc.internal.pageSize.getHeight();
        doc.text(`第 ${data.pageNumber} 頁`, data.settings.margin.left, pageHeight - 10);
      },
    });
    this.pdfFontService.displayPdf(doc, previewWindow);
  }

  ngAfterViewInit(): void {
    this.eventBrokerService.analysisReportRequest.subscribe(() => this.dialog.open());
  }
}

function getLoadTestReportText(members: Member[]): string {
  const lines: string[] = [
    '#\t材料種類\t斷面形狀\t尺寸 (mm)\t長度 (m)\t細長比\t壓力 (kN)\t' +
      '抗壓強度\t抗壓狀態\t拉力 (kN)\t抗拉強度\t抗拉狀態',
  ];
  for (const m of members) {
    const line =
      `${m.number}\t${m.materialShortName}\t${m.crossSectionShortName}\t${m.materialSizeMm}\t` +
      `${m.lengthM}\t${m.slenderness}\t${m.maxCompression}\t${m.compressionStrength}\t` +
      `${m.compressionStatus}\t${m.maxTension}\t${m.tensionStrength}\t${m.tensionStatus}`;
    lines.push(line);
  }
  return lines.join('\n');
}
