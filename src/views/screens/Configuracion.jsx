import { Fragment } from 'react';

export default function Configuracion({ v }) {
  return (
    <>
      <div style={{ padding: v.pad, display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: '0', fontSize: v.h1Size, fontWeight: '700', letterSpacing: '-.01em' }}>Configuración</h1>
          <span style={{ color: '#6B6960', fontSize: '14px' }}>Solo visible para administradores.</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid #E4E1D8', margin: '0 -2px' }}>
          {(v.cfgTabs || []).map((t, tI) => (
            <Fragment key={tI}>
              <button
                onClick={t?.onClick}
                style={{
                  flex: 'none',
                  padding: '10px 12px 9px',
                  border: 'none',
                  borderBottom: `3px solid ${t?.bar}`,
                  background: 'none',
                  color: t?.fg,
                  fontSize: '14px',
                  fontWeight: t?.fw,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: '44px',
                }}
              >
                {t?.label}
              </button>
            </Fragment>
          ))}
        </div>
        {v.isConnTab ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>{v.conn?.titulo}</span>
                  <span style={{ fontSize: '13px', color: '#6B6960', fontFamily: "'IBM Plex Mono',monospace" }}>{v.conn?.cuenta}</span>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    padding: '5px 11px',
                    borderRadius: '999px',
                    background: v.conn?.bg,
                    color: v.conn?.fg,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.conn?.dot }} />
                  {v.conn?.label}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#5E5B52' }}>{v.conn?.detail}</span>
              {v.conn?.showQR ? (
                <>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {v.conn?.hasQrImg ? (
                      <img
                        src={v.conn?.qrSrc}
                        alt="Código QR de Evolution API"
                        style={{ width: '220px', height: '220px', borderRadius: '10px', border: '1px solid #DEDBD1', background: '#fff' }}
                      />
                    ) : null}
                    {v.conn?.noQrImg ? (
                      <div
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '10px',
                          border: '1px solid #DEDBD1',
                          background: 'repeating-linear-gradient(45deg,#F4F3EF 0 8px,#ECEAE3 8px 16px)',
                          display: 'grid',
                          placeItems: 'center',
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: '12px',
                          color: '#6B6960',
                          textAlign: 'center',
                        }}
                      >
                        código QR
                        <br />
                        de Evolution API
                      </div>
                    ) : null}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxWidth: '320px',
                        fontSize: '13px',
                        color: '#5E5B52',
                        lineHeight: '1.5',
                      }}
                    >
                      {v.conn?.qrHelp}
                      <button
                        onClick={v.conn?.onScan}
                        style={{
                          alignSelf: 'flex-start',
                          height: '36px',
                          padding: '0 12px',
                          border: '1px solid #DEDBD1',
                          borderRadius: '8px',
                          background: '#fff',
                          color: '#17160F',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        {v.conn?.scanLabel}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
              {v.conn?.hasResult ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: v.conn?.resultBg,
                      color: v.conn?.resultFg,
                      fontSize: '13.5px',
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>
                      {v.conn?.resultIcon}
                    </span>
                    {v.conn?.resultMsg}
                  </div>
                </>
              ) : null}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={v.conn?.onTest}
                  style={{
                    height: '40px',
                    padding: '0 14px',
                    border: 'none',
                    borderRadius: '9px',
                    background: '#17160F',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>network_check</span>
                  {v.conn?.testLabel}
                </button>
                {v.conn?.showWebhookBtn ? (
                  <button
                    onClick={v.conn?.onWebhook}
                    style={{
                      height: '40px',
                      padding: '0 14px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '9px',
                      background: '#fff',
                      color: '#17160F',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>webhook</span>
                    {v.conn?.webhookLabel}
                  </button>
                ) : null}
                {v.conn?.showQRBtn ? (
                  <>
                    <button
                      onClick={v.conn?.onQR}
                      style={{
                        height: '40px',
                        padding: '0 14px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        color: '#17160F',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Generar QR
                    </button>
                  </>
                ) : null}
                {v.conn?.showDisconnect ? (
                  <>
                    <button
                      onClick={v.conn?.onDisconnect}
                      style={{
                        height: '40px',
                        padding: '0 14px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        color: '#B3261E',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Desconectar
                    </button>
                  </>
                ) : null}
              </div>
            </section>
            {v.imp?.mostrar ? (
              <section
                style={{
                  background: '#fff',
                  border: '1px solid #E4E1D8',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 style={{ margin: '0', fontSize: '16px', fontWeight: '700' }}>Importar historial</h2>
                  <span style={{ fontSize: '13px', color: '#5E5B52', lineHeight: '1.5' }}>
                    Trae de Evolution los mensajes de la instancia desde la fecha elegida y transcribe los audios. Los mensajes que ya
                    existen no se duplican, así que se puede repetir sin problema.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Desde
                    <input
                      type="date"
                      value={v.imp?.desde}
                      onChange={v.imp?.onDesde}
                      disabled={v.imp?.activo}
                      style={{
                        height: '40px',
                        padding: '0 10px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        fontSize: '13.5px',
                        color: '#17160F',
                      }}
                    />
                  </label>
                  {v.imp?.activo ? (
                    <button
                      onClick={v.imp?.onCancelar}
                      style={{
                        height: '40px',
                        padding: '0 14px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        color: '#B3261E',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Detener
                    </button>
                  ) : (
                    <button
                      onClick={v.imp?.onImportar}
                      style={{
                        height: '40px',
                        padding: '0 14px',
                        border: 'none',
                        borderRadius: '9px',
                        background: '#17160F',
                        color: '#fff',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>history</span>
                      Importar historial
                    </button>
                  )}
                </div>
                {v.imp?.hayEstado ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: v.imp?.estadoBg,
                      color: v.imp?.estadoFg,
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  >
                    <strong>{v.imp?.titulo}</strong>
                    <span>{v.imp?.detalle}</span>
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
        {v.hasFields ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>{v.cfgFieldsTitle}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: '16px' }}>
                {(v.cfgFields || []).map((f, fI) => (
                  <Fragment key={fI}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{f?.label}</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type={f?.type}
                          value={f?.value}
                          onChange={f?.onChange}
                          readOnly={f?.readonly}
                          placeholder={f?.ph}
                          style={{
                            flex: '1',
                            minWidth: '0',
                            height: '40px',
                            padding: '0 11px',
                            border: '1px solid #DEDBD1',
                            borderRadius: '9px',
                            background: f?.inBg,
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: '13px',
                            color: '#17160F',
                            outline: 'none',
                          }}
                        />
                        {f?.hasSuffix ? (
                          <>
                            <span style={{ fontSize: '13px', color: '#6B6960', whiteSpace: 'nowrap' }}>{f?.suffix}</span>
                          </>
                        ) : null}
                        {f?.isSecret ? (
                          <>
                            <button
                              type="button"
                              onClick={f?.onReveal}
                              title={f?.revTitle}
                              style={{
                                width: '40px',
                                height: '40px',
                                flex: 'none',
                                border: '1px solid #DEDBD1',
                                borderRadius: '9px',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'grid',
                                placeItems: 'center',
                                color: '#5E5B52',
                              }}
                            >
                              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1' }}>
                                {f?.revIcon}
                              </span>
                            </button>
                          </>
                        ) : null}
                        {f?.isCopy ? (
                          <>
                            <button
                              type="button"
                              onClick={f?.onCopy}
                              style={{
                                height: '40px',
                                flex: 'none',
                                padding: '0 12px',
                                border: '1px solid #DEDBD1',
                                borderRadius: '9px',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#17160F',
                                fontSize: '13px',
                                fontWeight: '600',
                              }}
                            >
                              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1' }}>
                                content_copy
                              </span>
                              Copiar
                            </button>
                          </>
                        ) : null}
                      </div>
                      {f?.hasHelp ? (
                        <>
                          <span style={{ fontSize: '12px', color: '#8A877D', lineHeight: '1.4' }}>{f?.help}</span>
                        </>
                      ) : null}
                    </div>
                  </Fragment>
                ))}
              </div>
              {v.isIA ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '11px 13px',
                      borderRadius: '9px',
                      background: '#FFF6CC',
                      border: '1px solid #F0DC8A',
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1.2', color: '#6B5300' }}>
                      info
                    </span>
                    <span>{v.iaRule}</span>
                  </div>
                </>
              ) : null}
              {v.isAlertasTab ? (
                <>
                  {v.thrWarn ? (
                    <>
                      <div style={{ padding: '10px 12px', borderRadius: '9px', background: '#FBE4E1', color: '#B3261E', fontSize: '13px' }}>
                        {v.thrWarnTxt}
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
            </section>
          </>
        ) : null}
        {v.isIA ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Proveedor y modelo</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Proveedor</span>
                  <select
                    value={v.proveedor}
                    onChange={v.onProv}
                    style={{
                      height: '40px',
                      padding: '0 10px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '14px',
                      color: '#17160F',
                    }}
                  >
                    {(v.provOpts || []).map((o, oI) => (
                      <Fragment key={oI}>
                        <option value={o?.value}>{o?.label}</option>
                      </Fragment>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Modelo</span>
                  <select
                    value={v.modelo}
                    onChange={v.onModelo}
                    style={{
                      height: '40px',
                      padding: '0 10px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '14px',
                      color: '#17160F',
                      fontFamily: "'IBM Plex Mono',monospace",
                    }}
                  >
                    {(v.modelOpts || []).map((o, oI) => (
                      <Fragment key={oI}>
                        <option value={o?.value}>{o?.label}</option>
                      </Fragment>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{v.iaKey?.label}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type={v.iaKey?.type}
                      value={v.iaKey?.value}
                      onChange={v.iaKey?.onChange}
                      style={{
                        flex: '1',
                        minWidth: '0',
                        height: '40px',
                        padding: '0 11px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: '13px',
                        color: '#17160F',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={v.iaKey?.onReveal}
                      title={v.iaKey?.revTitle}
                      style={{
                        width: '40px',
                        height: '40px',
                        flex: 'none',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#5E5B52',
                      }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1' }}>
                        {v.iaKey?.revIcon}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Peso de cada criterio en el puntaje general</h2>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: v.pesoBg,
                    color: v.pesoFg,
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {v.pesoMsg}
                </span>
              </div>
              {(v.pesos || []).map((p, pI) => (
                <Fragment key={pI}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(130px,200px) minmax(0,1fr) 52px',
                      gap: '14px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: '500' }}>{p?.nombre}</span>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={p?.value}
                      onChange={p?.onChange}
                      style={{ width: '100%', accentColor: '#17160F' }}
                    />
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                      {p?.label}
                    </span>
                  </div>
                </Fragment>
              ))}
              {v.pesoOff ? (
                <>
                  <button
                    onClick={v.onNormalizar}
                    style={{
                      alignSelf: 'flex-start',
                      height: '36px',
                      padding: '0 12px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '8px',
                      background: '#fff',
                      color: '#17160F',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Ajustar a 100%
                  </button>
                </>
              ) : null}
            </section>
          </>
        ) : null}
        {v.isAlertasTab ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Horario de atención</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(v.horario || []).map((h, hI) => (
                  <Fragment key={hI}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderTop: '1px solid #F0EEE8',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={h?.toggle?.onToggle}
                        style={{
                          width: '40px',
                          height: '24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: h?.toggle?.trackBg,
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
                            left: h?.toggle?.knobLeft,
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left .15s',
                            boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                          }}
                        />
                      </button>
                      <span style={{ width: '90px', fontSize: '14px', fontWeight: '600' }}>{h?.dia}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: h?.op }}>
                        <input
                          type="time"
                          value={h?.desde}
                          onChange={h?.onDesde}
                          style={{
                            height: '38px',
                            padding: '0 8px',
                            border: '1px solid #DEDBD1',
                            borderRadius: '8px',
                            background: '#fff',
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: '13px',
                            color: '#17160F',
                          }}
                        />
                        <span style={{ color: '#8A877D', fontSize: '13px' }}>a</span>
                        <input
                          type="time"
                          value={h?.hasta}
                          onChange={h?.onHasta}
                          style={{
                            height: '38px',
                            padding: '0 8px',
                            border: '1px solid #DEDBD1',
                            borderRadius: '8px',
                            background: '#fff',
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: '13px',
                            color: '#17160F',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12.5px', color: '#8A877D' }}>{h?.estado}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#FAF9F6' }}
              >
                <button
                  onClick={v.pausaTg?.onToggle}
                  style={{
                    width: '40px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: v.pausaTg?.trackBg,
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
                      left: v.pausaTg?.knobLeft,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .15s',
                      boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                    }}
                  />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Pausar el conteo de espera fuera de horario</span>
                  <span style={{ fontSize: '12.5px', color: '#6B6960' }}>Un mensaje recibido a la noche empieza a contar al abrir.</span>
                </div>
              </div>
            </section>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700' }}>
                Situaciones que disparan intervención de supervisor
              </h2>
              {(v.situaciones || []).map((x, xI) => (
                <Fragment key={xI}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: '1px solid #F0EEE8' }}>
                    <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{x?.nombre}</span>
                      <span style={{ fontSize: '12.5px', color: '#6B6960', lineHeight: '1.4' }}>{x?.desc}</span>
                    </div>
                    <button
                      onClick={x?.toggle?.onToggle}
                      style={{
                        width: '40px',
                        height: '24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: x?.toggle?.trackBg,
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
                          left: x?.toggle?.knobLeft,
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left .15s',
                          boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                        }}
                      />
                    </button>
                  </div>
                </Fragment>
              ))}
            </section>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700' }}>Canales de notificación</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: '1px solid #F0EEE8' }}>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Dentro de la app</span>
                  <span style={{ fontSize: '12.5px', color: '#6B6960' }}>Contador en la navegación y bandeja de alertas.</span>
                </div>
                <button
                  onClick={v.notifTg?.onToggle}
                  style={{
                    width: '40px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: v.notifTg?.trackBg,
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
                      left: v.notifTg?.knobLeft,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .15s',
                      boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                    }}
                  />
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderTop: '1px solid #F0EEE8',
                  opacity: '.55',
                }}
              >
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {'Email '}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: '#ECEAE3',
                        color: '#5E5B52',
                      }}
                    >
                      Próximamente
                    </span>
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#6B6960' }}>Resumen y alertas críticas por correo.</span>
                </div>
                <span
                  style={{ width: '40px', height: '24px', borderRadius: '12px', background: '#E4E1D8', position: 'relative', flex: 'none' }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: '3px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                    }}
                  />
                </span>
              </div>
            </section>
          </>
        ) : null}
        {v.isEstados ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Estados de venta</h2>
                  <span style={{ fontSize: '12.5px', color: '#6B6960' }}>La IA asigna estos estados; los inactivos dejan de usarse.</span>
                </div>
                <button
                  onClick={v.onAddEstado}
                  style={{
                    height: '38px',
                    padding: '0 13px',
                    border: 'none',
                    borderRadius: '9px',
                    background: '#17160F',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>add</span>
                  Agregar estado
                </button>
              </div>
              {(v.estRows || []).map((e, eI) => (
                <Fragment key={eI}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', borderTop: '1px solid #F0EEE8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', color: '#8A877D', width: '16px' }}>
                        {e?.orden}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                          onClick={e?.onUp}
                          title="Subir"
                          style={{
                            width: '26px',
                            height: '20px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            opacity: e?.upOp,
                            display: 'grid',
                            placeItems: 'center',
                            padding: '0',
                          }}
                        >
                          <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>
                            keyboard_arrow_up
                          </span>
                        </button>
                        <button
                          onClick={e?.onDown}
                          title="Bajar"
                          style={{
                            width: '26px',
                            height: '20px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            opacity: e?.downOp,
                            display: 'grid',
                            placeItems: 'center',
                            padding: '0',
                          }}
                        >
                          <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>
                            keyboard_arrow_down
                          </span>
                        </button>
                      </div>
                      <button
                        onClick={e?.onPal}
                        title="Cambiar color"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          border: '1px solid #DEDBD1',
                          background: '#fff',
                          cursor: 'pointer',
                          display: 'grid',
                          placeItems: 'center',
                          flex: 'none',
                          padding: '0',
                        }}
                      >
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: e?.color }} />
                      </button>
                      <input
                        value={e?.nombre}
                        onChange={e?.onNombre}
                        style={{
                          flex: '1 1 160px',
                          minWidth: '0',
                          height: '38px',
                          padding: '0 10px',
                          border: '1px solid #DEDBD1',
                          borderRadius: '8px',
                          background: '#fff',
                          fontSize: '14px',
                          color: '#17160F',
                        }}
                      />
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', color: '#8A877D', whiteSpace: 'nowrap' }}>
                        {e?.uso}
                      </span>
                      <button
                        onClick={e?.toggle?.onToggle}
                        title="Activo / inactivo"
                        style={{
                          width: '40px',
                          height: '24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: e?.toggle?.trackBg,
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
                            left: e?.toggle?.knobLeft,
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left .15s',
                            boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                          }}
                        />
                      </button>
                      {e?.canDelete ? (
                        <>
                          <button
                            onClick={e?.onDelete}
                            title="Eliminar"
                            style={{
                              width: '34px',
                              height: '34px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#B3261E',
                              display: 'grid',
                              placeItems: 'center',
                              padding: '0',
                            }}
                          >
                            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1' }}>delete</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                    {e?.palOpen ? (
                      <>
                        <div style={{ display: 'flex', gap: '10px', padding: '8px 0 4px 52px', flexWrap: 'wrap' }}>
                          {(e?.palette || []).map((c, cI) => (
                            <Fragment key={cI}>
                              <button
                                onClick={c?.onPick}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: 'none',
                                  background: c?.c,
                                  boxShadow: c?.ring,
                                  cursor: 'pointer',
                                  padding: '0',
                                }}
                              />
                            </Fragment>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </Fragment>
              ))}
            </section>
          </>
        ) : null}
        {v.isUsuarios ? (
          <>
            <section
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '6px',
                }}
              >
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Usuarios</h2>
                <button
                  onClick={v.onNewUser}
                  style={{
                    height: '38px',
                    padding: '0 13px',
                    border: 'none',
                    borderRadius: '9px',
                    background: '#17160F',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>person_add</span>
                  Nuevo usuario
                </button>
              </div>
              {(v.userRows || []).map((r, rI) => (
                <Fragment key={rI}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: v.userCols,
                      gap: '10px 16px',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderTop: '1px solid #F0EEE8',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', opacity: r?.op }}>
                      <span
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#EFEDE6',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          flex: 'none',
                        }}
                      >
                        {r?.ini}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: '0' }}>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r?.nombre}
                        </span>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#6B6960',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r?.email}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{ fontSize: '12px', fontWeight: '600', padding: '3px 9px', borderRadius: '999px', background: '#F2EFE6' }}
                      >
                        {r?.rol}
                      </span>
                      <button
                        onClick={r?.toggle?.onToggle}
                        style={{
                          width: '40px',
                          height: '24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: r?.toggle?.trackBg,
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
                            left: r?.toggle?.knobLeft,
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left .15s',
                            boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                          }}
                        />
                      </button>
                      <span style={{ fontSize: '12.5px', color: '#6B6960' }}>{r?.activoTxt}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      {r?.confirming ? (
                        <>
                          <span style={{ fontSize: '13px', color: '#B3261E' }}>¿Eliminar?</span>
                          <button
                            onClick={r?.onConfirmDel}
                            style={{
                              height: '34px',
                              padding: '0 11px',
                              border: 'none',
                              borderRadius: '8px',
                              background: '#B3261E',
                              color: '#fff',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            onClick={r?.onCancelDel}
                            style={{
                              height: '34px',
                              padding: '0 11px',
                              border: '1px solid #DEDBD1',
                              borderRadius: '8px',
                              background: '#fff',
                              color: '#17160F',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                            }}
                          >
                            No
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={r?.onEdit}
                        style={{
                          height: '34px',
                          padding: '0 11px',
                          border: '1px solid #DEDBD1',
                          borderRadius: '8px',
                          background: '#fff',
                          color: '#17160F',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Editar
                      </button>
                      {r?.canDelete ? (
                        <>
                          <button
                            onClick={r?.onDelete}
                            title="Eliminar"
                            style={{
                              width: '34px',
                              height: '34px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#B3261E',
                              display: 'grid',
                              placeItems: 'center',
                              padding: '0',
                            }}
                          >
                            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1' }}>delete</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Fragment>
              ))}
            </section>
          </>
        ) : null}
        {v.showSave ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#6B6960' }}>{v.dirtyTxt}</span>
              <button
                onClick={v.onSave}
                style={{
                  height: '42px',
                  padding: '0 18px',
                  border: 'none',
                  borderRadius: '9px',
                  background: '#F2C200',
                  color: '#17160F',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Guardar cambios
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
