/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { UiStateService } from '../../controls/management/ui-state.service';
import { EventBrokerService, EventOrigin } from '../../../shared/services/event-broker.service';
import { BROWSER_FEATURES } from '../browser-checks';

/** 
 * A component for disabling features due to missing device capabilities
 * and a dialog for informing the user.
 * 
 * Unlike most dialogs, this one is used directly by the app, not via the event broker.
 */
@Component({
  selector: 'missing-feature-disabler-dialog',
  imports: [ConfirmationDialogComponent],
  templateUrl: './missing-feature-disabler-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissingFeatureDisablerDialogComponent {
  contentHtml: string = '';

  @ViewChild('dialog') dialog!: ConfirmationDialogComponent;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly eventBrokerService: EventBrokerService,
    private readonly uiStateService: UiStateService,
  ) {}

  handleOkButtonClick(): void {
    // This continues the app welcome sequence.
    this.showTipDialog();
  }

  private showTipDialog(): void {
    this.eventBrokerService.tipRequest.next({ origin: EventOrigin.APP, data: 'startup' });
  }

  public disableAndInformUser(): void {
    const disabled = this.disableFeatures();
    if (disabled.length === 0) {
      // Simulated user ack.
      this.handleOkButtonClick();
      return;
    }
    this.contentHtml = `<p>橋梁結構設計師已停用您目前瀏覽器不支援的項目：</p>
<ul>
${disabled.map(item => `<li>${item}</li>`).join('\n')}
</ul>
<p>點擊「說明…」可查看更多資訊。</p>
<p>此訊息之後將不再重複顯示。</p>`;
    // Push text change to the confirmation dialog component.
    this.changeDetectorRef.detectChanges();
    this.dialog.open();
  }

  /** Quietly disable features when user has already been warned. */
  public disableFeatures(): string[] {
    const disabled = [];
    if (!BROWSER_FEATURES.webAssembly) {
      disabled.push('匯出 3D 列印模型需要瀏覽器支援 WebAssembly。');
      this.uiStateService.globallyDisable(this.eventBrokerService.print3dRequest);
    }
    if (!BROWSER_FEATURES.webgl2) {
      disabled.push('3D 載重測試動畫需要瀏覽器支援 WebGL2。');
      // First toggle off, then disable.
      this.eventBrokerService.animationToggle.next({ origin: EventOrigin.MISSING_BROWSER_FEATURE_DIALOG, data: false });
      this.uiStateService.globallyDisable(this.eventBrokerService.animationToggle);
    }
    return disabled;
  }
}
