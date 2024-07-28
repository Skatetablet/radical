import { useState, useEffect } from 'react';
import { Card, Divider } from '@tremor/react';
import * as XLSX from 'xlsx';

import '../main.css';
import Chart from './Chart';
import FixFetcher from './FixFetcher';

const Reader = () => {
  const [dataExcel, setDataExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({ name: '', temp: 0 });
  const [tipoCambio, setTipoCambio] = useState(true);

  const apiKey = import.meta.env.VITE_APP_WEATHER_KEY;

  //Fetch para la api del clima
  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=29.09&lon=-110.96&units=metric&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        const weatherInfo = {
          name: data.name,
          temp: data.main.temp,
        };
        setWeatherData(weatherInfo);
      })
      .catch((error) => console.error(error));
  }, []);

  //Boton para renderizar la vista del tipo de cambio
  const viewTipoCambio = () => {
    setTipoCambio(!tipoCambio);
  };

  //Funcion para leer un archivo excel y recibirlo como un arreglo
  //De igual manera de implementa la adicion del campo de Suma Total
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: ' ' });
      const updatedData = jsonData.map((item) => {
        const saldoActual = parseInt(item.SALDO_ACTUAL, 10);
        const limiteDeCredito = parseInt(item.LIMITE_DE_CREDITO, 10);
        const saldoVencido = parseInt(item.SALDO_VENCIDO, 10);
        const saldoDisponible = limiteDeCredito - saldoActual;
        const sumaTotal =
          saldoActual + limiteDeCredito + saldoVencido + saldoDisponible;

        return {
          ...item,
          SALDO_DISPONIBLE: saldoDisponible,
          SUMA_TOTAL: sumaTotal,
        };
      });

      setDataExcel(updatedData);
      setLoading(true);
    };
    reader.readAsArrayBuffer(file);
  };

  //Funciones para obtener el saldo actual más alto y el más bajo
  const highestSaldo = dataExcel.reduce(
    (max, obj) => {
      const saldoActual = parseInt(obj.SALDO_ACTUAL, 10);
      return saldoActual > max.saldo ? { ...obj, saldo: saldoActual } : max;
    },
    { saldo: 0 }
  );

  const lowestSaldo = dataExcel.reduce(
    (min, obj) => {
      const saldoActual = parseInt(obj.SALDO_ACTUAL, 10);
      return saldoActual < min.saldo
        ? { ...obj, saldo: saldoActual, name }
        : min;
    },
    { saldo: Infinity }
  );

  return (
    <section className='flex flex-col items-center p-4'>
      <Card className='w-full lg:2/3  mb-4 p-4 '>
        <p className='text-xl text-red-400'>{weatherData.name}</p>
        <p className='text-lg'>{weatherData.temp}°</p>
        <button
          onClick={viewTipoCambio}
          className='text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-3 dark:bg-blue-600 dark:hover:bg-blue-700'>
          TIPO DE CAMBIO
        </button>
      </Card>

      <Divider />
      {tipoCambio && (
        <div className='w-full lg:w-full'>
          <input
            type='file'
            accept='.xlsx, .xls'
            onChange={handleFileUpload}
            className='mb-4'
          />
          <div className='flex justify-between items-center mt-4 mb-4'>
            <p className='text-cyan-600 text-xl font-bold'>
              {loading
                ? `Mayor Saldo: ${highestSaldo.PRIMER_NOMBRE} ${highestSaldo.SEGUNDO_NOMBRE} ${highestSaldo.APELLIDO_PATERNO} ${highestSaldo.APELLIDO_MATERNO}`
                : ''}
            </p>
            <p className='text-cyan-600 text-xl font-bold'>
              {loading
                ? `Menor Saldo: ${lowestSaldo.PRIMER_NOMBRE} ${lowestSaldo.SEGUNDO_NOMBRE} ${lowestSaldo.APELLIDO_PATERNO} ${lowestSaldo.APELLIDO_MATERNO}`
                : ''}
            </p>
            <p className='text-cyan-600 text-xl font-bold'>
              {loading ? `Numero de Registros: ${dataExcel.length}` : ''}
            </p>
          </div>
          <Card className='overflow-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-slate-100'>
                <tr>
                  {dataExcel.length > 0 &&
                    Object.keys(dataExcel[0]).map((key) => (
                      <th
                        key={key}
                        className='px-6 py-3 text-center text-md font-medium text-cyan-700 uppercase'>
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {dataExcel.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((cell, idx) => (
                      <td
                        key={idx}
                        className='px-6 py-4 whitespace-nowrap text-center'>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {loading && <Chart dataExcel={dataExcel} />}
        </div>
      )}

      {!tipoCambio && <FixFetcher />}
    </section>
  );
};

export default Reader;
