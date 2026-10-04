import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function DaysChart({ data, threshold }) {
  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} label={{ value: "Ditë/vit", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="days" name={`Days above ${threshold}°C`} fill="#e4572e" />
          <Line dataKey="trend" name="Trendi linear" type="linear" dot={false} stroke="#222" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}