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