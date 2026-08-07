import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import config from '../../config';

type GraphCardId =
  | 'stockAmountByItem'
  | 'stockQtyByGroup'
  | 'stockAmountByGroup'
  | 'palletStorageTotal'
  | 'palletStorageGeneral'
  | 'palletStorageLamination'
  | 'palletMovementStockIn'
  | 'palletMovementIssueReturn'
  | 'palletMovementMoveArea';

type StackValue = {
  label: string;
  value: number;
  color: string;
};

type GraphDay = {
  date: string;
  values: StackValue[];
};

type GraphCard = {
  id: GraphCardId;
  title: string;
  subtitle?: string;
  unit?: string;
  decimals: number;
  maxValue: number;
  target?: number | null;
  chartType: 'amount' | 'quantity' | 'pallet' | 'movement';
  days: GraphDay[];
};

type InventoryApiRow = {
  incomingId: number;
  jobNo: string;
  notControl: string;
  storeId: number;
  storeName: string;
  coil: number;
  qty: number;
  totalPrice: number;
  lineNo: string;
  timeStmp: string;
};

type TransactionApiRow = {
  incomingId: number;
  jobNo: string;
  lineNo: string;
  type: string;
  timeStmp: string;
};

type NotControlFilter = 'all' | 'Control' | 'Not Control';


