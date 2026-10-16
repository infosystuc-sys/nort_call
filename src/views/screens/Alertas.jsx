import { Fragment } from 'react';

export default function Alertas({ v }) {
  return (
    <>
      <div style={{ padding: v.pad, display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ margin: '0', fontSize: v.h1Size, fontWeight: '700', letterSpacing: '-.01em' }}>Alertas</h1>
          <span style={{ color: '#6B6960', fontSize: '14px' }}>
            {'Ordenadas por urgencia · '}
            {v.canalLabel}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '3px',
              background: '#E9E6DE',
              borderRadius: '9px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            {(v.aEstadoOpts || []).map((o, oI) => (
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
                    minHeight: '34px',
                  }}
                >
                  {o?.label}
                </button>
              </Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '3px',
              background: '#E9E6DE',
              borderRadius: '9px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            {(v.aTipoOpts || []).map((o, oI) => (
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
                    minHeight: '34px',
                  }}
                >
                  {o?.label}
                </button>
              </Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '3px',
              background: '#E9E6DE',
              borderRadius: '9px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            {(v.aNivelOpts || []).map((o, oI) => (
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
                    minHeight: '34px',
                  }}
                >
                  {o?.label}
                </button>
              </Fragment>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '3px',
              background: '#E9E6DE',
              borderRadius: '9px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
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
                    minHeight: '34px',
                  }}
                >
                  {o?.label}
                </button>
              </Fragment>
            ))}
          </div>
        </div>
        {v.noAlertList ? (
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
              <span
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#E2F3E8',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: "'Material Symbols Rounded'",
                  fontSize: '26px',
                  lineHeight: '1',
                  color: '#1E8E4E',
                }}
              >
                task_alt
              </span>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{v.alertEmptyTitle}</span>
              <span style={{ fontSize: '13.5px', color: '#6B6960', maxWidth: '340px', lineHeight: '1.5' }}>{v.alertEmptyText}</span>
            </div>
          </>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(v.alertList || []).map((a, aI) => (
            <Fragment key={aI}>
              <article
                style={{
                  background: '#fff',
                  border: '1px solid #E4E1D8',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      background: a?.lvBg,
                      color: a?.lvFg,
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: a?.lvDot }} />
                    {a?.nivelLabel}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5E5B52' }}>
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '16px', lineHeight: '1' }}>{a?.tipoIcon}</span>
                    {a?.tipoLabel}
                  </span>
                  <span style={{ flex: '1' }} />
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11.5px', color: '#8A877D' }} title={a?.hora}>
                    {a?.ago}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{a?.titulo}</span>
                  <span style={{ fontSize: '13px', color: '#5E5B52', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {a?.cliente} <span style={{ color: '#B9B6AA' }}>·</span> {a?.usuario}{' '}
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: '600',
                        padding: '1px 8px',
                        borderRadius: '999px',
                        background: a?.chBg,
                        color: a?.chFg,
                      }}
                    >
                      {a?.chLabel}
                    </span>
                  </span>
                </div>
                <p style={{ margin: '0', fontSize: '13.5px', lineHeight: '1.5', textWrap: 'pretty' }}>{a?.motivo}</p>
                {a?.hasFrag ? (
                  <>
                    <blockquote
                      style={{
                        margin: '0',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        background: '#FAF9F6',
                        border: '1px solid #EEECE5',
                        fontSize: '13.5px',
                        lineHeight: '1.45',
                        color: '#3A3830',
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1.2', color: '#A19E92' }}>
                        format_quote
                      </span>
                      <span>{a?.frag}</span>
                    </blockquote>
                  </>
                ) : null}
                {a?.atendida ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        background: '#EEF7F1',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: '#16703D',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '16px', lineHeight: '1' }}>check_circle</span>
                        {a?.atendidaTxt}
                      </span>
                      {a?.hasComentario ? (
                        <>
                          <span style={{ fontSize: '13px', color: '#3A3830' }}>{a?.comentario}</span>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {a?.isResolving ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        value={a?.resolveComment}
                        onChange={a?.onResolveComment}
                        rows="2"
                        placeholder="Comentario opcional (qué se hizo)…"
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #DEDBD1',
                          borderRadius: '9px',
                          fontSize: '14px',
                          resize: 'vertical',
                          color: '#17160F',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={a?.onConfirm}
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
                          }}
                        >
                          Confirmar atendida
                        </button>
                        <button
                          onClick={a?.onCancel}
                          style={{
                            height: '40px',
                            padding: '0 14px',
                            border: '1px solid #DEDBD1',
                            borderRadius: '9px',
                            background: '#fff',
                            color: '#17160F',
                            fontSize: '13.5px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={a?.onOpen}
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
                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>forum</span>
                    Ver conversación
                  </button>
                  {a?.canResolve ? (
                    <>
                      <button
                        onClick={a?.onResolve}
                        style={{
                          height: '40px',
                          padding: '0 14px',
                          border: 'none',
                          borderRadius: '9px',
                          background: '#F2C200',
                          color: '#17160F',
                          fontSize: '13.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>done</span>
                        Marcar como atendida
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
