import { Sector } from 'recharts';

export const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } =
    props;

  const nameText = payload.name || '';
  const valueText = `${value} users (${(percent * 100).toFixed(0)}%)`;

  const nameWidth = nameText.length * 9; // Bold text is wider
  const valueWidth = valueText.length * 7.5;
  const maxTextWidth = Math.max(nameWidth, valueWidth);
  const rectWidth = Math.max(maxTextWidth + 30, 150); // Padding + minimum width
  const rectX = cx - rectWidth / 2;

  const labelData = {
    rectX,
    rectWidth,
    cx,
    cy,
    nameText,
    valueText,
  };

  if (typeof window !== 'undefined') {
    (window as any).__pieChartActiveLabel = labelData;
  }

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
};
