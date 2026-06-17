const { createApp } = Vue;

function isValidDataset(payload) {
  return payload && Array.isArray(payload.years) && payload.contextSeries && Array.isArray(payload.items);
}

function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && abs < 0.001) return value.toExponential(2);
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Math.round(value));
  }
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatBitcoinHuman(value) {
  if (value == null || Number.isNaN(value)) return '—';
  if (Math.abs(value) < 0.001) {
    const sats = Math.round(value * 100000000);
    return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(sats)} sats`;
  }
  return `${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 6 }).format(value)} bitcoin`;
}

createApp({
  data() {
    return {
      years: [],
      contextSeries: {},
      items: [],
      macroMetrics: [],
      isLoading: true,
      error: '',
      allDenominator: 'context:fiat',
      selectedRange: 'last30',
      rebased: false,
      selectedKeys: [],
      itemKey: '',
      mode: 'compare',
      numeratorKey: '',
      denominatorKey: '',
      macroMetricKey: '',
      macroCategory: 'all',
      isMobileMenuOpen: false,
      theme: 'dark',
    };
  },
  computed: {
    compareTableColumns() {
      if (this.mode === 'macro') {
        return this.macroMetricKey ? [{ key: this.macroMetricKey, name: this.seriesName(this.macroMetricKey) }] : [];
      }
      if (this.mode === 'single') return this.itemKey ? [{ key: this.itemKey, name: this.seriesName(this.itemKey) }] : [];
      if (this.mode === 'ratio') return [{ key: 'ratio', name: this.ratioLabel }];
      return this.selectedKeys.map((key) => ({ key, name: this.seriesName(key) }));
    },
    compareTableRows() {
      if (this.mode === 'macro') {
        return this.macroSeriesPoints.map((point) => ({ year: point.year, values: { [this.macroMetricKey]: point.value } }));
      }
      const years = [...new Set(this.compareTableColumns.flatMap((column) => (this.seriesMap[column.key] || []).map((point) => point.year)))].sort((a, b) => a - b);
      return years.map((year) => ({
        year,
        values: Object.fromEntries(this.compareTableColumns.map((column) => [column.key, (this.seriesMap[column.key] || []).find((point) => point.year === year)?.value ?? null])),
      }));
    },
    macroMetric() {
      return this.macroMetrics.find((metric) => metric.key === this.macroMetricKey) || this.macroMetrics[0] || null;
    },
    macroSeriesPoints() {
      if (!this.macroMetric?.series?.length) return [];
      const series = this.macroMetric.series;
      const lastYear = series.at(-1)?.year;
      if (!lastYear) return [];
      const minYear = this.selectedRange === 'last10' ? lastYear - 9
        : this.selectedRange === 'last20' ? lastYear - 19
          : this.selectedRange === 'last30' ? lastYear - 29
            : this.selectedRange === 'last40' ? lastYear - 39
              : series[0]?.year;
      const filtered = series.filter((point) => point.year >= minYear);
      if (!this.rebased || !filtered.length) return filtered;
      const base = filtered[0]?.value;
      if (!base) return filtered;
      return filtered.map((point) => ({ year: point.year, value: (point.value / base) * 100 }));
    },
    seriesMap() {
      if (this.mode === 'macro') return {};
      if (this.mode === 'single') {
        return this.itemKey
          ? { [this.itemKey]: this.visiblePairSeries(this.itemKey, this.denominatorSeriesRef(), this.costRebaseForcedStartYear([this.itemKey], this.denominatorType() === 'context' ? this.denominatorKey() : null)) }
          : {};
      }
      if (this.mode === 'ratio') {
        return { ratio: this.visiblePairSeries(this.numeratorKey, this.denominatorKey, this.costRebaseForcedStartYear([this.numeratorKey, this.denominatorKey])) };
      }
      return Object.fromEntries(this.selectedKeys.map((key) => [key, this.visiblePairSeries(key, this.denominatorSeriesRef(), this.costRebaseForcedStartYear(this.selectedKeys, this.denominatorType() === 'context' ? this.denominatorKey() : null))]));
    },
    ratioLabel() {
      return `${this.seriesName(this.numeratorKey)} / ${this.seriesName(this.denominatorKey)}`;
    },
    titleText() {
      if (this.mode === 'macro') return this.macroMetric?.name || 'Macro yearly data table';
      if (this.mode === 'single') return this.seriesName(this.itemKey);
      if (this.mode === 'ratio') return this.ratioLabel;
      return 'Yearly data table';
    },
    descriptionText() {
      if (this.mode === 'macro') {
        const valueBasis = this.rebased ? 'rebased to 100 at the first visible year' : (this.macroMetric?.unit || 'raw units');
        return `Yearly macro values for ${this.macroMetric?.name || 'the selected metric'}, ${valueBasis}, across the ${this.selectedRange} range.`;
      }
      const denominatorLabel = this.denominatorLabel();
      const rebaseLabel = this.rebased ? 'rebased to 100 at the first shared visible year' : 'shown in raw priced-in terms';
      const bitcoinLabel = 'with Bitcoin availability determined by the selected Bitcoin denominator';
      if (this.mode === 'single') {
        const suffix = this.pairUsesBitcoin(this.itemKey, this.denominatorSeriesRef()) ? `, and ${bitcoinLabel}` : '';
        return `Yearly values for ${this.seriesName(this.itemKey)} priced in ${denominatorLabel}, ${rebaseLabel}, across the ${this.selectedRange} range${suffix}.`;
      }
      if (this.mode === 'ratio') {
        const suffix = this.pairUsesBitcoin(this.numeratorKey, this.denominatorKey) ? `, and ${bitcoinLabel}` : '';
        return `Yearly values for ${this.ratioLabel}, ${rebaseLabel}, across the ${this.selectedRange} range${suffix}.`;
      }
      const compareUsesBitcoin = this.selectedKeys.some((key) => this.pairUsesBitcoin(key, this.denominatorSeriesRef()));
      const suffix = compareUsesBitcoin ? `, and ${bitcoinLabel}` : '';
      return `Yearly values for the selected items priced in ${denominatorLabel}, ${rebaseLabel}, across the ${this.selectedRange} range${suffix}.`;
    },
    backUrl() {
      if (this.mode === 'macro') {
        const params = new URLSearchParams();
        if (this.macroMetricKey) params.set('metric', this.macroMetricKey);
        if (this.macroCategory && this.macroCategory !== 'all') params.set('category', this.macroCategory);
        params.set('range', this.selectedRange);
        if (this.rebased) params.set('rebased', '1');
        params.set('theme', this.theme);
        return `/priced-in/macro.html?${params.toString()}`;
      }
      const params = new URLSearchParams();
      params.set('range', this.selectedRange);
      if (this.rebased) params.set('rebased', '1');
      params.set('theme', this.theme);
      if (this.mode === 'single') {
        params.set('denom', this.allDenominator);
        if (this.itemKey) params.set('item', this.itemKey);
        return `/priced-in/single.html?${params.toString()}`;
      }
      if (this.mode === 'ratio') {
        params.set('item', this.numeratorKey || 'house');
        params.set('denom', this.denominatorKey || 'context:fiat');
        return `/priced-in/single.html?${params.toString()}`;
      }
      params.set('denom', this.allDenominator);
      if (this.selectedKeys.length) params.set('items', this.selectedKeys.join(','));
      return `/priced-in/index.html?${params.toString()}`;
    },
  },
  methods: {
    isBitcoinSeriesRef(seriesRef = '') {
      const normalized = String(seriesRef || '').toLowerCase();
      return normalized.includes('bitcoin') || normalized === 'btc' || normalized.endsWith('_btc') || normalized.endsWith(':btc') || normalized.endsWith('_bitcoin') || normalized.includes('context_bitcoin');
    },
    pairUsesBitcoin(numeratorKey, denominatorKey) {
      return this.isBitcoinSeriesRef(numeratorKey) || this.isBitcoinSeriesRef(denominatorKey);
    },
    contextKeyFromSeriesRef(seriesKey = '') {
      return String(seriesKey || '').replace(/^context:/, '');
    },
    displayStartYearForSeriesRef(seriesKey = '') {
      if (!seriesKey) return null;
      const contextKey = this.contextKeyFromSeriesRef(seriesKey);
      const configured = this.contextSeries[contextKey]?.metadata?.display_start_year;
      if (configured) return Number(configured);
      return this.isBitcoinSeriesRef(seriesKey) ? 2017 : null;
    },
    pairDisplayStartYear(...seriesRefs) {
      const starts = seriesRefs
        .map((seriesRef) => this.displayStartYearForSeriesRef(seriesRef))
        .filter((year) => Number.isFinite(year));
      return starts.length ? Math.max(...starts) : null;
    },
    isBitcoinQuotedColumn(columnKey) {
      if (this.rebased) return false;
      if (this.mode === 'single') return this.pairUsesBitcoin(this.itemKey, this.denominatorSeriesRef());
      if (this.mode === 'compare') return this.pairUsesBitcoin(columnKey, this.denominatorSeriesRef());
      return this.mode === 'ratio' && this.pairUsesBitcoin(this.numeratorKey, this.denominatorKey) && columnKey === 'ratio';
    },
    denominatorType() {
      return this.allDenominator.startsWith('item:') ? 'item' : 'context';
    },
    denominatorKey() {
      return this.allDenominator.replace(/^(context:|item:)/, '');
    },
    denominatorSeriesRef() {
      return this.denominatorType() === 'item' ? `item:${this.denominatorKey()}` : `context:${this.denominatorKey()}`;
    },
    denominatorLabel() {
      if (this.denominatorType() === 'item') return this.items.find((item) => item.key === this.denominatorKey())?.name || this.denominatorKey();
      return this.contextSeries[this.denominatorKey()]?.label || this.denominatorKey();
    },
    referenceItemFromContext(contextKey, context) {
      return {
        key: `context:${contextKey}`,
        name: context.label || contextKey,
        category: 'reference',
        values: context.values || [],
        sources: context.sources || [],
        metadata: { reference_context_key: contextKey },
      };
    },
    withReferenceItems(items = []) {
      const existingKeys = new Set(items.map((item) => item.key));
      const referenceItems = Object.entries(this.contextSeries)
        .filter(([contextKey]) => !existingKeys.has(`context:${contextKey}`))
        .map(([contextKey, context]) => this.referenceItemFromContext(contextKey, context));
      return [...items, ...referenceItems];
    },
    formatTableValue(value, columnKey) {
      if (this.mode === 'macro') {
        return formatNumber(value);
      }
      if (this.isBitcoinQuotedColumn(columnKey)) return formatBitcoinHuman(value);
      return formatNumber(value);
    },
    seriesName(seriesKey) {
      if (!seriesKey) return '—';
      if (this.mode === 'macro') return this.macroMetrics.find((metric) => metric.key === seriesKey)?.name || seriesKey;
      if (seriesKey.startsWith('context:')) return this.contextSeries[seriesKey.replace('context:', '')]?.label || seriesKey;
      return this.items.find((item) => item.key === seriesKey)?.name || seriesKey;
    },
    readParams() {
      const p = new URLSearchParams(window.location.search);
      const denom = p.get('denom') || 'context:fiat';
      this.allDenominator = denom.includes(':') ? denom : `context:${denom}`;
      this.selectedRange = p.get('range') || 'last30';
      this.rebased = p.get('rebased') === '1';
      this.selectedKeys = (p.get('items') || '').split(',').filter(Boolean);
      this.itemKey = p.get('item') || '';
      this.mode = p.get('mode') || 'compare';
      this.numeratorKey = p.get('itemA') || '';
      this.denominatorKey = p.get('itemB') || '';
      this.macroMetricKey = p.get('metric') || '';
      this.macroCategory = p.get('category') || 'all';
      this.theme = p.get('theme') === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    rangeBounds() {
      if (this.selectedRange === 'last10') return [this.years[Math.max(0, this.years.length - 10)], this.years[this.years.length - 1]];
      if (this.selectedRange === 'last20') return [this.years[Math.max(0, this.years.length - 20)], this.years[this.years.length - 1]];
      if (this.selectedRange === 'last30') return [this.years[Math.max(0, this.years.length - 30)], this.years[this.years.length - 1]];
      if (this.selectedRange === 'last40') return [this.years[Math.max(0, this.years.length - 40)], this.years[this.years.length - 1]];
      return [this.years[0], this.years[this.years.length - 1]];
    },
    annualSeriesValuesForKey(seriesKey) {
      if (!seriesKey) return [];
      if (seriesKey.startsWith('context:')) return this.contextSeries[seriesKey.replace('context:', '')]?.values || [];
      return this.items.find((item) => item.key === seriesKey)?.values || [];
    },
    convertSeries(item, denominator) {
      if (!item) return [];
      return item.values.map((price, idx) => {
        const d = this.contextSeries[denominator]?.values?.[idx];
        if (price == null || d == null || d === 0) return null;
        return price / d;
      });
    },
    rebaseStartYears(seriesKeys, denominator = null) {
      const [fromYear, toYear] = this.rangeBounds();
      return seriesKeys.map((seriesKey) => {
        if (!seriesKey) return null;
        const values = denominator && !seriesKey.startsWith('context:')
          ? this.convertSeries(this.items.find((item) => item.key === seriesKey), denominator)
          : this.annualSeriesValuesForKey(seriesKey);
        return this.years.find((year, idx) => year >= fromYear && year <= toYear && values[idx] != null);
      }).filter((year) => year != null);
    },
    costRebaseForcedStartYear(seriesKeys, denominator = null) {
      if (!this.rebased) return null;
      const starts = this.rebaseStartYears(seriesKeys, denominator);
      return starts.length ? Math.max(...starts) : null;
    },
    applySeriesTransforms(points, forcedStartYear = null) {
      if (!this.rebased) return points;
      const startYear = forcedStartYear ?? points.find((point) => point.value != null)?.year;
      const rebasingPoint = points.find((point) => point.year >= startYear && point.value != null);
      if (!rebasingPoint?.value) return points.filter((point) => point.year >= startYear);
      return points.filter((point) => point.year >= rebasingPoint.year).map((point) => ({ ...point, value: (point.value / rebasingPoint.value) * 100 }));
    },
    visiblePairSeries(numeratorKey, denominatorKey, forcedStartYear = null) {
      const [fromYear, toYear] = this.rangeBounds();
      const numeratorAnnual = this.annualSeriesValuesForKey(numeratorKey);
      const denominatorAnnual = this.annualSeriesValuesForKey(denominatorKey);
      let points = this.years.map((year, idx) => {
        const numeratorValue = numeratorAnnual[idx];
        const denominatorValue = denominatorAnnual[idx];
        if (numeratorValue == null || denominatorValue == null || denominatorValue === 0) return { year, value: null, observed: false };
        return { year, value: numeratorValue / denominatorValue, observed: true };
      }).filter((point) => point.year >= fromYear && point.year <= toYear && point.observed);
      const displayStartYear = this.pairDisplayStartYear(numeratorKey, denominatorKey);
      if (displayStartYear) points = points.filter((point) => point.year >= displayStartYear);
      return this.applySeriesTransforms(points, forcedStartYear);
    },
    downloadCsv() {
      const headers = ['Year', ...this.compareTableColumns.map((column) => column.name)];
      const rows = this.compareTableRows.map((row) => [row.year, ...this.compareTableColumns.map((column) => row.values[column.key] == null ? '' : row.values[column.key].toFixed(6))]);
      const csv = [headers, ...rows].map((row) => row.map((value) => {
        const text = String(value);
        return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
      }).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `priced-in-yearly-${this.mode}-${this.allDenominator}-${this.selectedRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    async fetchData() {
      this.isLoading = true;
      this.error = '';
      try {
        if (this.mode === 'macro') {
          const macroResponse = await fetch('macro-trends.json', { cache: 'no-store' });
          if (!macroResponse.ok) throw new Error(`Macro dataset unavailable (${macroResponse.status})`);
          const macroPayload = await macroResponse.json();
          this.macroMetrics = Array.isArray(macroPayload?.metrics) ? macroPayload.metrics : [];
          if (!this.macroMetrics.length) throw new Error('macro dataset malformed');
          if (!this.macroMetricKey || !this.macroMetrics.some((metric) => metric.key === this.macroMetricKey)) {
            const metricFromCategory = this.macroCategory === 'all'
              ? this.macroMetrics[0]
              : this.macroMetrics.find((metric) => metric.category === this.macroCategory);
            this.macroMetricKey = metricFromCategory?.key || this.macroMetrics[0]?.key || '';
          }
          return;
        }
        const response = await fetch('prices-api.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Data unavailable (${response.status})`);
        const payload = await response.json();
        if (!isValidDataset(payload)) throw new Error('dataset malformed');
        this.years = payload.years;
        this.contextSeries = payload.contextSeries;
        this.items = this.withReferenceItems(payload.items);
        if (this.mode === 'single' && (!this.itemKey || !this.items.some((item) => item.key === this.itemKey))) this.itemKey = this.items[0]?.key || '';
        if (this.mode === 'ratio') {
          if (!this.numeratorKey) this.numeratorKey = this.items[0]?.key || '';
          if (!this.denominatorKey) this.denominatorKey = this.items[1]?.key || this.items[0]?.key || '';
        }
        if (this.mode === 'compare' && !this.selectedKeys.length) this.selectedKeys = this.items.slice(0, 3).map((item) => item.key);
      } catch (err) {
        this.error = `Unable to load pricing data: ${err.message}`;
      } finally {
        this.isLoading = false;
      }
    },
  },
  async mounted() {
    this.readParams();
    await this.fetchData();
  },
}).mount('#app');
