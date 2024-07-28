const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3002; // Changed port number

app.use(cors());

app.get('/proxy', async (req, res) => {
  const { startDate, endDate, token } = req.query;
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${startDate}/${endDate}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Bmx-Token': token,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
