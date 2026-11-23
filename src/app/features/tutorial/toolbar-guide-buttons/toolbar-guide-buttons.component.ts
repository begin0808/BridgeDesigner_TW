/* Copyright (c) 2026 BridgeDesigner_TW Contributors
   SPDX-License-Identifier: GPL-3.0-or-later */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TutorialService } from '../tutorial.service';

@Component({
  selector: 'toolbar-guide-buttons',
  standalone: true,
  template: `
    <div class="guide-toolbar-group">
      <button
        type="button"
        class="guide-btn guide-btn-primary"
        title="開啟新手圖文速成指南（工具對照、力學判讀與常見問題排解）"
        (click)="openQuickStart()"
      >
        <span class="btn-icon">📖</span>
        <span class="btn-text-full">新手速成指南</span>
        <span class="btn-text-short">指南</span>
      </button>
      <button
        type="button"
        class="guide-btn guide-btn-secondary"
        title="顯示或收合課堂 5 步驟互動引導卡片"
        (click)="toggleClassroomGuide()"
      >
        <span class="btn-icon">🎓</span>
        <span class="btn-text-full">課堂 5 步驟引導</span>
        <span class="btn-text-short">引導</span>
      </button>
      <a
        class="guide-btn guide-btn-link"
        href="https://www.asce.org/career-growth/pre-college-outreach/bridge-designer"
        target="_blank"
        rel="noopener noreferrer"
        title="另開新分頁前往 ASCE Bridge Designer 官方英文網站"
      >
        <span class="btn-icon">🌐</span>
        <span>官方網站</span>
      </a>
    </div>
  `,
  styles: [
    `
      .guide-toolbar-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: nowrap;
        overflow: hidden;
        gap: 5px;
        height: 100%;
        padding: 0 3px;
      }
      .guide-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding: 0 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        line-height: 1;
        transition: background-color 0.15s ease, border-color 0.15s ease;
        white-space: nowrap;
        text-decoration: none;
        box-sizing: border-box;
      }
      .guide-btn-primary {
        background-color: #1d4ed8;
        border: 1px solid #1e40af;
        color: #ffffff;
      }
      .guide-btn-primary:hover {
        background-color: #1e40af;
      }
      .guide-btn-secondary {
        background-color: #ecfdf5;
        border: 1px solid #059669;
        color: #065f46;
      }
      .guide-btn-secondary:hover {
        background-color: #d1fae5;
      }
      .guide-btn-link {
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #334155;
      }
      .guide-btn-link:hover {
        background-color: #e2e8f0;
        color: #0f172a;
      }
      .btn-icon {
        font-size: 13px;
      }
      .btn-text-short {
        display: none;
      }
      @media (max-width: 1240px) {
        .guide-btn-link {
          display: none;
        }
        .btn-text-full {
          display: none;
        }
        .btn-text-short {
          display: inline;
        }
        .guide-btn {
          padding: 0 6px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarGuideButtonsComponent {
  constructor(private readonly tutorialService: TutorialService) {}

  openQuickStart(): void {
    this.tutorialService.openQuickStart();
  }

  toggleClassroomGuide(): void {
    this.tutorialService.toggleGuide();
  }
}
