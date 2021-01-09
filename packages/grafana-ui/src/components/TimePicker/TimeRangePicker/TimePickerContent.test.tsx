import React from 'react';
import { shallow } from 'enzyme';
import { TimePickerContentWithPosition } from './TimePickerContent';
import { dateTime, TimeRange } from '@grafana/data';

describe('TimePickerContent', () => {
  it('renders correctly in full screen', () => {
    const value = createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z');
    const wrapper = shallow(
      <TimePickerContentWithPosition
        onChangeTimeZone={() => {}}
        onChange={value => {}}
        timeZone="utc"
        value={value}
        isFullscreen={true}
        openRight={false}
        openTop={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly in narrow screen', () => {
    const value = createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z');
    const wrapper = shallow(
      <TimePickerContentWithPosition
        onChangeTimeZone={() => {}}
        onChange={value => {}}
        timeZone="utc"
        value={value}
        isFullscreen={false}
        openRight={false}
        openTop={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders recent absolute ranges correctly', () => {
    const value = createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z');
    const history = [
      createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z'),
      createTimeRange('2019-10-17T07:48:27.433Z', '2019-10-18T07:48:27.433Z'),
    ];

    const wrapper = shallow(
      <TimePickerContentWithPosition
        onChangeTimeZone={() => {}}
        onChange={value => {}}
        timeZone="utc"
        value={value}
        isFullscreen={true}
        openRight={false}
        openTop={false}
        history={history}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without ranges', () => {
    const value = createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z');

    const wrapper = shallow(
      <TimePickerContentWithPosition
        onChangeTimeZone={() => {}}
        onChange={value => {}}
        timeZone="utc"
        value={value}
        isFullscreen={true}
        openRight={false}
        openTop={false}
        hideQuickRanges={true}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders form when ranges are hidden', () => {
    const value = createTimeRange('2019-12-17T07:48:27.433Z', '2019-12-18T07:48:27.433Z');

    const wrapper = shallow(
      <TimePickerContentWithPosition
        onChangeTimeZone={() => {}}
        onChange={value => {}}
        timeZone="utc"
        value={value}
        isFullscreen={false}
        openRight={false}
        openTop={false}
        hideQuickRanges={true}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});

function createTimeRange(from: string, to: string): TimeRange {
  return {
    from: dateTime(from),
    to: dateTime(to),
    raw: { from: dateTime(from), to: dateTime(to) },
  };
}
