import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface NetworkDataPoint {
    name: string;
    received: number;
    sent: number;
    timestamp: number;
}

interface LineChartProps {
    width: number;
    height: number;
    data: NetworkDataPoint[];
}

const LineChart = ({ width, height, data }: LineChartProps) => {
    // Garantir que data sempre tenha valores válidos e seja um array
    const chartData = Array.isArray(data)
        ? data.map(item => ({
            name: item?.name || '0',
            received: Number(item?.received) || 0,
            sent: Number(item?.sent) || 0,
            timestamp: item?.timestamp || Date.now()
        }))
        : [];

    // Se não houver dados, retorna null ou um placeholder
    if (chartData.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
                <p>No data available</p>
            </div>
        );
    }

    return (
        <AreaChart
            data={chartData}
            width={width}
            height={height}
            margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
                formatter={(value: number, name: string) => {
                    const absValue = Math.abs(Number(value));
                    let formattedValue = value;
                    let unit = 'B/s';

                    if (absValue < 1024) {
                        formattedValue = Number(value);
                        unit = 'B/s';
                    } else if (absValue < 1024 * 1024) {
                        formattedValue = Number(value) / 1024;
                        unit = 'KB/s';
                    } else if (absValue < 1024 * 1024 * 1024) {
                        formattedValue = Number(value) / (1024 * 1024);
                        unit = 'MB/s';
                    } else {
                        formattedValue = Number(value) / (1024 * 1024 * 1024);
                        unit = 'GB/s';
                    }

                    return [`${formattedValue.toFixed(2)} ${unit}`, name];
                }}
            />
            <Area
                type="monotone"
                dataKey="received"
                stroke="#8884d8"
                fill="#8884d8"
                name="Received"
                isAnimationActive={false}
            />
            <Area
                type="monotone"
                dataKey="sent"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Sent"
                isAnimationActive={false}
            />
        </AreaChart>
    );
};

export default LineChart;