import { Fragment } from 'react';

export default function Desempeno({ v }) {
  return (
    <>
      <div style={{ padding: v.pad, display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1440px', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 style={{ margin: '0', fontSize: v.h1Size, fontWeight: '700', letterSpacing: '-.01em' }}>{v.perfTitle}</h1>
            <span style={{ color: '#6B6960', fontSize: '14px' }}>
              {v.perfWho}
              {' · '}
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
        {v.noPerf ? (
          <>
            <div
              style={{
                background: '#fff',
                border: '1px solid #E4E1D8',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '30px', lineHeight: '1', color: '#B9B6AA' }}>
                insights
              </span>
              <span style={{ fontWeight: '600' }}>Sin conversaciones analizadas</span>
              <span style={{ fontSize: '13.5px', color: '#6B6960' }}>Probá con otro rango de fechas o canal.</span>
            </div>
          </>
        ) : null}
        {v.hasPerf ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <section
                style={{
                  flex: '1 1 260px',
                  background: '#17160F',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  minHeight: '200px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#C9C6BA' }}>Puntaje general</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '64px',
                      fontWeight: '600',
                      letterSpacing: '-.04em',
                      lineHeight: '1',
                      color: '#F2C200',
                    }}
                  >
                    {v.general}
                  </span>
                  <span style={{ fontSize: '16px', color: '#A8A598' }}>/10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', fontSize: '13px' }}>
                  <span style={{ fontWeight: '600' }}>{v.gLabel}</span>
                  <span style={{ color: '#A8A598' }}>{v.nAnalizadas}</span>
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
                  gap: '14px',
                  flex: '3 1 420px',
                  minWidth: '0',
                }}
              >
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Por criterio</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '16px 20px' }}>
                  {(v.perfCrit || []).map((c, cI) => (
                    <Fragment key={cI}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{c?.nombre}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '20px', fontWeight: '600', color: c?.color }}>
                            {c?.value}
                          </span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '4px', background: '#EEECE5', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: c?.w, background: c?.color, borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#8A877D' }}>{c?.peso}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
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
                  <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Evolución del puntaje</h2>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '13px', color: '#6B6960' }}>
                    {'último día '}
                    <b style={{ color: '#17160F' }}>{v.pChart?.last}</b>
                  </span>
                </div>
                {v.pChart?.has ? (
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
                        <span>{v.pChart?.y0}</span>
                        <span>{v.pChart?.y1}</span>
                        <span>{v.pChart?.y2}</span>
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
                          <polygon points={v.pChart?.area} style={{ fill: '#F2C200', fillOpacity: '.16' }} />
                          <polyline
                            points={v.pChart?.pts}
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
                          <span>{v.pChart?.x0}</span>
                          <span>{v.pChart?.x1}</span>
                          <span>{v.pChart?.x2}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.pChart?.none ? (
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
                  gap: '14px',
                }}
              >
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700' }}>Comparación por canal</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '18px' }}>
                  {(v.byCh || []).map((ch, chI) => (
                    <Fragment key={chI}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: ch?.dot }} />
                          <span style={{ fontWeight: '700', fontSize: '14px', flex: '1' }}>{ch?.label}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '22px', fontWeight: '600', color: ch?.gColor }}>
                            {ch?.general}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#8A877D', marginTop: '-6px' }}>{ch?.n}</span>
                        {(ch?.crit || []).map((c, cI) => (
                          <Fragment key={cI}>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0,1fr) 60px 30px',
                                gap: '8px',
                                alignItems: 'center',
                                fontSize: '12.5px',
                              }}
                            >
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#5E5B52' }}>
                                {c?.nombre}
                              </span>
                              <div style={{ height: '6px', borderRadius: '3px', background: '#EEECE5', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: c?.w, background: c?.color }} />
                              </div>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", textAlign: 'right', fontWeight: '600' }}>
                                {c?.value}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </div>
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
                  gap: '10px',
                }}
              >
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1', color: '#1E8E4E' }}>
                    arrow_upward
                  </span>
                  Mejor puntaje
                </h2>
                {(v.best || []).map((b, bI) => (
                  <Fragment key={bI}>
                    <button
                      onClick={b?.onClick}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        padding: '11px 0',
                        border: 'none',
                        borderTop: '1px solid #EEECE5',
                        background: 'none',
                        color: '#17160F',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: '18px',
                          fontWeight: '600',
                          color: b?.color,
                          width: '40px',
                          flex: 'none',
                        }}
                      >
                        {b?.score}
                      </span>
                      <span style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: b?.chDot }} />
                          {b?.nombre}{' '}
                          <span style={{ fontWeight: '400', color: '#8A877D' }}>
                            {'· '}
                            {b?.estado}
                          </span>
                        </span>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#6B6960',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {b?.resumen}
                        </span>
                      </span>
                    </button>
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
                  gap: '10px',
                }}
              >
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1', color: '#C62828' }}>
                    arrow_downward
                  </span>
                  Peor puntaje
                </h2>
                {(v.worst || []).map((b, bI) => (
                  <Fragment key={bI}>
                    <button
                      onClick={b?.onClick}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        padding: '11px 0',
                        border: 'none',
                        borderTop: '1px solid #EEECE5',
                        background: 'none',
                        color: '#17160F',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: '18px',
                          fontWeight: '600',
                          color: b?.color,
                          width: '40px',
                          flex: 'none',
                        }}
                      >
                        {b?.score}
                      </span>
                      <span style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: b?.chDot }} />
                          {b?.nombre}{' '}
                          <span style={{ fontWeight: '400', color: '#8A877D' }}>
                            {'· '}
                            {b?.estado}
                          </span>
                        </span>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#6B6960',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {b?.resumen}
                        </span>
                      </span>
                    </button>
                  </Fragment>
                ))}
              </section>
            </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: '0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1', color: '#C99F00' }}>
                    auto_awesome
                  </span>
                  Devolución de la IA
                </h2>
                <span style={{ fontSize: '12px', color: '#8A877D' }}>{v.resumenFecha}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span
                    style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '.07em', textTransform: 'uppercase', color: '#16703D' }}
                  >
                    Fortalezas
                  </span>
                  {(v.fortalezas || []).map((f, fI) => (
                    <Fragment key={fI}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13.5px', lineHeight: '1.45' }}>
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1.2', color: '#1E8E4E' }}>
                          check
                        </span>
                        <span>{f?.t}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span
                    style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '.07em', textTransform: 'uppercase', color: '#B3261E' }}
                  >
                    Aspectos a mejorar
                  </span>
                  {(v.mejoras || []).map((f, fI) => (
                    <Fragment key={fI}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13.5px', lineHeight: '1.45' }}>
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1.2', color: '#C62828' }}>
                          trending_flat
                        </span>
                        <span>{f?.t}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </>
  );
}
