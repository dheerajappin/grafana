import { GrafanaTheme, isDateTime, TimeOption, TimeRange, TimeZone } from '@grafana/data';
import { css, cx } from 'emotion';
import React, { memo, RefObject, useMemo, useState } from 'react';
import { useMedia, useWindowSize } from 'react-use';
import { stylesFactory, useTheme } from '../../../themes';
import { CustomScrollbar } from '../../CustomScrollbar/CustomScrollbar';
import { Icon } from '../../Icon/Icon';
import { stylesVariables } from '../stylesVariables';
import { mapRangeToTimeOption } from './mapper';
import { TimePickerTitle } from './TimePickerTitle';
import { TimeRangeForm } from './TimeRangeForm';
import { TimeRangeList } from './TimeRangeList';
import { TimePickerFooter } from './TimePickerFooter';

interface Fits {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

const checkIfFits = (windowWidth: number, windowHeight: number, bounding?: DOMRect): Fits => {
  if (!bounding) {
    return {
      left: true,
      right: true,
      bottom: true,
      top: true,
    };
  }

  const { bodyTallHeight, containerWideWidth, calendarWidth } = stylesVariables;
  const top = bounding.top - bodyTallHeight - bounding.height >= 0;
  const bottom = bounding.bottom + bodyTallHeight + bounding.height <= windowHeight;
  const left = bounding.right - containerWideWidth - calendarWidth >= 0;
  const right = bounding.left + containerWideWidth + calendarWidth <= windowWidth;

  return {
    top,
    bottom,
    left,
    right,
  };
};

interface Props {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  onChangeTimeZone: (timeZone: TimeZone) => void;
  /** The ref of the element that is used as a trigger for opening the content */
  handleRef: RefObject<HTMLDivElement>;
  timeZone?: TimeZone;
  quickOptions?: TimeOption[];
  otherOptions?: TimeOption[];
  history?: TimeRange[];
  showHistory?: boolean;
  className?: string;
  hideTimeZone?: boolean;
  hideQuickRanges?: boolean;
}

export const TimePickerContent: React.FC<Props> = props => {
  const theme = useTheme();
  const isFullscreen = useMedia(`(min-width: ${theme.breakpoints.lg})`);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const bounding = useMemo(() => props.handleRef.current?.getBoundingClientRect(), [
    props.handleRef,
    windowWidth,
    windowHeight,
  ]);
  const fits = checkIfFits(windowWidth, windowHeight, bounding);
  const openRight = !fits.left && fits.right;
  const openTop = !fits.bottom && fits.top;

  return (
    <TimePickerContentWithPosition {...props} isFullscreen={isFullscreen} openRight={openRight} openTop={openTop} />
  );
};

const getStyles = stylesFactory(
  (theme: GrafanaTheme, openRight: boolean, openTop: boolean, isContainerTall: boolean, hideQuickRanges?: boolean) => {
    const containerBorder = theme.isDark ? theme.palette.dark9 : theme.palette.gray5;

    return {
      container: css`
        background: ${theme.colors.bodyBg};
        box-shadow: 0px 0px 20px ${theme.colors.dropdownShadow};
        position: absolute;
        z-index: ${theme.zIndex.dropdown};
        width: ${stylesVariables.containerWideWidth}px;
        ${openTop ? 'bottom' : 'top'}: 116%;
        border-radius: 2px;
        border: 1px solid ${containerBorder};
        ${openRight ? 'left' : 'right'}: 0;

        @media only screen and (max-width: ${theme.breakpoints.lg}) {
          width: ${stylesVariables.containerNarrowWidth}px;
        }
      `,
      body: css`
        display: flex;
        height: ${isContainerTall ? `${stylesVariables.bodyTallHeight}px` : `${stylesVariables.bodyShortHeight}px`};
      `,
      leftSide: css`
        display: flex;
        flex-direction: column;
        border-right: ${openRight ? 'none' : `1px solid ${theme.colors.border1}`};
        width: ${!hideQuickRanges ? '60%' : '100%'};
        overflow: hidden;
        order: ${openRight ? 1 : 0};
      `,
      rightSide: css`
        width: 40% !important;
        border-right: ${openRight ? `1px solid ${theme.colors.border1}` : 'none'};

        @media only screen and (max-width: ${theme.breakpoints.lg}) {
          width: 100% !important;
        }
      `,
      spacing: css`
        margin-top: 16px;
      `,
    };
  }
);

function mapToHistoryOptions(ranges?: TimeRange[], timeZone?: TimeZone): TimeOption[] {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return [];
  }
  return ranges.slice(ranges.length - 4).map(range => mapRangeToTimeOption(range, timeZone));
}

interface PropsWithPosition extends Omit<Props, 'handleRef'> {
  isFullscreen: boolean;
  openRight: boolean;
  openTop: boolean;
}

