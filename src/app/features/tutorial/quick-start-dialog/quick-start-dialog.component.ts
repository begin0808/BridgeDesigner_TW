/* Copyright (c) 2026 BridgeDesigner_TW Contributors
   SPDX-License-Identifier: GPL-3.0-or-later */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBrokerService, EventOrigin } from '../../../shared/services/event-broker.service';
import { TutorialService } from '../tutorial.service';

export type QuickStartTab = 'steps' | 'tools' | 'mechanics' | 'faq';

@Component({
  selector: 'quick-start-dialog',
  standalone: true,
  templateUrl: './quick-start-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class QuickStartDialogComponent implements OnInit, OnDestroy {
  isOpen = false;
  activeTab: QuickStartTab = 'steps';
  private readonly subs = new Subscription();

  readonly toolItems = [
    { icon: 'img/joint.png', name: '節點工具', desc: '在繪圖區格線上點擊放置新的橋梁連接節點（點在灰色範本圓圈上最容易對齊）。' },
    { icon: 'img/member.png', name: '桿件工具', desc: '按住滑鼠左鍵從一個節點拖曳到另一個節點，建立橋梁鋼材桿件。' },
    { icon: 'img/arrow.png', name: '選取工具', desc: '點選或框選桿件，用來更改鋼材種類、實心／空心斷面或調整尺寸；也可拖曳移動節點位置。' },
    { icon: 'img/eraser.png', name: '橡皮擦工具', desc: '點選多餘或畫錯的桿件與節點直接刪除。' },
    { icon: 'img/loadtest.png', name: '載重測試', desc: '執行有限元素結構分析並播放卡車過橋 3D 動畫，檢驗橋梁是否穩固安全。' },
    { icon: 'img/design.png', name: '回到繪圖區', desc: '從 3D 載重測試動畫切回 2D 設計繪圖畫面繼續修改。' },
    { icon: 'img/sizeup.png', name: '加大／縮小桿件尺寸', desc: '將選取中的桿件尺寸一次調大或調小一級，快速進行結構補強或降本。' },
    { icon: 'img/loadsample.png', name: '開啟範例設計', desc: '載入內建的經典桁架橋範例（如 Pratt、Warren 桁架），最適合新手直接觀察學習！' },
    { icon: 'img/template.png', name: '顯示／隱藏設計範本', desc: '開關畫布上的灰色參考桁架線條，幫助初學者對齊節點位置。' },
    { icon: 'img/calculator.png', name: '成本計算明細', desc: '查看材料費、連接費、場地費等詳細造價構成，並支援匯出繁體中文 PDF。' },
    { icon: 'img/loadtestreport.png', name: '載重測試結果', desc: '列出每一支桿件的最大壓力／拉力與受力強度比，一眼找出最弱的瓶頸桿件。' },
    { icon: 'img/print.png', name: '列印中文設計圖', desc: '匯出含橋梁設計圖、標題欄與桿件明細表的繁體中文 PDF 學習單。' },
  ];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly eventBrokerService: EventBrokerService,
    private readonly tutorialService: TutorialService,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.tutorialService.quickStartOpen$.subscribe(open => {
        this.isOpen = open;
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  selectTab(tab: QuickStartTab): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  close(): void {
    this.tutorialService.closeQuickStart();
  }

  startInteractiveGuide(): void {
    this.tutorialService.closeQuickStart();
    this.tutorialService.showGuide(true);
  }

  loadSampleBridge(): void {
    this.tutorialService.closeQuickStart();
    this.eventBrokerService.loadSampleRequest.next({ origin: EventOrigin.APP, data: undefined });
  }

  openFullHelp(): void {
    this.tutorialService.closeQuickStart();
    this.eventBrokerService.helpRequest.next({ origin: EventOrigin.APP, data: { topic: 'hlp_how_to' } });
  }
}
