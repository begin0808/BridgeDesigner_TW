/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { jqxDropDownListModule } from 'jqwidgets-ng/jqxdropdownlist';
import { jqxToolBarComponent, jqxToolBarModule } from 'jqwidgets-ng/jqxtoolbar';
import { WidgetHelper } from '../../../shared/classes/widget-helper';
import { InventorySelectorComponent } from '../../../shared/components/inventory-selector/inventory-selector.component';
import { ComponentService } from '../../../shared/core/component.service';
import { EventBrokerService } from '../../../shared/services/event-broker.service';
import { UiStateService } from '../management/ui-state.service';

const enum Tools {
  INVENTORY_SELECTOR,
  SIZE_UP,
  SIZE_DOWN,
  MEMBER_NUMBERS,
  GUIDES,
  TEMPLATE,
  COARSE_GRID,
  MEDIUM_GRID,
  FINE_GRID,
  MEMBER_TABLE,
}

@Component({
  selector: 'toolbar-b',
  imports: [jqxToolBarModule, jqxDropDownListModule],
  templateUrl: './toolbar-b.component.html',
  styleUrl: './toolbar-b.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarBComponent implements AfterViewInit {
  readonly tools: string =
    'custom | ' +
    'button button | ' +
    'toggleButton toggleButton toggleButton | ' +
    'toggleButton toggleButton toggleButton | ' +
    'toggleButton'; // justified right and down by CSS

  @ViewChild('toolbar') toolbar!: jqxToolBarComponent;

  constructor(
    private readonly uiStateService: UiStateService,
    private readonly eventBrokerService: EventBrokerService,
    private readonly componentService: ComponentService,
  ) {
    this.initTools = this.initTools.bind(this);
  }

  initTools(_type?: string, index?: number, tool?: any, _menuToolInitialization?: boolean) {
    switch (index) {
      case Tools.INVENTORY_SELECTOR:
        this.componentService.load(InventorySelectorComponent, tool[0]);
        break;
      case Tools.SIZE_UP:
        WidgetHelper.initToolbarImgButton('加大所選桿件尺寸', 'img/sizeup.png', tool, true);
        break;
      case Tools.SIZE_DOWN:
        WidgetHelper.initToolbarImgButton('縮小所選桿件尺寸', 'img/sizedown.png', tool, true);
        break;
      case Tools.MEMBER_NUMBERS:
        WidgetHelper.initToolbarImgToggleButton('顯示／隱藏桿件編號', 'img/numbers.png', tool);
        break;
      case Tools.GUIDES:
        WidgetHelper.initToolbarImgToggleButton('顯示／隱藏對稱參考線', 'img/guides.png', tool);
        break;
      case Tools.TEMPLATE:
        WidgetHelper.initToolbarImgToggleButton('顯示／隱藏設計範本', 'img/template.png', tool, { toggled: true });
        break;
      case Tools.COARSE_GRID:
        WidgetHelper.initToolbarImgToggleButton('使用粗格線', 'img/coarsegrid.png', tool, {
          toggled: true,
        });
        break;
      case Tools.MEDIUM_GRID:
        WidgetHelper.initToolbarImgToggleButton('使用中格線', 'img/mediumgrid.png', tool);
        break;
      case Tools.FINE_GRID:
        WidgetHelper.initToolbarImgToggleButton('使用細格線', 'img/finegrid.png', tool);
        break;
      case Tools.MEMBER_TABLE:
        WidgetHelper.initToolbarImgToggleButton('顯示／隱藏桿件明細表', 'img/close.png', tool, {
          toggled: true,
          height: 16,
        });
        tool.css({ position: 'absolute', right: '0', bottom: '1px' });
        break;
    }
    return { minimizable: false, menuTool: false };
  }

  ngAfterViewInit(): void {
    const tools = this.toolbar.getTools();
    const gridTools = [Tools.COARSE_GRID, Tools.MEDIUM_GRID, Tools.FINE_GRID];
    const uiState = this.uiStateService;
    uiState.registerSelectToolbarButtons(tools, gridTools, this.eventBrokerService.gridDensitySelection);
    uiState.registerPlainToolbarButton(tools[Tools.SIZE_DOWN], this.eventBrokerService.memberSizeDecreaseRequest);
    uiState.registerPlainToolbarButton(tools[Tools.SIZE_UP], this.eventBrokerService.memberSizeIncreaseRequest);
    uiState.registerToggleToolbarButton(tools[Tools.MEMBER_NUMBERS], this.eventBrokerService.memberNumbersToggle);
    uiState.registerToggleToolbarButton(tools[Tools.GUIDES], this.eventBrokerService.guidesToggle);
    uiState.registerToggleToolbarButton(tools[Tools.TEMPLATE], this.eventBrokerService.templateToggle);
    uiState.registerToggleToolbarButton(tools[Tools.MEMBER_TABLE], this.eventBrokerService.memberTableToggle);
    // Handler toggles icon of member table button close <-> open.
    this.eventBrokerService.memberTableToggle.subscribe(info => {
      WidgetHelper.updateToolbarButtonImg(tools[Tools.MEMBER_TABLE], info.data ? 'img/close.png' : 'img/dropleft.png');
    });
  }
}
