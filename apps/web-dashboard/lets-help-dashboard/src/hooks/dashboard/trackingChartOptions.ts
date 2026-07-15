import type { EChartsOption } from 'echarts';
import { getChartThemeColors } from './attendanceChartOptions';

type ThemeMode = 'light' | 'dark';

interface ChartThemeColors {
  text: string;
  axis: string;
  splitLine: string;
  background: string;
}

export function parsePercent(percent: string): number {
  return parseFloat(percent.replace('%', '').trim()) || 0;
}

export function buildExecutionBarOption(
  planned: number,
  executed: number,
  plannedLabel: string,
  executedLabel: string,
  title: string,
  colors: ChartThemeColors
): EChartsOption {
  return {
    backgroundColor: colors.background,
    title: { text: title, left: 'center', textStyle: { color: colors.text, fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: colors.text } },
    grid: { left: 48, right: 24, top: 48, bottom: 56, containLabel: true },
    xAxis: {
      type: 'category',
      data: [plannedLabel, executedLabel],
      axisLabel: { color: colors.text },
      axisLine: { lineStyle: { color: colors.axis } },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.splitLine } },
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: planned, itemStyle: { color: '#FF9800', borderRadius: [4, 4, 0, 0] } },
          { value: executed, itemStyle: { color: '#29ABE2', borderRadius: [4, 4, 0, 0] } },
        ],
        barMaxWidth: 72,
        label: { show: true, position: 'top', color: colors.text },
      },
    ],
  };
}

export function buildGaugeOption(
  value: number,
  title: string,
  colors: ChartThemeColors,
  accentColor: string
): EChartsOption {
  return {
    backgroundColor: colors.background,
    title: {
      text: title,
      left: 'center',
      bottom: 4,
      textStyle: { color: colors.text, fontSize: 13, fontWeight: 600 },
    },
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: '90%',
        center: ['50%', '52%'],
        progress: {
          show: true,
          width: 16,
          itemStyle: { color: accentColor },
        },
        axisLine: {
          lineStyle: { width: 16, color: [[1, colors.splitLine]] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text,
          offsetCenter: [0, '5%'],
          formatter: `${Math.round(value * 100) / 100}%`,
        },
        data: [{ value: Math.round(value * 100) / 100 }],
      },
    ],
  };
}

export { getChartThemeColors, type ThemeMode, type ChartThemeColors };
