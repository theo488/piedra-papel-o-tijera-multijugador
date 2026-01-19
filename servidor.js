const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.static(path.join(__dirname)));

// Servir el HTML en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina-epica.html'));
});

const salas = {};

// Crear sala
app.post('/api/crearSala', (req, res) => {
  try {
    const codigo = req.body.codigo;
    if (!codigo) {
      return res.json({ success: false, error: 'Código requerido' });
    }
    
    if (!salas[codigo]) {
      salas[codigo] = {
        codigo: codigo,
        jugador1: {
          conectado: true,
          puntos: 0,
          jugada: null
        },
        jugador2: {
          conectado: false,
          puntos: 0,
          jugada: null
        },
        ronda: 1
      };
      console.log('Sala creada:', codigo);
      return res.json({ success: true, codigo: codigo });
    } else {
      return res.json({ success: false, error: 'Sala ya existe' });
    }
  } catch (error) {
    console.error('Error en crearSala:', error);
    res.json({ success: false, error: error.message });
  }
});

// Unirse a sala
app.post('/api/unirseSala', (req, res) => {
  try {
    const codigo = req.body.codigo;
    if (salas[codigo]) {
      if (salas[codigo].jugador2.conectado) {
        return res.json({ success: false, error: 'Sala llena' });
      } else {
        salas[codigo].jugador2.conectado = true;
        console.log('Jugador 2 se unió a:', codigo);
        return res.json({ success: true, sala: salas[codigo] });
      }
    } else {
      return res.json({ success: false, error: 'Sala no encontrada' });
    }
  } catch (error) {
    console.error('Error en unirseSala:', error);
    res.json({ success: false, error: error.message });
  }
});

// Obtener estado de sala
app.get('/api/sala/:codigo', (req, res) => {
  try {
    const codigo = req.params.codigo;
    if (salas[codigo]) {
      res.json({ success: true, sala: salas[codigo] });
    } else {
      res.json({ success: false, error: 'Sala no encontrada' });
    }
  } catch (error) {
    console.error('Error en obtener sala:', error);
    res.json({ success: false, error: error.message });
  }
});

// Enviar jugada
app.post('/api/jugada', (req, res) => {
  const { codigo, numeroJugador, jugada } = req.body;
  if (salas[codigo]) {
    if (numeroJugador === 1) {
      salas[codigo].jugador1.jugada = jugada;
    } else {
      salas[codigo].jugador2.jugada = jugada;
    }
    res.json({ success: true, sala: salas[codigo] });
  } else {
    res.json({ success: false, error: 'Sala no encontrada' });
  }
});

// Siguiente ronda
app.post('/api/proximaRonda', (req, res) => {
  const { codigo } = req.body;
  if (salas[codigo]) {
    salas[codigo].ronda++;
    salas[codigo].jugador1.jugada = null;
    salas[codigo].jugador2.jugada = null;
    res.json({ success: true, ronda: salas[codigo].ronda });
  } else {
    res.json({ success: false, error: 'Sala no encontrada' });
  }
});

// Limpiar sala
app.post('/api/limpiarSala', (req, res) => {
  const { codigo } = req.body;
  if (salas[codigo]) {
    delete salas[codigo];
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});
