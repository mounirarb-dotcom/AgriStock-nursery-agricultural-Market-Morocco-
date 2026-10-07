import React, { useRef, useEffect, useState, useId } from 'react';
import * as d3 from 'd3';
import {
  LotTimeSeries,
  TrendMetricKey,
  TREND_METRICS,
  GrowthDataPoint,
} from '../utils/growthTrendGenerator';

interface Props {
  seriesList: LotTimeSeries[];
  activeMetric: TrendMetricKey;
  showComparison: boolean;
  onHoverPoint?: (pt: GrowthDataPoint | null, variety: string | null) => void;
  chartSvgRef?: React.RefObject<SVGSVGElement | null>;
}

export const NurseryGrowthTrendChart: React.FC<Props> = ({
  seriesList,
  activeMetric,
  showComparison,
  onHoverPoint,
  chartSvgRef: externalSvgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;
  const gradientId = useId().replace(/:/g, '-');

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 380,
  });

  const [hoveredData, setHoveredData] = useState<{
    point: GrowthDataPoint;
    series: LotTimeSeries;
    x: number;
    y: number;
  } | null>(null);

  // ResizeObserver on the container element as required by guidelines
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width } = entry.contentRect;
      if (width > 0) {
        // Maintain a pleasant aspect ratio between 320px and 450px height
        const height = Math.min(460, Math.max(300, Math.round(width * 0.46)));
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const metricConfig = TREND_METRICS[activeMetric];

  // Helper to extract numeric value from point
  const getVal = (pt: GrowthDataPoint): number => {
    switch (activeMetric) {
      case 'height':
        return pt.heightCm;
      case 'stock':
        return pt.stockAvailable;
      case 'sales':
        return pt.cumulativeSales;
      case 'diameter':
        return pt.collarDiameterMm;
      case 'value':
        return pt.inventoryValueMAD;
      default:
        return pt.heightCm;
    }
  };

  // D3 Rendering effect
  useEffect(() => {
    if (!svgRef.current || seriesList.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 28, right: 35, bottom: 45, left: activeMetric === 'value' ? 75 : 55 };
    const innerWidth = Math.max(0, width - margin.left - margin.right);
    const innerHeight = Math.max(0, height - margin.top - margin.bottom);

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Determine domain from series
    const displayedSeries = showComparison ? seriesList : [seriesList[0]];

    const allPoints: GrowthDataPoint[] = displayedSeries.flatMap(s => s.points);
    if (allPoints.length === 0) return;

    const xExtent = d3.extent(allPoints, d => d.date);
    const xDomain: [Date, Date] = [xExtent[0] || new Date(), xExtent[1] || new Date()];
    const yMaxVal = d3.max(allPoints, (d: GrowthDataPoint) => getVal(d)) || 10;
    const yMinVal = d3.min(allPoints, (d: GrowthDataPoint) => getVal(d)) || 0;

    // Y domain with a bit of top headroom
    const yMarginFactor = activeMetric === 'height' || activeMetric === 'diameter' ? 1.15 : 1.12;
    const yDomain: [number, number] = [
      Math.max(0, yMinVal * 0.85),
      Math.max(1, yMaxVal * yMarginFactor),
    ];

    // Scales
    const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Defs for gradients & clip-paths
    const defs = svg.append('defs');

    // Area Gradient for primary series
    const primaryColor = displayedSeries[0]?.color || metricConfig.color;
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', `area-grad-${gradientId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.28);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.0);

    // Root Group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Grid Lines
    const yTicksCount = Math.max(4, Math.floor(innerHeight / 50));
    const yTicks = yScale.ticks(yTicksCount);

    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e7e5e4')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // X Axis
    const xAxisGenerator = d3
      .axisBottom<Date>(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 100)))
      .tickFormat(d => {
        const date = d as Date;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      });

    const xAxisG = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxisGenerator);

    xAxisG.select('.domain').attr('stroke', '#d6d3d1').attr('stroke-width', 1.5);
    xAxisG.selectAll('.tick line').attr('stroke', '#d6d3d1');
    xAxisG
      .selectAll('.tick text')
      .attr('fill', '#78716c')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('dy', '12px');

    // Y Axis
    const yAxisGenerator = d3
      .axisLeft(yScale)
      .ticks(yTicksCount)
      .tickFormat(d => {
        const num = d as number;
        if (activeMetric === 'value') {
          if (num >= 1000) return `${Math.round(num / 1000)}k`;
          return `${num}`;
        }
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return `${num}`;
      });

    const yAxisG = g.append('g').attr('class', 'y-axis').call(yAxisGenerator);

    yAxisG.select('.domain').attr('stroke', '#d6d3d1').attr('stroke-width', 1.5);
    yAxisG.selectAll('.tick line').attr('stroke', '#d6d3d1');
    yAxisG
      .selectAll('.tick text')
      .attr('fill', '#78716c')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('dx', '-6px');

    // Unit Label on top of Y-axis
    g.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', '#57534e')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text(`${metricConfig.label} (${metricConfig.unit})`);

    // Line & Area Generators
    const lineGenerator = d3
      .line<GrowthDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(getVal(d)))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<GrowthDataPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(getVal(d)))
      .curve(d3.curveMonotoneX);

    // Draw primary series area fill (only for main series to avoid clutter)
    if (displayedSeries[0]?.points.length > 0) {
      g.append('path')
        .datum(displayedSeries[0].points)
        .attr('class', 'area-fill')
        .attr('d', areaGenerator)
        .attr('fill', `url(#area-grad-${gradientId})`);
    }

    // Render each series line
    displayedSeries.forEach((series, idx) => {
      const isPrimary = idx === 0;
      const strokeColor = series.color;

      const path = g
        .append('path')
        .datum(series.points)
        .attr('class', `line-${series.lotId}`)
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', isPrimary ? 3 : 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGenerator);

      // Path dash animation for smooth entrance
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength?.() || 1000;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // Data dots on key points or events
      series.points.forEach((pt, pIdx) => {
        const isLast = pIdx === series.points.length - 1;
        const hasEvent = !!pt.eventNote;

        if (isLast || hasEvent || series.points.length <= 15) {
          const cx = xScale(pt.date);
          const cy = yScale(getVal(pt));

          const dot = g
            .append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', hasEvent ? 5 : isLast ? 4.5 : 3)
            .attr('fill', hasEvent ? '#f59e0b' : strokeColor)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('class', 'data-dot');

          if (hasEvent) {
            dot.attr('stroke', '#78350f').attr('stroke-width', 1.5);
          }
        }
      });
    });

    // Crosshair overlay elements
    const crosshairGroup = g.append('g').attr('class', 'crosshair-group').style('display', 'none');

    const crosshairLine = crosshairGroup
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#78716c')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    const crosshairDots: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];
    displayedSeries.forEach(series => {
      const dot = crosshairGroup
        .append('circle')
        .attr('r', 6)
        .attr('fill', series.color)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5);
      crosshairDots.push(dot);
    });

    // Bisector for tracking mouse position
    const bisectDate = d3.bisector<GrowthDataPoint, Date>(d => d.date).left;

    // Invisible interactive mouse overlay
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair')
      .on('mouseenter', () => {
        crosshairGroup.style('display', null);
      })
      .on('mouseleave', () => {
        crosshairGroup.style('display', 'none');
        setHoveredData(null);
        if (onHoverPoint) onHoverPoint(null, null);
      })
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const mouseDate = xScale.invert(mx);

        // Find nearest point in primary series
        const primarySeries = displayedSeries[0];
        if (!primarySeries || primarySeries.points.length === 0) return;

        const idx = bisectDate(primarySeries.points, mouseDate, 1);
        const d0 = primarySeries.points[idx - 1];
        const d1 = primarySeries.points[idx];
        let nearestPt = d0;
        if (d1 && d0) {
          nearestPt =
            mouseDate.getTime() - d0.date.getTime() > d1.date.getTime() - mouseDate.getTime()
              ? d1
              : d0;
        } else if (d1) {
          nearestPt = d1;
        }

        if (!nearestPt) return;

        const xPos = xScale(nearestPt.date);
        crosshairLine.attr('x1', xPos).attr('x2', xPos);

        // Position dots for each displayed series at this date
        displayedSeries.forEach((series, sIdx) => {
          const pt =
            series.points.find(p => p.dateStr === nearestPt.dateStr) ||
            series.points[Math.min(idx, series.points.length - 1)];
          if (pt && crosshairDots[sIdx]) {
            crosshairDots[sIdx]
              .attr('cx', xScale(pt.date))
              .attr('cy', yScale(getVal(pt)))
              .style('display', null);
          }
        });

        // Compute container-relative position for HTML tooltip
        const containerRect = containerRef.current?.getBoundingClientRect();
        const tooltipX = margin.left + xPos;
        const tooltipY = margin.top + yScale(getVal(nearestPt));

        setHoveredData({
          point: nearestPt,
          series: primarySeries,
          x: tooltipX,
          y: tooltipY,
        });

        if (onHoverPoint) {
          onHoverPoint(nearestPt, primarySeries.variety);
        }
      });
  }, [dimensions, seriesList, activeMetric, showComparison, gradientId, onHoverPoint]);

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full overflow-visible"
      />

      {/* Floating Interactive Tooltip */}
      {hoveredData && (
        <div
          className="absolute z-20 pointer-events-none transition-transform duration-75 ease-out shadow-xl rounded-2xl p-3 bg-stone-900/95 backdrop-blur-md text-white border border-stone-700/80 text-xs min-w-[200px]"
          style={{
            left: `${Math.min(Math.max(10, hoveredData.x - 100), dimensions.width - 220)}px`,
            top: `${Math.max(10, hoveredData.y - 120)}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5 mb-1.5">
            <span className="font-bold text-stone-300 capitalize text-[11px]">
              {hoveredData.point.formattedDate}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
              {hoveredData.point.dateStr}
            </span>
          </div>

          <div className="space-y-1">
            {showComparison ? (
              seriesList.map(series => {
                const pt =
                  series.points.find(p => p.dateStr === hoveredData.point.dateStr) ||
                  hoveredData.point;
                const val = getVal(pt);
                return (
                  <div key={series.lotId} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: series.color }}
                      />
                      <span className="truncate text-stone-200">{series.variety}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {val.toLocaleString('fr-FR')} {metricConfig.unit}
                    </span>
                  </div>
                );
              })
            ) : (
              <div>
                <div className="text-[10px] text-stone-400 font-medium">
                  {hoveredData.series.variety}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {getVal(hoveredData.point).toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">{metricConfig.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-stone-300">
                  <div>
                    <span className="text-stone-400 block">Vigueur :</span>
                    <span className="font-bold text-white">{hoveredData.point.vigorScore}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Sorties sem. :</span>
                    <span className="font-bold text-white">
                      {hoveredData.point.weeklyOfftake} plants
                    </span>
                  </div>
                </div>
              </div>
            )}

            {hoveredData.point.eventNote && (
              <div className="mt-2 pt-1.5 border-t border-amber-500/30 text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                <span>🌱 {hoveredData.point.eventNote}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
