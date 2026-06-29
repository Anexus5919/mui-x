import * as React from 'react';
import { createRenderer } from '@mui/internal-test-utils';
import { barClasses } from '@mui/x-charts/BarChart';
import { chartsAxisHighlightClasses } from '@mui/x-charts/ChartsAxisHighlight';
import { BarChartPro } from './BarChartPro';

describe('<BarChartPro /> - Sampling', () => {
  const { render } = createRenderer();

  const countBars = (container: HTMLElement) =>
    container.querySelectorAll(`.${barClasses.element}`).length;

  const range = (length: number) => Array.from({ length }, (_, i) => i);

  // Sampling only applies to zoomable axes, so every case enables zoom.
  it('renders one bar per data point when bars are wide enough', () => {
    const { container } = render(
      <BarChartPro
        series={[{ data: range(8) }]}
        xAxis={[{ data: range(8).map(String), zoom: true }]}
        yAxis={[{ position: 'none' }]}
        width={2000}
        height={200}
        margin={0}
        sampling="minmax"
        skipAnimation
      />,
    );

    expect(countBars(container)).to.equal(8);
  });

  it('samples bars when they would be thinner than the minimum width', () => {
    const dataLength = 256;
    const { container } = render(
      <BarChartPro
        series={[{ data: range(dataLength) }]}
        xAxis={[{ data: range(dataLength).map(String), zoom: true }]}
        yAxis={[{ position: 'none' }]}
        width={200}
        height={200}
        margin={0}
        sampling="minmax"
        skipAnimation
      />,
    );

    const rendered = countBars(container);
    expect(rendered).to.be.greaterThan(0);
    expect(rendered).to.be.lessThan(dataLength / 2);
  });

  it('renders every bar when sampling is disabled (default)', () => {
    const dataLength = 256;
    const { container } = render(
      <BarChartPro
        series={[{ data: range(dataLength) }]}
        xAxis={[{ data: range(dataLength).map(String), zoom: true }]}
        yAxis={[{ position: 'none' }]}
        width={200}
        height={200}
        margin={0}
        sampling="none"
        skipAnimation
      />,
    );

    expect(countBars(container)).to.equal(dataLength);
  });

  const renderReversible = (reverse: boolean) =>
    render(
      <BarChartPro
        series={[{ data: range(256) }]}
        xAxis={[{ id: 'x', data: range(256).map(String), zoom: true, reverse }]}
        yAxis={[{ position: 'none' }]}
        width={200}
        height={200}
        margin={0}
        sampling="minmax"
        axisHighlight={{ x: 'band' }}
        highlightedAxis={[{ axisId: 'x', dataIndex: 0 }]}
        skipAnimation
      />,
    );

  const readBars = (container: HTMLElement) =>
    Array.from(container.querySelectorAll(`.${barClasses.element}`)).map((bar) => ({
      x: Number(bar.getAttribute('x')),
      width: Number(bar.getAttribute('width')),
    }));

  it('mirrors sampled bars on a reversed band axis instead of shifting them off-span', () => {
    const normal = readBars(renderReversible(false).container);
    const reversed = readBars(renderReversible(true).container);

    expect(normal.length).to.be.greaterThan(0);
    expect(reversed.length).to.equal(normal.length);

    const left = Math.min(...normal.map((bar) => bar.x));
    const right = Math.max(...normal.map((bar) => bar.x + bar.width));

    // Reversing keeps the same horizontal coverage instead of pushing bars past their span.
    expect(Math.min(...reversed.map((bar) => bar.x))).to.be.closeTo(left, 0.5);
    expect(Math.max(...reversed.map((bar) => bar.x + bar.width))).to.be.closeTo(right, 0.5);

    // Each reversed bar is the horizontal mirror of a bar on the default axis.
    const mirrored = reversed
      .map((bar) => ({ x: left + right - (bar.x + bar.width), width: bar.width }))
      .sort((a, b) => a.x - b.x);
    [...normal]
      .sort((a, b) => a.x - b.x)
      .forEach((bar, index) => {
        expect(mirrored[index].x).to.be.closeTo(bar.x, 0.5);
        expect(mirrored[index].width).to.be.closeTo(bar.width, 0.5);
      });
  });

  it('widens the band highlight over the merged bucket on a reversed band axis', () => {
    const width = 200;
    const readBand = (container: HTMLElement) => {
      const d = container.querySelector(`.${chartsAxisHighlightClasses.root}`)!.getAttribute('d')!;
      const [, start, size] = d.match(/^M ([\d.-]+) [\d.-]+ l ([\d.-]+) /)!;
      return { start: Number(start), size: Number(size) };
    };

    const normal = readBand(renderReversible(false).container);
    const reversed = readBand(renderReversible(true).container);

    // Same bucket width, and the band stays inside the drawing area on both axes.
    expect(reversed.size).to.be.closeTo(normal.size, 0.5);
    expect(normal.start).to.be.closeTo(0, 0.5);
    expect(reversed.start + reversed.size).to.be.closeTo(width, 0.5);
    // dataIndex 0 sits at the left by default and mirrors to the right when reversed.
    expect(reversed.start).to.be.closeTo(width - (normal.start + normal.size), 0.5);
  });
});
