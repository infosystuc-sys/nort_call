// Nort Monitor — datos de ejemplo. Cada clave = una tabla en Supabase.
(function () {
  const AHORA = new Date('2026-10-15T16:40:00-03:00').getTime();
  const t = (minAgo) => new Date(AHORA - minAgo * 60000).toISOString();

  const usuarios = [
    { id: 'u1', nombre: 'Martina Ruiz', email: 'admin@suplenort.com', rol: 'admin', activo: true, creadoAt: t(90 * 1440) },
    { id: 'u2', nombre: 'Diego Paz', email: 'supervisor@suplenort.com', rol: 'supervisor', activo: true, creadoAt: t(80 * 1440) },
    { id: 'u3', nombre: 'Lucas Herrera', email: 'ventas@suplenort.com', rol: 'vendedor', activo: true, creadoAt: t(80 * 1440) },
    { id: 'u4', nombre: 'Sofía Ledesma', email: 'sofia@suplenort.com', rol: 'supervisor', activo: false, creadoAt: t(40 * 1440) },
  ];

  const canales = [
    { id: 'whatsapp', nombre: 'WhatsApp', proveedor: 'Evolution API', identificador: '+54 381 364 9036' },
    { id: 'instagram', nombre: 'Instagram', proveedor: 'Meta · Instagram Messaging API', identificador: '@suplementosnort' },
  ];

  const estadosVenta = [
    { id: 'nuevo', nombre: 'Nuevo', color: '#6B7280', orden: 1, activo: true },
    { id: 'consulta', nombre: 'Consulta', color: '#2F6FDB', orden: 2, activo: true },
    { id: 'cotizado', nombre: 'Cotizado', color: '#7A4FD6', orden: 3, activo: true },
    { id: 'negociacion', nombre: 'Negociación', color: '#D98A00', orden: 4, activo: true },
    { id: 'ganado', nombre: 'Cerrado ganado', color: '#1E8E4E', orden: 5, activo: true },
    { id: 'perdido', nombre: 'Perdido', color: '#C62828', orden: 6, activo: true },
    { id: 'postventa', nombre: 'Postventa', color: '#0F8A8A', orden: 7, activo: true },
  ];

  const clientes = [];
  const conversaciones = [];
  const mensajes = [];
  const historialEstados = [];

  // conv(id, canal, cliente, estado, historial[[estado, minAgo, origen, usuario]], mensajes[[autor c|v, texto, minAgo]])
  function conv(id, canalId, cli, estadoId, hist, msgs) {
    const clienteId = 'cl_' + id;
    clientes.push({ id: clienteId, canalId, ...cli });
    conversaciones.push({ id, clienteId, canalId, vendedorId: 'u3', estadoId, creadaAt: t(msgs[0][2]) });
    msgs.forEach((m, i) => mensajes.push({
      id: `${id}_m${i + 1}`, conversacionId: id, autor: m[0] === 'c' ? 'cliente' : 'vendedor', texto: m[1], enviadoAt: t(m[2]),
    }));
    hist.forEach((h, i) => historialEstados.push({
      id: `${id}_h${i + 1}`, conversacionId: id, estadoId: h[0], origen: h[2] || 'ia', cambiadoPor: h[3] || null, creadoAt: t(h[1]),
    }));
  }

  conv('c01', 'whatsapp', { nombre: 'Facundo Gómez', usuario: '+54 381 555 2210', empresa: 'Titanes Gym (Yerba Buena)' }, 'negociacion',
    [['nuevo', 190], ['consulta', 168], ['negociacion', 64]], [
      ['c', 'Buenas! Te escribo de Titanes Gym en Yerba Buena. Queremos armar un pedido para revender en el gimnasio', 190],
      ['v', 'Hola Facundo! Qué bueno. Contame qué productos te interesan y te paso precios', 172],
      ['c', 'Serían 20 potes de whey 2 lb (vainilla y chocolate) y 15 creatinas de 300 g. Tienen precio mayorista?', 168],
      ['c', 'Necesitaríamos factura A también', 165],
      ['v', 'Sí, tenemos lista mayorista a partir de 10 unidades. Te la paso en un rato', 120],
      ['c', 'Dale, quedo atento. Si no me lo pasan hoy lo compro en otro distribuidor que ya me cotizó', 64],
      ['c', 'Hola? Necesito cerrar hoy', 52],
    ]);

  conv('c02', 'instagram', { nombre: 'Valentina Sosa', usuario: '@valen.fit' }, 'cotizado',
    [['consulta', 95], ['cotizado', 88]], [
      ['c', 'Hola! cuánto sale la creatina monohidrato de 300g?', 95],
      ['v', 'Hola Valen! La creatina monohidrato 300 g está $28.900. Si abonás por transferencia tenés 10% off', 88],
      ['c', 'Y el envío a Córdoba capital cuánto sería?', 80],
      ['v', 'Por Andreani a domicilio $6.200, llega en 3 a 5 días hábiles. Si superás $60.000 el envío es gratis', 74],
      ['c', 'Ah bueno, y si le sumo un shaker y una whey de 1 kg llego al envío gratis?', 18],
    ]);

  conv('c03', 'whatsapp', { nombre: 'Rodrigo Luna', usuario: '+54 381 502 7733' }, 'postventa',
    [['postventa', 300]], [
      ['c', 'Hola, me llegó el pedido #4821 y la whey vino con el sello de seguridad roto', 300],
      ['v', 'Hola Rodrigo, lamento lo que pasó. ¿Me mandás una foto del pote?', 290],
      ['c', '[Imagen] Ahí está. Es una vergüenza, pagué $54.000 por un producto que no sé si está adulterado', 285],
      ['v', 'Ya lo consulto con el depósito y te aviso', 200],
      ['c', 'Pasaron 3 horas y nadie me dice nada. Si no me lo cambian hoy hago la denuncia en Defensa del Consumidor y lo publico en Instagram', 40],
      ['v', 'Tranqui Rodrigo, ya lo estamos viendo', 34],
    ]);

  conv('c04', 'instagram', { nombre: 'Nicolás Acosta', usuario: '@nico.calistenia' }, 'ganado',
    [['consulta', 1560], ['cotizado', 1540], ['ganado', 1500]], [
      ['c', 'Buenas, qué diferencia hay entre la whey concentrada y la isolate?', 1560],
      ['v', 'Hola Nico! La isolate tiene más proteína por servicio (27 g vs 22 g) y casi nada de lactosa. Si te cae pesada la leche, te conviene la isolate', 1552],
      ['c', 'Me cae medio mal la lactosa, sí. Cuánto está la isolate 2 lb?', 1545],
      ['v', 'La ISO Whey 2 lb está $62.500, con transferencia $56.250. Si confirmás antes de las 17 sale hoy', 1540],
      ['c', 'Listo, te transfiero. Pasame los datos', 1530],
      ['v', 'Genial! Alias SUPLE.NORT.MP. Mandame el comprobante y tus datos de envío', 1527],
      ['c', 'Enviado el comprobante. Gracias!', 1500],
      ['v', 'Recibido Nico! Sale hoy por Andreani, a la noche te paso el seguimiento', 1496],
    ]);

  conv('c05', 'whatsapp', { nombre: 'Carla Medina', usuario: '+54 381 611 0482' }, 'consulta',
    [['consulta', 140]], [
      ['c', 'Hola, quería consultar por el quemador Thermo Fuel. Tengo hipotiroidismo, lo puedo tomar?', 140],
      ['v', 'Hola Carla! Sí, no pasa nada, lo toman muchas chicas. Es re efectivo, en un mes ves resultados', 131],
      ['c', 'Ah buenísimo. Y cuánto sale? tiene mucha cafeína?', 125],
      ['v', 'Está $24.500. Tiene 200 mg de cafeína por servicio', 118],
      ['c', 'Bueno, lo pienso y te aviso', 110],
      ['v', 'Dale! Cualquier cosa escribime', 105],
    ]);

  conv('c06', 'whatsapp', { nombre: 'Julián Ferreyra', usuario: '+54 381 470 1199' }, 'ganado',
    [['consulta', 2950], ['cotizado', 2942], ['ganado', 2905]], [
      ['c', 'Hola! Estoy arrancando en el gym y quiero ganar masa. Qué me recomendás?', 2950],
      ['v', 'Hola Julián! Para arrancar te recomiendo el Combo Volumen: whey 2 lb + creatina 300 g + shaker de regalo. Sale $78.900 (con transferencia $71.000)', 2942],
      ['c', 'Y cómo se toma la creatina?', 2930],
      ['v', '5 g por día, todos los días, con agua o con el batido. No hace falta fase de carga', 2925],
      ['c', 'Buenísimo, lo quiero. Puedo retirar por el local?', 2910],
      ['v', 'Sí! Te lo dejo separado a tu nombre en el local de Tucumán', 2905],
      ['c', 'Genial, paso mañana a la tarde', 2900],
      ['v', 'Julián, ya está listo tu combo para retirar. Te esperamos!', 1450],
    ]);

  conv('c07', 'instagram', { nombre: 'Sofía Romano', usuario: '@sofi.runner' }, 'perdido',
    [['consulta', 4400], ['cotizado', 4300], ['perdido', 4270]], [
      ['c', 'Hola, tenés BCAA en polvo? precio?', 4400],
      ['v', 'Hola Sofi! Sí, BCAA 2:1:1 de 250 g a $21.800', 4300],
      ['c', 'Uh, lo vi a $16.000 en otra tienda', 4290],
      ['v', 'Es otra calidad, el nuestro es importado', 4280],
      ['c', 'Bueno, gracias igual', 4270],
    ]);

  conv('c08', 'whatsapp', { nombre: 'Matías Ocampo', usuario: '+54 3865 41 2290' }, 'nuevo',
    [['nuevo', 9]], [
      ['c', 'Hola buenas tardes, tienen creatina Star Nutrition? Hacen envíos a Concepción?', 9],
    ]);

  conv('c09', 'instagram', { nombre: 'Tomás Brizuela', usuario: '@gymbro.tuc' }, 'negociacion',
    [['consulta', 180], ['cotizado', 170], ['negociacion', 160]], [
      ['c', 'Che, cuánto me sale el combo definición?', 180],
      ['v', 'Hola! El Combo Definición (whey isolate 2 lb + quemador + L-carnitina) está $98.500, con transferencia $88.650', 170],
      ['c', 'Me hacés 30% y pago contra entrega? Tengo muchos seguidores, te hago publicidad en mis historias', 160],
      ['v', 'Dejame ver qué puedo hacer', 150],
      ['c', 'Tengo 12k seguidores, les va a servir', 120],
      ['c', 'Y? me confirmás o no?', 71],
    ]);

  conv('c10', 'whatsapp', { nombre: 'Lorena Díaz', usuario: '+54 387 455 9012' }, 'postventa',
    [['ganado', 7200], ['postventa', 600]], [
      ['c', 'Hola! Compré el jueves, me pasás el seguimiento del envío a Salta?', 600],
      ['v', 'Hola Lorena! Sí, el código es AND-3307-9921. Está en sucursal Salta, mañana sale a distribución', 592],
      ['c', 'Genial, gracias!', 585],
      ['v', 'De nada! Cuando te llegue contanos qué tal la whey. En tu próxima compra tenés 10% off', 580],
    ]);

  conv('c11', 'whatsapp', { nombre: 'Federico Alderete', usuario: '+54 381 588 3401' }, 'cotizado',
    [['consulta', 3100], ['cotizado', 3060]], [
      ['c', 'Buenas, me pasás precio del combo definición y si tienen sabor frutilla', 3100],
      ['v', 'Hola Federico. Combo Definición $98.500. Frutilla no hay, solo vainilla y chocolate', 3060],
      ['c', 'Ok, lo pienso', 3050],
      ['v', 'Ok', 3045],
    ]);

  conv('c12', 'instagram', { nombre: 'Andrés Villafañe', usuario: '@andre.crossfit' }, 'cotizado',
    [['consulta', 48], ['cotizado', 37]], [
      ['c', 'Hola! Qué pre entreno tienen que no tenga tanta cafeína?', 48],
      ['v', 'Hola Andrés! Tenemos el Pump Zero, sin estimulantes: citrulina, beta alanina y arginina. $26.700', 44],
      ['c', 'Y se puede combinar con creatina?', 40],
      ['v', 'Sí, sin problema, muchos lo toman juntos. Si llevás los dos te hago $49.900 con transferencia', 37],
      ['c', 'Mmm dale, mañana te confirmo cuando cobre', 30],
      ['v', 'Perfecto Andrés, te lo reservo hasta mañana a la noche', 28],
    ]);

  conv('c13', 'whatsapp', { nombre: 'Pablo Juárez', usuario: '+54 381 499 8120', empresa: 'Gimnasio Fuerza Norte (Tafí Viejo)' }, 'ganado',
    [['consulta', 1400], ['cotizado', 1392], ['negociacion', 1380], ['ganado', 1295, 'manual', 'u2']], [
      ['c', 'Hola, soy Pablo de Fuerza Norte. Necesito reponer: 12 whey 2 lb y 10 creatinas. Lista mayorista como siempre', 1400],
      ['v', 'Hola Pablo! Whey 2 lb $41.200 c/u y creatina 300 g $19.900 c/u. Total $693.400 con factura A. Envío sin cargo a Tafí', 1392],
      ['c', 'Perfecto. Te transfiero hoy', 1380],
      ['v', 'Gracias! Lo despachamos mañana a primera hora', 1376],
      ['c', 'Transferido, te mando comprobante', 1300],
      ['v', 'Recibido. Mañana 9 h sale el pedido', 1290],
    ]);

  conv('c14', 'instagram', { nombre: 'Lucía Paz', usuario: '@lucia.nutri' }, 'nuevo',
    [['nuevo', 27]], [
      ['c', 'Hola! Soy nutricionista deportiva en San Miguel. Tienen algún convenio o descuento para derivar pacientes?', 27],
    ]);

  // analisis: puntajes 1–10 por criterio
  const analisis = [];
  function an(conversacionId, minAgo, motivo, resumen, intencion, productos, objeciones, proximoPaso, p) {
    const k = ['respuesta', 'atencion', 'tecnica', 'seguimiento'];
    const puntajes = {};
    k.forEach((key, i) => (puntajes[key] = { puntaje: p[i][0], comentario: p[i][1] }));
    analisis.push({ id: 'an_' + conversacionId, conversacionId, creadoAt: t(minAgo), motivo, resumen, intencion, productos, objeciones, proximoPaso, puntajes });
  }

  an('c01', 30, 'mensajes', 'Gimnasio de Yerba Buena pide cotización mayorista (20 whey + 15 creatinas) con factura A. El vendedor prometió la lista pero no la envió; el cliente amenaza con comprar a otro distribuidor.',
    'Compra mayorista para reventa', ['Whey Protein 2 lb', 'Creatina monohidrato 300 g'], ['Urgencia: necesita cerrar hoy', 'Tiene una cotización de la competencia'],
    'Enviar ya la lista mayorista para 35 unidades con factura A y ofrecer envío sin cargo a Yerba Buena.',
    [[3, 'Más de 45 min sin responder a un pedido mayorista.'], [7, 'Trato cordial y claro.'], [4, 'No cotizó ni intentó el cierre pese a la intención explícita.'], [2, 'Prometió la lista "en un rato" y no la envió.']]);
  an('c02', 15, 'tiempo', 'Clienta de Córdoba consulta creatina y envío. Ahora pregunta si sumando whey 1 kg y shaker llega al envío gratis.',
    'Compra minorista con envío', ['Creatina monohidrato 300 g', 'Whey Protein 1 kg', 'Shaker'], ['Costo de envío'],
    'Confirmar el total con envío gratis y enviar el link de pago.',
    [[8, 'Respuestas en menos de 10 min.'], [9, 'Claro y cercano; informa el descuento por transferencia.'], [8, 'Usó el umbral de envío gratis para subir el ticket.'], [6, 'Mensaje nuevo sin respuesta hace 18 min.']]);
  an('c03', 30, 'mensajes', 'Reclamo por whey con sello de seguridad roto (pedido #4821). El cliente espera hace horas y amenaza con denuncia y exposición pública.',
    'Reclamo / cambio de producto', ['Whey Protein 2 lb'], ['Desconfianza sobre la calidad del producto'],
    'Supervisor: ofrecer cambio inmediato con envío sin cargo y disculpa formal. Evitar respuestas informales.',
    [[3, 'Pasaron casi 3 h sin novedades.'], [4, '"Tranqui" minimiza el reclamo de un cliente enojado.'], [5, 'Pidió evidencia correctamente, pero no ofreció solución.'], [3, 'No informó avances del caso.']]);
  an('c04', 1490, 'mensajes', 'Cliente con intolerancia a la lactosa. El vendedor explicó la diferencia entre concentrada e isolate y cerró la venta de ISO Whey 2 lb por transferencia.',
    'Compra minorista', ['ISO Whey 2 lb'], ['Intolerancia a la lactosa'],
    'Enviar código de seguimiento y ofrecer recompra en 30 días.',
    [[9, 'Respuestas en minutos.'], [9, 'Explicación técnica clara y simple.'], [10, 'Detectó la necesidad y generó urgencia con el despacho del día.'], [9, 'Confirmó el comprobante y anticipó el seguimiento.']]);
  an('c05', 100, 'tiempo', 'Consulta por quemador Thermo Fuel de una clienta con hipotiroidismo. El vendedor afirmó que puede tomarlo sin consultar al médico y prometió resultados.',
    'Pérdida de peso', ['Quemador Thermo Fuel'], ['Duda por condición de salud', 'Indecisión ("lo pienso")'],
    'Recomendar consulta médica antes de usar termogénicos y ofrecer alternativas sin estimulantes.',
    [[8, 'Respondió rápido.'], [6, 'Cordial, pero minimizó una consulta de salud.'], [4, 'Promesa de resultados y sin alternativas.'], [5, 'No retomó tras el "lo pienso".']]);
  an('c06', 1440, 'mensajes', 'Principiante que busca ganar masa. El vendedor recomendó el Combo Volumen, explicó la toma de creatina y cerró con retiro en el local.',
    'Compra minorista', ['Combo Volumen', 'Whey Protein 2 lb', 'Creatina monohidrato 300 g', 'Shaker'], [],
    'Postventa: consultar en 2 semanas cómo le va con el combo.',
    [[9, 'Respuestas en menos de 10 min.'], [9, 'Tono cercano y didáctico.'], [9, 'Recomendó un combo acorde al objetivo.'], [10, 'Avisó que el pedido estaba listo para retirar.']]);
  an('c07', 4260, 'mensajes', 'Consulta por BCAA. La clienta encontró un precio menor en otra tienda y el vendedor no defendió el valor del producto. Venta perdida.',
    'Compra minorista', ['BCAA 2:1:1 250 g'], ['Precio más bajo en la competencia'],
    'Retomar con una alternativa de menor precio o un combo con aminoácidos.',
    [[3, 'Primera respuesta a la 1 h 40 min.'], [6, 'Correcto pero seco.'], [3, 'No argumentó valor ni ofreció alternativa ante la objeción de precio.'], [2, 'Sin seguimiento.']]);
  an('c09', 60, 'tiempo', 'Cliente pide 30% de descuento y pago contra entrega a cambio de publicidad en redes. El vendedor quedó en "ver qué puede hacer" y no volvió a responder.',
    'Compra con descuento especial', ['Combo Definición', 'Whey Isolate 2 lb', 'Quemador', 'L-Carnitina'], ['Pide 30% de descuento', 'Pago contra entrega'],
    'Responder con la política vigente: hasta 10% por transferencia, sin contra entrega. Un canje de difusión requiere aprobación del supervisor.',
    [[5, 'Demoras crecientes; último mensaje sin respuesta hace más de 1 h.'], [7, 'Correcto.'], [5, '"Dejame ver" sin una respuesta concreta.'], [3, 'Dejó al cliente sin respuesta.']]);
  an('c10', 575, 'mensajes', 'Clienta de Salta pide seguimiento del envío. El vendedor respondió rápido con el código y ofreció descuento para la próxima compra.',
    'Seguimiento de envío', ['Whey Protein 2 lb'], [],
    'Confirmar la entrega mañana y pedir reseña.',
    [[9, 'Respuesta en 8 min.'], [9, 'Amable y concreto.'], [8, 'Incentivó la recompra con descuento.'], [9, 'Buen cierre de postventa.']]);
  an('c11', 3000, 'tiempo', 'Consulta por Combo Definición sabor frutilla. Sin stock del sabor; el vendedor no ofreció alternativa y no retomó la conversación en 2 días.',
    'Compra minorista', ['Combo Definición'], ['Sabor no disponible'],
    'Retomar hoy ofreciendo sabores alternativos o whey sin sabor + saborizante.',
    [[6, 'Primera respuesta a los 40 min.'], [6, 'Respuestas escuetas ("Ok").'], [4, 'No ofreció alternativa de sabor ni intentó el cierre.'], [2, 'Sin seguimiento en 2 días.']]);
  an('c12', 25, 'mensajes', 'Cliente busca pre entreno sin estimulantes. El vendedor recomendó Pump Zero, armó combo con creatina y lo reservó hasta mañana.',
    'Compra minorista', ['Pre entreno Pump Zero', 'Creatina monohidrato 300 g'], ['Espera a cobrar'],
    'Recordar la reserva mañana a las 19 h con el link de pago.',
    [[9, 'Respuestas en 2 a 4 min.'], [9, 'Claro y empático.'], [9, 'Armó combo y reservó con fecha.'], [8, 'Dejó el seguimiento pactado.']]);
  an('c13', 1285, 'mensajes', 'Gimnasio cliente habitual repone stock mayorista: 12 whey + 10 creatinas por $693.400 con factura A. Pago confirmado.',
    'Compra mayorista recurrente', ['Whey Protein 2 lb', 'Creatina monohidrato 300 g'], [],
    'Confirmar despacho y agendar la próxima reposición en 30 días.',
    [[9, 'Respuesta en 8 min.'], [9, 'Profesional y preciso.'], [9, 'Cotización completa en un solo mensaje.'], [9, 'Confirmó pago y despacho.']]);

  const alertas = [
    { id: 'a01', conversacionId: 'c01', tipo: 'intervencion', situacionId: 'mayorista', nivel: 'critico', titulo: 'Venta mayorista en riesgo',
      motivo: 'Pedido de 35 unidades con factura A (≈ $1.100.000). El vendedor prometió la lista mayorista y no la envió; el cliente menciona una cotización de la competencia y necesita cerrar hoy.',
      fragmento: 'Si no me lo pasan hoy lo compro en otro distribuidor que ya me cotizó', estado: 'abierta', creadaAt: t(30) },
    { id: 'a02', conversacionId: 'c01', tipo: 'espera', nivel: 'critico', titulo: 'Cliente esperando respuesta', estado: 'abierta', creadaAt: t(7) },
    { id: 'a03', conversacionId: 'c03', tipo: 'intervencion', situacionId: 'reclamo', nivel: 'critico', titulo: 'Cliente enojado / reclamo',
      motivo: 'Reclamo por producto con sello roto sin resolución en 3 h. El cliente amenaza con denuncia en Defensa del Consumidor y exposición en Instagram. La última respuesta del vendedor es informal.',
      fragmento: 'Si no me lo cambian hoy hago la denuncia en Defensa del Consumidor y lo publico en Instagram', estado: 'abierta', creadaAt: t(32) },
    { id: 'a04', conversacionId: 'c05', tipo: 'intervencion', situacionId: 'error', nivel: 'advertencia', titulo: 'Error del vendedor',
      motivo: 'El vendedor indicó que un termogénico con 200 mg de cafeína es apto para una clienta con hipotiroidismo sin sugerir consulta médica, y prometió resultados.',
      fragmento: 'Sí, no pasa nada, lo toman muchas chicas. Es re efectivo, en un mes ves resultados', estado: 'abierta', creadaAt: t(100) },
    { id: 'a05', conversacionId: 'c09', tipo: 'intervencion', situacionId: 'politica', nivel: 'advertencia', titulo: 'Pedido fuera de política',
      motivo: 'El cliente pide 30% de descuento y pago contra entrega. La política vigente permite hasta 10% por transferencia y no ofrece contra entrega.',
      fragmento: 'Me hacés 30% y pago contra entrega?', estado: 'abierta', creadaAt: t(60) },
    { id: 'a06', conversacionId: 'c09', tipo: 'espera', nivel: 'critico', titulo: 'Cliente esperando respuesta', estado: 'abierta', creadaAt: t(26) },
    { id: 'a07', conversacionId: 'c02', tipo: 'espera', nivel: 'advertencia', titulo: 'Cliente esperando respuesta', estado: 'abierta', creadaAt: t(3) },
    { id: 'a08', conversacionId: 'c14', tipo: 'espera', nivel: 'advertencia', titulo: 'Cliente esperando respuesta', estado: 'abierta', creadaAt: t(12) },
    { id: 'a09', conversacionId: 'c07', tipo: 'intervencion', situacionId: 'competencia', nivel: 'advertencia', titulo: 'Venta perdida por precio',
      motivo: 'La clienta comparó con un precio de la competencia y el vendedor no ofreció alternativas.',
      fragmento: 'Uh, lo vi a $16.000 en otra tienda', estado: 'atendida', creadaAt: t(4260), atendidaPor: 'u2', atendidaAt: t(4000), comentario: 'Lo charlé con Lucas: ofrecer BCAA nacional como alternativa.' },
    { id: 'a10', conversacionId: 'c11', tipo: 'intervencion', situacionId: 'seguimiento', nivel: 'advertencia', titulo: 'Cotización sin seguimiento',
      motivo: 'Cotización enviada hace más de 24 h sin seguimiento del vendedor.',
      fragmento: 'Ok, lo pienso', estado: 'atendida', creadaAt: t(1600), atendidaPor: 'u2', atendidaAt: t(1500), comentario: 'Le pedí a Lucas que retome hoy.' },
  ];

  const notas = [
    { id: 'n01', conversacionId: 'c01', autorId: 'u2', texto: 'Lo llamo por teléfono: puede ser cliente de reventa mensual.', creadoAt: t(20) },
    { id: 'n02', conversacionId: 'c03', autorId: 'u2', texto: 'Coordinado con depósito: se reenvía pote nuevo mañana. Falta avisarle al cliente.', creadoAt: t(25) },
  ];

  // métricas diarias por canal (30 días)
  const metricasDiarias = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let d = 29; d >= 0; d--) {
    const fecha = new Date(AHORA - d * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const k = (29 - d) / 29;
    [['whatsapp', 6.3, 7.0, 19, 12, 9], ['instagram', 6.0, 6.6, 27, 19, 6]].forEach(([canalId, p0, p1, t0, t1, base]) => {
      const conversacionesN = Math.round(base + rnd() * 5);
      metricasDiarias.push({
        fecha, canalId,
        puntaje: Math.round((p0 + (p1 - p0) * k + (rnd() - 0.5) * 0.9) * 10) / 10,
        tiempoRespuestaMin: Math.round(t0 + (t1 - t0) * k + (rnd() - 0.5) * 6),
        conversaciones: conversacionesN,
        ganadas: Math.round(conversacionesN * (0.24 + rnd() * 0.14)),
      });
    });
  }

  const resumenDesempeno = {
    vendedorId: 'u3', generadoAt: t(60),
    fortalezas: [
      'Explica proteínas y creatina con claridad y adapta la recomendación al objetivo del cliente.',
      'Usa el umbral de envío gratis y los combos para subir el ticket promedio.',
      'Tono cordial y cercano en ambos canales.',
    ],
    mejoras: [
      'Responder pedidos mayoristas en menos de 15 min y enviar la cotización completa en un solo mensaje.',
      'Ante objeciones de precio, argumentar valor u ofrecer alternativas antes de dar por perdida la venta.',
      'Retomar cotizaciones sin respuesta a las 24 h.',
      'Derivar consultas de salud a un profesional y evitar prometer resultados.',
    ],
  };

  const configuracion = {
    whatsapp: { serverUrl: 'https://evo.suplenort.com', apiKey: 'demo-evolution-api-key', instancia: 'nort-ventas', numero: '+54 381 364 9036',
      webhookUrl: 'https://monitor.suplenort.com/api/webhooks/evolution', estado: 'conectado', verificadoAt: t(12) },
    instagram: { appId: '1029384756102938', appSecret: 'demo-meta-app-secret', pageId: '104857392010293', igBusinessId: '17841405822304917',
      accessToken: 'demo-meta-access-token', verifyToken: 'nort-verify-2026', webhookUrl: 'https://monitor.suplenort.com/api/webhooks/meta',
      estado: 'conectado', verificadoAt: t(40) },
    ia: { cadaMinutos: 30, cadaMensajes: 10, proveedor: 'Anthropic', modelo: 'claude-sonnet-4-5', apiKey: 'demo-anthropic-api-key',
      pesos: { respuesta: 25, atencion: 25, tecnica: 30, seguimiento: 20 } },
    alertas: {
      advertenciaMin: 15, criticoMin: 45, pausarFueraHorario: true,
      horario: [
        { dia: 'Lunes', activo: true, desde: '09:00', hasta: '20:00' },
        { dia: 'Martes', activo: true, desde: '09:00', hasta: '20:00' },
        { dia: 'Miércoles', activo: true, desde: '09:00', hasta: '20:00' },
        { dia: 'Jueves', activo: true, desde: '09:00', hasta: '20:00' },
        { dia: 'Viernes', activo: true, desde: '09:00', hasta: '20:00' },
        { dia: 'Sábado', activo: true, desde: '09:00', hasta: '13:00' },
        { dia: 'Domingo', activo: false, desde: '10:00', hasta: '13:00' },
      ],
      situaciones: [
        { id: 'reclamo', nombre: 'Cliente enojado o reclamo', descripcion: 'Tono negativo, amenazas de denuncia o exposición pública.', activo: true },
        { id: 'politica', nombre: 'Pedido fuera de política', descripcion: 'Descuentos mayores al permitido, formas de pago no ofrecidas.', activo: true },
        { id: 'mayorista', nombre: 'Venta grande o mayorista en riesgo', descripcion: 'Pedidos de 10+ unidades o tickets altos con señales de abandono.', activo: true },
        { id: 'error', nombre: 'Error del vendedor', descripcion: 'Información incorrecta de precios, stock o recomendaciones de salud.', activo: true },
        { id: 'seguimiento', nombre: 'Cotización sin seguimiento', descripcion: 'Cotización enviada hace más de 24 h sin seguimiento.', activo: true },
        { id: 'competencia', nombre: 'Cliente menciona a la competencia', descripcion: 'Comparación de precios con otras tiendas.', activo: false },
      ],
      notificaciones: { app: true, email: false, emailDestino: '' },
    },
  };

  window.NORT_DATA = {
    ahora: new Date(AHORA).toISOString(),
    usuarios, canales, estadosVenta, clientes, conversaciones, mensajes, historialEstados,
    analisis, alertas, notas, metricasDiarias, resumenDesempeno, configuracion,
  };
})();
