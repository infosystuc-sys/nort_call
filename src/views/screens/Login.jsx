import { Fragment } from 'react';

export default function Login({ v }) {
  return (
    <>
      <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))' }}>
        <div
          style={{
            background: '#17160F',
            color: '#F4F3EF',
            padding: 'clamp(28px,5vw,56px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '9px',
                background: '#F2C200',
                color: '#17160F',
                display: 'grid',
                placeItems: 'center',
                fontWeight: '800',
                fontSize: '19px',
              }}
            >
              N
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: '800', letterSpacing: '.08em', fontSize: '17px' }}>NORT</span>
              <span style={{ fontSize: '12px', color: '#A8A598' }}>Monitor de ventas</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '460px' }}>
            <h1
              style={{
                margin: '0',
                fontSize: 'clamp(28px,4vw,42px)',
                lineHeight: '1.08',
                fontWeight: '700',
                letterSpacing: '-.02em',
                textWrap: 'balance',
              }}
            >
              Cada conversación de venta, bajo control.
            </h1>
            <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.5', color: '#C9C6BA', textWrap: 'pretty' }}>
              Monitoreo de WhatsApp e Instagram de Suplementos Nort, con análisis de IA y alertas para la supervisión.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12.5px', color: '#A8A598' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#128C7E' }} />
              WhatsApp · Evolution API
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C13584' }} />
              Instagram · Meta API
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', padding: '36px 20px' }}>
          <form onSubmit={v.onLogin} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>Iniciar sesión</h2>
              <p style={{ margin: '0', fontSize: '14px', color: '#6B6960' }}>Ingresá con tu cuenta de Nort Monitor.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Email</span>
              <input
                type="email"
                value={v.loginEmail}
                onChange={v.onLoginEmail}
                placeholder="nombre@suplenort.com"
                style={{
                  height: '44px',
                  padding: '0 13px',
                  border: '1px solid #DEDBD1',
                  borderRadius: '9px',
                  background: '#fff',
                  fontSize: '15px',
                  color: '#17160F',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Contraseña</span>
              <input
                type="password"
                value={v.loginPass}
                onChange={v.onLoginPass}
                placeholder="••••••••"
                style={{
                  height: '44px',
                  padding: '0 13px',
                  border: '1px solid #DEDBD1',
                  borderRadius: '9px',
                  background: '#fff',
                  fontSize: '15px',
                  color: '#17160F',
                  outline: 'none',
                }}
              />
            </div>
            {v.hasLoginError ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    background: '#FBE4E1',
                    color: '#B3261E',
                    fontSize: '13.5px',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>error</span>
                  {v.loginError}
                </div>
              </>
            ) : null}
            <button
              type="submit"
              style={{
                height: '46px',
                border: 'none',
                borderRadius: '9px',
                background: '#17160F',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {v.loginBtn}
            </button>
            {v.showDemo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8A877D', fontSize: '12px', marginTop: '6px' }}>
                <span style={{ flex: '1', height: '1px', background: '#E4E1D8' }} />
                Acceso de demostración
                <span style={{ flex: '1', height: '1px', background: '#E4E1D8' }} />
              </div>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(v.demoUsers || []).map((du, duI) => (
                <Fragment key={duI}>
                  <button
                    type="button"
                    onClick={du?.onClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      border: '1px solid #E4E1D8',
                      borderRadius: '10px',
                      background: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#17160F',
                      minHeight: '52px',
                    }}
                    className="hv-1"
                  >
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#F2EFE6',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        flex: 'none',
                      }}
                    >
                      {du?.ini}
                    </span>
                    <span style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{du?.rol}</span>
                      <span
                        style={{ fontSize: '12px', color: '#6B6960', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {du?.nombre}
                        {' · '}
                        {du?.email}
                      </span>
                    </span>
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '20px', lineHeight: '1', color: '#8A877D' }}>
                      arrow_forward
                    </span>
                  </button>
                </Fragment>
              ))}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
