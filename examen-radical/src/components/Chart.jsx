import { useEffect, useState } from 'react';
import { Card } from '@tremor/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function Chart({ dataExcel }) {
  const [chartData, setChartData] = useState([]);

  //Se sacan los datos de estado y saldo actual.
  //Se suman los saldos de un solo estado para que no se repitan los estados
  const aggregateChartData = (data) => {
    const aggregatedData = data.reduce((acc, item) => {
      const estado = item.ESTADO;
      const saldoActual = parseInt(item.SALDO_ACTUAL, 10);

      if (!acc[estado]) {
        acc[estado] = 0;
      }

      acc[estado] += saldoActual;
      return acc;
    }, {});

    return Object.entries(aggregatedData).map(([estado, saldoActual]) => ({
      estado,
      saldoActual,
    }));
  };

  useEffect(() => {
    if (dataExcel) {
      const formattedData = aggregateChartData(dataExcel);
      setChartData(formattedData);
    }
  }, [dataExcel]);
  return (
    <div className='flex flex-col items-center p-4 w-full'>
      <Card>
        <div className='w-full md:w-2/3 lg:w-1/2'>
          <h2 className='text-2xl font-bold mb-4 text-center'>
            Saldo Actual por Estado
          </h2>
          <ResponsiveContainer width='100%' height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='estado' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='saldoActual' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Chart;
