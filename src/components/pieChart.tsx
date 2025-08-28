import { Cell, Pie, PieChart } from 'recharts';

const RADIAN = Math.PI / 180;
// const chartData = [
//   { name: 'A', value: 80, color: '#ff0000' },
//   { name: 'B', value: 45, color: '#00ff00' },
//   { name: 'C', value: 25, color: '#0000ff' },
// ];

type Needle = {
  value: number;
  data: { name: string; value: number; color: string }[];
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
};

const needle = ({ value, data, cx, cy, iR, oR, color }: Needle) => {
  // const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const total = 100;
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="needle-circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="needle-path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="#none"
      fill={color}
    />,
  ];
};

export default function ChartPie(wid: number, hei: number, val: number) {
  const cx = 150;
  const cy = 150;
  const iR = 60;
  const oR = 100;
  const value = val;

  const chartData = [
    { name: 'A', value: val, color: '#ff3838' },
    { name: 'B', value: 100 - val, color: '#737373' },
  ];

  return (
    <>
      <PieChart width={wid} height={hei}>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={chartData}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          fill="#8884d8"
          stroke="none"
          isAnimationActive={false}
        >
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
        {needle({ value, data: chartData, cx, cy, iR, oR, color: '#23fcd1' })}
      </PieChart>
    </>
  );
}