export const TimePickerContentWithPosition: React.FC<PropsWithPosition> = props => {
  const {
    quickOptions = [],
    otherOptions = [],
    hideQuickRanges,
    showHistory,
    history,
    isFullscreen,
    openRight,
    openTop,
  } = props;
  const theme = useTheme();
  const isHistoryEmpty = !!history?.length;
  const isContainerTall = (isFullscreen && showHistory) || (!isFullscreen && (!isHistoryEmpty || !hideQuickRanges));
  const styles = getStyles(theme, openRight, openTop, isContainerTall, hideQuickRanges);
  const historyOptions = mapToHistoryOptions(props.history, props.timeZone);

  return (
    <div className={cx(styles.container, props.className)}>
      <div className={styles.body}>
        {isFullscreen && (
          <div className={styles.leftSide}>
            <FullScreenForm {...props} historyOptions={historyOptions} />
          </div>
        )}
        {(!isFullscreen || !hideQuickRanges) && (
          <CustomScrollbar className={styles.rightSide}>
            {!isFullscreen && <NarrowScreenForm {...props} historyOptions={historyOptions} />}
            {!hideQuickRanges && (
              <>
                <TimeRangeList
                  title="Relative time ranges"
                  options={quickOptions}
                  onSelect={props.onChange}
                  value={props.value}
                  timeZone={props.timeZone}
                />
                <div className={styles.spacing} />
                <TimeRangeList
                  title="Other quick ranges"
                  options={otherOptions}
                  onSelect={props.onChange}
                  value={props.value}
                  timeZone={props.timeZone}
                />
              </>
            )}
          </CustomScrollbar>
        )}
      </div>
      {!props.hideTimeZone && isFullscreen && (
        <TimePickerFooter timeZone={props.timeZone} onChangeTimeZone={props.onChangeTimeZone} />
      )}
    </div>
  );
};

interface FormProps extends Omit<PropsWithPosition, 'history'> {
  historyOptions?: TimeOption[];
}

const getNarrowScreenStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    header: css`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${theme.colors.border1};
      padding: 7px 9px 7px 9px;
    `,
    body: css`
      border-bottom: 1px solid ${theme.colors.border1};
      box-shadow: inset 0px 2px 2px ${theme.colors.dropdownShadow};
    `,
    form: css`
      padding: 7px 9px 7px 9px;
    `,
  };
});

const NarrowScreenForm: React.FC<FormProps> = props => {
  const theme = useTheme();
  const { value, hideQuickRanges, onChange, timeZone, historyOptions, showHistory } = props;
  const isAbsolute = isDateTime(value.raw.from) || isDateTime(value.raw.to);
  const [collapsedFlag, setCollapsedFlag] = useState(!isAbsolute);
  const collapsed = hideQuickRanges ? false : collapsedFlag;
  const styles = getNarrowScreenStyles(theme);

  return (
    <>
      <div
        aria-label="TimePicker absolute time range"
        className={styles.header}
        onClick={() => {
          if (!hideQuickRanges) {
            setCollapsedFlag(!collapsed);
          }
        }}
      >
        <TimePickerTitle>Absolute time range</TimePickerTitle>
        {!hideQuickRanges && <Icon name={!collapsed ? 'angle-up' : 'angle-down'} />}
      </div>
      {!collapsed && (
        <div className={styles.body}>
          <div className={styles.form}>
            <TimeRangeForm value={value} onApply={onChange} timeZone={timeZone} isFullscreen={false} />
          </div>
          {showHistory && (
            <TimeRangeList
              title="Recently used absolute ranges"
              options={historyOptions || []}
              onSelect={onChange}
              value={value}
              placeholderEmpty={null}
              timeZone={timeZone}
            />
          )}
        </div>
      )}
    </>
  );
};

const getFullScreenStyles = stylesFactory((theme: GrafanaTheme, hideQuickRanges?: boolean) => {
  return {
    container: css`
      padding-top: 9px;
      padding-left: 11px;
      padding-right: ${!hideQuickRanges ? '20%' : '11px'};
    `,
    title: css`
      margin-bottom: 11px;
    `,
    recent: css`
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    `,
  };
});

const FullScreenForm: React.FC<FormProps> = props => {
  const theme = useTheme();
  const styles = getFullScreenStyles(theme, props.hideQuickRanges);

  return (
    <>
      <div className={styles.container}>
        <div aria-label="TimePicker absolute time range" className={styles.title}>
          <TimePickerTitle>Absolute time range</TimePickerTitle>
        </div>
        <TimeRangeForm
          value={props.value}
          timeZone={props.timeZone}
          onApply={props.onChange}
          isFullscreen={true}
          isReversed={props.openRight}
        />
      </div>
      {props.showHistory && (
        <div className={styles.recent}>
          <TimeRangeList
            title="Recently used absolute ranges"
            options={props.historyOptions || []}
            onSelect={props.onChange}
            value={props.value}
            placeholderEmpty={<EmptyRecentList />}
            timeZone={props.timeZone}
          />
        </div>
      )}
    </>
  );
};

const getEmptyListStyles = stylesFactory((theme: GrafanaTheme) => {
  const formBackground = theme.isDark ? theme.palette.gray15 : theme.palette.gray98;

  return {
    container: css`
      background-color: ${formBackground};
      padding: 12px;
      margin: 12px;

      a,
      span {
        font-size: 13px;
      }
    `,
    link: css`
      color: ${theme.colors.linkExternal};
    `,
  };
});

const EmptyRecentList = memo(() => {
  const theme = useTheme();
  const styles = getEmptyListStyles(theme);

  return (
    <div className={styles.container}>
      <div>
        <span>
          It looks like you haven&apos;t used this timer picker before. As soon as you enter some time intervals,
          recently used intervals will appear here.
        </span>
      </div>
      <div>
        <a
          className={styles.link}
          href="https://grafana.com/docs/grafana/latest/dashboards/time-range-controls"
          target="_new"
        >
          Read the documentation
        </a>
        <span> to find out more about how to enter custom time ranges.</span>
      </div>
    </div>
  );
});

EmptyRecentList.displayName = 'EmptyRecentList';
