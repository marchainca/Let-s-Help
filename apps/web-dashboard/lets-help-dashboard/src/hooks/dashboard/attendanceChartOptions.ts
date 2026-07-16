import type { EChartsOption } from 'echarts';

type ThemeMode = 'light' | 'dark';

interface ChartThemeColors {
  text: string;
  axis: string;
  splitLine: string;
  background: string;
}

export function getChartThemeColors(mode: ThemeMode): ChartThemeColors {
  return mode === 'dark'
    ? { text: '#e0e0e0', axis: '#666', splitLine: '#333', background: 'transparent' }
    : { text: '#424242', axis: '#bdbdbd', splitLine: '#eee', background: 'transparent' };
}

const RANKING_LABEL_MAX_LINES = 3;
const RANKING_LABEL_MAX_WIDTH = 130;
const RANKING_FONT_SIZE_DEFAULT = 12;
const RANKING_FONT_SIZE_MIN = 10;
const RANKING_LINE_HEIGHT = 16;
const RANKING_ROW_PADDING = 22;

function getCharsPerLine(fontSize: number, maxWidth = RANKING_LABEL_MAX_WIDTH): number {
  return Math.max(8, Math.floor(maxWidth / (fontSize * 0.52)));
}

function wrapToLines(text: string | null | undefined, maxCharsPerLine: number, maxLines: number): string[] {
  if (!text) return [''];

  const lines: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  let currentLine = '';

  const pushLine = () => {
    if (currentLine) {
      lines.push(currentLine);
      currentLine = '';
    }
  };

  for (const word of words) {
    if (lines.length >= maxLines) break;

    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    pushLine();

    if (lines.length >= maxLines) break;

    if (word.length <= maxCharsPerLine) {
      currentLine = word;
      continue;
    }

    let remaining = word;
    while (remaining.length > 0 && lines.length < maxLines) {
      if (lines.length === maxLines - 1) {
        currentLine = remaining;
        remaining = '';
        break;
      }

      lines.push(remaining.slice(0, maxCharsPerLine));
      remaining = remaining.slice(maxCharsPerLine);
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function normalizeText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function isFullyWrapped(original: string | null | undefined, lines: string[]): boolean {
  return normalizeText(lines.join(' ')) === normalizeText(original);
}

export function getRankingLabelLayout(names: Array<string | null | undefined>): {
  displayNames: string[];
  fontSize: number;
  lineCounts: number[];
} {
  const safeNames = names.map((name) => name ?? '');

  for (let fontSize = RANKING_FONT_SIZE_DEFAULT; fontSize >= RANKING_FONT_SIZE_MIN; fontSize -= 1) {
    const charsPerLine = getCharsPerLine(fontSize);
    const wrapped = safeNames.map((name) => wrapToLines(name, charsPerLine, RANKING_LABEL_MAX_LINES));

    if (wrapped.every((lines, index) => isFullyWrapped(safeNames[index], lines))) {
      return {
        displayNames: wrapped.map((lines) => lines.join('\n')),
        fontSize,
        lineCounts: wrapped.map((lines) => lines.length),
      };
    }
  }

  const fontSize = RANKING_FONT_SIZE_MIN;
  const charsPerLine = getCharsPerLine(fontSize);
  const wrapped = safeNames.map((name) => wrapToLines(name, charsPerLine, RANKING_LABEL_MAX_LINES));

  return {
    displayNames: wrapped.map((lines) => lines.join('\n')),
    fontSize,
    lineCounts: wrapped.map((lines) => lines.length),
  };
}

export function getRankingChartHeight(lineCounts: number[]): number {
  if (lineCounts.length === 0) return 240;

  const cappedLines = lineCounts.map((count) => Math.min(count, RANKING_LABEL_MAX_LINES));
  const totalLines = cappedLines.reduce((sum, count) => sum + count, 0);
  const height = totalLines * RANKING_LINE_HEIGHT + lineCounts.length * RANKING_ROW_PADDING + 80;

  return Math.max(240, height);
}

export function buildAttendanceTrendOption(
  labels: string[],
  values: number[],
  title: string,
  colors: ChartThemeColors
): EChartsOption {
  return {
    backgroundColor: colors.background,
    title: { text: title, left: 'center', textStyle: { color: colors.text, fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 48, bottom: 32 },
    xAxis: {
      type: 'category',
      data: labels,
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
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#29ABE2' },
        itemStyle: { color: '#29ABE2' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(41, 171, 226, 0.35)' },
              { offset: 1, color: 'rgba(41, 171, 226, 0.02)' },
            ],
          },
        },
      },
    ],
  };
}

export function buildAttendanceDonutOption(
  labels: string[],
  values: number[],
  title: string,
  colors: ChartThemeColors
): EChartsOption {
  const chartColors = ['#4CAF50', '#F44336', '#FF9800'];

  return {
    backgroundColor: colors.background,
    title: { text: title, left: 'center', textStyle: { color: colors.text, fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: colors.text },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: colors.background, borderWidth: 2 },
        label: { color: colors.text, formatter: '{b}\n{d}%' },
        data: labels.map((name, index) => ({
          name,
          value: values[index],
          itemStyle: { color: chartColors[index] },
        })),
      },
    ],
  };
}

export function buildRankingBarOption(
  items: Array<{ name: string; count: number; percent: string }>,
  title: string,
  barColor: string,
  colors: ChartThemeColors
): EChartsOption {
  const originalNames = items.map((item) => item.name ?? '').reverse();
  const counts = items.map((item) => item.count).reverse();
  const percents = items.map((item) => item.percent).reverse();
  const { displayNames, fontSize } = getRankingLabelLayout(originalNames);

  return {
    backgroundColor: colors.background,
    title: { text: title, left: 'center', textStyle: { color: colors.text, fontSize: 14 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const list = params as Array<{ dataIndex: number; value: number }>;
        const index = list[0]?.dataIndex ?? 0;
        return `${originalNames[index]}<br/>${counts[index]} (${percents[index]})`;
      },
    },
    grid: { left: 8, right: 48, top: 48, bottom: 16, containLabel: true },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.splitLine } },
    },
    yAxis: {
      type: 'category',
      data: displayNames,
      axisLabel: {
        color: colors.text,
        width: RANKING_LABEL_MAX_WIDTH,
        overflow: 'break',
        lineHeight: RANKING_LINE_HEIGHT,
        fontSize,
        interval: 0,
      },
      axisLine: { lineStyle: { color: colors.axis } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: counts,
        barMaxWidth: 24,
        itemStyle: { color: barColor, borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          color: colors.text,
          formatter: (params) => percents[params.dataIndex] ?? '',
        },
      },
    ],
  };
}
