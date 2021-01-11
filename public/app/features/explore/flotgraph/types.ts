import { GraphTooltipOptions, LegendDisplayMode, LegendPlacement } from '@grafana/ui';
import { YAxis } from '@grafana/data';
import Legend from 'app/plugins/panel/graph/Legend/Legend';

export interface SeriesOptions {
  color?: string;
  yAxis?: YAxis;
  [key: string]: any;
}
export interface GraphOptions {
  showBars: boolean;
  showLines: boolean;
  showPoints: boolean;
}

export interface Options {
  graph: GraphOptions;
  legend: {
    displayMode: LegendDisplayMode;
    placement: LegendPlacement;
  };
  series: {
    [alias: string]: SeriesOptions;
  };
  tooltipOptions: GraphTooltipOptions;
}

export const defaults: Options = {
  graph: {
    showBars: false,
    showLines: true,
    showPoints: false,
  },
  legend: {
    displayMode: LegendDisplayMode.List,
    placement: 'bottom',
  },
  series: {},
  tooltipOptions: { mode: 'single' },
};

export interface GraphLegendEditorLegendOptions {
  displayMode: LegendDisplayMode;
  placement: LegendPlacement;
  stats?: string[];
  decimals?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
