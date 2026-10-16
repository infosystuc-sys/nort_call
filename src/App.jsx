import { Component } from 'react';
import AppView from './views/AppView';
import * as api from './data/api';

// Lógica de Nort Monitor: mantiene el estado y arma el view-model que consume <AppView />.
// Los cambios se aplican primero en memoria y luego se guardan con ./data/api (Supabase o modo demo).
export default class App extends Component {
  static defaultProps = { estadoDemo: 'normal', rolInicial: 'ninguno' };

  state = {
    db: null,
    loadError: false,
    user: null,
    booting: false,
    loggingIn: false,
    loginEmail: api.usaSupabase ? '' : 'supervisor@suplenort.com',
    loginPass: api.usaSupabase ? '' : 'demo1234',
    loginError: '',
    screen: 'dashboard',
    w: window.innerWidth,
    range: 14,
    canal: 'todos',
    q: '',
    fEstado: 'todos',
    fAlerta: 'todos',
    fEsperando: false,
    convView: 'lista',
    selConv: null,
    detailTab: 'chat',
    analizando: false,
    noteDraft: '',
    aTipo: 'todos',
    aNivel: 'todos',
    aEstado: 'abiertas',
    resolving: null,
    resolveComment: '',
    cfgTab: 'whatsapp',
    reveal: {},
    testing: {},
    testResult: {},
    userModal: null,
    confirmDel: null,
    confirmDelConv: null,
    palOpen: null,
    toast: '',
    retried: false,
    retrying: false,
    dirty: false,
    qr: null,
    importarDesde: '2026-10-01',
    importacion: null, // { fase, pagina, paginas, guardados, repetidos, audios, transcritos, fallidos, pendientes, mensaje }
    cola: null, // cola de análisis: { activa, fase, total, hechos, conClaude, errores, usarClaude }
  };
  tz = 'America/Argentina/Buenos_Aires';
  CRIT = [
    ['respuesta', 'Tiempo de respuesta'],
    ['atencion', 'Atención y tono'],
    ['tecnica', 'Técnica de venta'],
    ['seguimiento', 'Seguimiento'],
  ];
  PALETTE = ['#6B7280', '#2F6FDB', '#7A4FD6', '#D98A00', '#1E8E4E', '#C62828', '#0F8A8A', '#B5446E'];
  // El análisis usa primero Groq (gratuito) y, si falla, Claude con el modelo elegido acá.
  MODELOS = {
    Anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'],
  };
  ROLES = { admin: 'Administrador', supervisor: 'Supervisor', vendedor: 'Vendedor' };

