const { createApp, nextTick } = Vue;
const THEME_KEY = 'site-theme';
const RANGE_OPTIONS = [
  { value: 'last10', label: 'Last 10Y' },
  { value: 'last20', label: 'Last 20Y' },
  { value: 'last30', label: 'Last 30Y' },
  { value: 'last40', label: 'Last 40Y' },
  { value: 'full', label: 'Full' },
];

const PLOTLY_MODEBAR_ICON = {
  log: { width: 512, height: 512, path: 'M96 416h320v-32H128V96H96v320zm112-56h40V192h-28l-52 36 18 26 22-15v121zm104 0h96v-32h-58l34-38c18-20 24-32 24-50 0-30-23-52-57-52-27 0-47 13-60 35l27 16c7-12 17-19 32-19 15 0 25 8 25 21 0 9-3 17-15 30l-48 53v36z' },
  rebase: { width: 512, height: 512, path: 'M96 96v320h320v-32H128V96H96zm80 224h64v-32h-64v32zm96-64h64v-32h-64v32zm96-64h64v-32h-64v32zM176 192h64v-32h-64v32z' },
  yearly: { width: 512, height: 512, path: 'M112 64h64v48h160V64h64v48h48v336H64V112h48V64zm272 112H128v208h256V176zm-32 48v32H160v-32h192zm-80 64v32H160v-32h112z' },
  range: { width: 512, height: 512, path: 'M80 96h352v64H80V96zm64 128h224v64H144v-64zm64 128h96v64h-96v-64z' },
};

function plotlyAxisBase(isDarkMode) {
  return {
    color: isDarkMode ? '#cbd5e1' : '#334155',
    gridcolor: isDarkMode ? 'rgba(148,163,184,0.22)' : 'rgba(51,65,85,0.16)',
    zerolinecolor: isDarkMode ? 'rgba(148,163,184,0.16)' : 'rgba(51,65,85,0.12)',
  };
}

function plotlyConfig({ onToggleLogScale, onToggleRebase, onRangeSelect, onOpenYearlyData } = {}) {
  const rangeButtons = RANGE_OPTIONS.map((option) => ({
    name: `Range: ${option.label}`,
    title: `Apply ${option.label} range`,
    icon: PLOTLY_MODEBAR_ICON.range,
    click: () => onRangeSelect?.(option.value),
  }));
  return {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    scrollZoom: false,
    showTips: false,
    modeBarButtonsToAdd: [
      { name: 'Toggle log scale', title: 'Toggle log scale', icon: PLOTLY_MODEBAR_ICON.log, click: () => onToggleLogScale?.() },
      { name: 'Toggle rebase', title: 'Toggle rebase to 100', icon: PLOTLY_MODEBAR_ICON.rebase, click: () => onToggleRebase?.() },
      ...rangeButtons,
      { name: 'Open yearly data', title: 'Open yearly data table in a dedicated page', icon: PLOTLY_MODEBAR_ICON.yearly, click: () => onOpenYearlyData?.() },
    ],
    modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toImage'],
  };
}

