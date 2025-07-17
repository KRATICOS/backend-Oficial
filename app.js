const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const allowedOrigins = [ 
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:8100',
  'https://frontend-materials-dispenser.vercel.app',
  'https://frontend-md-ytjd.vercel.app',
  'https://frontend-oficial-alpha.vercel.app',
  'https://frontend-oficial-h83m88c1b-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-ly3pcikbh-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-ad2xmwxg9-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-8g706hsjc-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-bszdjnuhp-emmanuels-projects-ad5ae683.vercel.app',
  'http://frontend-oficial-bszdjnuhp-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-ggb8v5l92-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-7uakbajeg-emmanuels-projects-ad5ae683.vercel.app',
  'https://frontend-oficial-mwssut7pz-emmanuels-projects-ad5ae683.vercel.app'
];


const corsOptions = {
  
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS: ' + origin));
    }
  },

  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan('dev'));

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./app/routes/authRoutes');
const usuarioRoutes = require('./app/routes/usuarioRoutes');
const itemsRoutes = require('./app/routes/items');
const historialRoutes = require('./app/routes/historialRoutes');
const inventarioRoutes = require('./app/routes/inventarioRoutes');
const uploadRoutes = require('./app/routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api', uploadRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'API de Meterials-Dispenser funcionando correctamente.' });
});

module.exports = app;
