/* Copyright (c) 2026 BridgeDesigner_TW Contributors
   SPDX-License-Identifier: GPL-3.0-or-later */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { AnalysisService, AnalysisStatus } from '../../../shared/services/analysis.service';
import { BridgeService } from '../../../shared/services/bridge.service';
import { DesignConditionsService } from '../../../shared/services/design-conditions.service';
import { EventBrokerService, EventOrigin } from '../../../shared/services/event-broker.service';
import { AnalysisValidityService } from '../../controls/management/analysis-validity.service';
import { UiMode } from '../../controls/management/ui-state.service';
import { TutorialService } from '../tutorial.service';
import { EditEffect } from '../../../shared/classes/editing';

export interface GuideStep {
  id: number;
  shortTitle: string;
  title: string;
  description: string;
  tip: string;
  actionLabel: string;
  actionId: 'joint' | 'member' | 'test' | 'select' | 'report';
}

@Component({
  selector: 'classroom-guide',
  standalone: true,
  templateUrl: './classroom-guide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ClassroomGuideComponent implements AfterViewInit, OnDestroy {
  @ViewChild('floatingRoot') floatingRoot?: ElementRef<HTMLElement>;

  readonly steps: GuideStep[] = [
    {
      id: 1,
      shortTitle: '點節點',
      title: '步驟 1：建立橋梁節點（Joints）',
      description: '使用左側繪圖工具的「節點工具（○）」，沿著灰色設計範本的圓圈位置點擊，建立桁架上方的連接點。',
      tip: '提示：橋面下方已經預設好路基節點，只要先補齊上方或下方的桁架節點即可！',
      actionLabel: '切換至節點工具',
      actionId: 'joint',
    },
    {
      id: 2,
      shortTitle: '連桿件',
      title: '步驟 2：連接三角形桁架桿件（Members）',
      description: '切換成「桿件工具（斜線）」，在兩個相鄰節點之間按住滑鼠左鍵拖曳連線，組成穩固的「三角形」結構。',
      tip: '關鍵觀念：三角形是最穩定的幾何形狀！四邊形若沒有斜撐，一受力就會傾斜倒塌。',
      actionLabel: '切換至桿件工具',
      actionId: 'member',
    },
    {
      id: 3,
      shortTitle: '載重測試',
      title: '步驟 3：執行載重測試（Load Test）',
      description: '將所有節點連接完整後，點擊上方工具列的「載重測試」按鈕，觀看卡車行駛過橋的 3D 受力模擬動畫！',
      tip: '小技巧：測試後可看上方「狀態」燈號：綠色＝通過、紅色＝未通過；若跳出不穩定提示，代表還有節點未組成三角形。',
      actionLabel: '立即執行載重測試',
      actionId: 'test',
    },
    {
      id: 4,
      shortTitle: '受力優化',
      title: '步驟 4：看懂紅藍受力並優化設計',
      description:
        '測試後桿件會上色：紅色＝受壓、藍色＝受拉，右側「受力／強度比 > 1.00」代表會破壞。用「選取工具（↖）」點選桿件，在上方調整尺寸、鋼材或改用「空心方管」來補強與降價！',
      tip: '工程挑戰：受壓桿件（紅色）改用「空心方管」最抗挫屈；若已直接通過測試，可微調桿件降價並重新測試，或按下方按鈕標記完成！',
      actionLabel: '切換至選取工具',
      actionId: 'select',
    },
    {
      id: 5,
      shortTitle: '匯出報告',
      title: '步驟 5：匯出繁體中文 PDF 報表交作業',
      description: '設計通過載重測試且滿意造價後，點擊上方「報告 → 載重測試結果」或「檔案 → 列印」，即可匯出繁體中文 PDF 報表與設計圖！',
      tip: '也別忘了點「檔案 → 儲存」把 .bdc 設計檔存下來，下次可以繼續優化。',
      actionLabel: '開啟載重測試報告',
      actionId: 'report',
    },
  ];

  isVisible = true;
  isCollapsed = false;
  uiMode: UiMode = 'initial';
  activeStepIndex = 0;

  // Cached progress state (avoids array re-allocations during template checks)
  completedFlags: boolean[] = [false, false, false, false, false];
  completedCount = 0;
  isAllDone = false;
  progressPercent = 0;

  // Draggable position (null = default bottom-left CSS position)
  posX: number | null = null;
  posY: number | null = null;
  isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragMoved = false;
  private autoCollapsedForAnimation = false;
  private activeMoveListener?: (ev: PointerEvent) => void;
  private activeUpListener?: () => void;

  // Live progress tracking
  customJointCount = 0;
  memberCount = 0;
  hasTested = false;
  lastTestStatus: AnalysisStatus = AnalysisStatus.NONE;
  hasEditedAfterTest = false;
  hasOptimizedAndPassed = false;
  hasViewedMemberDetails = false;
  hasConfirmedStep4 = false;
  hasExportedReport = false;
  activeEditTool = 0;

  private readonly subs = new Subscription();

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly analysisValidityService: AnalysisValidityService,
    private readonly bridgeService: BridgeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventBrokerService: EventBrokerService,
    private readonly ngZone: NgZone,
    private readonly tutorialService: TutorialService,
  ) {}

  get currentStep(): GuideStep {
    return this.steps[this.activeStepIndex];
  }

  get shouldRender(): boolean {
    const hasActiveBridge =
      this.bridgeService.designConditions !== DesignConditionsService.PLACEHOLDER_CONDITIONS;
    return this.isVisible && (this.uiMode !== 'initial' || hasActiveBridge);
  }

  get isTestCurrent(): boolean {
    return this.analysisValidityService.isLastAnalysisValid && this.analysisService.status > AnalysisStatus.UNSTABLE;
  }

  get isBridgePassing(): boolean {
    return this.analysisValidityService.isLastAnalysisValid && this.analysisService.status === AnalysisStatus.PASSES;
  }

  get testStatusBadge(): string {
    if (!this.hasTested) {
      return '尚未測試';
    }
    if (!this.analysisValidityService.isLastAnalysisValid) {
      return '⚠️ 設計已修改，請重新執行載重測試';
    }
    switch (this.lastTestStatus) {
      case AnalysisStatus.PASSES:
        return '✅ 通過載重測試！';
      case AnalysisStatus.FAILS_LOAD_TEST:
        return '⚠️ 桿件強度不足（請看步驟 4 補強）';
      case AnalysisStatus.FAILS_SLENDERNESS:
        return '⚠️ 細長比超標（請改用較大空心方管或縮短）';
      case AnalysisStatus.UNSTABLE:
        return '⚠️ 結構不穩定（請補齊三角形斜撐）';
      default:
        return '已分析';
    }
  }

  get iterationNumber(): number {
    return this.bridgeService.bridge.iterationNumber;
  }

  get floatingStyle(): Record<string, string> {
    if (this.posX !== null && this.posY !== null) {
      return {
        left: `${this.posX}px`,
        top: `${this.posY}px`,
        bottom: 'auto',
      };
    }
    return {};
  }

  startDrag(event: PointerEvent): void {
    // Allow dragging the collapsed .guide-pill button itself, while ignoring header action buttons.
    const target = event.target as HTMLElement | null;
    const btn = target?.closest('button');
    if (btn && !btn.classList.contains('guide-pill')) {
      return;
    }
    const el = this.floatingRoot?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    this.isDragging = true;
    this.dragMoved = false;
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    event.preventDefault();
    this.cdr.markForCheck();

    // Attach global pointer listeners ONLY while dragging, outside Angular zone to avoid idle CD ticks.
    this.detachDragListeners();
    this.ngZone.runOutsideAngular(() => {
      this.activeMoveListener = (ev: PointerEvent) => this.handleDragMove(ev);
      this.activeUpListener = () => this.handleDragEnd();
      window.addEventListener('pointermove', this.activeMoveListener);
      window.addEventListener('pointerup', this.activeUpListener);
      window.addEventListener('pointercancel', this.activeUpListener);
    });
  }

  private handleDragMove(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }
    const el = this.floatingRoot?.nativeElement;
    const width = el ? el.offsetWidth : 396;
    const height = el ? el.offsetHeight : 120;
    const maxX = Math.max(8, window.innerWidth - width - 8);
    const maxY = Math.max(8, window.innerHeight - height - 8);
    const nextX = Math.min(Math.max(8, event.clientX - this.dragOffsetX), maxX);
    const nextY = Math.min(Math.max(8, event.clientY - this.dragOffsetY), maxY);
    if (this.posX === null || Math.abs(nextX - this.posX) > 3 || Math.abs(nextY - (this.posY ?? 0)) > 3) {
      this.dragMoved = true;
    }
    this.posX = nextX;
    this.posY = nextY;
    if (el) {
      el.style.left = `${nextX}px`;
      el.style.top = `${nextY}px`;
      el.style.bottom = 'auto';
    }
  }

  private handleDragEnd(): void {
    this.detachDragListeners();
    if (!this.isDragging) {
      return;
    }
    this.ngZone.run(() => {
      this.isDragging = false;
      this.cdr.markForCheck();
    });
  }

  private detachDragListeners(): void {
    if (this.activeMoveListener) {
      window.removeEventListener('pointermove', this.activeMoveListener);
      this.activeMoveListener = undefined;
    }
    if (this.activeUpListener) {
      window.removeEventListener('pointerup', this.activeUpListener);
      window.removeEventListener('pointercancel', this.activeUpListener);
      this.activeUpListener = undefined;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.posX === null || this.posY === null) {
      return;
    }
    const el = this.floatingRoot?.nativeElement;
    const width = el ? el.offsetWidth : 396;
    const height = el ? el.offsetHeight : 120;
    this.posX = Math.min(Math.max(8, this.posX), Math.max(8, window.innerWidth - width - 8));
    this.posY = Math.min(Math.max(8, this.posY), Math.max(8, window.innerHeight - height - 8));
    this.cdr.markForCheck();
  }

  onPillClick(): void {
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }
    this.expand();
  }

  ngAfterViewInit(): void {
    this.subs.add(
      this.tutorialService.guideVisible$.subscribe(v => {
        this.isVisible = v;
        this.cdr.markForCheck();
      }),
    );
    this.subs.add(
      this.tutorialService.guideCollapsed$.subscribe(c => {
        this.isCollapsed = c;
        this.cdr.markForCheck();
      }),
    );
    this.subs.add(
      this.eventBrokerService.uiModeChange.subscribe(info => {
        this.uiMode = info.data;
        if (info.data === 'animation') {
          this.hasTested = true;
          if (!this.isCollapsed) {
            this.autoCollapsedForAnimation = true;
            this.tutorialService.setGuideCollapsed(true);
          }
        } else if (info.data === 'drafting' && this.autoCollapsedForAnimation) {
          this.autoCollapsedForAnimation = false;
          this.tutorialService.setGuideCollapsed(false);
        }
        this.refreshProgress(true);
      }),
    );
    this.subs.add(
      this.eventBrokerService.editModeChange.subscribe(info => {
        this.activeEditTool = info.data;
        this.cdr.markForCheck();
      }),
    );
    this.subs.add(
      merge(
        this.eventBrokerService.loadBridgeCompletion,
        this.eventBrokerService.sessionStateRestoreCompletion,
      ).subscribe(() => {
        if (this.uiMode === 'initial') {
          this.uiMode = 'drafting';
        }
        this.lastTestStatus = this.analysisService.status;
        this.hasTested = this.lastTestStatus !== AnalysisStatus.NONE;
        this.hasEditedAfterTest = false;
        this.hasOptimizedAndPassed = false;
        this.hasViewedMemberDetails = false;
        this.hasConfirmedStep4 = false;
        this.hasExportedReport = false;
        this.refreshProgress(true);
      }),
    );
    this.subs.add(
      this.eventBrokerService.editCommandCompletion.subscribe(info => {
        const mask = info.data.effectsMask;
        if (this.hasTested && (mask & (EditEffect.MEMBERS | EditEffect.JOINTS | EditEffect.CHANGE)) !== 0) {
          this.hasEditedAfterTest = true;
          this.hasConfirmedStep4 = false;
        }
        this.refreshProgress(false);
      }),
    );
    this.subs.add(
      this.eventBrokerService.analysisCompletion.subscribe(info => {
        this.hasTested = true;
        this.lastTestStatus = info.data;
        if (info.data === AnalysisStatus.PASSES && this.hasEditedAfterTest) {
          this.hasOptimizedAndPassed = true;
        }
        this.refreshProgress(true);
      }),
    );
    this.subs.add(
      this.eventBrokerService.memberDetailsReportRequest.subscribe(() => {
        this.hasViewedMemberDetails = true;
        this.refreshProgress(true);
      }),
    );
    this.subs.add(
      merge(
        this.eventBrokerService.printRequest,
        this.eventBrokerService.analysisReportRequest,
      ).subscribe(() => {
        this.hasExportedReport = true;
        this.refreshProgress(false);
      }),
    );

    this.refreshProgress(false);
  }

  ngOnDestroy(): void {
    this.detachDragListeners();
    this.subs.unsubscribe();
  }

  private computeCompletedFlags(): boolean[] {
    const step1 = this.customJointCount > 0;
    const step2 = this.memberCount >= 3;
    const step3 = this.hasTested;
    const step4 =
      this.isBridgePassing &&
      (this.hasOptimizedAndPassed ||
        this.hasViewedMemberDetails ||
        this.hasConfirmedStep4 ||
        this.bridgeService.bridge.iterationNumber >= 2);
    const step5 = this.hasExportedReport;
    return [step1, step2, step3, step4, step5];
  }

  private refreshProgress(autoAdvance: boolean): void {
    const prevFlags = this.completedFlags;
    const bridge = this.bridgeService.bridge;
    const prescribed = this.bridgeService.designConditions.prescribedJoints.length;
    this.customJointCount = Math.max(0, bridge.joints.length - prescribed);
    this.memberCount = bridge.members.length;

    const nextFlags = this.computeCompletedFlags();
    this.completedFlags = nextFlags;
    this.completedCount = nextFlags.filter(Boolean).length;
    this.isAllDone = this.completedCount === this.steps.length;
    this.progressPercent = Math.round((this.completedCount / this.steps.length) * 100);

    if (autoAdvance && !prevFlags[this.activeStepIndex] && nextFlags[this.activeStepIndex]) {
      const nextIncomplete = nextFlags.findIndex(done => !done);
      if (nextIncomplete !== -1) {
        this.activeStepIndex = nextIncomplete;
      }
    }
    this.cdr.markForCheck();
  }

  confirmStep4(): void {
    this.hasConfirmedStep4 = true;
    this.refreshProgress(true);
  }

  selectStep(index: number): void {
    this.activeStepIndex = index;
    this.cdr.markForCheck();
  }

  prevStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.cdr.markForCheck();
    }
  }

  nextStep(): void {
    if (this.activeStepIndex < this.steps.length - 1) {
      this.activeStepIndex++;
      this.cdr.markForCheck();
    }
  }

  runStepAction(actionId: GuideStep['actionId']): void {
    switch (actionId) {
      case 'joint':
        if (this.uiMode === 'animation') {
          this.eventBrokerService.designModeSelection.next({ origin: EventOrigin.APP, data: 0 });
        }
        this.eventBrokerService.editModeSelection.next({ origin: EventOrigin.APP, data: 0 });
        break;
      case 'member':
        if (this.uiMode === 'animation') {
          this.eventBrokerService.designModeSelection.next({ origin: EventOrigin.APP, data: 0 });
        }
        this.eventBrokerService.editModeSelection.next({ origin: EventOrigin.APP, data: 1 });
        break;
      case 'test':
        if (this.memberCount >= 3) {
          this.eventBrokerService.designModeSelection.next({ origin: EventOrigin.APP, data: 1 });
        }
        break;
      case 'select':
        if (this.uiMode === 'animation') {
          this.eventBrokerService.designModeSelection.next({ origin: EventOrigin.APP, data: 0 });
        }
        this.eventBrokerService.editModeSelection.next({ origin: EventOrigin.APP, data: 2 });
        break;
      case 'report':
        // Respect analysis validity: never open a stale Load Test Report with NaN values after edits.
        if (this.isTestCurrent) {
          this.eventBrokerService.analysisReportRequest.next({ origin: EventOrigin.APP, data: undefined });
        } else {
          this.eventBrokerService.printRequest.next({ origin: EventOrigin.APP, data: undefined });
        }
        break;
    }
  }

  openQuickStart(): void {
    this.tutorialService.openQuickStart();
  }

  openSampleDialog(): void {
    this.eventBrokerService.loadSampleRequest.next({ origin: EventOrigin.APP, data: undefined });
  }

  collapse(): void {
    this.autoCollapsedForAnimation = false;
    this.tutorialService.setGuideCollapsed(true);
  }

  expand(): void {
    this.autoCollapsedForAnimation = false;
    this.tutorialService.setGuideCollapsed(false);
  }

  dismiss(): void {
    this.autoCollapsedForAnimation = false;
    this.tutorialService.hideGuide();
  }
}