  componentDidMount() {
    this._rs = () => this.setState({ w: window.innerWidth });
    window.addEventListener('resize', this._rs);
    if (api.usaSupabase) {
      // Los tiempos de espera se calculan contra db.ahora: se actualiza cada minuto.
      this._clock = setInterval(() => this.state.db && this.setState(s => ({ db: { ...s.db, ahora: new Date().toISOString() } })), 60000);
      // Los cambios llegan por Realtime (ver suscribir). Si la pestaña estuvo oculta más de 2 min,
      // el navegador pudo pausar la conexión: al volver se hace una recarga completa por las dudas.
      this._vis = () => {
        if (document.visibilityState === 'hidden') this._ocultaDesde = Date.now();
        else if (this._ocultaDesde && Date.now() - this._ocultaDesde > 120000) this.refrescar();
      };
      document.addEventListener('visibilitychange', this._vis);
      api
        .sesionActual()
        .then(session => session && this.entrar(session))
        .catch(() => this.setState({ loadError: true }));
      return;
    }
    api
      .loadDatabase()
      .then(db => {
        const r = this.props.rolInicial;
        const user = r && r !== 'ninguno' ? db.usuarios.find(u => u.rol === r && u.activo) : null;
        this.setState({ db, user: user || null, screen: user ? this.home(user) : 'dashboard' });
      })
      .catch(() => this.setState({ loadError: true }));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._rs);
    clearInterval(this._clock);
    this.desuscribir();
    clearTimeout(this._reintento);
    if (this._vis) document.removeEventListener('visibilitychange', this._vis);
    [this._lt, this._wt, this._tt, this._bt, this._colaEspera].forEach(clearTimeout);
    Object.values(this._deb || {}).forEach(clearTimeout);
  }
  home(u) {
    return u.rol === 'vendedor' ? 'conversaciones' : 'dashboard';
  }
  // Carga los datos de la sesión de Supabase y ubica al usuario de la app vinculado.
  async entrar(session) {
    this.setState({ loggingIn: true, loginError: '' });
    try {
      const db = await api.loadDatabase();
      const u = db.usuarios.find(x => x.authUserId === session.user.id);
      if (!u || !u.activo) {
        await api.cerrarSesion();
        return this.setState({
          loggingIn: false,
          db: null,
          loginError: u ? 'Este usuario está inactivo. Contactá al administrador.' : 'Tu cuenta no tiene acceso a Nort Monitor.',
        });
      }
      this.setState({
        db,
        user: u,
        loggingIn: false,
        loadError: false,
        screen: this.home(u),
        selConv: null,
        loginEmail: u.email,
        loginPass: '',
      });
      this.suscribir();
    } catch (e) {
      this.setState({ loggingIn: false, loadError: true });
    }
  }
  // Realtime: aplica en memoria cada fila nueva, modificada o borrada.
  suscribir() {
    this.desuscribir();
    let conectadoAntes = false;
    this._cancelarRT = api.suscribirCambios(
      cambio => this.aplicarCambio(cambio),
      estado => {
        // Al reconectar se recarga todo una vez, por los cambios que pudieron perderse mientras tanto.
        if (estado === 'SUBSCRIBED' && conectadoAntes) this.refrescar();
        if (estado === 'SUBSCRIBED') conectadoAntes = true;
      },
    );
  }
  desuscribir() {
    if (this._cancelarRT) this._cancelarRT();
    this._cancelarRT = null;
  }
  aplicarCambio({ clave, tipo, fila, id }) {
    if (!this.state.db) return;
    if (clave === 'configuracion') {
      // No se pisa un formulario de configuración con cambios sin guardar.
      if (tipo === 'DELETE' || this.state.dirty) return;
      return this.setState(s => ({
        db: { ...s.db, configuracion: { ...s.db.configuracion, [fila.seccion]: { ...s.db.configuracion[fila.seccion], ...fila.valores } } },
      }));
    }
    this.upd(db => {
      const lista = db[clave] || [];
      if (tipo === 'DELETE') {
        db[clave] = lista.filter(x => x.id !== id);
        return;
      }
      const i = lista.findIndex(x => x.id === fila.id);
      db[clave] = i >= 0 ? lista.map((x, j) => (j === i ? { ...x, ...fila } : x)) : [...lista, fila];
    });
    if (tipo === 'DELETE' && clave === 'conversaciones' && this.state.selConv === id) this.setState({ selConv: null });
  }
  // Recarga completa y silenciosa. Si hay algo sin guardar o un guardado en curso, la reintenta más tarde.
  async refrescar() {
    const s = this.state;
    if (!s.user || !s.db || this._refrescando) return;
    if (s.dirty || s.userModal || this._pendientes > 0 || Object.values(this._deb || {}).length) {
      clearTimeout(this._reintento);
      this._reintento = setTimeout(() => this.refrescar(), 5000);
      return;
    }
    this._refrescando = true;
    try {
      const db = await api.loadDatabase();
      if (!this.state.dirty && !(this._pendientes > 0) && this.state.user) this.setState({ db });
    } catch (e) {
      // sin aviso: se reintenta en el próximo ciclo
    } finally {
      this._refrescando = false;
    }
  }
  async recargar() {
    try {
      const db = await api.loadDatabase();
      this.setState({ db });
    } catch (e) {
      this.toastMsg('No se pudieron recargar los datos');
    }
  }
  // Guarda un cambio ya aplicado en memoria; si falla, avisa y vuelve a los datos del servidor.
  persist(p, okMsg) {
    this._pendientes = (this._pendientes || 0) + 1;
    const listo = () => (this._pendientes -= 1);
    p.then(listo, listo);
    p.then(
      () => okMsg && this.toastMsg(okMsg),
      err => {
        console.error(err);
        this.toastMsg('No se pudo guardar el cambio');
        if (api.usaSupabase) this.recargar();
      },
    );
  }
  // Igual que persist, pero agrupa cambios rápidos (p. ej. escribir un nombre) en un solo guardado.
  persistLuego(clave, fn, ms = 600) {
    this._deb = this._deb || {};
    clearTimeout(this._deb[clave]);
    this._deb[clave] = setTimeout(() => {
      delete this._deb[clave];
      this.persist(fn());
    }, ms);
  }
  doLogin(email) {
    if (api.usaSupabase) {
      const e = this.state.loginEmail.trim();
      if (!e || !this.state.loginPass) return this.setState({ loginError: 'Ingresá email y contraseña.' });
      this.setState({ loggingIn: true, loginError: '' });
      api
        .iniciarSesion(e, this.state.loginPass)
        .then(session => this.entrar(session))
        .catch(() => this.setState({ loggingIn: false, loginError: 'Email o contraseña incorrectos.' }));
      return;
    }
    const db = this.state.db;
    if (!db) return;
    const e = (email || this.state.loginEmail).trim().toLowerCase();
    const u = db.usuarios.find(x => x.email.toLowerCase() === e);
    if (!u || (!email && !this.state.loginPass)) return this.setState({ loginError: 'Email o contraseña incorrectos.' });
    if (!u.activo) return this.setState({ loginError: 'Este usuario está inactivo. Contactá al administrador.' });
    this.setState({ user: u, loginError: '', screen: this.home(u), selConv: null, booting: true, loginEmail: u.email });
    this._bt = setTimeout(() => this.setState({ booting: false }), 700);
  }
  go(k) {
    this.setState({ screen: k, selConv: null, resolving: null });
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
  }
  // tipo 'aviso': resaltado en ámbar y visible más tiempo.
  toastMsg(t, tipo = 'ok') {
    clearTimeout(this._tt);
    this.setState({ toast: t, toastTipo: tipo });
    this._tt = setTimeout(() => this.setState({ toast: '' }), tipo === 'aviso' ? 8000 : 2400);
  }
  copy(t) {
    try {
      navigator.clipboard.writeText(t);
    } catch (e) {}
    this.toastMsg('Copiado al portapapeles');
  }
  ahora() {
    return new Date(this.state.db.ahora).getTime();
  }
  nowIso() {
    this._seq = (this._seq || 0) + 1;
    return new Date(this.ahora() + this._seq * 1000).toISOString();
  }
  minsAgo(iso) {
    return Math.max(0, Math.round((this.ahora() - new Date(iso).getTime()) / 60000));
  }
  dur(m) {
    if (m < 60) return m + ' min';
    if (m < 1440) {
      const h = Math.floor(m / 60),
        r = m % 60;
      return h + ' h' + (r ? ' ' + r + ' min' : '');
    }
    const d = Math.floor(m / 1440);
    return d + (d === 1 ? ' día' : ' días');
  }
  hora(iso) {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: this.tz });
  }
  dk(x) {
    return new Date(x).toLocaleDateString('en-CA', { timeZone: this.tz });
  }
  dshort(x) {
    return new Date(x).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: this.tz });
  }
  dayWord(iso) {
    const k = this.dk(iso);
    if (k === this.dk(this.ahora())) return 'Hoy';
    if (k === this.dk(this.ahora() - 864e5)) return 'Ayer';
    return null;
  }
  rel(iso) {
    const w = this.dayWord(iso);
    return w === 'Hoy' ? this.hora(iso) : w || this.dshort(iso);
  }
  fecha(iso) {
    return (this.dayWord(iso) || this.dshort(iso)) + ' ' + this.hora(iso);
  }
  dayLabel(iso) {
    const w = this.dayWord(iso);
    if (w) return w;
    const s = new Date(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: this.tz });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  initials(n) {
    return (n || '?')
      .replace('@', '')
      .split(/[\s._]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(x => x[0].toUpperCase())
      .join('');
  }
  chan(id) {
    return id === 'instagram'
      ? { label: 'Instagram', dot: '#C13584', bg: '#F7E6F0', fg: '#8A1F5C' }
      : { label: 'WhatsApp', dot: '#128C7E', bg: '#E1F2EF', fg: '#0B5F55' };
  }
  lvl(n) {
    return n === 'critico'
      ? { label: 'Crítico', fg: '#B3261E', bg: '#FBE4E1', dot: '#D93025' }
      : n === 'advertencia'
        ? { label: 'Advertencia', fg: '#8A5200', bg: '#FCEFD2', dot: '#E09B00' }
        : { label: 'En tiempo', fg: '#5E4B00', bg: '#FFF4C2', dot: '#C9A100' };
  }
  sc(p) {
    return p == null ? '#A19E92' : p >= 8 ? '#1E8E4E' : p >= 6 ? '#C98500' : '#C62828';
  }
  fmt1(x) {
    return x == null || isNaN(x) ? '—' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
  }
  pill(label, on, fn) {
    return {
      label,
      onClick: fn,
      bg: on ? '#FFFFFF' : 'transparent',
      fg: on ? '#17160F' : '#5E5B52',
      sh: on ? '0 1px 2px rgba(23,22,15,.14)' : 'none',
      fw: on ? '600' : '500',
    };
  }
  tg(on, fn) {
    return { onToggle: fn, trackBg: on ? '#17160F' : '#D3D0C6', knobLeft: on ? '19px' : '3px' };
  }
  estadosOrd() {
    return [...this.state.db.estadosVenta].sort((a, b) => a.orden - b.orden);
  }
  I() {
    const db = this.state.db;
    if (this._ix && this._ixDb === db) return this._ix;
    const msgs = {};
    db.mensajes.forEach(m => {
      (msgs[m.conversacionId] = msgs[m.conversacionId] || []).push(m);
    });
    Object.keys(msgs).forEach(k => msgs[k].sort((a, b) => (a.enviadoAt < b.enviadoAt ? -1 : 1)));
    const an = {};
    db.analisis.forEach(a => {
      if (!an[a.conversacionId] || an[a.conversacionId].creadoAt < a.creadoAt) an[a.conversacionId] = a;
    });
    const cli = {},
      est = {},
      usr = {};
    db.clientes.forEach(c => (cli[c.id] = c));
    db.estadosVenta.forEach(e => (est[e.id] = e));
    db.usuarios.forEach(u => (usr[u.id] = u));
    this._ixDb = db;
    this._ix = { msgs, an, cli, est, usr };
    return this._ix;
  }
  score(an) {
    const w = this.state.db.configuracion.ia.pesos;
    let t = 0,
      sw = 0;
    this.CRIT.forEach(([k]) => {
      const p = an.puntajes[k] && an.puntajes[k].puntaje;
      if (p != null) {
        t += p * w[k];
        sw += w[k];
      }
    });
    return sw ? t / sw : null;
  }
  cv(c, I) {
    const cfg = this.state.db.configuracion.alertas;
    const msgs = I.msgs[c.id] || [];
    const last = msgs[msgs.length - 1];
    const cli = I.cli[c.clienteId] || { nombre: '—', usuario: '' };
    const est = I.est[c.estadoId] || { nombre: c.estadoId, color: '#8A877D' };
    const esperando = !!last && last.autor === 'cliente';
    const esperaMin = esperando ? this.minsAgo(last.enviadoAt) : 0;
    const nivel = !esperando ? null : esperaMin >= cfg.criticoMin ? 'critico' : esperaMin >= cfg.advertenciaMin ? 'advertencia' : 'normal';
    const alertas = this.state.db.alertas.filter(a => a.conversacionId === c.id && a.estado === 'abierta');
    const an = I.an[c.id];
    return { c, id: c.id, cli, est, msgs, last, esperando, esperaMin, nivel, alertas, an, score: an ? this.score(an) : null };
  }
  convsAll() {
    const s = this.state;
    if (this.props.estadoDemo === 'vacio') return [];
    const I = this.I();
    let l = s.db.conversaciones;
    if (s.user.rol === 'vendedor') l = l.filter(c => c.vendedorId === s.user.id);
    return l.map(c => this.cv(c, I));
  }
  byCanal(v) {
    return this.state.canal === 'todos' || v.c.canalId === this.state.canal;
  }
  upd(fn) {
    this.setState(s => {
      const db = { ...s.db };
      fn(db);
      return { db };
    });
  }
  setCfg(sec, key, val) {
    this.setState(s => ({
      dirty: true,
      db: { ...s.db, configuracion: { ...s.db.configuracion, [sec]: { ...s.db.configuracion[sec], [key]: val } } },
    }));
  }
  openConv(id) {
    this.setState({
      screen: 'conversaciones',
      selConv: id,
      detailTab: 'chat',
      noteDraft: '',
      convView: 'lista',
      resolving: null,
      confirmDelConv: null,
    });
  }
  // Elimina la conversación con todo lo que depende de ella, y el cliente si se queda sin conversaciones.
  eliminarConversacion(convId) {
    const conv = this.state.db.conversaciones.find(c => c.id === convId);
    if (!conv) return;
    this.upd(db => {
      const quedan = db.conversaciones.filter(c => c.id !== convId);
      const deEsta = x => x.conversacionId !== convId;
      db.conversaciones = quedan;
      db.mensajes = db.mensajes.filter(deEsta);
      db.historialEstados = db.historialEstados.filter(deEsta);
      db.analisis = db.analisis.filter(deEsta);
      db.alertas = db.alertas.filter(deEsta);
      db.notas = db.notas.filter(deEsta);
      if (!quedan.some(c => c.clienteId === conv.clienteId)) db.clientes = db.clientes.filter(c => c.id !== conv.clienteId);
    });
    this.setState({ selConv: null, confirmDelConv: null });
    this.persist(api.eliminarConversacion(convId), 'Conversación eliminada');
  }
  setEstado(convId, estadoId) {
    const u = this.state.user;
    this.upd(db => {
      db.conversaciones = db.conversaciones.map(c => (c.id === convId ? { ...c, estadoId } : c));
      db.historialEstados = [
        ...db.historialEstados,
        { id: crypto.randomUUID(), conversacionId: convId, estadoId, origen: 'manual', cambiadoPor: u.id, creadoAt: this.nowIso() },
      ];
    });
    this.toastMsg('Estado corregido manualmente');
    this.persist(api.cambiarEstado(convId, estadoId));
  }
  analizar(x) {
    if (this.state.analizando) return;
    if (api.usaSupabase) return this.analizarReal(x);
    this.setState({ analizando: true });
    setTimeout(() => {
      const u = this.state.user;
      const prev = this.I().an[x.id];
      const first = x.msgs[0] ? x.msgs[0].texto : '';
      const base = prev
        ? { ...prev }
        : {
            resumen: 'Consulta inicial: "' + first + '". Todavía no hay respuesta del vendedor.',
            intencion: 'Consulta inicial',
            productos: [],
            objeciones: [],
            proximoPaso: 'Responder dentro de los próximos minutos con precio, stock y opciones de envío.',
            puntajes: {
              respuesta: { puntaje: x.esperaMin >= 15 ? 4 : 7, comentario: 'Cliente esperando hace ' + this.dur(x.esperaMin) + '.' },
              atencion: { puntaje: null, comentario: 'Sin respuestas del vendedor para evaluar.' },
              tecnica: { puntaje: null, comentario: 'Sin respuestas del vendedor para evaluar.' },
              seguimiento: { puntaje: null, comentario: 'Sin respuestas del vendedor para evaluar.' },
            },
          };
      const rec = {
        ...base,
        id: crypto.randomUUID(),
        conversacionId: x.id,
        creadoAt: this.nowIso(),
        motivo: 'manual',
        solicitadoPor: u.id,
      };
      this.upd(db => {
        db.analisis = [...db.analisis, rec];
      });
      this.persist(api.crearAnalisis(rec));
      this.setState({ analizando: false });
      this.toastMsg('Análisis actualizado');
    }, 1600);
  }
  // Cola de análisis: analiza de a una las conversaciones pedidas, solo con Groq. Si Groq llega a su límite,
  // se pausa y pregunta si seguir con Claude (que tiene costo) o esperar. Corre mientras la pestaña esté abierta.
  iniciarCola(ids) {
    if (this.state.cola?.activa || !ids.length) return;
    this._cola = { ids: [...ids], i: 0, hechos: 0, conClaude: 0, errores: 0, usarClaude: false, detener: false };
    this.procesarCola();
  }
  publicarCola(fase, activa = true) {
    const c = this._cola;
    this.setState({
      cola: { activa, fase, total: c.ids.length, hechos: c.hechos, conClaude: c.conClaude, errores: c.errores, usarClaude: c.usarClaude },
    });
  }
  async procesarCola() {
    const c = this._cola;
    while (c.i < c.ids.length && !c.detener) {
      this.publicarCola('analizando');
      try {
        const r = await api.analizarConversacion(c.ids[c.i], { soloGroq: !c.usarClaude });
        if (!r.ok && r.limiteGroq) return this.publicarCola('limite'); // espera la decisión del usuario
        if (r.ok) {
          c.hechos++;
          if (r.respaldo) c.conClaude++;
        } else c.errores++;
      } catch (e) {
        c.errores++;
      }
      c.i++;
      // Pausa corta entre análisis para no saturar el límite por minuto de Groq.
      if (c.i < c.ids.length && !c.detener) await new Promise(res => setTimeout(res, 1500));
    }
    this.publicarCola(c.detener ? 'detenida' : 'lista', false);
  }
  colaSeguirConClaude() {
    if (!this._cola) return;
    this._cola.usarClaude = true;
    this.toastMsg('La cola sigue con Claude: cada análisis tiene costo.', 'aviso');
    this.procesarCola();
  }
  colaEsperarGroq() {
    if (!this._cola) return;
    this.publicarCola('esperando');
    this._colaEspera = setTimeout(() => this.procesarCola(), 60000);
  }
  colaDetener() {
    if (!this._cola) return;
    this._cola.detener = true;
    // Si estaba pausada (límite o esperando) el bucle no corre: se cierra acá.
    if (['limite', 'esperando'].includes(this.state.cola?.fase)) {
      clearTimeout(this._colaEspera);
      this.publicarCola('detenida', false);
    }
  }
  colaVM(lista, isVend) {
    const cola = this.state.cola;
    // Pendientes: con mensajes y sin análisis, o con mensajes posteriores al último análisis.
    const pendientes = lista.filter(x => x.msgs.length && (!x.an || (x.last && x.last.enviadoAt > x.an.creadoAt)));
    const vm = {
      mostrarBoton: api.usaSupabase && !isVend && pendientes.length > 0 && !cola?.activa,
      botonLabel: `Analizar pendientes (${pendientes.length})`,
      onIniciar: () => this.iniciarCola(pendientes.map(x => x.id)),
      hayCola: !!cola,
    };
    if (!cola) return vm;
    const n = cola.hechos + cola.errores;
    const extras = [cola.conClaude ? `${cola.conClaude} con Claude` : '', cola.errores ? `${cola.errores} con error` : '']
      .filter(Boolean)
      .join(' · ');
    const textos = {
      analizando: [
        'Analizando conversaciones…',
        `${n} de ${cola.total} · con ${cola.usarClaude ? 'Claude' : 'Groq'}${extras ? ' · ' + extras : ''}`,
      ],
      limite: [
        'Groq alcanzó su límite de uso.',
        `Van ${n} de ${cola.total}. ¿Seguís con Claude (tiene costo) o esperás a que Groq se libere? Se reintenta al minuto.`,
      ],
      esperando: ['Esperando a Groq…', `Se reintenta en un minuto. Van ${n} de ${cola.total}.`],
      lista: ['Cola terminada.', `${cola.hechos} analizadas de ${cola.total}${extras ? ' · ' + extras : ''}.`],
      detenida: ['Cola detenida.', `${cola.hechos} analizadas de ${cola.total}${extras ? ' · ' + extras : ''}.`],
    };
    const [titulo, detalle] = textos[cola.fase] || ['', ''];
    const aviso = cola.fase === 'limite' || cola.fase === 'esperando';
    return {
      ...vm,
      titulo,
      detalle,
      activa: cola.activa,
      pausadaLimite: cola.fase === 'limite',
      fondo: aviso ? '#FFF4C2' : cola.fase === 'lista' ? '#E2F3E8' : '#FFFFFF',
      borde: aviso ? '1px solid #E0B400' : '1px solid #E4E1D8',
      color: aviso ? '#5E4B00' : cola.fase === 'lista' ? '#16703D' : '#17160F',
      onSeguirClaude: () => this.colaSeguirConClaude(),
      onEsperar: () => this.colaEsperarGroq(),
      onDetener: () => this.colaDetener(),
      onCerrar: () => this.setState({ cola: null }),
    };
  }
  // "groq/openai/gpt-oss-120b" → "Groq · gpt-oss-120b"; "anthropic/claude-opus-5-5" → "Claude · claude-opus-5-5".
  nombreModelo(modelo) {
    if (!modelo) return '';
    const [prov, ...resto] = modelo.split('/');
    const nombre = resto.join('/').replace(/^openai\//, '');
    return (prov === 'anthropic' ? 'Claude' : prov === 'groq' ? 'Groq' : prov) + ' · ' + nombre;
  }
  // Análisis real (Edge Function nc-analizar). El resultado, el estado sugerido y las alertas llegan por Realtime.
  async analizarReal(x) {
    this.setState({ analizando: true });
    try {
      const r = await api.analizarConversacion(x.id);
      if (!r.ok) {
        this.toastMsg(r.mensaje || 'No se pudo analizar la conversación', 'aviso');
        return;
      }
      const extras = [r.estadoCambiado ? 'estado actualizado' : '', r.alertasNuevas ? `${r.alertasNuevas} alerta(s) nueva(s)` : '']
        .filter(Boolean)
        .join(' · ');
      if (r.respaldo) {
        // Se pasó de Groq a Claude: se avisa en ámbar porque Claude tiene costo.
        this.toastMsg(
          `${r.motivoRespaldo ? r.motivoRespaldo[0].toUpperCase() + r.motivoRespaldo.slice(1) : 'Groq no respondió'}: este análisis se hizo con ${this.nombreModelo(r.modelo)}, que tiene costo.${extras ? ' ' + extras[0].toUpperCase() + extras.slice(1) + '.' : ''}`,
          'aviso',
        );
      } else this.toastMsg(`Análisis listo con Groq${extras ? ' · ' + extras : ''}`);
    } catch (e) {
      this.toastMsg(e.message, 'aviso');
    } finally {
      this.setState({ analizando: false });
    }
  }
  addNote(convId) {
    const t = this.state.noteDraft.trim();
    if (!t) return;
    const u = this.state.user;
    const rec = { id: crypto.randomUUID(), conversacionId: convId, autorId: u.id, texto: t, creadoAt: this.nowIso() };
    this.upd(db => {
      db.notas = [...db.notas, rec];
    });
    this.persist(api.crearNota(rec));
    this.setState({ noteDraft: '' });
    this.toastMsg('Nota agregada');
  }
  resolve(id) {
    const u = this.state.user,
      c = this.state.resolveComment.trim();
    this.upd(db => {
      db.alertas = db.alertas.map(a =>
        a.id === id ? { ...a, estado: 'atendida', atendidaPor: u.id, atendidaAt: this.nowIso(), comentario: c } : a,
      );
    });
    this.setState({ resolving: null, resolveComment: '' });
    this.toastMsg('Alerta marcada como atendida');
    this.persist(api.atenderAlerta(id, u.id, c));
  }
  series() {
    const s = this.state,
      db = s.db;
    if (this.props.estadoDemo === 'vacio') return [];
    const days = [...new Set(db.metricasDiarias.map(m => m.fecha))].sort().slice(-s.range);
    return days.map(f => {
      const ms = db.metricasDiarias.filter(m => m.fecha === f && (s.canal === 'todos' || m.canalId === s.canal));
      const conv = ms.reduce((a, m) => a + m.conversaciones, 0),
        d = conv || 1;
      return {
        fecha: f,
        conv,
        ganadas: ms.reduce((a, m) => a + m.ganadas, 0),
        puntaje: ms.reduce((a, m) => a + m.puntaje * m.conversaciones, 0) / d,
        tiempo: ms.reduce((a, m) => a + m.tiempoRespuestaMin * m.conversaciones, 0) / d,
      };
    });
  }
  chart(vals, min, max, ser) {
    const n = vals.length;
    const f = d => d.slice(8, 10) + '/' + d.slice(5, 7);
    const x = n ? [f(ser[0].fecha), f(ser[Math.floor((n - 1) / 2)].fecha), f(ser[n - 1].fecha)] : ['', '', ''];
    if (n < 2) return { has: false, none: true, pts: '', area: '', x0: '', x1: '', x2: '' };
    const W = 600,
      H = 160;
    const pts = vals
      .map((v, i) => ((i / (n - 1)) * W).toFixed(1) + ',' + (H - 8 - ((v - min) / (max - min || 1)) * (H - 16)).toFixed(1))
      .join(' ');
    return { has: true, none: false, pts, area: '0,' + H + ' ' + pts + ' ' + W + ',' + H, x0: x[0], x1: x[1], x2: x[2] };
  }
  alertsAll() {
    if (this.props.estadoDemo === 'vacio') return [];
    const I = this.I(),
      cmap = {};
    this.state.db.conversaciones.forEach(c => (cmap[c.id] = this.cv(c, I)));
    return this.state.db.alertas.map(a => ({ a, v: cmap[a.conversacionId] }));
  }
  urg(x, y) {
    const r = t => (t.a.estado === 'abierta' ? 0 : 10) + (t.a.nivel === 'critico' ? 0 : 2) + (t.a.tipo === 'intervencion' ? 0 : 1);
    return r(x) - r(y) || (x.a.creadaAt < y.a.creadaAt ? -1 : 1);
  }
  aVM(t) {
    const { a, v } = t;
    const s = this.state,
      cfg = s.db.configuracion.alertas,
      I = this.I();
    const esp = a.tipo === 'espera',
      lv = this.lvl(a.nivel),
      ch = this.chan(v ? v.c.canalId : 'whatsapp'),
      isR = s.resolving === a.id,
      ab = a.estado === 'abierta';
    let motivo = a.motivo,
      frag = a.fragmento || '';
    if (esp) {
      motivo =
        v && v.esperando
          ? 'El último mensaje del cliente lleva ' +
            this.dur(v.esperaMin) +
            ' sin respuesta (umbral ' +
            (a.nivel === 'critico' ? 'crítico: ' + cfg.criticoMin : 'de advertencia: ' + cfg.advertenciaMin) +
            ' min).'
          : 'El cliente ya fue respondido.';
      frag = v && v.last && v.last.autor === 'cliente' ? v.last.texto : '';
    }
    const at = I.usr[a.atendidaPor];
    return {
      id: a.id,
      nivelLabel: lv.label,
      lvFg: lv.fg,
      lvBg: lv.bg,
      lvDot: lv.dot,
      tipoLabel: esp ? 'Cliente esperando respuesta' : 'Intervención de supervisor',
      tipoIcon: esp ? 'schedule' : 'support_agent',
      titulo: esp ? 'Esperando hace ' + (v ? this.dur(v.esperaMin) : '—') : a.titulo,
      cliente: v ? v.cli.nombre : '—',
      usuario: v ? v.cli.usuario : '',
      chLabel: ch.label,
      chDot: ch.dot,
      chBg: ch.bg,
      chFg: ch.fg,
      hora: this.fecha(a.creadaAt),
      ago: 'hace ' + this.dur(this.minsAgo(a.creadaAt)),
      motivo,
      frag,
      hasFrag: !!frag,
      abierta: ab,
      atendida: !ab,
      atendidaTxt: !ab ? 'Atendida por ' + (at ? at.nombre : '—') + ' · ' + this.fecha(a.atendidaAt) : '',
      comentario: a.comentario || '',
      hasComentario: !ab && !!a.comentario,
      onOpen: () => this.openConv(a.conversacionId),
      canResolve: ab && !isR && s.user.rol !== 'vendedor',
      isResolving: isR,
      onResolve: () => this.setState({ resolving: a.id, resolveComment: '' }),
      resolveComment: s.resolveComment,
      onResolveComment: e => this.setState({ resolveComment: e.target.value }),
      onConfirm: () => this.resolve(a.id),
      onCancel: () => this.setState({ resolving: null }),
    };
  }
  itemVM(x, isVend) {
    const ch = this.chan(x.c.canalId),
      lv = this.lvl(x.nivel || 'normal'),
      sel = this.state.selConv === x.id;
    const crit = x.alertas.some(a => a.nivel === 'critico');
    return {
      id: x.id,
      estadoId: x.c.estadoId,
      nombre: x.cli.nombre,
      sub: x.cli.empresa || x.cli.usuario,
      ini: this.initials(x.cli.nombre),
      chLabel: ch.label,
      chDot: ch.dot,
      chBg: ch.bg,
      chFg: ch.fg,
      preview: x.last ? (x.last.autor === 'vendedor' ? 'Vendedor: ' : '') + x.last.texto : '',
      hora: x.last ? this.rel(x.last.enviadoAt) : '',
      estNombre: x.est.nombre,
      estColor: x.est.color,
      estFg: 'color-mix(in oklch, ' + x.est.color + ' 70%, black)',
      estBg: 'color-mix(in oklch, ' + x.est.color + ' 12%, white)',
      esperando: x.esperando,
      espLabel: 'Esperando ' + this.dur(x.esperaMin),
      espFg: lv.fg,
      espBg: lv.bg,
      hasAlert: !isVend && x.alertas.length > 0,
      alertN: String(x.alertas.length),
      alertBg: crit ? '#D42A2A' : '#E09B00',
      hasScore: x.score != null,
      scoreLabel: this.fmt1(x.score),
      scoreFg: this.sc(x.score),
      scoreBg: 'color-mix(in oklch, ' + this.sc(x.score) + ' 12%, white)',
      scoreTitle: 'Puntaje del análisis de IA' + (x.an && x.an.creadoAt ? ' · ' + this.rel(x.an.creadoAt) : ''),
      rowBg: sel ? '#FFF7D6' : '#FFFFFF',
      bar: sel ? '#F2C200' : 'transparent',
      onClick: () => this.openConv(x.id),
    };
  }
  dashVals() {
    const s = this.state;
    const convs = this.convsAll().filter(x => this.byCanal(x));
    const ser = this.series();
    const tot = ser.reduce((a, d) => a + d.conv, 0),
      gan = ser.reduce((a, d) => a + d.ganadas, 0);
    const avg = k => (tot ? ser.reduce((a, d) => a + d[k] * d.conv, 0) / tot : null);
    const activas = convs.filter(x => !['ganado', 'perdido'].includes(x.c.estadoId)).length;
    const esp = convs.filter(x => x.esperando),
      espC = esp.filter(x => x.nivel === 'critico').length,
      espA = esp.filter(x => x.nivel === 'advertencia').length;
    const al = this.alertsAll()
      .filter(t => t.a.estado === 'abierta' && t.v && this.byCanal(t.v))
      .sort((a, b) => this.urg(a, b));
    const alC = al.filter(t => t.a.nivel === 'critico').length;
    const kpis = [
      {
        label: 'Conversaciones activas',
        value: String(activas),
        sub: convs.length + ' en total',
        icon: 'forum',
        onClick: () => this.go('conversaciones'),
      },
      {
        label: 'Esperando respuesta',
        value: String(esp.length),
        sub: esp.length ? espC + ' críticas · ' + espA + ' en advertencia' : 'Nadie esperando',
        icon: 'hourglass_top',
        hasDot: espC > 0,
        dot: '#D93025',
        onClick: () => {
          this.go('conversaciones');
          this.setState({ fEsperando: true });
        },
      },
      {
        label: 'Alertas abiertas',
        value: String(al.length),
        sub: alC ? alC + ' críticas' : 'Sin alertas críticas',
        icon: 'notifications',
        hasDot: alC > 0,
        dot: '#D93025',
        onClick: () => this.go('alertas'),
      },
      {
        label: '1ª respuesta promedio',
        value: tot ? String(Math.round(avg('tiempo'))) : '—',
        unit: 'min',
        sub: 'Últimos ' + s.range + ' días',
        icon: 'timer',
      },
      {
        label: 'Tasa de conversión',
        value: tot ? String(Math.round((gan / tot) * 100)) : '—',
        unit: '%',
        sub: gan + ' ganadas de ' + tot,
        icon: 'trending_up',
      },
      { label: 'Puntaje del vendedor', value: this.fmt1(avg('puntaje')), unit: '/10', sub: 'Promedio del período', icon: 'star' },
    ].map(k => ({
      unit: '',
      hasDot: false,
      dot: 'transparent',
      ...k,
      cursor: k.onClick ? 'pointer' : 'default',
      onClick: k.onClick || null,
      hasArrow: !!k.onClick,
    }));
    const ests = this.estadosOrd().filter(e => e.activo);
    const counts = ests.map(e => convs.filter(x => x.c.estadoId === e.id).length);
    const mx = Math.max(1, ...counts);
    const funnel = ests.map((e, i) => ({ nombre: e.nombre, color: e.color, count: String(counts[i]), w: (counts[i] / mx) * 100 + '%' }));
    const ps = ser.map(d => d.puntaje),
      ts = ser.map(d => d.tiempo),
      tmax = Math.max(10, Math.ceil(Math.max(0, ...ts) / 10) * 10);
    return {
      kpis,
      funnel,
      hasFunnel: convs.length > 0,
      noFunnel: convs.length === 0,
      dashAlerts: al.slice(0, 6).map(t => this.aVM(t)),
      hasDashAlerts: al.length > 0,
      noDashAlerts: al.length === 0,
      dashAlertsMore: al.length > 6 ? 'Ver las ' + al.length + ' alertas' : 'Ver bandeja',
      onAllAlerts: () => this.go('alertas'),
      chScore: { ...this.chart(ps, 4, 10, ser), y0: '10', y1: '7', y2: '4', last: ps.length ? this.fmt1(ps[ps.length - 1]) : '—' },
      chTime: {
        ...this.chart(ts, 0, tmax, ser),
        y0: String(tmax),
        y1: String(tmax / 2),
        y2: '0',
        last: ts.length ? Math.round(ts[ts.length - 1]) + ' min' : '—',
      },
    };
  }
  detailVM(x, isVend, split) {
    const s = this.state,
      db = s.db,
      I = this.I(),
      ch = this.chan(x.c.canalId),
      cfg = db.configuracion.ia;
    const vend = (I.usr[x.c.vendedorId] || { nombre: 'Vendedor' }).nombre.split(' ')[0];
    const thread = [];
    let lastDay = null;
    x.msgs.forEach(m => {
      const k = this.dk(m.enviadoAt);
      if (k !== lastDay) {
        thread.push({ isDay: true, isMsg: false, label: this.dayLabel(m.enviadoAt) });
        lastDay = k;
      }
      const cl = m.autor === 'cliente';
      thread.push({
        isDay: false,
        isMsg: true,
        texto: m.texto,
        align: cl ? 'flex-start' : 'flex-end',
        bg: cl ? '#FFFFFF' : '#FFF0B3',
        bd: cl ? '#E4E1D8' : '#EBD587',
        radius: cl ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        meta: (cl ? x.cli.nombre.split(' ')[0] + ' · cliente' : vend + ' · vendedor') + ' · ' + this.hora(m.enviadoAt),
      });
    });
    const hist = db.historialEstados
      .filter(h => h.conversacionId === x.id)
      .sort((a, b) => (a.creadoAt < b.creadoAt ? 1 : -1))
      .map(h => {
        const e = I.est[h.estadoId] || { nombre: h.estadoId, color: '#8A877D' };
        return {
          nombre: e.nombre,
          color: e.color,
          quien: h.origen === 'manual' ? 'Corregido por ' + ((I.usr[h.cambiadoPor] || {}).nombre || 'usuario') : 'Asignado por IA',
          fecha: this.fecha(h.creadoAt),
          icon: h.origen === 'manual' ? 'person' : 'auto_awesome',
        };
      });
    const an = x.an;
    const motivoLbl = an
      ? {
          tiempo: 'Por tiempo · cada ' + cfg.cadaMinutos + ' min',
          mensajes: 'Por volumen · ' + cfg.cadaMensajes + ' mensajes nuevos',
          manual: 'Manual · ' + ((I.usr[an.solicitadoPor] || {}).nombre || ''),
        }[an.motivo]
      : '';
    const anVM = an
      ? {
          fecha: this.fecha(an.creadoAt),
          motivo: [motivoLbl, this.nombreModelo(an.modelo)].filter(Boolean).join(' · '),
          resumen: an.resumen,
          intencion: an.intencion,
          productos: an.productos.map(p => ({ p })),
          hasProductos: an.productos.length > 0,
          noProductos: !an.productos.length,
          objeciones: an.objeciones.map(o => ({ o })),
          hasObjeciones: an.objeciones.length > 0,
          noObjeciones: !an.objeciones.length,
          proximo: an.proximoPaso,
          score: this.fmt1(x.score),
          scoreColor: this.sc(x.score),
          crit: this.CRIT.map(([k, n]) => {
            const p = an.puntajes[k] || {};
            return {
              nombre: n,
              puntaje: p.puntaje == null ? '—' : String(p.puntaje),
              comentario: p.comentario || '',
              w: p.puntaje == null ? '0%' : p.puntaje * 10 + '%',
              color: this.sc(p.puntaje),
              peso: 'peso ' + cfg.pesos[k] + '%',
            };
          }),
        }
      : {};
    const als = db.alertas
      .filter(a => a.conversacionId === x.id)
      .map(a => ({ a, v: x }))
      .sort((a, b) => this.urg(a, b))
      .map(t => this.aVM(t));
    const notas = db.notas
      .filter(n => n.conversacionId === x.id)
      .sort((a, b) => (a.creadoAt < b.creadoAt ? 1 : -1))
      .map(n => ({ autor: (I.usr[n.autorId] || {}).nombre || '—', fecha: this.fecha(n.creadoAt), texto: n.texto }));
    const openN = als.filter(a => a.abierta).length;
    const lv = this.lvl(x.nivel || 'normal');
    return {
      nombre: x.cli.nombre,
      sub: [x.cli.usuario, x.cli.empresa].filter(Boolean).join(' · '),
      ini: this.initials(x.cli.nombre),
      chLabel: ch.label,
      chDot: ch.dot,
      chBg: ch.bg,
      chFg: ch.fg,
      estNombre: x.est.nombre,
      estColor: x.est.color,
      estFg: 'color-mix(in oklch, ' + x.est.color + ' 70%, black)',
      estBg: 'color-mix(in oklch, ' + x.est.color + ' 12%, white)',
      esperando: x.esperando,
      espLabel: 'Esperando ' + this.dur(x.esperaMin),
      espFg: lv.fg,
      espBg: lv.bg,
      thread,
      readOnly: 'Solo lectura · el vendedor responde desde la app de ' + ch.label,
      canEditEstado: !isVend,
      noEditEstado: isVend,
      estadoId: x.c.estadoId,
      estadoOpts: this.estadosOrd()
        .filter(e => e.activo || e.id === x.c.estadoId)
        .map(e => ({ value: e.id, label: e.nombre })),
      onEstado: e => this.setEstado(x.id, e.target.value),
      hist,
      hasAn: !!an,
      noAn: !an,
      an: anVM,
      analizando: s.analizando,
      notAnalizando: !s.analizando,
      analizarLabel: s.analizando ? 'Analizando…' : 'Analizar ahora',
      onAnalizar: () => this.analizar(x),
      noAnText:
        'Se analiza cada ' +
        cfg.cadaMinutos +
        ' min o cada ' +
        cfg.cadaMensajes +
        ' mensajes nuevos, lo que ocurra primero. Podés forzarlo ahora.',
      showAlerts: !isVend,
      alerts: als,
      hasAlerts: als.length > 0,
      noAlerts: als.length === 0,
      showNotes: !isVend,
      notas,
      hasNotas: notas.length > 0,
      noNotas: notas.length === 0,
      noteDraft: s.noteDraft,
      onNote: e => this.setState({ noteDraft: e.target.value }),
      onAddNote: () => this.addNote(x.id),
      noteBtnOp: s.noteDraft.trim() ? '1' : '.45',
      onBack: () => this.setState({ selConv: null, confirmDelConv: null }),
      canDeleteConv: s.user.rol === 'admin' && s.confirmDelConv !== x.id,
      confirmingDelConv: s.user.rol === 'admin' && s.confirmDelConv === x.id,
      onDeleteConv: () => this.setState({ confirmDelConv: x.id }),
      onCancelDelConv: () => this.setState({ confirmDelConv: null }),
      onConfirmDelConv: () => this.eliminarConversacion(x.id),
      tabs: [
        this.pill('Chat', s.detailTab === 'chat', () => this.setState({ detailTab: 'chat' })),
        this.pill('Análisis y gestión' + (openN && !isVend ? ' · ' + openN : ''), s.detailTab === 'info', () =>
          this.setState({ detailTab: 'info' }),
        ),
      ],
    };
  }
  convVals() {
    const s = this.state,
      w = s.w,
      isMobile = w < 760,
      isVend = s.user.rol === 'vendedor';
    const all = this.convsAll(),
      q = s.q.trim().toLowerCase();
    let list = all.filter(x => this.byCanal(x));
    if (s.fEstado !== 'todos') list = list.filter(x => x.c.estadoId === s.fEstado);
    if (!isVend && s.fAlerta === 'con') list = list.filter(x => x.alertas.length);
    if (!isVend && s.fAlerta === 'sin') list = list.filter(x => !x.alertas.length);
    if (s.fEsperando) list = list.filter(x => x.esperando);
    if (q)
      list = list.filter(
        x =>
          (x.cli.nombre + ' ' + x.cli.usuario + ' ' + (x.cli.empresa || '')).toLowerCase().includes(q) ||
          x.msgs.some(m => m.texto.toLowerCase().includes(q)),
      );
    list.sort((a, b) => ((b.last ? b.last.enviadoAt : '') > (a.last ? a.last.enviadoAt : '') ? 1 : -1));
    const filtersOn = s.fEstado !== 'todos' || s.fAlerta !== 'todos' || s.fEsperando || !!q || s.canal !== 'todos';
    const sel = s.selConv ? all.find(x => x.id === s.selConv) : null;
    const kanban = s.convView === 'kanban' && !isMobile,
      wide = w >= 900,
      split = w >= 1400;
    const items = list.map(x => this.itemVM(x, isVend));
    const ests = this.estadosOrd().filter(e => e.activo);
    const espCount = all.filter(x => x.esperando && this.byCanal(x)).length;
    return {
      q: s.q,
      onQ: e => this.setState({ q: e.target.value }),
      estadoOpts: [{ value: 'todos', label: 'Todos los estados' }, ...ests.map(e => ({ value: e.id, label: e.nombre }))],
      fEstado: s.fEstado,
      onFEstado: e => this.setState({ fEstado: e.target.value }),
      showAlertaFilter: !isVend,
      alertaOpts: [
        { value: 'todos', label: 'Con y sin alerta' },
        { value: 'con', label: 'Con alerta' },
        { value: 'sin', label: 'Sin alerta' },
      ],
      fAlerta: s.fAlerta,
      onFAlerta: e => this.setState({ fAlerta: e.target.value }),
      espPill: {
        label: 'Esperando respuesta',
        count: String(espCount),
        onClick: () => this.setState(st => ({ fEsperando: !st.fEsperando })),
        bg: s.fEsperando ? '#17160F' : '#FFFFFF',
        fg: s.fEsperando ? '#FFFFFF' : '#17160F',
        bd: s.fEsperando ? '#17160F' : '#DEDBD1',
        cbg: s.fEsperando ? '#F2C200' : '#F2EFE6',
      },
      viewOpts: [
        this.pill('Lista', !kanban, () => this.setState({ convView: 'lista' })),
        this.pill('Kanban', kanban, () => this.setState({ convView: 'kanban', selConv: null })),
      ],
      showViewToggle: !isMobile,
      convTitle: isVend ? 'Mis conversaciones' : 'Conversaciones',
      resultCount: list.length + (list.length === 1 ? ' conversación' : ' conversaciones'),
      cola: this.colaVM(list, isVend),
      onClearFilters: () => this.setState({ fEstado: 'todos', fAlerta: 'todos', fEsperando: false, q: '', canal: 'todos' }),
      convH: isMobile ? 'calc(100dvh - 120px)' : '100dvh',
      convPadX: isMobile ? '14px' : '28px',
      showConvHeader: !(isMobile && sel),
      isKanban: kanban,
      isLista: !kanban,
      items,
      hasItems: items.length > 0,
      noItems: items.length === 0,
      emptyTitle: all.length === 0 ? 'Todavía no hay conversaciones' : 'Sin resultados',
      emptyText:
        all.length === 0
          ? 'Cuando lleguen mensajes por WhatsApp o Instagram los vas a ver acá.'
          : 'Ninguna conversación coincide con los filtros aplicados.',
      showClear: all.length > 0 && filtersOn,
      showList: !kanban && (!sel || wide),
      listW: wide ? (w >= 1280 ? '380px' : '340px') : '100%',
      showDetailCol: !kanban && (wide || !!sel),
      hasSel: !!sel,
      noSel: !sel,
      split,
      showTabs: !split,
      showChat: split || s.detailTab === 'chat',
      showPanel: split || s.detailTab === 'info',
      panelW: split ? '390px' : '100%',
      panelBorder: split ? '1px solid #E4E1D8' : 'none',
      showBack: !wide,
      d: sel ? this.detailVM(sel, isVend, split) : { tabs: [], thread: [], hist: [], alerts: [], notas: [], estadoOpts: [], an: {} },
      kCols: ests.map(e => {
        const cards = items
          .filter(i => i.estadoId === e.id)
          .map(i => ({ ...i, onClick: () => this.setState({ convView: 'lista', selConv: i.id, detailTab: 'chat' }) }));
        return { nombre: e.nombre, color: e.color, count: String(cards.length), cards, empty: cards.length === 0 };
      }),
    };
  }
  perfVals() {
    const s = this.state,
      db = s.db,
      I = this.I(),
      isVend = s.user.rol === 'vendedor';
    const all = this.convsAll().filter(x => x.an && this.minsAgo(x.an.creadoAt) <= s.range * 1440);
    const sel = all.filter(x => this.byCanal(x));
    const avgC = (arr, k) => {
      const v = arr.map(x => x.an.puntajes[k] && x.an.puntajes[k].puntaje).filter(p => p != null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const avgG = arr => {
      const v = arr.map(x => x.score).filter(p => p != null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const g = avgG(sel);
    const crit = this.CRIT.map(([k, n]) => {
      const a = avgC(sel, k);
      return {
        nombre: n,
        value: this.fmt1(a),
        w: a == null ? '0%' : a * 10 + '%',
        color: this.sc(a),
        peso: 'Peso ' + db.configuracion.ia.pesos[k] + '%',
      };
    });
    const byCh = ['whatsapp', 'instagram'].map(id => {
      const arr = all.filter(x => x.c.canalId === id),
        ch = this.chan(id),
        gg = avgG(arr);
      return {
        label: ch.label,
        dot: ch.dot,
        n: arr.length + ' analizadas',
        general: this.fmt1(gg),
        gColor: this.sc(gg),
        crit: this.CRIT.map(([k, n]) => {
          const a = avgC(arr, k);
          return { nombre: n, value: this.fmt1(a), w: a == null ? '0%' : a * 10 + '%', color: this.sc(a) };
        }),
      };
    });
    const sorted = [...sel].filter(x => x.score != null).sort((a, b) => b.score - a.score);
    const card = x => {
      const ch = this.chan(x.c.canalId);
      return {
        nombre: x.cli.nombre,
        chLabel: ch.label,
        chDot: ch.dot,
        score: this.fmt1(x.score),
        color: this.sc(x.score),
        resumen: x.an.resumen,
        estado: x.est.nombre,
        onClick: () => this.openConv(x.id),
      };
    };
    const ser = this.series(),
      ps = ser.map(d => d.puntaje);
    const r = db.resumenDesempeno,
      vend = I.usr[r.vendedorId] || { nombre: '' };
    return {
      perfTitle: isVend ? 'Mi desempeño' : 'Desempeño del vendedor',
      perfWho: vend.nombre,
      general: this.fmt1(g),
      gColor: this.sc(g),
      gLabel: g == null ? 'Sin datos' : g >= 8 ? 'Muy bueno' : g >= 6 ? 'Aceptable' : 'Necesita mejorar',
      nAnalizadas: sel.length + ' conversaciones analizadas',
      perfCrit: crit,
      byCh,
      best: sorted.slice(0, 3).map(card),
      worst: sorted.slice(-3).reverse().map(card),
      hasPerf: sel.length > 0,
      noPerf: sel.length === 0,
      fortalezas: r.fortalezas.map(t => ({ t })),
      mejoras: r.mejoras.map(t => ({ t })),
      resumenFecha: 'Redactado por IA · ' + this.fecha(r.generadoAt),
      pChart: { ...this.chart(ps, 4, 10, ser), y0: '10', y1: '7', y2: '4', last: ps.length ? this.fmt1(ps[ps.length - 1]) : '—' },
    };
  }
  alertVals() {
    const s = this.state;
    let l = this.alertsAll().filter(t => t.v && this.byCanal(t.v));
    const nAb = l.filter(t => t.a.estado === 'abierta').length,
      nAt = l.length - nAb;
    if (s.aTipo !== 'todos') l = l.filter(t => t.a.tipo === s.aTipo);
    if (s.aNivel !== 'todos') l = l.filter(t => t.a.nivel === s.aNivel);
    if (s.aEstado === 'abiertas') l = l.filter(t => t.a.estado === 'abierta');
    else if (s.aEstado === 'atendidas') l = l.filter(t => t.a.estado !== 'abierta');
    l.sort((a, b) => this.urg(a, b));
    const P = (k, v, lab) => this.pill(lab, s[k] === v, () => this.setState({ [k]: v, resolving: null }));
    return {
      aEstadoOpts: [
        P('aEstado', 'abiertas', 'Abiertas · ' + nAb),
        P('aEstado', 'atendidas', 'Atendidas · ' + nAt),
        P('aEstado', 'todas', 'Todas'),
      ],
      aTipoOpts: [P('aTipo', 'todos', 'Todos los tipos'), P('aTipo', 'intervencion', 'Intervención'), P('aTipo', 'espera', 'Espera')],
      aNivelOpts: [P('aNivel', 'todos', 'Todos'), P('aNivel', 'critico', 'Crítico'), P('aNivel', 'advertencia', 'Advertencia')],
      alertList: l.map(t => this.aVM(t)),
      hasAlertList: l.length > 0,
      noAlertList: l.length === 0,
      alertEmptyTitle: s.aEstado === 'abiertas' ? 'No hay alertas abiertas' : 'Sin alertas',
      alertEmptyText:
        s.aEstado === 'abiertas'
          ? 'Todo en orden: ningún cliente esperando de más ni situaciones para intervenir.'
          : 'No hay alertas que coincidan con los filtros.',
    };
  }
  fld(sec, key, label, o) {
    o = o || {};
    const val = this.state.db.configuracion[sec][key];
    const rk = sec + '.' + key,
      rev = !!this.state.reveal[rk];
    return {
      label,
      value: val == null ? '' : val,
      onChange: e => this.setCfg(sec, key, o.num ? Number(e.target.value) : e.target.value),
      type: o.secret && !rev ? 'password' : o.num ? 'number' : 'text',
      isSecret: !!o.secret,
      revIcon: rev ? 'visibility_off' : 'visibility',
      revTitle: rev ? 'Ocultar' : 'Mostrar',
      onReveal: () => this.setState(s => ({ reveal: { ...s.reveal, [rk]: !rev } })),
      readonly: !!o.ro,
      isCopy: !!o.copy,
      onCopy: () => this.copy(val),
      help: o.help || '',
      hasHelp: !!o.help,
      suffix: o.suffix || '',
      hasSuffix: !!o.suffix,
      inBg: o.ro ? '#F4F3EF' : '#FFFFFF',
      ph: o.ph || '',
    };
  }
  connVM(ch) {
    const s = this.state,
      c = s.db.configuracion[ch];
    const st = {
      conectado: { label: 'Conectado', fg: '#16703D', bg: '#E2F3E8', dot: '#1E8E4E' },
      desconectado: { label: 'Desconectado', fg: '#B3261E', bg: '#FBE4E1', dot: '#D93025' },
      esperando_qr: { label: 'Esperando QR', fg: '#8A5200', bg: '#FCEFD2', dot: '#E09B00' },
    }[c.estado];
    const res = s.testResult[ch],
      testing = !!s.testing[ch],
      wa = ch === 'whatsapp';
    return {
      ...st,
      titulo: wa ? 'WhatsApp · Evolution API' : 'Instagram · API oficial de Meta',
      cuenta: wa ? c.numero : '@suplementosnort',
      detail:
        c.estado === 'conectado'
          ? 'Última verificación: ' + this.fecha(c.verificadoAt)
          : c.estado === 'esperando_qr'
            ? 'Escaneá el código desde WhatsApp › Dispositivos vinculados.'
            : 'No se reciben mensajes. Revisá las credenciales y probá la conexión.',
      showQR: wa && c.estado === 'esperando_qr',
      hasQrImg: wa && api.usaSupabase && !!s.qr,
      noQrImg: !(wa && api.usaSupabase && !!s.qr),
      qrSrc: s.qr || '',
      qrHelp: api.usaSupabase
        ? 'El código vence en unos 40 segundos: si no llegás, generalo de nuevo. Abrí WhatsApp en el teléfono › Dispositivos vinculados › Vincular dispositivo.'
        : 'El código se renueva cada 40 segundos. Abrí WhatsApp en el teléfono del local › Dispositivos vinculados › Vincular dispositivo.',
      scanLabel: api.usaSupabase ? 'Ya lo escaneé' : 'Simular escaneo',
      isWA: wa,
      testLabel: testing ? 'Probando…' : 'Probar conexión',
      testing,
      onTest: () => this.probar(ch),
      hasResult: !!res && !testing,
      resultMsg: res ? res.msg : '',
      resultFg: res && res.ok ? '#16703D' : '#B3261E',
      resultBg: res && res.ok ? '#E2F3E8' : '#FBE4E1',
      resultIcon: res && res.ok ? 'check_circle' : 'error',
      onQR: () => (api.usaSupabase ? this.generarQR() : this.setCfg(ch, 'estado', 'esperando_qr')),
      onScan: () => {
        if (api.usaSupabase) return this.probar(ch);
        this.setState(s2 => ({
          db: {
            ...s2.db,
            configuracion: {
              ...s2.db.configuracion,
              [ch]: { ...s2.db.configuracion[ch], estado: 'conectado', verificadoAt: this.nowIso() },
            },
          },
        }));
        this.toastMsg('WhatsApp vinculado');
      },
      onDisconnect: () => this.setCfg(ch, 'estado', 'desconectado'),
      // Con Evolution real el QR vence rápido: siempre se puede pedir uno nuevo mientras no esté conectado.
      showQRBtn: wa && (api.usaSupabase ? c.estado !== 'conectado' : c.estado !== 'esperando_qr'),
      // Con Evolution real, desvincular el teléfono se hace desde Evolution (evita cortar la línea por error).
      showDisconnect: !api.usaSupabase && c.estado === 'conectado',
      showWebhookBtn: wa && api.usaSupabase,
      webhookLabel: s.configurandoWebhook ? 'Configurando…' : 'Configurar webhook en Evolution',
      onWebhook: () => this.configurarWebhook(),
    };
  }
  // Importa el historial de la instancia desde una fecha (página por página) y después transcribe la cola
  // de audios en lotes, respetando las pausas que pida Groq. Mientras dura se pausa Realtime para no recibir
  // miles de eventos; al terminar se recarga todo una vez.
  async importarHistorial() {
    if (this.state.importacion?.activo) return;
    if (this.state.dirty)
      return this.setState({ importacion: { fase: 'error', mensaje: 'Guardá los cambios de configuración antes de importar.' } });
    const desde = this.state.importarDesde;
    const imp = {
      activo: true,
      fase: 'importando',
      pagina: 0,
      paginas: null,
      guardados: 0,
      repetidos: 0,
      audios: 0,
      transcritos: 0,
      fallidos: 0,
      pendientes: 0,
    };
    const actualizar = cambios => {
      Object.assign(imp, cambios);
      this.setState({ importacion: { ...imp } });
    };
    this._cancelarImport = false;
    this.desuscribir();
    actualizar({});
    try {
      for (let pagina = 1; pagina <= 2000 && !this._cancelarImport; pagina++) {
        const r = await api.consultarEvolution('importar', { desde, pagina });
        if (!r.ok) throw new Error(r.mensaje);
        actualizar({
          pagina,
          paginas: r.paginas,
          guardados: imp.guardados + r.guardados,
          repetidos: imp.repetidos + r.repetidos,
          audios: imp.audios + r.audios,
        });
        if (r.terminado) break;
      }
      while (!this._cancelarImport) {
        actualizar({ fase: 'transcribiendo' });
        const r = await api.consultarEvolution('transcribir');
        if (!r.ok) throw new Error(r.mensaje);
        actualizar({ transcritos: imp.transcritos + r.transcritos, fallidos: imp.fallidos + r.fallidos, pendientes: r.pendientes });
        if (!r.pendientes) break;
        if (r.esperar) {
          actualizar({ fase: 'esperando' });
          await new Promise(res => setTimeout(res, r.esperar * 1000));
        } else if (!r.transcritos && !r.fallidos) break;
      }
      actualizar({ activo: false, fase: this._cancelarImport ? 'detenido' : 'listo' });
    } catch (e) {
      actualizar({ activo: false, fase: 'error', mensaje: e.message });
    } finally {
      await this.recargar();
      this.suscribir();
    }
  }
  importacionVM() {
    const s = this.state,
      imp = s.importacion;
    const base = {
      mostrar: api.usaSupabase,
      desde: s.importarDesde,
      onDesde: e => this.setState({ importarDesde: e.target.value }),
      onImportar: () => this.importarHistorial(),
      onCancelar: () => (this._cancelarImport = true),
      activo: !!imp?.activo,
      hayEstado: !!imp,
    };
    if (!imp) return base;
    const n = x => Number(x || 0).toLocaleString('es-AR');
    const resumenImp = `${n(imp.guardados)} mensajes nuevos${imp.repetidos ? ` · ${n(imp.repetidos)} ya existían` : ''} · ${n(imp.audios)} audios.`;
    const resumenAud = `Audios transcritos: ${n(imp.transcritos)}${imp.fallidos ? ` · ${n(imp.fallidos)} con error` : ''} · pendientes: ${n(imp.pendientes)}.`;
    const fases = {
      importando: ['Importando mensajes…', `Página ${imp.pagina}${imp.paginas ? ` de ${imp.paginas}` : ''}. ${resumenImp}`],
      transcribiendo: ['Transcribiendo audios…', `${resumenImp} ${resumenAud}`],
      esperando: ['Esperando a Groq (límite de uso)…', `Se reanuda en un minuto. ${resumenAud}`],
      listo: ['Importación terminada', `${resumenImp} ${resumenAud}`],
      detenido: ['Importación detenida', `${resumenImp} ${resumenAud} Podés volver a ejecutarla: no duplica mensajes.`],
      error: ['No se pudo completar la importación', imp.mensaje || ''],
    };
    const [titulo, detalle] = fases[imp.fase] || ['', ''];
    const color = imp.fase === 'error' ? ['#FBE4E1', '#B3261E'] : imp.fase === 'listo' ? ['#E2F3E8', '#16703D'] : ['#F4F3EF', '#17160F'];
    return { ...base, titulo, detalle, estadoBg: color[0], estadoFg: color[1] };
  }
  // Apunta el webhook de la instancia (en Evolution) a esta app, vía la Edge Function nc-evolution.
  async configurarWebhook() {
    if (this.state.configurandoWebhook) return;
    const fin = (ok, msg) => this.setState(s => ({ configurandoWebhook: false, testResult: { ...s.testResult, whatsapp: { ok, msg } } }));
    if (this.state.dirty) return fin(false, 'Guardá los cambios antes de configurar el webhook.');
    this.setState({ configurandoWebhook: true });
    try {
      const r = await api.consultarEvolution('webhook');
      fin(!!r.ok, r.mensaje);
    } catch (e) {
      fin(false, e.message);
    }
  }
  // Aplica el estado de WhatsApp devuelto por Evolution (vía nc-evolution) a la configuración en memoria.
  aplicarEstadoWA(estado) {
    this.setState(s => ({
      db: {
        ...s.db,
        configuracion: {
          ...s.db.configuracion,
          whatsapp: { ...s.db.configuracion.whatsapp, estado, verificadoAt: new Date().toISOString() },
        },
      },
      qr: estado === 'esperando_qr' ? s.qr : null,
    }));
  }
  async probarReal(ch) {
    const fin = (ok, msg) =>
      this.setState(s => ({ testing: { ...s.testing, [ch]: false }, testResult: { ...s.testResult, [ch]: { ok, msg } } }));
    if (ch !== 'whatsapp') return fin(false, 'La conexión con Instagram (Meta) todavía no está disponible.');
    if (this.state.dirty) return fin(false, 'Guardá los cambios antes de probar la conexión.');
    this.setState(s => ({ testing: { ...s.testing, [ch]: true } }));
    try {
      const r = await api.consultarEvolution('estado');
      if (r.estado) this.aplicarEstadoWA(r.estado);
      fin(!!r.ok, r.mensaje);
    } catch (e) {
      fin(false, e.message);
    }
  }
  async generarQR() {
    if (this.state.dirty)
      return this.setState(s => ({
        testResult: { ...s.testResult, whatsapp: { ok: false, msg: 'Guardá los cambios antes de generar el QR.' } },
      }));
    this.setState(s => ({ testing: { ...s.testing, whatsapp: true } }));
    try {
      const r = await api.consultarEvolution('qr');
      this.setState(s => ({
        testing: { ...s.testing, whatsapp: false },
        qr: r.qr || null,
        testResult: { ...s.testResult, whatsapp: r.qr ? undefined : { ok: !!r.ok, msg: r.mensaje } },
      }));
      if (r.estado) this.aplicarEstadoWA(r.estado);
    } catch (e) {
      this.setState(s => ({
        testing: { ...s.testing, whatsapp: false },
        testResult: { ...s.testResult, whatsapp: { ok: false, msg: e.message } },
      }));
    }
  }
  probar(ch) {
    if (api.usaSupabase) return this.probarReal(ch);
    this.setState(s => ({ testing: { ...s.testing, [ch]: true } }));
    setTimeout(() => {
      const c = this.state.db.configuracion[ch];
      const ok =
        ch === 'whatsapp' ? !!(c.serverUrl && c.apiKey && c.instancia) : !!(c.appId && c.appSecret && c.accessToken && c.igBusinessId);
      const msg = ok
        ? ch === 'whatsapp'
          ? 'Conexión exitosa · la instancia "' + c.instancia + '" respondió en 142 ms.'
          : 'Conexión exitosa · cuenta de Instagram Business verificada.'
        : 'No se pudo conectar: faltan credenciales obligatorias.';
      const estado = ok ? (c.estado === 'esperando_qr' ? 'esperando_qr' : 'conectado') : 'desconectado';
      this.setState(s => ({
        testing: { ...s.testing, [ch]: false },
        testResult: { ...s.testResult, [ch]: { ok, msg } },
        db: {
          ...s.db,
          configuracion: {
            ...s.db.configuracion,
            [ch]: { ...s.db.configuracion[ch], estado, verificadoAt: ok ? this.nowIso() : s.db.configuracion[ch].verificadoAt },
          },
        },
      }));
    }, 1300);
  }
  updAl(patch) {
    this.setState(s => ({
      dirty: true,
      db: { ...s.db, configuracion: { ...s.db.configuracion, alertas: { ...s.db.configuracion.alertas, ...patch } } },
    }));
  }
  updEstado(id, patch) {
    const e = { ...this.state.db.estadosVenta.find(x => x.id === id), ...patch };
    this.upd(db => {
      db.estadosVenta = db.estadosVenta.map(x => (x.id === id ? e : x));
    });
    this.persistLuego('estado:' + id, () => api.guardarEstadoVenta(e));
  }
  moveEstado(i, dir) {
    const l = this.estadosOrd();
    const j = i + dir;
    if (j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    const estados = l.map((e, k) => ({ ...e, orden: k + 1 }));
    this.upd(db => {
      db.estadosVenta = estados;
    });
    this.persist(api.guardarEstadosVenta(estados));
  }
  cfgVals() {
    const s = this.state,
      db = s.db,
      cfg = db.configuracion,
      tab = s.cfgTab,
      isMobile = s.w < 760;
    const tabs = [
      ['whatsapp', 'WhatsApp'],
      ['instagram', 'Instagram'],
      ['ia', 'Análisis con IA'],
      ['alertas', 'Alertas y tiempos'],
      ['estados', 'Estados de venta'],
      ['usuarios', 'Usuarios'],
    ].map(([k, l]) => ({
      label: l,
      onClick: () => this.setState({ cfgTab: k }),
      fg: tab === k ? '#17160F' : '#6B6960',
      bar: tab === k ? '#F2C200' : 'transparent',
      fw: tab === k ? '600' : '500',
    }));
    let fields = [];
    if (tab === 'whatsapp')
      fields = [
        this.fld('whatsapp', 'serverUrl', 'URL del servidor Evolution API', {
          ph: 'https://',
          help: 'La dirección del panel de Evolution (por ejemplo https://mi-servidor.com), no la de un webhook de n8n.',
        }),
        this.fld('whatsapp', 'apiKey', 'API Key', { secret: true }),
        this.fld('whatsapp', 'instancia', 'Nombre de la instancia'),
        this.fld('whatsapp', 'numero', 'Número de WhatsApp asociado'),
        this.fld('whatsapp', 'webhookUrl', 'URL de webhook', {
          ro: true,
          copy: true,
          help: 'Pegala en Evolution › Events › Webhook (Enabled, sin "Webhook by Events") con los eventos MESSAGES_UPSERT y CONNECTION_UPDATE.',
        }),
      ];
    if (tab === 'instagram')
      fields = [
        this.fld('instagram', 'appId', 'App ID'),
        this.fld('instagram', 'appSecret', 'App Secret', { secret: true }),
        this.fld('instagram', 'pageId', 'ID de la página de Facebook vinculada'),
        this.fld('instagram', 'igBusinessId', 'ID de la cuenta de Instagram Business'),
        this.fld('instagram', 'accessToken', 'Token de acceso', { secret: true }),
        this.fld('instagram', 'verifyToken', 'Token de verificación del webhook', { secret: true }),
        this.fld('instagram', 'webhookUrl', 'URL de webhook', {
          ro: true,
          copy: true,
          help: 'Pegala en Meta for Developers › Webhooks junto al token de verificación.',
        }),
      ];
    if (tab === 'ia')
      fields = [
        this.fld('ia', 'cadaMinutos', 'Frecuencia por tiempo', { num: true, suffix: 'minutos' }),
        this.fld('ia', 'cadaMensajes', 'Frecuencia por volumen', { num: true, suffix: 'mensajes nuevos' }),
        this.fld('ia', 'groqApiKey', 'API Key de Groq · transcripción de audios', {
          secret: true,
          help: 'Los audios de WhatsApp se transcriben con Whisper (Groq) y se guarda solo el texto. Si queda vacía, se registran como [Audio].',
        }),
      ];
    if (tab === 'alertas')
      fields = [
        this.fld('alertas', 'advertenciaMin', 'Espera para alerta de advertencia', { num: true, suffix: 'minutos' }),
        this.fld('alertas', 'criticoMin', 'Espera para alerta crítica', { num: true, suffix: 'minutos' }),
      ];
    const pesos = cfg.ia.pesos,
      ptot = Object.values(pesos).reduce((a, b) => a + Number(b), 0);
    const ests = this.estadosOrd();
    const uso = id => db.conversaciones.filter(c => c.estadoId === id).length;
    const um = s.userModal;
    return {
      cfgTabs: tabs,
      cfgFields: fields,
      hasFields: fields.length > 0,
      cfgFieldsTitle:
        {
          whatsapp: 'Credenciales de Evolution API',
          instagram: 'Credenciales de Meta',
          ia: 'Frecuencia de análisis',
          alertas: 'Tiempos de espera del cliente',
        }[tab] || '',
      isConnTab: tab === 'whatsapp' || tab === 'instagram',
      imp: tab === 'whatsapp' ? this.importacionVM() : { mostrar: false },
      conn: tab === 'whatsapp' || tab === 'instagram' ? this.connVM(tab) : {},
      isIA: tab === 'ia',
      isAlertasTab: tab === 'alertas',
      isEstados: tab === 'estados',
      isUsuarios: tab === 'usuarios',
      showSave: ['whatsapp', 'instagram', 'ia', 'alertas'].includes(tab),
      dirtyTxt: s.dirty ? 'Cambios sin guardar' : 'Todo guardado',
      onSave: () => {
        this.setState({ dirty: false });
        this.persist(api.guardarConfiguracion(this.state.db.configuracion, s.user.id), 'Configuración guardada');
      },
      iaRule: api.usaSupabase
        ? 'Por ahora el análisis se hace con "Analizar ahora" en cada conversación (todavía no es automático). Se usa Groq (openai/gpt-oss-120b, con la API Key de Groq de abajo) y, si Groq se queda sin cupo o falla, Claude con el modelo y la API Key de Anthropic elegidos acá.'
        : 'Se analiza cada ' +
          cfg.ia.cadaMinutos +
          ' minutos o cada ' +
          cfg.ia.cadaMensajes +
          ' mensajes nuevos, lo que ocurra primero. Las conversaciones sin mensajes nuevos no se vuelven a analizar.',
      provOpts: Object.keys(this.MODELOS).map(p => ({ value: p, label: p })),
      proveedor: cfg.ia.proveedor,
      onProv: e => {
        const p = e.target.value;
        this.setCfg('ia', 'proveedor', p);
        this.setCfg('ia', 'modelo', this.MODELOS[p][0]);
      },
      modelOpts: (this.MODELOS[cfg.ia.proveedor] || []).map(m => ({ value: m, label: m })),
      modelo: cfg.ia.modelo,
      onModelo: e => this.setCfg('ia', 'modelo', e.target.value),
      iaKey: this.fld('ia', 'apiKey', 'API Key del proveedor', { secret: true }),
      pesos: this.CRIT.map(([k, n]) => ({
        nombre: n,
        value: pesos[k],
        label: pesos[k] + '%',
        onChange: e => this.setCfg('ia', 'pesos', { ...this.state.db.configuracion.ia.pesos, [k]: Number(e.target.value) }),
      })),
      pesoMsg: ptot === 100 ? 'Total 100%' : 'Total ' + ptot + '% · debe sumar 100%',
      pesoFg: ptot === 100 ? '#16703D' : '#B3261E',
      pesoBg: ptot === 100 ? '#E2F3E8' : '#FBE4E1',
      pesoOff: ptot !== 100,
      onNormalizar: () => {
        const k = Object.keys(pesos);
        const t = ptot || 1;
        const n = {};
        let acc = 0;
        k.forEach((kk, i) => {
          n[kk] = i === k.length - 1 ? 100 - acc : Math.round(((pesos[kk] / t) * 100) / 5) * 5;
          acc += n[kk];
        });
        this.setCfg('ia', 'pesos', n);
      },
      thrWarn: cfg.alertas.criticoMin <= cfg.alertas.advertenciaMin,
      thrWarnTxt: 'El tiempo crítico debe ser mayor que el de advertencia.',
      horario: cfg.alertas.horario.map((h, i) => {
        const set = p => this.updAl({ horario: this.state.db.configuracion.alertas.horario.map((x, j) => (j === i ? { ...x, ...p } : x)) });
        return {
          dia: h.dia,
          toggle: this.tg(h.activo, () => set({ activo: !h.activo })),
          desde: h.desde,
          hasta: h.hasta,
          onDesde: e => set({ desde: e.target.value }),
          onHasta: e => set({ hasta: e.target.value }),
          op: h.activo ? '1' : '.4',
          estado: h.activo ? 'Abierto' : 'Cerrado',
        };
      }),
      pausaTg: this.tg(cfg.alertas.pausarFueraHorario, () => this.updAl({ pausarFueraHorario: !cfg.alertas.pausarFueraHorario })),
      situaciones: cfg.alertas.situaciones.map((x, i) => ({
        nombre: x.nombre,
        desc: x.descripcion,
        toggle: this.tg(x.activo, () =>
          this.updAl({
            situaciones: this.state.db.configuracion.alertas.situaciones.map((y, j) => (j === i ? { ...y, activo: !y.activo } : y)),
          }),
        ),
      })),
      notifTg: this.tg(cfg.alertas.notificaciones.app, () =>
        this.updAl({ notificaciones: { ...cfg.alertas.notificaciones, app: !cfg.alertas.notificaciones.app } }),
      ),
      estRows: ests.map((e, i) => ({
        nombre: e.nombre,
        color: e.color,
        orden: String(i + 1),
        onNombre: ev => this.updEstado(e.id, { nombre: ev.target.value }),
        onUp: () => this.moveEstado(i, -1),
        onDown: () => this.moveEstado(i, 1),
        upOp: i > 0 ? '1' : '.3',
        downOp: i < ests.length - 1 ? '1' : '.3',
        toggle: this.tg(e.activo, () => this.updEstado(e.id, { activo: !e.activo })),
        uso: uso(e.id) + ' conv.',
        canDelete: uso(e.id) === 0,
        onDelete: () => {
          this.upd(db2 => {
            db2.estadosVenta = db2.estadosVenta.filter(x => x.id !== e.id);
          });
          this.persist(api.eliminarEstadoVenta(e.id), 'Estado eliminado');
        },
        onPal: () => this.setState(st => ({ palOpen: st.palOpen === e.id ? null : e.id })),
        palOpen: s.palOpen === e.id,
        palette: this.PALETTE.map(c => ({
          c,
          ring: c === e.color ? '0 0 0 2px #fff, 0 0 0 4px #17160F' : 'none',
          onPick: () => {
            this.updEstado(e.id, { color: c });
            this.setState({ palOpen: null });
          },
        })),
      })),
      onAddEstado: () => {
        const nuevo = {
          id: crypto.randomUUID(),
          nombre: 'Nuevo estado',
          color: '#B5446E',
          orden: db.estadosVenta.length + 1,
          activo: true,
        };
        this.upd(db2 => {
          db2.estadosVenta = [...db2.estadosVenta, nuevo];
        });
        this.persist(api.guardarEstadoVenta(nuevo));
      },
      userRows: db.usuarios.map(u => {
        const me = u.id === s.user.id,
          cd = s.confirmDel === u.id;
        return {
          nombre: u.nombre + (me ? ' (vos)' : ''),
          email: u.email,
          ini: this.initials(u.nombre),
          rol: this.ROLES[u.rol],
          toggle: this.tg(u.activo, () => {
            if (me) return this.toastMsg('No podés desactivar tu propio usuario');
            this.upd(db2 => {
              db2.usuarios = db2.usuarios.map(x => (x.id === u.id ? { ...x, activo: !x.activo } : x));
            });
            this.persist(api.guardarUsuario({ ...u, activo: !u.activo }));
          }),
          activoTxt: u.activo ? 'Activo' : 'Inactivo',
          op: u.activo ? '1' : '.55',
          onEdit: () => this.setState({ userModal: { ...u, error: '' } }),
          canDelete: !me && !cd,
          confirming: cd,
          onDelete: () => this.setState({ confirmDel: u.id }),
          onCancelDel: () => this.setState({ confirmDel: null }),
          onConfirmDel: () => {
            this.upd(db2 => {
              db2.usuarios = db2.usuarios.filter(x => x.id !== u.id);
            });
            this.setState({ confirmDel: null });
            this.persist(api.eliminarUsuario(u.id), 'Usuario eliminado');
          },
        };
      }),
      onNewUser: () => this.setState({ userModal: { id: null, nombre: '', email: '', rol: 'vendedor', activo: true, error: '' } }),
      userCols: isMobile ? '1fr' : 'minmax(0,1.4fr) minmax(0,1fr) auto',
    };
  }
  saveUser() {
    const m = this.state.userModal,
      db = this.state.db;
    if (!m.nombre.trim()) return this.setState({ userModal: { ...m, error: 'Ingresá el nombre.' } });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email.trim()))
      return this.setState({ userModal: { ...m, error: 'Ingresá un email válido.' } });
    if (db.usuarios.some(u => u.email.toLowerCase() === m.email.trim().toLowerCase() && u.id !== m.id))
      return this.setState({ userModal: { ...m, error: 'Ya existe un usuario con ese email.' } });
    const rec = { nombre: m.nombre.trim(), email: m.email.trim(), rol: m.rol, activo: m.activo };
    const id = m.id || crypto.randomUUID();
    this.upd(d => {
      d.usuarios = m.id
        ? d.usuarios.map(u => (u.id === m.id ? { ...u, ...rec } : u))
        : [...d.usuarios, { id, creadoAt: this.nowIso(), ...rec }];
    });
    this.setState({ userModal: null });
    this.persist(api.guardarUsuario({ id, ...rec }), m.id ? 'Usuario actualizado' : 'Usuario creado');
  }
  renderVals() {
    const s = this.state,
      P = this.props,
      w = s.w,
      isMobile = w < 760,
      demo = P.estadoDemo || 'normal';
    const base = {
      isMobile,
      toast: s.toast,
      hasToast: !!s.toast,
      // Aviso (ámbar) para cosas que el usuario tiene que notar, como el paso de Groq a Claude.
      toastBg: s.toastTipo === 'aviso' ? '#FFF4C2' : '#17160F',
      toastFg: s.toastTipo === 'aviso' ? '#5E4B00' : '#fff',
      toastBorde: s.toastTipo === 'aviso' ? '1px solid #E0B400' : 'none',
      toastIcon: s.toastTipo === 'aviso' ? 'warning' : 'check_circle',
      toastIconColor: s.toastTipo === 'aviso' ? '#B07D00' : '#F2C200',
      toastBottom: isMobile && s.user ? '80px' : '24px',
      hasUserModal: false,
      um: {},
    };
    if (!s.user) {
      return {
        ...base,
        showLogin: true,
        showApp: false,
        loginEmail: s.loginEmail,
        loginPass: s.loginPass,
        onLoginEmail: e => this.setState({ loginEmail: e.target.value, loginError: '' }),
        onLoginPass: e => this.setState({ loginPass: e.target.value, loginError: '' }),
        onLogin: e => {
          if (e && e.preventDefault) e.preventDefault();
          this.doLogin();
        },
        loginError: s.loginError || (s.loadError ? 'No se pudieron cargar los datos. Reintentá en unos segundos.' : ''),
        hasLoginError: !!(s.loginError || s.loadError),
        loginBtn: api.usaSupabase ? (s.loggingIn ? 'Ingresando…' : 'Ingresar') : s.db ? 'Ingresar' : 'Cargando…',
        showDemo: !api.usaSupabase,
        demoUsers:
          !api.usaSupabase && s.db
            ? s.db.usuarios
                .filter(u => u.activo)
                .map(u => ({
                  nombre: u.nombre,
                  rol: this.ROLES[u.rol],
                  email: u.email,
                  ini: this.initials(u.nombre),
                  onClick: () => this.doLogin(u.email),
                }))
            : [],
      };
    }
    const db = s.db,
      u = s.user,
      role = u.rol,
      isVend = role === 'vendedor';
    const allowed = {
      admin: ['dashboard', 'conversaciones', 'desempeno', 'alertas', 'config'],
      supervisor: ['dashboard', 'conversaciones', 'desempeno', 'alertas'],
      vendedor: ['conversaciones', 'desempeno'],
    }[role];
    const screen = allowed.includes(s.screen) ? s.screen : allowed[0];
    const NAV = {
      dashboard: ['Panel principal', 'space_dashboard', 'Panel'],
      conversaciones: ['Conversaciones', 'forum', 'Chats'],
      desempeno: [isVend ? 'Mi desempeño' : 'Desempeño', 'insights', 'Desempeño'],
      alertas: ['Alertas', 'notifications', 'Alertas'],
      config: ['Configuración', 'settings', 'Ajustes'],
    };
    const sideLabels = w >= 1100;
    const badge = isVend || demo === 'vacio' ? 0 : db.alertas.filter(a => a.estado === 'abierta').length;
    const nav = allowed.map(k => {
      const on = k === screen;
      return {
        label: NAV[k][0],
        short: NAV[k][2],
        icon: NAV[k][1],
        onClick: () => this.go(k),
        bg: on ? '#2B2A22' : 'transparent',
        fg: on ? '#FFFFFF' : '#B9B6AA',
        ic: on ? '#F2C200' : '#8F8C80',
        showLabel: sideLabels,
        justify: sideLabels ? 'flex-start' : 'center',
        hasBadge: k === 'alertas' && badge > 0,
        badge: String(badge),
        badgePos: sideLabels ? 'static' : 'absolute',
        mfg: on ? '#17160F' : '#7A776C',
        mic: on ? '#17160F' : '#8F8C80',
        mbar: on ? '#F2C200' : 'transparent',
      };
    });
    const appLoading = demo === 'carga' || s.retrying || s.booting;
    const appError = !appLoading && demo === 'error' && !s.retried;
    const ready = !appLoading && !appError;
    const um = s.userModal;
    const v = {
      ...base,
      showLogin: false,
      showApp: true,
      nav,
      sideLabels,
      brandJustify: sideLabels ? 'flex-start' : 'center',
      sidebarW: sideLabels ? '236px' : '72px',
      showSidebar: !isMobile,
      showBottomBar: isMobile,
      showTopbar: isMobile,
      userName: u.nombre,
      userRole: this.ROLES[role],
      userIni: this.initials(u.nombre),
      onLogout: () => {
        this.desuscribir();
        api.cerrarSesion();
        this.setState({ user: null, selConv: null, loginError: '', userModal: null, ...(api.usaSupabase ? { db: null } : {}) });
      },
      hasBell: !isVend,
      badge: String(badge),
      hasBadge: badge > 0,
      onBell: () => this.go('alertas'),
      pageTitle: NAV[screen][0],
      appLoading,
      appError,
      onRetry: () => {
        this.setState({ retrying: true });
        setTimeout(() => this.setState({ retrying: false, retried: true }), 900);
      },
      isDash: ready && screen === 'dashboard',
      isConv: ready && screen === 'conversaciones',
      isPerf: ready && screen === 'desempeno',
      isAlerts: ready && screen === 'alertas',
      isCfg: ready && screen === 'config',
      pad: isMobile ? '18px 14px 96px' : '28px 32px 48px',
      h1Size: isMobile ? '22px' : '26px',
      rangeOpts: [7, 14, 30].map(n => this.pill(n + ' días', s.range === n, () => this.setState({ range: n }))),
      canalOpts: [
        ['todos', 'Todos'],
        ['whatsapp', 'WhatsApp'],
        ['instagram', 'Instagram'],
      ].map(([k, l]) => this.pill(l, s.canal === k, () => this.setState({ canal: k }))),
      rangeLabel: 'Últimos ' + s.range + ' días',
      canalLabel: s.canal === 'todos' ? 'Todos los canales' : this.chan(s.canal).label,
      hasUserModal: !!um,
      um: um
        ? {
            title: um.id ? 'Editar usuario' : 'Nuevo usuario',
            nombre: um.nombre,
            email: um.email,
            rol: um.rol,
            error: um.error,
            hasError: !!um.error,
            onNombre: e => this.setState({ userModal: { ...this.state.userModal, nombre: e.target.value, error: '' } }),
            onEmail: e => this.setState({ userModal: { ...this.state.userModal, email: e.target.value, error: '' } }),
            onRol: e => this.setState({ userModal: { ...this.state.userModal, rol: e.target.value } }),
            rolOpts: Object.keys(this.ROLES).map(k => ({ value: k, label: this.ROLES[k] })),
            toggle: this.tg(um.activo, () =>
              this.setState({ userModal: { ...this.state.userModal, activo: !this.state.userModal.activo } }),
            ),
            activoTxt: um.activo ? 'Activo' : 'Inactivo',
            onSave: () => this.saveUser(),
            onCancel: () => this.setState({ userModal: null }),
            saveLabel: um.id ? 'Guardar cambios' : 'Crear usuario',
          }
        : {},
    };
    if (!ready) return v;
    if (screen === 'dashboard') Object.assign(v, this.dashVals());
    if (screen === 'conversaciones') Object.assign(v, this.convVals());
    if (screen === 'desempeno') Object.assign(v, this.perfVals());
    if (screen === 'alertas') Object.assign(v, this.alertVals());
    if (screen === 'config') Object.assign(v, this.cfgVals());
    return v;
  }

  render() {
    return <AppView v={this.renderVals()} />;
  }
}
