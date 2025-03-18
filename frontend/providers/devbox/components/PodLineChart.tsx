'use client';

import dayjs from 'dayjs';
import * as echarts from 'echarts';
import React, { useEffect, useMemo, useRef } from 'react';

import { useGlobalStore } from '@/stores/global';
import { MonitorDataResult } from '@/types/monitor';
import { Box, Flex } from '@chakra-ui/react';

const map = {
  blue: {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(3, 190, 232, 0.42)'
        },
        {
          offset: 1,
          color: 'rgba(0, 182, 240, 0)'
        }
      ],
      global: false
    },
    lineColor: '#36ADEF'
  },
  deepBlue: {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(47, 112, 237, 0.42)'
        },
        {
          offset: 1,
          color: 'rgba(94, 159, 235, 0)'
        }
      ],
      global: false
    },
    lineColor: '#3293EC'
  },
  purple: {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(211, 190, 255, 0.42)'
        },
        {
          offset: 1,
          color: 'rgba(52, 60, 255, 0)'
        }
      ],
      global: false // 缺省为 false
    },
    lineColor: '#8172D8'
  },
  green: {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: 'rgba(4, 209, 148, 0.42)'
        },
        {
          offset: 1,
          color: 'rgba(19, 217, 181, 0)'
        }
      ],
      global: false
    },
    lineColor: '#00A9A6',
    max: 100
  },
  purpleBlue: {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: '#F5F7FD'
        },
        {
          offset: 1,
          color: 'rgba(52, 60, 255, 0)'
        }
      ],
      global: false // 缺省为 false
    },
    lineColor: '#3F76ED'
  }
};

const PodLineChart = ({
  type,
  data,
  isShowLabel = false,
  noBg = false,
  splitNumber = 2
}: {
  type: 'blue' | 'deepBlue' | 'green' | 'purple' | 'purpleBlue';
  data?: MonitorDataResult;
  noBg?: boolean;
  isShowLabel?: boolean;
  splitNumber?: number;
}) => {
  const { screenWidth } = useGlobalStore();
  const xData =
    data?.xData?.map((time) => (time ? dayjs(time * 1000).format('HH:mm') : '')) ||
    new Array(30).fill(0);
  const yData = data?.yData || new Array(30).fill('');

  const Dom = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();

  const handleChartClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseLeave = () => {
    if (myChart.current) {
      myChart.current.dispatchAction({
        type: 'hideTip'
      });
    }
  };

  const optionStyle = useMemo(
    () => ({
      areaStyle: {
        color: noBg ? 'transparent' : map[type].backgroundColor
      },
      lineStyle: {
        width: '1',
        color: map[type].lineColor
      },
      itemStyle: {
        width: 1.5,
        color: map[type].lineColor
      }
    }),
    [type]
  );
  const option = useRef({
    xAxis: {
      type: 'category',
      show: isShowLabel,
      boundaryGap: false,
      data: xData,
      axisLabel: {
        show: isShowLabel
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: false,
      splitNumber: splitNumber,
      max: 100,
      min: 0,
      axisLabel: {
        show: isShowLabel
      }
    },
    grid: {
      containLabel: isShowLabel,
      show: false,
      left: 0,
      right: isShowLabel ? 14 : 0,
      top: 10,
      bottom: 2
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      appendToBody: true,
      enterable: false,
      hideDelay: 100,
      formatter: (params: any[]) => {
        const axisValue = params[0]?.axisValue;
        return `
          <div style="padding: 8px; width: 200px;">
            <div style="border-bottom: 1px solid #F1F1F3; margin-bottom: 5px; color: #18181B; padding-bottom: 5px;">${
              axisValue || '2025-03-04 12:00'
            }</div>
            <div style="display: flex; align-items: center;">
              <div style="width: 10px; height: 10px; border-radius: 10px; background-color: #22C55E; margin-right: 5px; "></div>
              <div style="font-size: 12px; font-weight: 500; color: black;">${
                params[0]?.value || 0
              }%</div>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        data: yData,
        type: 'line',
        showSymbol: false,
        smooth: false,
        animationDuration: 300,
        animationEasingUpdate: 'linear',
        ...optionStyle,
        emphasis: {
          disabled: true
        }
      }
    ]
  });

  // init chart
  useEffect(() => {
    if (!Dom.current || myChart?.current?.getOption()) return;
    myChart.current = echarts.init(Dom.current);
    myChart.current && myChart.current.setOption(option.current);

    if (Dom.current) {
      Dom.current.addEventListener('click', handleChartClick);
      Dom.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (Dom.current) {
        Dom.current.removeEventListener('click', handleChartClick);
        Dom.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [Dom]);

  // data changed, update
  useEffect(() => {
    if (!myChart.current || !myChart?.current?.getOption()) return;
    option.current.xAxis.data = xData;
    option.current.series[0].data = yData;
    myChart.current.setOption(option.current);
  }, [xData, yData]);

  // type changed, update
  useEffect(() => {
    if (!myChart.current || !myChart?.current?.getOption()) return;
    option.current.series[0] = {
      ...option.current.series[0],
      ...optionStyle
    };
    myChart.current.setOption(option.current);
  }, [optionStyle]);

  // resize chart
  useEffect(() => {
    if (!myChart.current || !myChart.current.getOption()) return;
    myChart.current.resize();
  }, [screenWidth]);

  useEffect(() => {
    return () => {
      try {
        if (myChart?.current) {
          myChart?.current?.dispose();
          myChart.current = undefined;
        }
      } catch (error) {}
    };
  }, []);

  return <div ref={Dom} style={{ width: '100%', height: '100%' }} />;
};

export default React.memo(PodLineChart);