createApp({
  data() {
    return {
      isLoading: true,
      error: '',
      payload: null,
      selectedCategory: 'all',
      selectedMetricKey: '',
      showRebased: false,
      useLogScale: false,
      selectedRange: 'last30',
      theme: localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark',
    };
  },
  computed: {
    isDarkMode() { return this.theme === 'dark'; },
    metrics() { return this.payload?.metrics || []; },
    categories() { return [...new Set(this.metrics.map((metric) => metric.category))].sort((a, b) => a.localeCompare(b)); },
    filteredMetrics() {
      return this.metrics
        .filter((metric) => this.selectedCategory === 'all' || metric.category === this.selectedCategory)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    currentMetric() {
      return this.filteredMetrics.find((metric) => metric.key === this.selectedMetricKey) || this.filteredMetrics[0] || { series: [], sources: [] };
    },
    visibleSeries() {
      const series = this.currentMetric.series || [];
      if (!series.length) return [];
      const years = series.map((point) => point.year);
      const last = years.at(-1);
      const from = this.selectedRange === 'last10' ? last - 9
        : this.selectedRange === 'last20' ? last - 19
          : this.selectedRange === 'last30' ? last - 29
            : this.selectedRange === 'last40' ? last - 39
              : years[0];
      return series.filter((point) => point.year >= from);
    },
    transformedSeries() {
      const series = this.visibleSeries;
      if (!this.showRebased || !series.length) return series;
      const base = series[0].value;
      if (!base) return series;
      return series.map((point) => ({ year: point.year, value: (point.value / base) * 100 }));
    },
    latestValue() {
      const latest = this.transformedSeries.at(-1)?.value;
      const unit = this.showRebased ? 'Index' : this.currentMetric.unit;
      return this.formatValue(latest, unit);
    },
    totalChange() {
      const series = this.transformedSeries;
      if (series.length < 2) return '—';
      const first = series[0].value;
      const last = series.at(-1).value;
      if (!first) return '—';
      return `${(((last - first) / Math.abs(first)) * 100).toFixed(1)}%`;
    },
    yearsCovered() {
      const series = this.visibleSeries;
      if (!series.length) return '—';
      return `${series[0].year}–${series.at(-1).year}`;
    },
  },
  watch: {
    theme() { document.documentElement.setAttribute('data-theme', this.theme); this.renderChart(); },
    selectedMetricKey() { this.renderChart(); },
    showRebased() { this.renderChart(); },
    useLogScale() { this.renderChart(); },
    selectedRange() { this.renderChart(); },
    selectedCategory() {
      if (!this.filteredMetrics.find((metric) => metric.key === this.selectedMetricKey)) this.selectedMetricKey = this.filteredMetrics[0]?.key || '';
      this.renderChart();
    },
  },
  methods: {
    async loadData() {
      this.isLoading = true;
      this.error = '';
      try {
        const response = await fetch('macro-trends.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Macro data request failed (${response.status}).`);
        this.payload = await response.json();
        this.selectedMetricKey = this.payload.metrics[0]?.key || '';
      } catch (err) {
        this.error = err?.message || 'Unable to load macro data.';
      } finally {
        this.isLoading = false;
        document.documentElement.setAttribute('data-theme', this.theme);
        await nextTick();
        this.renderChart();
      }
    },
    renderChart() {
      const chartElement = document.getElementById('macro-chart');
      if (!chartElement || !this.currentMetric?.series?.length || !window.Plotly) return;
      const axisBase = plotlyAxisBase(this.isDarkMode);
      const series = this.transformedSeries;
      const trace = {
        type: 'scatter', mode: 'lines+markers',
        x: series.map((point) => point.year),
        y: series.map((point) => point.value),
        line: { width: 3, color: '#38bdf8' }, marker: { size: 5, color: '#2563eb' },
        name: this.currentMetric.name,
        hovertemplate: `%{x}: %{y:.2f} ${this.showRebased ? '' : this.currentMetric.unit}<extra></extra>`,
      };
      const layout = {
        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', autosize: true,
        margin: { l: 56, r: 20, t: 20, b: 64 },
        font: { color: axisBase.color },
        xaxis: { ...axisBase, title: 'Year', tickformat: 'd' },
        yaxis: { ...axisBase, title: this.showRebased ? 'Index (first year = 100)' : this.currentMetric.unit, type: this.useLogScale ? 'log' : 'linear', rangemode: this.useLogScale ? undefined : 'tozero' },
      };
      Plotly.react(chartElement, [trace], layout, plotlyConfig({
        onToggleLogScale: () => { this.useLogScale = !this.useLogScale; },
        onToggleRebase: () => { this.showRebased = !this.showRebased; },
        onRangeSelect: (range) => { this.selectedRange = range; },
        onOpenYearlyData: () => this.openYearlyData(),
      }));
      this.$nextTick(() => this.applyModebarTextButtons(chartElement));
    },
    applyModebarTextButtons(chartElement) {
      if (!chartElement) return;
      chartElement.querySelectorAll('.modebar-btn').forEach((button) => {
        const title = button.getAttribute('data-title') || button.getAttribute('title') || '';
        const rangeButton = RANGE_OPTIONS.find((option) => title.includes(`Apply ${option.label} range`));
        const customButtonLabels = [
          { match: 'Toggle log scale', label: 'log' },
          { match: 'Toggle rebase to 100', label: 'Rebase' },
          { match: 'Open yearly data table in a dedicated page', label: 'Data ↗' },
        ];
        const mappedButton = customButtonLabels.find((entry) => title.includes(entry.match));
        const label = rangeButton
          ? (rangeButton.value === 'full' ? 'All' : rangeButton.label.replace(/^Last\s+/i, '').toLowerCase())
          : mappedButton?.label;
        if (!label) return;
        button.classList.add('modebar-text-button');
        button.textContent = label;
        button.setAttribute('aria-label', title);
      });
    },
    openYearlyData() {
      const params = new URLSearchParams();
      params.set('mode', 'macro');
      params.set('metric', this.currentMetric?.key || this.selectedMetricKey || '');
      params.set('category', this.selectedCategory || 'all');
      params.set('range', this.selectedRange || 'full');
      if (this.showRebased) params.set('rebased', '1');
      params.set('theme', this.theme);
      window.open(`/priced-in/yearly.html?${params.toString()}`, '_blank', 'noopener');
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, this.theme);
    },
    categoryLabel(value) {
      return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    },
    categoryTagStyle(category = '') {
      const palette = { monetary: '#60a5fa', economy: '#a78bfa', society: '#34d399', energy: '#f59e0b', health: '#f472b6', quality_of_life: '#22d3ee' };
      const color = palette[category] || '#94a3b8';
      return { background: `color-mix(in srgb, ${color} 24%, transparent)`, borderColor: `color-mix(in srgb, ${color} 60%, var(--border))`, color };
    },
    formatValue(value, unit = '') {
      if (value == null || Number.isNaN(value)) return '—';
      if (unit.startsWith('GBP')) {
        const maxFractionDigits = unit.includes('billions') ? 2 : 0;
        const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: maxFractionDigits }).format(value);
        return unit.includes('per person') ? `${gbp} per person` : (unit.includes('billions') ? `${gbp} bn` : gbp);
      }
      const formatted = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value);
      return unit ? `${formatted} ${unit}` : formatted;
    },
    metricChange(metric) {
      const series = metric?.series || [];
      if (series.length < 2 || !series[0].value) return '—';
      const change = ((series.at(-1).value - series[0].value) / Math.abs(series[0].value)) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    },
    latestYearChange(metric) {
      const series = metric?.series || [];
      if (series.length < 2 || !series.at(-2)?.value) return '—';
      const previous = series.at(-2).value;
      const latest = series.at(-1)?.value;
      const change = ((latest - previous) / Math.abs(previous)) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    },
  },
  mounted() { this.loadData(); },
}).mount('#app');
