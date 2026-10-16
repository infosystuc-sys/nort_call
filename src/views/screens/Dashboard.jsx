import { Fragment } from 'react';

export default function Dashboard({ v }) {
  return (
    <>
      <div style={{ padding: v.pad, display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1440px', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 style={{ margin: '0', fontSize: v.h1Size, fontWeight: '700', letterSpacing: '-.01em' }}>Panel principal</h1>
            <span style={{ color: '#6B6960', fontSize: '14px' }}>
              {v.rangeLabel}
              {' · '}
              {v.canalLabel}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px', padding: '3px', background: '#E9E6DE', borderRadius: '9px' }}>
              {(v.rangeOpts || []).map((o, oI) => (
                <Fragment key={oI}>
                  <button
                    onClick={o?.onClick}
                    style={{
                      padding: '6px 11px',
                      borderRadius: '7px',
                      border: 'none',
                      background: o?.bg,
                      color: o?.fg,
                      boxShadow: o?.sh,
                      fontSize: '13px',
                      fontWeight: o?.fw,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '32px',
                    }}
                  >
                    {o?.label}
                  </button>
                </Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '2px', padding: '3px', background: '#E9E6DE', borderRadius: '9px' }}>
              {(v.canalOpts || []).map((o, oI) => (
                <Fragment key={oI}>
                  <button
                    onClick={o?.onClick}
                    style={{
                      padding: '6px 11px',
                      borderRadius: '7px',
                      border: 'none',
                      background: o?.bg,
                      color: o?.fg,
                      boxShadow: o?.sh,
                      fontSize: '13px',
                      fontWeight: o?.fw,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '32px',
                    }}
                  >
                    {o?.label}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,190px),1fr))', gap: '12px' }}>
          {(v.kpis || []).map((k, kI) => (
            <Fragment key={kI}>
              <button
                onClick={k?.onClick}
                style={{
                  textAlign: 'left',
                  color: '#17160F',
                  background: '#fff',
                  border: '1px solid #E4E1D8',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: k?.cursor,
                  minWidth: '0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                  <span style={{ fontSize: '12.5px', color: '#6B6960', fontWeight: '500' }}>{k?.label}</span>
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1', color: '#A19E92' }}>
                    {k?.icon}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '30px',
                      fontWeight: '600',
                      letterSpacing: '-.03em',
                      lineHeight: '1',
                    }}
                  >
                    {k?.value}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B6960' }}>{k?.unit}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B6960' }}>
                  {k?.hasDot ? (
                    <>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: k?.dot, flex: 'none' }} />
                    </>
                  ) : null}
                  {k?.sub}
                </div>
              </button>
            </Fragment>
          ))}
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '14px', alignItems: 'start' }}
        >
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Alertas abiertas</h2>
              <button
                onClick={v.onAllAlerts}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#17160F',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textDecoration: 'underline',
                  textDecorationColor: '#F2C200',
                  textUnderlineOffset: '3px',
                }}
              >
                {v.dashAlertsMore}
              </button>
            </div>
            {v.hasDashAlerts ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {(v.dashAlerts || []).map((a, aI) => (
                    <Fragment key={aI}>
                      <button
                        onClick={a?.onOpen}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          textAlign: 'left',
                          padding: '11px 0',
                          border: 'none',
                          borderTop: '1px solid #EEECE5',
                          background: 'none',
                          color: '#17160F',
                          cursor: 'pointer',
                          width: '100%',
                          minHeight: '52px',
                        }}
                      >
                        <span
                          style={{
                            width: '92px',
                            flex: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: a?.lvBg,
                            color: a?.lvFg,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: a?.lvDot }} />
                          {a?.nivelLabel}
                        </span>
                        <span style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {a?.titulo}
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
                            {a?.cliente}
                            {' · '}
                            {a?.chLabel}
                            {' · '}
                            {a?.ago}
                          </span>
                        </span>
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '20px', lineHeight: '1', color: '#A19E92' }}>
                          chevron_right
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.noDashAlerts ? (
              <>
                <div
                  style={{
                    padding: '28px 12px',
                    textAlign: 'center',
                    color: '#6B6960',
                    fontSize: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '28px', lineHeight: '1', color: '#1E8E4E' }}>
                    task_alt
                  </span>
                  Sin alertas abiertas en este canal.
                </div>
              </>
            ) : null}
          </section>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Embudo de ventas</h2>
              <span style={{ fontSize: '12.5px', color: '#6B6960' }}>Conversaciones por estado</span>
            </div>
            {v.hasFunnel ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {(v.funnel || []).map((f, fI) => (
                    <Fragment key={fI}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '118px minmax(0,1fr) 30px',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                        }}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f?.nombre}</span>
                        <div style={{ height: '22px', background: '#F2F0EA', borderRadius: '5px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: f?.w,
                              minWidth: '3px',
                              background: f?.color,
                              borderRadius: '5px',
                              transition: 'width .3s',
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", textAlign: 'right', fontWeight: '600' }}>{f?.count}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.noFunnel ? (
              <>
                <div style={{ padding: '28px 12px', textAlign: 'center', color: '#6B6960', fontSize: '14px' }}>
                  Todavía no hay conversaciones para mostrar.
                </div>
              </>
            ) : null}
          </section>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '14px' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Puntaje del vendedor</h2>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '13px', color: '#6B6960' }}>
                {'último día '}
                <b style={{ color: '#17160F' }}>{v.chScore?.last}</b>
              </span>
            </div>
            {v.chScore?.has ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '11px',
                      color: '#8A877D',
                      height: '160px',
                      textAlign: 'right',
                    }}
                  >
                    <span>{v.chScore?.y0}</span>
                    <span>{v.chScore?.y1}</span>
                    <span>{v.chScore?.y2}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                    <svg
                      viewBox="0 0 600 160"
                      preserveAspectRatio="none"
                      style={{ width: '100%', height: '160px', display: 'block', overflow: 'visible' }}
                    >
                      <line
                        x1="0"
                        y1="8"
                        x2="600"
                        y2="8"
                        style={{ stroke: '#EEECE5', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <line
                        x1="0"
                        y1="80"
                        x2="600"
                        y2="80"
                        style={{ stroke: '#EEECE5', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <line
                        x1="0"
                        y1="152"
                        x2="600"
                        y2="152"
                        style={{ stroke: '#E4E1D8', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <polygon points={v.chScore?.area} style={{ fill: '#F2C200', fillOpacity: '.16' }} />
                      <polyline
                        points={v.chScore?.pts}
                        style={{
                          fill: 'none',
                          stroke: '#17160F',
                          strokeWidth: '2',
                          vectorEffect: 'non-scaling-stroke',
                          strokeLinejoin: 'round',
                        }}
                      />
                    </svg>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: '11px',
                        color: '#8A877D',
                      }}
                    >
                      <span>{v.chScore?.x0}</span>
                      <span>{v.chScore?.x1}</span>
                      <span>{v.chScore?.x2}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {v.chScore?.none ? (
              <>
                <div
                  style={{
                    height: '160px',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#6B6960',
                    fontSize: '14px',
                    background: '#FAF9F6',
                    borderRadius: '8px',
                  }}
                >
                  Sin datos para el período.
                </div>
              </>
            ) : null}
          </section>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Tiempo de primera respuesta</h2>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '13px', color: '#6B6960' }}>
                {'último día '}
                <b style={{ color: '#17160F' }}>{v.chTime?.last}</b>
              </span>
            </div>
            {v.chTime?.has ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '11px',
                      color: '#8A877D',
                      height: '160px',
                      textAlign: 'right',
                    }}
                  >
                    <span>{v.chTime?.y0}</span>
                    <span>{v.chTime?.y1}</span>
                    <span>{v.chTime?.y2}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
                    <svg
                      viewBox="0 0 600 160"
                      preserveAspectRatio="none"
                      style={{ width: '100%', height: '160px', display: 'block', overflow: 'visible' }}
                    >
                      <line
                        x1="0"
                        y1="8"
                        x2="600"
                        y2="8"
                        style={{ stroke: '#EEECE5', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <line
                        x1="0"
                        y1="80"
                        x2="600"
                        y2="80"
                        style={{ stroke: '#EEECE5', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <line
                        x1="0"
                        y1="152"
                        x2="600"
                        y2="152"
                        style={{ stroke: '#E4E1D8', strokeWidth: '1', vectorEffect: 'non-scaling-stroke' }}
                      />
                      <polygon points={v.chTime?.area} style={{ fill: '#D42A2A', fillOpacity: '.08' }} />
                      <polyline
                        points={v.chTime?.pts}
                        style={{
                          fill: 'none',
                          stroke: '#D42A2A',
                          strokeWidth: '2',
                          vectorEffect: 'non-scaling-stroke',
                          strokeLinejoin: 'round',
                        }}
                      />
                    </svg>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: '11px',
                        color: '#8A877D',
                      }}
                    >
                      <span>{v.chTime?.x0}</span>
                      <span>{v.chTime?.x1}</span>
                      <span>{v.chTime?.x2}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {v.chTime?.none ? (
              <>
                <div
                  style={{
                    height: '160px',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#6B6960',
                    fontSize: '14px',
                    background: '#FAF9F6',
                    borderRadius: '8px',
                  }}
                >
                  Sin datos para el período.
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