type TargetGraphApiRow = {
  id: number;
  graph: string;
  target: number;
  status: string;
};

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  constructor(private http: HttpClient) {}

  isLoading = false;
  isUpdatingGraph = false;
  isExportingExcel = false;
  isError = false;

  startDate = '';
  endDate = '';
  notControlFilter: NotControlFilter = 'all';

  inventoryRows: InventoryApiRow[] = [];
  transactionRows: TransactionApiRow[] = [];

  graphCards: GraphCard[] = [];

  targetDraftMap: Partial<Record<GraphCardId, string>> = {};


  activeTooltip: {
    cardId: GraphCardId;
    date: string;
  } | null = null;


  private targetMap: Record<GraphCardId, number | null> = {
    stockAmountByItem: null,
    stockQtyByGroup: null,
    stockAmountByGroup: null,
    palletStorageTotal: null,
    palletStorageGeneral: null,
    palletStorageLamination: null,
    palletMovementStockIn: null,
    palletMovementIssueReturn: null,
    palletMovementMoveArea: null
  };


  private graphNoMap: Record<GraphCardId, string> = {
    stockAmountByItem: '1',
    stockQtyByGroup: '2',
    stockAmountByGroup: '3',
    palletStorageTotal: '4',
    palletStorageGeneral: '5',
    palletStorageLamination: '6',
    palletMovementStockIn: '7',
    palletMovementIssueReturn: '8',
    palletMovementMoveArea: '9'
  };



  readonly color = {
    control: '#1479bd',
    notControl: '#dce7f3',

    gen: '#28b9e8',
    lam: '#89f28d',

    palletAll: '#f3a264',
    palletPending: '#f8dfce',

    returnDark: '#082f49'
  };

  ngOnInit() {
    this.setDefaultDateRange();
    this.updateGraphAndFetchData();
  }


  updateGraphAndFetchData() {
    if (this.isUpdatingGraph || this.isLoading) return;
  
    this.isUpdatingGraph = true;
    this.isError = false;
  
    this.http.get<any>(
      `${config.apiServer}/api/graph/updateGraph`
    ).subscribe({
      next: (res) => {
        console.log('updateGraph success:', res);
  
        this.isUpdatingGraph = false;
        this.fetchGraphData();
      },
      error: (err) => {
        console.error('updateGraph error:', err);
  
        this.isUpdatingGraph = false;
        this.isError = true;
      }
    });
  }


  fetchGraphData() {
  if (this.isLoading) return;

  this.isLoading = true;
  this.isError = false;

  forkJoin({
    inventory: this.http.get<any>(
      `${config.apiServer}/api/graph/listInventory`
    ),
    transaction: this.http.get<any>(
      `${config.apiServer}/api/graph/listTransaction`
    ),
    targetGraph: this.http.get<any>(
      `${config.apiServer}/api/graph/listTargetGraph`
    )
  }).subscribe({
    next: (res) => {
      this.inventoryRows = Array.isArray(res.inventory?.results)
        ? res.inventory.results
        : [];

      this.transactionRows = Array.isArray(res.transaction?.results)
        ? res.transaction.results
        : [];

      const targetRows: TargetGraphApiRow[] = Array.isArray(
        res.targetGraph?.results
      )
        ? res.targetGraph.results
        : [];

      this.applyTargetGraphRows(targetRows);

      this.buildGraphCards();

      this.isLoading = false;
    },
    error: (err) => {
      console.error('fetchGraphData error:', err);

      this.inventoryRows = [];
      this.transactionRows = [];
      this.graphCards = [];
      this.isLoading = false;
      this.isError = true;
    }
  });
}

  refresh() {
    this.fetchGraphData();
  }

  onFilterChange() {
    this.buildGraphCards();
  }

  onTargetChange(card: GraphCard, value: number | string | null) {

    if (this.isMovementAutoTargetCard(card.id)) {
      return;
    }
    const targetValue = Number(value);
  
    const nextTarget =
      value === null ||
      value === '' ||
      Number.isNaN(targetValue) ||
      targetValue < 0
        ? null
        : targetValue;
  
    this.targetMap[card.id] = nextTarget;
  
    this.buildGraphCards();
  
    if (nextTarget === null) {
      return;
    }
  
    this.updateTargetGraph(card.id, nextTarget);
  }

  private setDefaultDateRange() {
    const today = new Date();
  
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 11);
  
    this.startDate = this.toInputDate(startDate);
    this.endDate = this.toInputDate(today);
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toDateKey(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = value instanceof Date
      ? value
      : new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return this.toInputDate(date);
  }

  private toDisplayDate(dateKey: string): string {
    if (!dateKey) return '';

    const [year, month, day] = dateKey.split('-');

    return `${day}/${month}/${year}`;
  }

  private getDateKeysBetween(
    startDate: string,
    endDate: string
  ): string[] {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return [];
    }

    const result: string[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      result.push(this.toInputDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  private roundExcel(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);

    return Math.round(Number(value || 0) * factor) / factor;
  }

  private toMillionBaht(value: number): number {
    return Number(value || 0) / 1_000_000;
  }

  private toTon(value: number): number {
    return this.roundExcel(
      Number(value || 0) / 1000,
      0
    );
  }

  private sum(rows: any[], key: string): number {
    return rows.reduce((total, row) => {
      return total + Number(row?.[key] || 0);
    }, 0);
  }

  private countUniqueIncoming(rows: { incomingId: number }[]): number {
    return new Set(
      rows
        .map(row => Number(row.incomingId || 0))
        .filter(id => id > 0)
    ).size;
  }

  private isNotControl(row: { notControl?: string }): boolean {
    return String(row.notControl || '')
      .trim()
      .toLowerCase() === 'yes';
  }

  private applyNotControlFilter(
    rows: InventoryApiRow[]
  ): InventoryApiRow[] {
    if (this.notControlFilter === 'Control') {
      return rows.filter(row => !this.isNotControl(row));
    }

    if (this.notControlFilter === 'Not Control') {
      return rows.filter(row => this.isNotControl(row));
    }

    return rows;
  }

  private normalizeLineNo(value: string): string {
    return String(value || '')
      .trim()
      .toUpperCase();
  }

  private normalizeType(value: string): string {
    return String(value || '').trim();
  }

  private getInventoryRowsByDate(
    dateKey: string
  ): InventoryApiRow[] {
    return this.inventoryRows.filter(row => {
      return this.toDateKey(row.timeStmp) === dateKey;
    });
  }

  private getTransactionRowsByDate(
    dateKey: string
  ): TransactionApiRow[] {
    return this.transactionRows.filter(row => {
      return this.toDateKey(row.timeStmp) === dateKey;
    });
  }

  private isStoreName(
    row: InventoryApiRow,
    storeName: string
  ): boolean {
    return String(row.storeName || '')
      .trim()
      .toLowerCase() === storeName.toLowerCase();
  }

  private isGen(row: { lineNo: string }): boolean {
    return this.normalizeLineNo(row.lineNo) === 'GEN';
  }

  private isLam(row: { lineNo: string }): boolean {
    return this.normalizeLineNo(row.lineNo) === 'LAM';
  }

  private buildGraphCards() {
    const dateKeys = this.getDateKeysBetween(
      this.startDate,
      this.endDate
    );

    const cards: GraphCard[] = [
      this.buildStockAmountByItem(dateKeys),
      this.buildStockQtyByGroup(dateKeys),
      this.buildStockAmountByGroup(dateKeys),
      this.buildPalletStorageTotal(dateKeys),
      this.buildPalletStorageByLine(dateKeys, 'GEN'),
      this.buildPalletStorageByLine(dateKeys, 'LAM'),
      this.buildPalletMovementStockIn(dateKeys),
      this.buildPalletMovementIssueReturn(dateKeys),
      this.buildPalletMovementMoveArea(dateKeys)
    ];

    this.graphCards = cards.map(card => {
      return {
        ...card,
        maxValue: this.getAutoMaxValue(card)
      };
    });
  }

  private buildStockAmountByItem(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.getInventoryRowsByDate(dateKey);

      const controlRows = rows.filter(row => {
        return !this.isNotControl(row);
      });

      const notControlRows = rows.filter(row => {
        return this.isNotControl(row);
      });

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'Control',
            value: this.toMillionBaht(
              this.sum(controlRows, 'totalPrice')
            ),
            color: this.color.control
          },
          {
            label: 'Not Control',
            value: this.toMillionBaht(
              this.sum(notControlRows, 'totalPrice')
            ),
            color: this.color.notControl
          }
        ]
      };
    });

    return {
      id: 'stockAmountByItem',
      title: 'Stock Amount by Item',
      subtitle: 'Control - Not Control',
      unit: 'Mbaht',
      decimals: 2,
      target: this.targetMap.stockAmountByItem,
      maxValue: 10,
      chartType: 'amount',
      days
    };
  }

  private buildStockQtyByGroup(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.applyNotControlFilter(
        this.getInventoryRowsByDate(dateKey)
      );

      const genRows = rows.filter(row => this.isGen(row));
      const lamRows = rows.filter(row => this.isLam(row));

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'GEN',
            value: this.toTon(
              this.sum(genRows, 'qty')
            ),
            color: this.color.gen
          },
          {
            label: 'LAM',
            value: this.toTon(
              this.sum(lamRows, 'qty')
            ),
            color: this.color.lam
          }
        ]
      };
    });

    return {
      id: 'stockQtyByGroup',
      title: 'Stock Qty by Group',
      subtitle: 'General - Lamination',
      unit: 'ton',
      decimals: 0,
      target: this.targetMap.stockQtyByGroup,
      maxValue: 10,
      chartType: 'quantity',
      days
    };
  }

  private buildStockAmountByGroup(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.applyNotControlFilter(
        this.getInventoryRowsByDate(dateKey)
      );

      const genRows = rows.filter(row => this.isGen(row));
      const lamRows = rows.filter(row => this.isLam(row));

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'GEN',
            value: this.toMillionBaht(
              this.sum(genRows, 'totalPrice')
            ),
            color: this.color.gen
          },
          {
            label: 'LAM',
            value: this.toMillionBaht(
              this.sum(lamRows, 'totalPrice')
            ),
            color: this.color.lam
          }
        ]
      };
    });

    return {
      id: 'stockAmountByGroup',
      title: 'Stock Amount by Group',
      subtitle: 'General - Lamination',
      unit: 'Mbaht',
      decimals: 2,
      target: this.targetMap.stockAmountByGroup,
      maxValue: 10,
      chartType: 'amount',
      days
    };
  }

  private buildPalletStorageTotal(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.applyNotControlFilter(
        this.getInventoryRowsByDate(dateKey)
      );

      const nonChemicalRows = rows.filter(row => {
        return !this.isStoreName(row, 'Chemical');
      });

      const pendingRows = nonChemicalRows.filter(row => {
        return this.isStoreName(row, 'Pending');
      });

      const allRows = nonChemicalRows.filter(row => {
        return !this.isStoreName(row, 'Pending');
      });

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'All-T',
            value: this.countUniqueIncoming(allRows),
            color: this.color.palletAll
          },
          {
            label: 'Pending-T',
            value: this.countUniqueIncoming(pendingRows),
            color: this.color.palletPending
          }
        ]
      };
    });

    return {
      id: 'palletStorageTotal',
      title: 'Pallet Storage',
      subtitle: 'Total',
      decimals: 0,
      target: this.targetMap.palletStorageTotal,
      maxValue: 260,
      chartType: 'pallet',
      days
    };
  }

  private buildPalletStorageByLine(
    dateKeys: string[],
    lineNo: 'GEN' | 'LAM'
  ): GraphCard {
    const cardId: GraphCardId =
      lineNo === 'GEN'
        ? 'palletStorageGeneral'
        : 'palletStorageLamination';

    const days = dateKeys.map(dateKey => {
      const rows = this.applyNotControlFilter(
        this.getInventoryRowsByDate(dateKey)
      ).filter(row => {
        return this.normalizeLineNo(row.lineNo) === lineNo;
      });

      const nonChemicalRows = rows.filter(row => {
        return !this.isStoreName(row, 'Chemical');
      });

      const pendingRows = nonChemicalRows.filter(row => {
        return this.isStoreName(row, 'Pending');
      });

      const allRows = nonChemicalRows.filter(row => {
        return !this.isStoreName(row, 'Pending');
      });

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: lineNo === 'GEN' ? 'All-G' : 'All-L',
            value: this.countUniqueIncoming(allRows),
            color: lineNo === 'GEN'
              ? this.color.gen
              : this.color.lam
          },
          {
            label: lineNo === 'GEN' ? 'Pending-G' : 'Pending-L',
            value: this.countUniqueIncoming(pendingRows),
            color: lineNo === 'GEN'
              ? this.color.notControl
              : this.color.palletPending
          }
        ]
      };
    });

    return {
      id: cardId,
      title: 'Pallet Storage',
      subtitle: lineNo === 'GEN'
        ? 'General'
        : 'Lamination',
      decimals: 0,
      target: this.targetMap[cardId],
      maxValue: lineNo === 'GEN' ? 180 : 120,
      chartType: 'pallet',
      days
    };
  }

  private buildPalletMovementStockIn(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.getTransactionRowsByDate(dateKey).filter(row => {
        return this.normalizeType(row.type) === 'StockIn';
      });

      const genRows = rows.filter(row => this.isGen(row));
      const lamRows = rows.filter(row => this.isLam(row));

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'StockIn-G',
            value: this.countUniqueIncoming(genRows),
            color: this.color.gen
          },
          {
            label: 'StockIn-L',
            value: this.countUniqueIncoming(lamRows),
            color: this.color.lam
          }
        ]
      };
    });

    return {
      id: 'palletMovementStockIn',
      title: 'Pallet Movement',
      subtitle: 'Stock In',
      decimals: 0,
      target: this.getAverageTargetFromVisibleDays(days),
      maxValue: 150,
      chartType: 'movement',
      days
    };
  }

  private buildPalletMovementIssueReturn(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.getTransactionRowsByDate(dateKey);

      const issueRows = rows.filter(row => {
        return this.normalizeType(row.type) === 'Issue';
      });

      const returnRows = rows.filter(row => {
        return this.normalizeType(row.type) === 'ReturnStockIn';
      });

      const issueGenRows = issueRows.filter(row => this.isGen(row));
      const issueLamRows = issueRows.filter(row => this.isLam(row));

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'Issue-G',
            value: this.countUniqueIncoming(issueGenRows),
            color: this.color.gen
          },
          {
            label: 'Issue-L',
            value: this.countUniqueIncoming(issueLamRows),
            color: this.color.lam
          },
          {
            label: 'Return',
            value: this.countUniqueIncoming(returnRows),
            color: this.color.returnDark
          }
        ]
      };
    });

    return {
      id: 'palletMovementIssueReturn',
      title: 'Pallet Movement',
      subtitle: 'Issue - Return',
      decimals: 0,
      target: this.getAverageTargetFromVisibleDays(days),
      maxValue: 80,
      chartType: 'movement',
      days
    };
  }

  private buildPalletMovementMoveArea(
    dateKeys: string[]
  ): GraphCard {
    const days = dateKeys.map(dateKey => {
      const rows = this.getTransactionRowsByDate(dateKey).filter(row => {
        return this.normalizeType(row.type) === 'MoveArea';
      });

      const genRows = rows.filter(row => this.isGen(row));
      const lamRows = rows.filter(row => this.isLam(row));

      return {
        date: this.toDisplayDate(dateKey),
        values: [
          {
            label: 'MoveArea-G',
            value: this.countUniqueIncoming(genRows),
            color: this.color.gen
          },
          {
            label: 'MoveArea-L',
            value: this.countUniqueIncoming(lamRows),
            color: this.color.lam
          }
        ]
      };
    });

    return {
      id: 'palletMovementMoveArea',
      title: 'Pallet Movement',
      subtitle: 'Move Area',
      decimals: 0,
      target: this.getAverageTargetFromVisibleDays(days),
      maxValue: 110,
      chartType: 'movement',
      days
    };
  }

  private getAutoMaxValue(card: GraphCard): number {
    const maxTotal = Math.max(
      0,
      ...card.days.map(day => this.getTotal(day))
    );

    const targetValue = Number(card.target || 0);

    const maxValue = Math.max(
      maxTotal,
      targetValue,
      card.maxValue || 0
    );

    if (maxValue <= 0) return 1;

    return Math.ceil(maxValue * 1.15);
  }

  getLegendItems(card: GraphCard): StackValue[] {
    const firstDay = card.days[0];

    return firstDay?.values || [];
  }

  getTotal(day: GraphDay): number {
    return day.values.reduce((sum, item) => {
      return sum + Number(item.value || 0);
    }, 0);
  }





 isMovementAutoTargetCard(cardId: GraphCardId): boolean {
    return (
      cardId === 'palletMovementStockIn' ||
      cardId === 'palletMovementIssueReturn' ||
      cardId === 'palletMovementMoveArea'
    );
  }
  
  private isTodayDisplayDate(displayDate: string): boolean {
    const todayKey = this.toInputDate(new Date());
    return displayDate === this.toDisplayDate(todayKey);
  }
  
  private getAverageTargetFromVisibleDays(days: GraphDay[]): number | null {
    const validTotals = days
      .filter(day => !this.isTodayDisplayDate(day.date))
      .map(day => this.getTotal(day))
      .filter(total => total > 0);
  
    if (!validTotals.length) {
      return null;
    }
  
    const total = validTotals.reduce((sum, value) => {
      return sum + Number(value || 0);
    }, 0);
  
    return total / validTotals.length;
  }



  getTargetLabel(card: GraphCard): string {
    return this.isMovementAutoTargetCard(card.id)
      ? 'Average'
      : 'Target';
  }
  
  getLatestTotalForDisplay(card: GraphCard): number {
    if (!card?.days?.length) {
      return 0;
    }
  
    // กราฟ 1-6 ใช้ logic เดิม คือเอาวันล่าสุดในช่วงวันที่
    if (!this.isMovementAutoTargetCard(card.id)) {
      return this.getTotal(card.days[card.days.length - 1]);
    }
  
    // กราฟ 7-9 ไม่เอาวันปัจจุบัน
    // และต้องหา day ล่าสุดที่ Total > 0
    for (let i = card.days.length - 1; i >= 0; i--) {
      const day = card.days[i];
  
      if (this.isTodayDisplayDate(day.date)) {
        continue;
      }
  
      const total = this.getTotal(day);
  
      if (total > 0) {
        return total;
      }
    }
  
    return 0;
  }






  getSegmentHeight(
    value: number,
    maxValue: number
  ): number {
    if (!maxValue || value <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (value / maxValue) * 100
    );
  }

  getTargetRatio(card: GraphCard): number | null {
    const target = Number(card.target || 0);
    const maxValue = Number(card.maxValue || 0);

    if (!target || !maxValue) {
      return null;
    }

    return Math.min(
      1,
      Math.max(
        0,
        target / maxValue
      )
    );
  }

  isChartScrollable(card: GraphCard): boolean {
    return card.days.length > 31;
  }

  formatValue(
    value: number,
    decimals: number
  ): string {
    return Number(value || 0).toFixed(decimals);
  }

  trackByCard(
    index: number,
    card: GraphCard
  ): string {
    return `${card.id}-${index}`;
  }

  trackByDay(
    index: number,
    day: GraphDay
  ): string {
    return `${day.date}-${index}`;
  }

  trackByValue(
    index: number,
    value: StackValue
  ): string {
    return `${value.label}-${index}`;
  }


  showDayTooltip(card: GraphCard, day: GraphDay) {
    this.activeTooltip = {
      cardId: card.id,
      date: day.date
    };
  }
  
  hideDayTooltip() {
    this.activeTooltip = null;
  }
  
  isTooltipActive(card: GraphCard, day: GraphDay): boolean {
    return (
      this.activeTooltip?.cardId === card.id &&
      this.activeTooltip?.date === day.date
    );
  }
  
  getTooltipRows(day: GraphDay): StackValue[] {
    return day.values;
  }



  isLongDateRange(card: GraphCard): boolean {
    return card.days.length > 12;
  }
  
  getBarWidth(card: GraphCard): number {
    const dayCount = card.days.length;
  
    /*
      ช่วง 25-31 วัน ต้องเล็กมาก
      เพราะยังไม่ให้ scroll และต้องไม่ให้แท่งซ้อนกัน
    */
    if (dayCount > 24) {
      return card.chartType === 'movement' ? 8 : 9;
    }
  
    if (dayCount > 18) {
      return card.chartType === 'movement' ? 12 : 13;
    }
  
    if (dayCount > 12) {
      return card.chartType === 'movement' ? 16 : 18;
    }
  
    return card.chartType === 'movement' ? 34 : 36;
  }
  
  getColumnGap(card: GraphCard): number {
    const dayCount = card.days.length;
  
    if (dayCount > 24) {
      return 5;
    }
  
    if (dayCount > 18) {
      return 6;
    }
  
    if (dayCount > 12) {
      return 8;
    }
  
    return card.chartType === 'movement' ? 14 : 8;
  }
  
  getColumnMinWidth(card: GraphCard): number {
    const dayCount = card.days.length;
  
    /*
      ไม่ให้ scroll ถ้ายังไม่เกิน 31 วัน
      ใช้ขนาด column เล็กลงแทน
    */
    if (dayCount > 24) {
      return 14;
    }
  
    if (dayCount > 18) {
      return 20;
    }
  
    if (dayCount > 12) {
      return 28;
    }
  
    return 64;
  }




  isTooltipShiftRight(card: GraphCard, dayIndex: number): boolean {
    const dayCount = card.days.length;
  
    if (dayCount <= 1) {
      return false;
    }
  
    return dayIndex < Math.floor(dayCount / 2);
  }
  
  isTooltipShiftLeft(card: GraphCard, dayIndex: number): boolean {
    const dayCount = card.days.length;
  
    if (dayCount <= 1) {
      return false;
    }
  
    return dayIndex >= Math.floor(dayCount / 2);
  }




  private applyTargetGraphRows(rows: TargetGraphApiRow[]) {
    const targetByGraphNo = new Map<string, number>();
  
    for (const row of rows) {
      const graphNo = String(row.graph || '').trim();
      const targetValue = Number(row.target);
  
      if (!graphNo || Number.isNaN(targetValue)) {
        continue;
      }
  
      targetByGraphNo.set(graphNo, targetValue);
    }
  
    const graphIds = Object.keys(this.graphNoMap) as GraphCardId[];
  
    for (const graphId of graphIds) {
      if (this.isMovementAutoTargetCard(graphId)) {
        this.targetMap[graphId] = null;
        continue;
      }

      const graphNo = this.graphNoMap[graphId];
  
      this.targetMap[graphId] = targetByGraphNo.has(graphNo)
        ? targetByGraphNo.get(graphNo) ?? null
        : null;
    }
  }


  private updateTargetGraph(
    graphId: GraphCardId,
    target: number
  ) {
    const graphNo = this.graphNoMap[graphId];
  
    if (!graphNo) {
      return;
    }
  
    this.http.post<any>(
      `${config.apiServer}/api/graph/updateTargetGraph`,
      {
        graph: graphNo,
        target
      }
    ).subscribe({
      next: () => {},
      error: (err) => {
        console.error('updateTargetGraph error:', err);
      }
    });
  }




  exportExcel() {
    if (this.isExportingExcel || this.isLoading || this.isUpdatingGraph) {
      return;
    }
  
    this.isExportingExcel = true;
  
    const payload = {
      startDate: this.startDate,
      endDate: this.endDate,
      notControlFilter: this.notControlFilter
    };
  
    this.http.post(
      `${config.apiServer}/api/graph/exportExcel`,
      payload,
      {
        responseType: 'blob'
      }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph_export_${this.startDate}_to_${this.endDate}.xlsx`;
        a.click();
  
        window.URL.revokeObjectURL(url);
  
        this.isExportingExcel = false;
      },
      error: (err) => {
        console.error('exportExcel error:', err);
        this.isExportingExcel = false;
      }
    });
  }



  
  getTargetInputValue(card: GraphCard): string {
    const draftValue = this.targetDraftMap[card.id];
  
    if (draftValue !== undefined) {
      return draftValue;
    }
  
    if (card.target === null || card.target === undefined) {
      return '';
    }
  
    return String(card.target);
  }
  
  onTargetDraftChange(card: GraphCard, value: string | number | null) {
    this.targetDraftMap[card.id] =
      value === null || value === undefined
        ? ''
        : String(value);
  }
  
  hasTargetDraft(card: GraphCard): boolean {
    const draftValue = this.targetDraftMap[card.id];
  
    if (draftValue === undefined) {
      return false;
    }
  
    const currentValue =
      card.target === null || card.target === undefined
        ? ''
        : String(card.target);
  
    return String(draftValue) !== currentValue;
  }
  
  confirmTargetChange(card: GraphCard) {
    const draftValue = this.targetDraftMap[card.id];
  
    if (draftValue === undefined) {
      return;
    }
  
    this.onTargetChange(card, draftValue);
  
    delete this.targetDraftMap[card.id];
  }
  
  cancelTargetChange(card: GraphCard) {
    delete this.targetDraftMap[card.id];
  }

  
}