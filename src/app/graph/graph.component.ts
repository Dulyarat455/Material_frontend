import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
  title: string;
  subtitle?: string;
  unit?: string;
  decimals: number;
  maxValue: number;
  chartType: 'amount' | 'quantity' | 'pallet' |'movement';
  days: GraphDay[];
};

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  readonly graphCards: GraphCard[] = [
    {
      title: 'Stock Amount by Item',
      subtitle: 'Control - Not Control',
      unit: 'Mbaht',
      decimals: 1,
      maxValue: 10,
      chartType: 'amount',
      days: [
        {
          date: '04/06/2026',
          values: [
            { label: 'Control', value: 0, color: '#1479bd' },
            { label: 'Not Control', value: 0, color: '#dce7f3' }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            { label: 'Control', value: 0, color: '#1479bd' },
            { label: 'Not Control', value: 0, color: '#dce7f3' }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            { label: 'Control', value: 0, color: '#1479bd' },
            { label: 'Not Control', value: 0, color: '#dce7f3' }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            { label: 'Control', value: 0, color: '#1479bd' },
            { label: 'Not Control', value: 0, color: '#dce7f3' }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            { label: 'Control', value: 6.5, color: '#1479bd' },
            { label: 'Not Control', value: 1.1, color: '#dce7f3' }
          ]
        }
      ]
    },
    {
      title: 'Stock Qty by Group',
      subtitle: 'General - Lamination',
      unit: 'ton',
      decimals: 1,
      maxValue: 10,
      chartType: 'quantity',
      days: [
        {
          date: '04/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            { label: 'GEN', value: 4.3, color: '#28b9e8' },
            { label: 'LAM', value: 3.3, color: '#89f28d' }
          ]
        }
      ]
    },
    {
      title: 'Stock Amount by Group',
      subtitle: 'General - Lamination',
      unit: 'Mbaht',
      decimals: 1,
      maxValue: 10,
      chartType: 'amount',
      days: [
        {
          date: '04/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            { label: 'GEN', value: 0, color: '#28b9e8' },
            { label: 'LAM', value: 0, color: '#89f28d' }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            { label: 'GEN', value: 4.3, color: '#28b9e8' },
            { label: 'LAM', value: 3.3, color: '#89f28d' }
          ]
        }
      ]
    },
    {
      title: 'Pallet Storage',
      subtitle: 'Total',
      decimals: 0,
      maxValue: 260,
      chartType: 'pallet',
      days: [
        {
          date: '08/06/2026',
          values: [
            { label: 'All-T', value: 208, color: '#f3a264' },
            { label: 'Pending-T', value: 21, color: '#f8dfce' }
          ]
        }
      ]
    },
    {
      title: 'Pallet Storage',
      subtitle: 'General',
      decimals: 0,
      maxValue: 180,
      chartType: 'pallet',
      days: [
        {
          date: '08/06/2026',
          values: [
            { label: 'All-G', value: 137, color: '#28b9e8' },
            { label: 'Pending-G', value: 7, color: '#dce7f3' }
          ]
        }
      ]
    },
    {
      title: 'Pallet Storage',
      subtitle: 'Lamination',
      decimals: 0,
      maxValue: 120,
      chartType: 'pallet',
      days: [
        {
          date: '08/06/2026',
          values: [
            { label: 'All-L', value: 71, color: '#89f28d' },
            { label: 'Pending-L', value: 14, color: '#f8dfce' }
          ]
        }
      ]
    },
    {
      title: 'Pallet Movement',
      subtitle: 'Stock In',
      decimals: 0,
      maxValue: 150,
      chartType: 'movement',
      days: [
        {
          date: '04/06/2026',
          values: [
            {
              label: 'StockIn-G',
              value: 97,
              color: '#28b9e8'
            },
            {
              label: 'StockIn-L',
              value: 33,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            {
              label: 'StockIn-G',
              value: 73,
              color: '#28b9e8'
            },
            {
              label: 'StockIn-L',
              value: 60,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            {
              label: 'StockIn-G',
              value: 26,
              color: '#28b9e8'
            },
            {
              label: 'StockIn-L',
              value: 54,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            {
              label: 'StockIn-G',
              value: 0,
              color: '#28b9e8'
            },
            {
              label: 'StockIn-L',
              value: 0,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            {
              label: 'StockIn-G',
              value: 11,
              color: '#28b9e8'
            },
            {
              label: 'StockIn-L',
              value: 0,
              color: '#89f28d'
            }
          ]
        }
      ]
    },
    {
      title: 'Pallet Movement',
      subtitle: 'Issue - Return',
      decimals: 0,
      maxValue: 80,
      chartType: 'movement',
      days: [
        {
          date: '04/06/2026',
          values: [
            {
              label: 'Issue-G',
              value: 30,
              color: '#28b9e8'
            },
            {
              label: 'Issue-L',
              value: 30,
              color: '#89f28d'
            },
            {
              label: 'Return',
              value: 0,
              color: '#082f49'
            }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            {
              label: 'Issue-G',
              value: 33,
              color: '#28b9e8'
            },
            {
              label: 'Issue-L',
              value: 36,
              color: '#89f28d'
            },
            {
              label: 'Return',
              value: 0,
              color: '#082f49'
            }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            {
              label: 'Issue-G',
              value: 32,
              color: '#28b9e8'
            },
            {
              label: 'Issue-L',
              value: 33,
              color: '#89f28d'
            },
            {
              label: 'Return',
              value: 0,
              color: '#082f49'
            }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            {
              label: 'Issue-G',
              value: 6,
              color: '#28b9e8'
            },
            {
              label: 'Issue-L',
              value: 9,
              color: '#89f28d'
            },
            {
              label: 'Return',
              value: 1,
              color: '#082f49'
            }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            {
              label: 'Issue-G',
              value: 11,
              color: '#28b9e8'
            },
            {
              label: 'Issue-L',
              value: 11,
              color: '#89f28d'
            },
            {
              label: 'Return',
              value: 1,
              color: '#082f49'
            }
          ]
        }
      ]
    },
    {
      title: 'Pallet Movement',
      subtitle: 'Move Area',
      decimals: 0,
      maxValue: 110,
      chartType: 'movement',
      days: [
        {
          date: '04/06/2026',
          values: [
            {
              label: 'MoveArea-G',
              value: 32,
              color: '#28b9e8'
            },
            {
              label: 'MoveArea-L',
              value: 10,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '05/06/2026',
          values: [
            {
              label: 'MoveArea-G',
              value: 34,
              color: '#28b9e8'
            },
            {
              label: 'MoveArea-L',
              value: 63,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '06/06/2026',
          values: [
            {
              label: 'MoveArea-G',
              value: 70,
              color: '#28b9e8'
            },
            {
              label: 'MoveArea-L',
              value: 24,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '07/06/2026',
          values: [
            {
              label: 'MoveArea-G',
              value: 3,
              color: '#28b9e8'
            },
            {
              label: 'MoveArea-L',
              value: 11,
              color: '#89f28d'
            }
          ]
        },
        {
          date: '08/06/2026',
          values: [
            {
              label: 'MoveArea-G',
              value: 5,
              color: '#28b9e8'
            },
            {
              label: 'MoveArea-L',
              value: 6,
              color: '#89f28d'
            }
          ]
        }
      ]
    }


  ];

  getLegendItems(card: GraphCard): StackValue[] {
    const firstDay = card.days[0];

    return firstDay?.values || [];
  }

  getTotal(day: GraphDay): number {
    return day.values.reduce((sum, item) => {
      return sum + Number(item.value || 0);
    }, 0);
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
    return `${card.title}-${card.subtitle}-${index}`;
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
}