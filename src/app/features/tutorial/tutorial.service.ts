/* Copyright (c) 2026 BridgeDesigner_TW Contributors
   SPDX-License-Identifier: GPL-3.0-or-later */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const HIDE_GUIDE_STORAGE_KEY = 'bd_tw_hide_classroom_guide';

@Injectable({ providedIn: 'root' })
export class TutorialService {
  private readonly guideVisibleSubject: BehaviorSubject<boolean>;
  private readonly guideCollapsedSubject = new BehaviorSubject<boolean>(false);
  private readonly quickStartOpenSubject = new BehaviorSubject<boolean>(false);

  public readonly guideVisible$;
  public readonly guideCollapsed$ = this.guideCollapsedSubject.asObservable();
  public readonly quickStartOpen$ = this.quickStartOpenSubject.asObservable();

  constructor() {
    let hidden = false;
    try {
      hidden = localStorage.getItem(HIDE_GUIDE_STORAGE_KEY) === '1';
    } catch {
      hidden = false;
    }
    this.guideVisibleSubject = new BehaviorSubject<boolean>(!hidden);
    this.guideVisible$ = this.guideVisibleSubject.asObservable();
  }

  public get isGuideVisible(): boolean {
    return this.guideVisibleSubject.value;
  }

  public showGuide(expand: boolean = true): void {
    try {
      localStorage.removeItem(HIDE_GUIDE_STORAGE_KEY);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    this.guideVisibleSubject.next(true);
    if (expand) {
      this.guideCollapsedSubject.next(false);
    }
  }

  public hideGuide(): void {
    try {
      localStorage.setItem(HIDE_GUIDE_STORAGE_KEY, '1');
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    this.guideVisibleSubject.next(false);
  }

  public toggleGuide(): void {
    if (this.guideVisibleSubject.value && !this.guideCollapsedSubject.value) {
      this.guideCollapsedSubject.next(true);
    } else {
      this.showGuide(true);
    }
  }

  public setGuideCollapsed(collapsed: boolean): void {
    this.guideCollapsedSubject.next(collapsed);
  }

  public openQuickStart(): void {
    this.quickStartOpenSubject.next(true);
  }

  public closeQuickStart(): void {
    this.quickStartOpenSubject.next(false);
  }
}
