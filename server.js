// server.js
const app = require('./app'); // tu app Express
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const DB_URL = process.env.DB_URL; // MongoDB Atlas URI
const PORT = process.env.PORT || 3000;

const client = new MongoClient(DB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Ajusta el origen si quieres mayor seguridad
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('⚡ Cliente desconectado:', socket.id);
  });
});

// Si usas rutas que dependen de io
const notificacionesRoutes = require('./app/routes/notificacionesRoutes')(io);
app.use('/api/notificaciones', notificacionesRoutes);

async function startServer() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    // Si quieres acceder a la base de datos en rutas, lo puedes hacer así:
    app.locals.db = client.db('nombre_de_tu_base'); // cambia el nombre

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });

    // Socket.IO usa el mismo puerto, no necesitas otro puerto separado
    // Si quieres que Socket.IO escuche en el mismo servidor, solo usa 'server' como aquí.

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

startServer();
