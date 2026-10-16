import { Fragment } from 'react';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Conversaciones from './screens/Conversaciones';
import Desempeno from './screens/Desempeno';
import Alertas from './screens/Alertas';
import Configuracion from './screens/Configuracion';

export default function AppView({ v }) {
  return (
    <>
      <div style={{ minHeight: '100dvh', background: '#F4F3EF', color: '#17160F', fontFamily: "'Archivo',system-ui,sans-serif" }}>
        {v.showLogin ? <Login v={v} /> : null}
        {v.showApp ? (
          <>
            <div style={{ display: 'flex', minHeight: '100dvh' }}>
              {v.showSidebar ? (
                <>
                  <aside
                    style={{
                      width: v.sidebarW,
                      flex: 'none',
                      background: '#17160F',
                      color: '#EDEBE4',
                      position: 'sticky',
                      top: '0',
                      height: '100dvh',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '18px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '4px 8px 22px',
                        justifyContent: v.brandJustify,
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: '#F2C200',
                          color: '#17160F',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '800',
                          fontSize: '16px',
                          flex: 'none',
                        }}
                      >
                        N
                      </div>
                      {v.sideLabels ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{ fontWeight: '800', letterSpacing: '.08em', fontSize: '15px' }}>NORT</span>
                            <span style={{ fontSize: '11px', color: '#A8A598' }}>Monitor de ventas</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    {(v.nav || []).map((n, nI) => (
                      <Fragment key={nI}>
                        <button
                          onClick={n?.onClick}
                          title={n?.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: n?.bg,
                            color: n?.fg,
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left',
                            position: 'relative',
                            justifyContent: n?.justify,
                            minHeight: '42px',
                          }}
                        >
                          <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '21px', lineHeight: '1', color: n?.ic }}>
                            {n?.icon}
                          </span>
                          {n?.showLabel ? (
                            <>
                              <span style={{ flex: '1' }}>{n?.label}</span>
                            </>
                          ) : null}
                          {n?.hasBadge ? (
                            <>
                              <span
                                style={{
                                  minWidth: '20px',
                                  height: '20px',
                                  padding: '0 6px',
                                  borderRadius: '10px',
                                  background: '#D42A2A',
                                  color: '#fff',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  display: 'grid',
                                  placeItems: 'center',
                                  position: n?.badgePos,
                                  top: '3px',
                                  right: '3px',
                                  fontFamily: "'IBM Plex Mono',monospace",
                                }}
                              >
                                {n?.badge}
                              </span>
                            </>
                          ) : null}
                        </button>
                      </Fragment>
                    ))}
                    <div style={{ flex: '1' }} />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 8px',
                        borderTop: '1px solid #2E2C24',
                        justifyContent: v.brandJustify,
                      }}
                    >
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#2E2C24',
                          color: '#F2C200',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          flex: 'none',
                        }}
                      >
                        {v.userIni}
                      </span>
                      {v.sideLabels ? (
                        <>
                          <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {v.userName}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#A8A598' }}>{v.userRole}</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <button
                      onClick={v.onLogout}
                      title="Cerrar sesión"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '9px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#B9B6AA',
                        fontSize: '13px',
                        cursor: 'pointer',
                        justifyContent: v.brandJustify,
                      }}
                      className="hv-2"
                    >
                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '20px', lineHeight: '1' }}>logout</span>
                      {v.sideLabels ? (
                        <>
                          <span>Cerrar sesión</span>
                        </>
                      ) : null}
                    </button>
                  </aside>
                </>
              ) : null}
              <main style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                {v.showTopbar ? (
                  <>
                    <header
                      style={{
                        position: 'sticky',
                        top: '0',
                        zIndex: '20',
                        height: '56px',
                        flex: 'none',
                        background: '#17160F',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0 10px 0 14px',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '7px',
                          background: '#F2C200',
                          color: '#17160F',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '800',
                          fontSize: '14px',
                          flex: 'none',
                        }}
                      >
                        N
                      </div>
                      <span
                        style={{
                          flex: '1',
                          fontSize: '16px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {v.pageTitle}
                      </span>
                      {v.hasBell ? (
                        <>
                          <button
                            onClick={v.onBell}
                            title="Alertas"
                            style={{
                              width: '44px',
                              height: '44px',
                              border: 'none',
                              background: 'transparent',
                              color: '#fff',
                              position: 'relative',
                              cursor: 'pointer',
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '23px', lineHeight: '1' }}>
                              notifications
                            </span>
                            {v.hasBadge ? (
                              <>
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '5px',
                                    minWidth: '18px',
                                    height: '18px',
                                    padding: '0 5px',
                                    borderRadius: '9px',
                                    background: '#D42A2A',
                                    color: '#fff',
                                    fontSize: '10.5px',
                                    fontWeight: '700',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontFamily: "'IBM Plex Mono',monospace",
                                  }}
                                >
                                  {v.badge}
                                </span>
                              </>
                            ) : null}
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={v.onLogout}
                        title="Cerrar sesión"
                        style={{
                          height: '44px',
                          border: 'none',
                          background: 'transparent',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0 6px',
                        }}
                      >
                        <span
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#2E2C24',
                            color: '#F2C200',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                          }}
                        >
                          {v.userIni}
                        </span>
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '20px', lineHeight: '1', color: '#A8A598' }}>
                          logout
                        </span>
                      </button>
                    </header>
                  </>
                ) : null}
                {v.appLoading ? (
                  <>
                    <div style={{ padding: v.pad, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6B6960', fontSize: '14px' }}>
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '2px solid #DEDBD1',
                            borderTopColor: '#17160F',
                            animation: 'nortSpin .8s linear infinite',
                          }}
                        />
                        Cargando datos…
                      </div>
                      <div
                        style={{
                          height: '30px',
                          width: '220px',
                          borderRadius: '8px',
                          background: '#E6E3DA',
                          animation: 'nortPulse 1.4s ease-in-out infinite',
                        }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '12px' }}>
                        <div
                          style={{
                            height: '112px',
                            borderRadius: '12px',
                            background: '#E9E6DE',
                            animation: 'nortPulse 1.4s ease-in-out infinite',
                          }}
                        />
                        <div
                          style={{
                            height: '112px',
                            borderRadius: '12px',
                            background: '#E9E6DE',
                            animation: 'nortPulse 1.4s ease-in-out infinite',
                          }}
                        />
                        <div
                          style={{
                            height: '112px',
                            borderRadius: '12px',
                            background: '#E9E6DE',
                            animation: 'nortPulse 1.4s ease-in-out infinite',
                          }}
                        />
                        <div
                          style={{
                            height: '112px',
                            borderRadius: '12px',
                            background: '#E9E6DE',
                            animation: 'nortPulse 1.4s ease-in-out infinite',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: '260px',
                          borderRadius: '12px',
                          background: '#E9E6DE',
                          animation: 'nortPulse 1.4s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </>
                ) : null}
                {v.appError ? (
                  <>
                    <div style={{ padding: v.pad, display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
                      <div
                        style={{
                          maxWidth: '420px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#FBE4E1',
                            color: '#B3261E',
                            display: 'grid',
                            placeItems: 'center',
                            fontFamily: "'Material Symbols Rounded'",
                            fontSize: '28px',
                            lineHeight: '1',
                          }}
                        >
                          cloud_off
                        </span>
                        <h2 style={{ margin: '0', fontSize: '20px' }}>No pudimos cargar los datos</h2>
                        <p style={{ margin: '0', color: '#6B6960', fontSize: '14px', lineHeight: '1.5' }}>
                          Hubo un problema al conectar con la base de datos. Las conversaciones siguen registrándose; reintentá en unos
                          segundos.
                        </p>
                        <button
                          onClick={v.onRetry}
                          style={{
                            marginTop: '6px',
                            height: '42px',
                            padding: '0 18px',
                            border: 'none',
                            borderRadius: '9px',
                            background: '#17160F',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.isDash ? <Dashboard v={v} /> : null}
                {v.isConv ? <Conversaciones v={v} /> : null}
                {v.isPerf ? <Desempeno v={v} /> : null}
                {v.isAlerts ? <Alertas v={v} /> : null}
                {v.isCfg ? <Configuracion v={v} /> : null}
              </main>
              {v.showBottomBar ? (
                <>
                  <nav
                    style={{
                      position: 'fixed',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      zIndex: '30',
                      height: '64px',
                      background: '#FFFFFF',
                      borderTop: '1px solid #E4E1D8',
                      display: 'flex',
                      paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                  >
                    {(v.nav || []).map((n, nI) => (
                      <Fragment key={nI}>
                        <button
                          onClick={n?.onClick}
                          style={{
                            flex: '1',
                            minWidth: '0',
                            border: 'none',
                            background: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                            position: 'relative',
                            color: n?.mfg,
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '0',
                              left: '22%',
                              right: '22%',
                              height: '3px',
                              borderRadius: '0 0 3px 3px',
                              background: n?.mbar,
                            }}
                          />
                          <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '23px', lineHeight: '1', color: n?.mic }}>
                            {n?.icon}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                              padding: '0 2px',
                            }}
                          >
                            {n?.short}
                          </span>
                          {n?.hasBadge ? (
                            <>
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '7px',
                                  left: 'calc(50% + 6px)',
                                  minWidth: '18px',
                                  height: '18px',
                                  padding: '0 5px',
                                  borderRadius: '9px',
                                  background: '#D42A2A',
                                  color: '#fff',
                                  fontSize: '10.5px',
                                  fontWeight: '700',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontFamily: "'IBM Plex Mono',monospace",
                                }}
                              >
                                {n?.badge}
                              </span>
                            </>
                          ) : null}
                        </button>
                      </Fragment>
                    ))}
                  </nav>
                </>
              ) : null}
            </div>
          </>
        ) : null}
        {v.hasUserModal ? (
          <>
            <div onClick={v.um?.onCancel} style={{ position: 'fixed', inset: '0', zIndex: '50', background: 'rgba(23,22,15,.45)' }} />
            <div
              style={{
                position: 'fixed',
                zIndex: '51',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%,-50%)',
                width: 'min(440px,calc(100vw - 24px))',
                background: '#fff',
                borderRadius: '14px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 20px 50px rgba(23,22,15,.3)',
              }}
            >
              <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '700' }}>{v.um?.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Nombre</span>
                <input
                  value={v.um?.nombre}
                  onChange={v.um?.onNombre}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    border: '1px solid #DEDBD1',
                    borderRadius: '9px',
                    fontSize: '14px',
                    color: '#17160F',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Email</span>
                <input
                  type="email"
                  value={v.um?.email}
                  onChange={v.um?.onEmail}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    border: '1px solid #DEDBD1',
                    borderRadius: '9px',
                    fontSize: '14px',
                    color: '#17160F',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Rol</span>
                <select
                  value={v.um?.rol}
                  onChange={v.um?.onRol}
                  style={{
                    height: '42px',
                    padding: '0 10px',
                    border: '1px solid #DEDBD1',
                    borderRadius: '9px',
                    background: '#fff',
                    fontSize: '14px',
                    color: '#17160F',
                  }}
                >
                  {(v.um?.rolOpts || []).map((o, oI) => (
                    <Fragment key={oI}>
                      <option value={o?.value}>{o?.label}</option>
                    </Fragment>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={v.um?.toggle?.onToggle}
                  style={{
                    width: '40px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: v.um?.toggle?.trackBg,
                    position: 'relative',
                    cursor: 'pointer',
                    flex: 'none',
                    padding: '0',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: v.um?.toggle?.knobLeft,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .15s',
                    }}
                  />
                </button>
                <span style={{ fontSize: '14px' }}>{v.um?.activoTxt}</span>
              </div>
              {v.um?.hasError ? (
                <>
                  <div style={{ padding: '9px 12px', borderRadius: '9px', background: '#FBE4E1', color: '#B3261E', fontSize: '13px' }}>
                    {v.um?.error}
                  </div>
                </>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={v.um?.onCancel}
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    border: '1px solid #DEDBD1',
                    borderRadius: '9px',
                    background: '#fff',
                    color: '#17160F',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={v.um?.onSave}
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    border: 'none',
                    borderRadius: '9px',
                    background: '#17160F',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {v.um?.saveLabel}
                </button>
              </div>
            </div>
          </>
        ) : null}
        {v.hasToast ? (
          <>
            <div
              style={{
                position: 'fixed',
                left: '50%',
                bottom: v.toastBottom,
                transform: 'translateX(-50%)',
                zIndex: '60',
                background: v.toastBg,
                color: v.toastFg,
                border: v.toastBorde,
                padding: '11px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(23,22,15,.25)',
                maxWidth: 'calc(100vw - 32px)',
              }}
            >
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1', color: v.toastIconColor }}>
                {v.toastIcon}
              </span>
              {v.toast}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
