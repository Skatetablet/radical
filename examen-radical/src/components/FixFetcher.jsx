import { useState, useEffect } from 'react';

const FixFetcher = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);

  // Se manejan las date pickers para el uso de la api
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  //Fetch datos a la api de Banxico
  const fetchData = async () => {
    const token = '{TOKEN}';
    const url = `http://localhost:3002/proxy?startDate=${startDate}&endDate=${endDate}&token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      const datos = responseData?.bmx?.series?.[0]?.datos || [];
      setData(datos);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);
  console.log(data);

  return (
    <div className='flex flex-col items-center p-4'>
      <h2 className='text-2xl font-bold mb-4'>FIX Tipo de Cambio</h2>
      <div className='flex flex-col items-center mb-4'>
        <label className='mb-2'>
          Fecha Inicial :
          <input
            type='date'
            value={startDate}
            onChange={handleStartDateChange}
            className='ml-2 p-2 border border-gray-400 rounded'
          />
        </label>
        <label>
          Fecha Final:
          <input
            type='date'
            value={endDate}
            onChange={handleEndDateChange}
            className='ml-2 p-2 border border-gray-400 rounded'
          />
        </label>
      </div>

      <div className='overflow-x-auto mt-4'>
        {data && data.length > 0 ? (
          <table className='min-w-full bg-white border border-gray-200'>
            <thead>
              <tr>
                <th className='py-2 px-4 bg-gray-100 border-b'>Fecha</th>
                <th className='py-2 px-4 bg-gray-100 border-b'>Dato</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className='py-2 px-4 border-b'>{item.fecha}</td>
                  <td className='py-2 px-4 border-b'>${item.dato}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            No hay datos disponibles. Por favor seleccione un rango de fechas.
          </p>
        )}
      </div>
    </div>
  );
};

export default FixFetcher;
