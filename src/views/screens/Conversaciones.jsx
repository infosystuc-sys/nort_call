import { Fragment } from 'react';

// Texto con las coincidencias de la búsqueda resaltadas.
function Resaltado({ partes }) {
  return (partes || []).map((p, i) =>
    p.hit ? (
      <mark key={i} style={{ background: '#FFD94D', color: '#17160F', borderRadius: '3px', padding: '0 1px' }}>
        {p.t}
      </mark>
    ) : (
      <Fragment key={i}>{p.t}</Fragment>
    ),
  );
}

function ChipInterna({ grande }) {
  return (
    <span
      title="Conversación interna: no se analiza con IA"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: grande ? '12px' : '11.5px',
        fontWeight: '600',
        padding: grande ? '3px 9px' : '2px 8px',
        borderRadius: '999px',
        background: '#ECEAE3',
        color: '#5E5B52',
      }}
    >
      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '13px', lineHeight: '1' }}>lock</span>
      Interna
    </span>
  );
}

export default function Conversaciones({ v }) {
  return (
    <>
      <div style={{ height: v.convH, display: 'flex', flexDirection: 'column', minHeight: '0' }}>
        {v.showConvHeader ? (
          <>
            <div
              style={{
                flex: 'none',
                padding: `18px ${v.convPadX} 14px`,
                borderBottom: '1px solid #E4E1D8',
                background: '#F4F3EF',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <h1 style={{ margin: '0', fontSize: v.h1Size, fontWeight: '700', letterSpacing: '-.01em' }}>{v.convTitle}</h1>
                  <span style={{ color: '#6B6960', fontSize: '13.5px' }}>{v.resultCount}</span>
                  {v.cola?.mostrarBoton ? (
                    <button
                      onClick={v.cola?.onIniciar}
                      title="Analiza con IA las conversaciones filtradas que no tienen análisis o tienen mensajes nuevos"
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '6px',
                        height: '34px',
                        padding: '0 12px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#17160F',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1' }}>auto_awesome</span>
                      {v.cola?.botonLabel}
                    </button>
                  ) : null}
                  {v.cola?.hayCola ? (
                    <div
                      style={{
                        marginTop: '6px',
                        maxWidth: '560px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        background: v.cola?.fondo,
                        border: v.cola?.borde,
                        color: v.cola?.color,
                        fontSize: '13px',
                        lineHeight: '1.5',
                      }}
                    >
                      <span>
                        <strong>{v.cola?.titulo}</strong> {v.cola?.detalle}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {v.cola?.pausadaLimite ? (
                          <>
                            <button
                              onClick={v.cola?.onSeguirClaude}
                              style={{
                                height: '32px',
                                padding: '0 12px',
                                border: 'none',
                                borderRadius: '8px',
                                background: '#17160F',
                                color: '#fff',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Seguir con Claude (tiene costo)
                            </button>
                            <button
                              onClick={v.cola?.onEsperar}
                              style={{
                                height: '32px',
                                padding: '0 12px',
                                border: '1px solid #DEDBD1',
                                borderRadius: '8px',
                                background: '#fff',
                                color: '#17160F',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Esperar a Groq
                            </button>
                          </>
                        ) : null}
                        {v.cola?.activa ? (
                          <button
                            onClick={v.cola?.onDetener}
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              border: '1px solid #DEDBD1',
                              borderRadius: '8px',
                              background: '#fff',
                              color: '#B3261E',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Detener
                          </button>
                        ) : (
                          <button
                            onClick={v.cola?.onCerrar}
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              border: '1px solid #DEDBD1',
                              borderRadius: '8px',
                              background: '#fff',
                              color: '#17160F',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                            }}
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {v.showViewToggle ? (
                    <>
                      <div style={{ display: 'flex', gap: '2px', padding: '3px', background: '#E9E6DE', borderRadius: '9px' }}>
                        {(v.viewOpts || []).map((o, oI) => (
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
                    </>
                  ) : null}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: '1 1 220px', minWidth: '0', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '11px',
                      fontFamily: "'Material Symbols Rounded'",
                      fontSize: '19px',
                      lineHeight: '1',
                      color: '#8A877D',
                    }}
                  >
                    search
                  </span>
                  <input
                    type="search"
                    value={v.q}
                    onChange={v.onQ}
                    placeholder="Buscar cliente o texto…"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px 0 36px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '14px',
                      color: '#17160F',
                      outline: 'none',
                    }}
                  />
                </div>
                <select
                  value={v.fEstado}
                  onChange={v.onFEstado}
                  style={{
                    height: '40px',
                    padding: '0 10px',
                    border: '1px solid #DEDBD1',
                    borderRadius: '9px',
                    background: '#fff',
                    fontSize: '13.5px',
                    color: '#17160F',
                    flex: '0 1 auto',
                    minWidth: '0',
                  }}
                >
                  {(v.estadoOpts || []).map((o, oI) => (
                    <Fragment key={oI}>
                      <option value={o?.value}>{o?.label}</option>
                    </Fragment>
                  ))}
                </select>
                {v.showAlertaFilter ? (
                  <>
                    <select
                      value={v.fAlerta}
                      onChange={v.onFAlerta}
                      style={{
                        height: '40px',
                        padding: '0 10px',
                        border: '1px solid #DEDBD1',
                        borderRadius: '9px',
                        background: '#fff',
                        fontSize: '13.5px',
                        color: '#17160F',
                        flex: '0 1 auto',
                        minWidth: '0',
                      }}
                    >
                      {(v.alertaOpts || []).map((o, oI) => (
                        <Fragment key={oI}>
                          <option value={o?.value}>{o?.label}</option>
                        </Fragment>
                      ))}
                    </select>
                  </>
                ) : null}
                <button
                  onClick={v.espPill?.onClick}
                  style={{
                    height: '40px',
                    padding: '0 10px 0 12px',
                    border: `1px solid ${v.espPill?.bd}`,
                    borderRadius: '9px',
                    background: v.espPill?.bg,
                    color: v.espPill?.fg,
                    fontSize: '13.5px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '18px', lineHeight: '1' }}>hourglass_top</span>
                  {v.espPill?.label}
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '1px 7px',
                      borderRadius: '999px',
                      background: v.espPill?.cbg,
                      color: '#17160F',
                    }}
                  >
                    {v.espPill?.count}
                  </span>
                </button>
                {v.showInternasCheck ? (
                  <label
                    title="Conversaciones internas: no son ventas y no se analizan con IA"
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid #DEDBD1',
                      borderRadius: '9px',
                      background: v.verInternas ? '#F2EFE6' : '#FFFFFF',
                      color: '#17160F',
                      fontSize: '13.5px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!v.verInternas}
                      onChange={v.onVerInternas}
                      style={{ width: '16px', height: '16px', accentColor: '#17160F', margin: '0', cursor: 'pointer' }}
                    />
                    {v.internasLabel}
                  </label>
                ) : null}
                {v.showClear ? (
                  <>
                    <button
                      onClick={v.onClearFilters}
                      style={{
                        height: '40px',
                        padding: '0 10px',
                        border: 'none',
                        background: 'none',
                        color: '#6B6960',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
        {v.isLista ? (
          <>
            <div style={{ flex: '1', minHeight: '0', display: 'flex' }}>
              {v.showList ? (
                <>
                  <div style={{ width: v.listW, flex: 'none', borderRight: '1px solid #E4E1D8', overflowY: 'auto', background: '#fff' }}>
                    {v.hasItems ? (
                      <>
                        {(v.items || []).map((it, itI) => (
                          <Fragment key={itI}>
                            <button
                              onClick={it?.onClick}
                              style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '14px 16px 14px 14px',
                                border: 'none',
                                borderBottom: '1px solid #EEECE5',
                                borderLeft: `3px solid ${it?.bar}`,
                                background: it?.rowBg,
                                textAlign: 'left',
                                color: '#17160F',
                                cursor: 'pointer',
                                width: '100%',
                                alignItems: 'flex-start',
                              }}
                              className="hv-3"
                            >
                              <span
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: '#EFEDE6',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: '700',
                                  fontSize: '13.5px',
                                  flex: 'none',
                                  position: 'relative',
                                }}
                              >
                                {it?.ini}
                                <span
                                  title={it?.chLabel}
                                  style={{
                                    position: 'absolute',
                                    right: '-2px',
                                    bottom: '-2px',
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: it?.chDot,
                                    border: '2px solid #fff',
                                  }}
                                />
                              </span>
                              <span style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <span
                                    style={{
                                      flex: '1',
                                      minWidth: '0',
                                      fontWeight: '600',
                                      fontSize: '14.5px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    <Resaltado partes={it?.nombrePartes} />
                                  </span>
                                  <span
                                    style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11.5px', color: '#8A877D', flex: 'none' }}
                                  >
                                    {it?.hora}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    color: '#6B6960',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  <Resaltado partes={it?.previewPartes} />
                                </span>
                                <span style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                  {it?.hasMatch ? (
                                    <span
                                      title="Mensajes que contienen el texto buscado"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        background: '#FFF0B3',
                                        color: '#7A5A00',
                                      }}
                                    >
                                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '13px', lineHeight: '1' }}>
                                        search
                                      </span>
                                      {it?.matchLabel}
                                    </span>
                                  ) : null}
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: '11.5px',
                                      fontWeight: '600',
                                      padding: '2px 8px',
                                      borderRadius: '999px',
                                      background: it?.estBg,
                                      color: it?.estFg,
                                    }}
                                  >
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: it?.estColor }} />
                                    {it?.estNombre}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '11.5px',
                                      fontWeight: '600',
                                      padding: '2px 8px',
                                      borderRadius: '999px',
                                      background: it?.chBg,
                                      color: it?.chFg,
                                    }}
                                  >
                                    {it?.chLabel}
                                  </span>
                                  {it?.esInterna ? <ChipInterna /> : null}
                                  {it?.hasScore ? (
                                    <span
                                      title={it?.scoreTitle}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        background: it?.scoreBg,
                                        color: it?.scoreFg,
                                      }}
                                    >
                                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '13px', lineHeight: '1' }}>
                                        star
                                      </span>
                                      {it?.scoreLabel}
                                    </span>
                                  ) : null}
                                  {it?.esperando ? (
                                    <>
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          fontSize: '11.5px',
                                          fontWeight: '600',
                                          padding: '2px 8px',
                                          borderRadius: '999px',
                                          background: it?.espBg,
                                          color: it?.espFg,
                                        }}
                                      >
                                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '13px', lineHeight: '1' }}>
                                          schedule
                                        </span>
                                        {it?.espLabel}
                                      </span>
                                    </>
                                  ) : null}
                                  {it?.hasAlert ? (
                                    <>
                                      <span
                                        title="Alertas abiertas"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                          fontSize: '11.5px',
                                          fontWeight: '700',
                                          padding: '2px 7px',
                                          borderRadius: '999px',
                                          background: it?.alertBg,
                                          color: '#fff',
                                        }}
                                      >
                                        <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '13px', lineHeight: '1' }}>
                                          notifications
                                        </span>
                                        {it?.alertN}
                                      </span>
                                    </>
                                  ) : null}
                                </span>
                              </span>
                            </button>
                          </Fragment>
                        ))}
                      </>
                    ) : null}
                    {v.noItems ? (
                      <>
                        <div
                          style={{
                            padding: '48px 24px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: '#F2EFE6',
                              display: 'grid',
                              placeItems: 'center',
                              fontFamily: "'Material Symbols Rounded'",
                              fontSize: '24px',
                              lineHeight: '1',
                              color: '#6B6960',
                            }}
                          >
                            forum
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: '600' }}>{v.emptyTitle}</span>
                          <span style={{ fontSize: '13.5px', color: '#6B6960', maxWidth: '280px', lineHeight: '1.5' }}>{v.emptyText}</span>
                          {v.showClear ? (
                            <>
                              <button
                                onClick={v.onClearFilters}
                                style={{
                                  marginTop: '4px',
                                  height: '38px',
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
                                Limpiar filtros
                              </button>
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}
              {v.showDetailCol ? (
                <>
                  <div
                    style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', minHeight: '0', background: '#F7F6F2' }}
                  >
                    {v.noSel ? (
                      <>
                        <div
                          style={{
                            flex: '1',
                            display: 'grid',
                            placeItems: 'center',
                            padding: '24px',
                            textAlign: 'center',
                            color: '#6B6960',
                            fontSize: '14px',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '34px', lineHeight: '1', color: '#B9B6AA' }}>
                              chat_bubble
                            </span>
                            Seleccioná una conversación para ver el hilo y el análisis de IA.
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.hasSel ? (
                      <>
                        <div
                          style={{
                            flex: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: '#fff',
                            borderBottom: '1px solid #E4E1D8',
                            flexWrap: 'wrap',
                          }}
                        >
                          {v.showBack ? (
                            <>
                              <button
                                onClick={v.d?.onBack}
                                title="Volver"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  marginLeft: '-8px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  display: 'grid',
                                  placeItems: 'center',
                                  color: '#17160F',
                                }}
                              >
                                <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '24px', lineHeight: '1' }}>
                                  arrow_back
                                </span>
                              </button>
                            </>
                          ) : null}
                          <span
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#EFEDE6',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: '700',
                              fontSize: '13.5px',
                              flex: 'none',
                            }}
                          >
                            {v.d?.ini}
                          </span>
                          <div style={{ flex: '1', minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '700', fontSize: '16px' }}>{v.d?.nombre}</span>
                            <span style={{ fontSize: '12.5px', color: '#6B6960' }}>{v.d?.sub}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                background: v.d?.chBg,
                                color: v.d?.chFg,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: v.d?.chDot }} />
                              {v.d?.chLabel}
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                background: v.d?.estBg,
                                color: v.d?.estFg,
                              }}
                            >
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: v.d?.estColor }} />
                              {v.d?.estNombre}
                            </span>
                            {v.d?.esperando ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    padding: '3px 9px',
                                    borderRadius: '999px',
                                    background: v.d?.espBg,
                                    color: v.d?.espFg,
                                  }}
                                >
                                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '14px', lineHeight: '1' }}>
                                    schedule
                                  </span>
                                  {v.d?.espLabel}
                                </span>
                              </>
                            ) : null}
                            {v.d?.esInterna && !v.d?.canEditInterna ? <ChipInterna grande /> : null}
                          </div>
                          {v.d?.canEditInterna ? (
                            <label
                              title="Las conversaciones internas no son ventas: se ocultan de la lista y no se analizan con IA"
                              style={{
                                height: '36px',
                                padding: '0 11px',
                                border: `1px solid ${v.d?.esInterna ? '#5E5B52' : '#E4E1D8'}`,
                                borderRadius: '8px',
                                background: v.d?.esInterna ? '#ECEAE3' : '#fff',
                                color: '#17160F',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!v.d?.esInterna}
                                onChange={v.d?.onInterna}
                                style={{ width: '15px', height: '15px', accentColor: '#17160F', margin: '0', cursor: 'pointer' }}
                              />
                              Interna
                            </label>
                          ) : null}
                          {v.d?.canDeleteConv ? (
                            <button
                              onClick={v.d?.onDeleteConv}
                              title="Eliminar conversación"
                              style={{
                                width: '36px',
                                height: '36px',
                                border: '1px solid #E4E1D8',
                                borderRadius: '8px',
                                background: '#fff',
                                cursor: 'pointer',
                                color: '#B3261E',
                                display: 'grid',
                                placeItems: 'center',
                                padding: '0',
                              }}
                            >
                              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '19px', lineHeight: '1' }}>delete</span>
                            </button>
                          ) : null}
                          {v.d?.confirmingDelConv ? (
                            <div
                              style={{
                                flexBasis: '100%',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: '9px',
                                background: '#FBE4E1',
                                color: '#B3261E',
                                fontSize: '13px',
                              }}
                            >
                              <span style={{ flex: '1', minWidth: '200px' }}>
                                ¿Eliminar esta conversación? Se borran sus mensajes, análisis, alertas y notas. No se puede deshacer.
                              </span>
                              <button
                                onClick={v.d?.onConfirmDelConv}
                                style={{
                                  height: '34px',
                                  padding: '0 12px',
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
                                onClick={v.d?.onCancelDelConv}
                                style={{
                                  height: '34px',
                                  padding: '0 12px',
                                  border: '1px solid #DEDBD1',
                                  borderRadius: '8px',
                                  background: '#fff',
                                  color: '#17160F',
                                  fontSize: '12.5px',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {v.showTabs ? (
                          <>
                            <div style={{ flex: 'none', padding: '8px 12px', background: '#fff', borderBottom: '1px solid #E4E1D8' }}>
                              <div style={{ display: 'flex', gap: '2px', padding: '3px', background: '#E9E6DE', borderRadius: '9px' }}>
                                {(v.d?.tabs || []).map((o, oI) => (
                                  <Fragment key={oI}>
                                    <button
                                      onClick={o?.onClick}
                                      style={{
                                        flex: '1',
                                        padding: '8px 11px',
                                        borderRadius: '7px',
                                        border: 'none',
                                        background: o?.bg,
                                        color: o?.fg,
                                        boxShadow: o?.sh,
                                        fontSize: '13.5px',
                                        fontWeight: o?.fw,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        minHeight: '38px',
                                      }}
                                    >
                                      {o?.label}
                                    </button>
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : null}
                        <div style={{ flex: '1', minHeight: '0', display: 'flex' }}>
                          {v.showChat ? (
                            <>
                              <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', minHeight: '0' }}>
                                {v.d?.hasHits ? (
                                  <div
                                    style={{
                                      flex: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '7px 10px 7px 14px',
                                      background: '#FFF7D6',
                                      borderBottom: '1px solid #EBD587',
                                      fontSize: '12.5px',
                                      color: '#5E4700',
                                    }}
                                  >
                                    <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1' }}>search</span>
                                    <span
                                      style={{ flex: '1', minWidth: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}
                                    >
                                      {v.d?.hitsLabel}
                                    </span>
                                    {[
                                      ['keyboard_arrow_up', 'Coincidencia anterior', v.d?.onHitPrev],
                                      ['keyboard_arrow_down', 'Coincidencia siguiente', v.d?.onHitNext],
                                    ].map(([icon, title, fn]) => (
                                      <button
                                        key={icon}
                                        title={title}
                                        onClick={fn}
                                        style={{
                                          width: '30px',
                                          height: '30px',
                                          display: 'grid',
                                          placeItems: 'center',
                                          border: '1px solid #EBD587',
                                          borderRadius: '7px',
                                          background: '#fff',
                                          color: '#5E4700',
                                          cursor: 'pointer',
                                          fontFamily: "'Material Symbols Rounded'",
                                          fontSize: '20px',
                                          lineHeight: '1',
                                        }}
                                      >
                                        {icon}
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                                <div
                                  style={{
                                    flex: '1',
                                    minHeight: '0',
                                    overflowY: 'auto',
                                    padding: '18px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                  }}
                                >
                                  {(v.d?.thread || []).map((m, mI) => (
                                    <Fragment key={mI}>
                                      {m?.isDay ? (
                                        <>
                                          <div
                                            style={{
                                              alignSelf: 'center',
                                              fontSize: '11.5px',
                                              fontWeight: '600',
                                              color: '#6B6960',
                                              background: '#ECEAE3',
                                              padding: '4px 11px',
                                              borderRadius: '999px',
                                              margin: '6px 0',
                                            }}
                                          >
                                            {m?.label}
                                          </div>
                                        </>
                                      ) : null}
                                      {m?.isMsg ? (
                                        <>
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: m?.align, gap: '3px' }}>
                                            <div
                                              data-hit-actual={m?.hitActual}
                                              style={{
                                                maxWidth: 'min(80%,540px)',
                                                padding: '9px 12px',
                                                borderRadius: m?.radius,
                                                background: m?.bg,
                                                border: `1px solid ${m?.bd}`,
                                                boxShadow: m?.ring,
                                                fontSize: '14px',
                                                lineHeight: '1.45',
                                                whiteSpace: 'pre-wrap',
                                                overflowWrap: 'anywhere',
                                                color: '#17160F',
                                              }}
                                            >
                                              <Resaltado partes={m?.partes} />
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#8A877D', fontFamily: "'IBM Plex Mono',monospace" }}>
                                              {m?.meta}
                                            </span>
                                          </div>
                                        </>
                                      ) : null}
                                    </Fragment>
                                  ))}
                                </div>
                                <div
                                  style={{
                                    flex: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '11px 14px',
                                    background: '#EFEDE6',
                                    borderTop: '1px solid #E4E1D8',
                                    color: '#5E5B52',
                                    fontSize: '12.5px',
                                    textAlign: 'center',
                                  }}
                                >
                                  <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '17px', lineHeight: '1' }}>
                                    visibility
                                  </span>
                                  {v.d?.readOnly}
                                </div>
                              </div>
                            </>
                          ) : null}
                          {v.showPanel ? (
                            <>
                              <div
                                style={{
                                  width: v.panelW,
                                  flex: 'none',
                                  borderLeft: v.panelBorder,
                                  overflowY: 'auto',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                  background: '#F4F3EF',
                                }}
                              >
                                <section
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #E4E1D8',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '700' }}>Estado de venta</h3>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        padding: '3px 9px',
                                        borderRadius: '999px',
                                        background: v.d?.estBg,
                                        color: v.d?.estFg,
                                      }}
                                    >
                                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: v.d?.estColor }} />
                                      {v.d?.estNombre}
                                    </span>
                                  </div>
                                  {v.d?.canEditEstado ? (
                                    <>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontSize: '12.5px', color: '#6B6960' }}>Corregir estado (queda registrado)</span>
                                        <select
                                          value={v.d?.estadoId}
                                          onChange={v.d?.onEstado}
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
                                          {(v.d?.estadoOpts || []).map((o, oI) => (
                                            <Fragment key={oI}>
                                              <option value={o?.value}>{o?.label}</option>
                                            </Fragment>
                                          ))}
                                        </select>
                                      </div>
                                    </>
                                  ) : null}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        letterSpacing: '.07em',
                                        textTransform: 'uppercase',
                                        color: '#8A877D',
                                        marginBottom: '6px',
                                      }}
                                    >
                                      Historial
                                    </span>
                                    {(v.d?.hist || []).map((h, hI) => (
                                      <Fragment key={hI}>
                                        <div
                                          style={{
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'flex-start',
                                            padding: '7px 0',
                                            borderTop: '1px solid #F0EEE8',
                                          }}
                                        >
                                          <span
                                            style={{
                                              width: '8px',
                                              height: '8px',
                                              borderRadius: '50%',
                                              background: h?.color,
                                              marginTop: '5px',
                                              flex: 'none',
                                            }}
                                          />
                                          <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{h?.nombre}</span>
                                            <span
                                              style={{
                                                fontSize: '12px',
                                                color: '#6B6960',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                              }}
                                            >
                                              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '14px', lineHeight: '1' }}>
                                                {h?.icon}
                                              </span>
                                              {h?.quien}
                                            </span>
                                          </div>
                                          <span
                                            style={{
                                              fontFamily: "'IBM Plex Mono',monospace",
                                              fontSize: '11px',
                                              color: '#8A877D',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                            {h?.fecha}
                                          </span>
                                        </div>
                                      </Fragment>
                                    ))}
                                  </div>
                                </section>
                                <section
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #E4E1D8',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: '8px',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <h3
                                      style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontFamily: "'Material Symbols Rounded'",
                                          fontSize: '18px',
                                          lineHeight: '1',
                                          color: '#C99F00',
                                        }}
                                      >
                                        auto_awesome
                                      </span>
                                      Análisis de IA
                                    </h3>
                                    <button
                                      onClick={v.d?.onAnalizar}
                                      disabled={!v.d?.puedeAnalizar}
                                      style={{
                                        height: '34px',
                                        padding: '0 12px',
                                        border: '1px solid #17160F',
                                        borderRadius: '8px',
                                        background: '#17160F',
                                        color: '#fff',
                                        fontSize: '12.5px',
                                        fontWeight: '600',
                                        cursor: v.d?.puedeAnalizar ? 'pointer' : 'not-allowed',
                                        opacity: v.d?.puedeAnalizar ? '1' : '.45',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '16px', lineHeight: '1' }}>
                                        refresh
                                      </span>
                                      {v.d?.analizarLabel}
                                    </button>
                                  </div>
                                  {v.d?.analizando ? (
                                    <>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div
                                          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B6960' }}
                                        >
                                          <span
                                            style={{
                                              width: '14px',
                                              height: '14px',
                                              borderRadius: '50%',
                                              border: '2px solid #DEDBD1',
                                              borderTopColor: '#17160F',
                                              animation: 'nortSpin .8s linear infinite',
                                            }}
                                          />
                                          Analizando la conversación…
                                        </div>
                                        <div
                                          style={{
                                            height: '12px',
                                            borderRadius: '4px',
                                            background: '#EEECE5',
                                            animation: 'nortPulse 1.2s ease-in-out infinite',
                                          }}
                                        />
                                        <div
                                          style={{
                                            height: '12px',
                                            width: '80%',
                                            borderRadius: '4px',
                                            background: '#EEECE5',
                                            animation: 'nortPulse 1.2s ease-in-out infinite',
                                          }}
                                        />
                                        <div
                                          style={{
                                            height: '12px',
                                            width: '60%',
                                            borderRadius: '4px',
                                            background: '#EEECE5',
                                            animation: 'nortPulse 1.2s ease-in-out infinite',
                                          }}
                                        />
                                      </div>
                                    </>
                                  ) : null}
                                  {v.d?.notAnalizando ? (
                                    <>
                                      {v.d?.hasAn ? (
                                        <>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div
                                              style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: '10px',
                                                fontSize: '12px',
                                                color: '#6B6960',
                                                flexWrap: 'wrap',
                                              }}
                                            >
                                              <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{v.d?.an?.fecha}</span>
                                              <span>{v.d?.an?.motivo}</span>
                                            </div>
                                            <div
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                background: '#FAF9F6',
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontFamily: "'IBM Plex Mono',monospace",
                                                  fontSize: '32px',
                                                  fontWeight: '600',
                                                  color: v.d?.an?.scoreColor,
                                                  lineHeight: '1',
                                                }}
                                              >
                                                {v.d?.an?.score}
                                              </span>
                                              <span style={{ fontSize: '12.5px', color: '#6B6960', lineHeight: '1.4' }}>
                                                Puntaje del vendedor en esta conversación, ponderado por criterio.
                                              </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#8A877D',
                                                }}
                                              >
                                                Resumen
                                              </span>
                                              <p style={{ margin: '0', fontSize: '13.5px', lineHeight: '1.5', textWrap: 'pretty' }}>
                                                {v.d?.an?.resumen}
                                              </p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#8A877D',
                                                }}
                                              >
                                                Intención del cliente
                                              </span>
                                              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{v.d?.an?.intencion}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#8A877D',
                                                }}
                                              >
                                                Productos mencionados
                                              </span>
                                              {v.d?.an?.hasProductos ? (
                                                <>
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {(v.d?.an?.productos || []).map((p, pI) => (
                                                      <Fragment key={pI}>
                                                        <span
                                                          style={{
                                                            fontSize: '12px',
                                                            padding: '3px 9px',
                                                            borderRadius: '6px',
                                                            background: '#F2EFE6',
                                                            border: '1px solid #E4E1D8',
                                                          }}
                                                        >
                                                          {p?.p}
                                                        </span>
                                                      </Fragment>
                                                    ))}
                                                  </div>
                                                </>
                                              ) : null}
                                              {v.d?.an?.noProductos ? (
                                                <>
                                                  <span style={{ fontSize: '13px', color: '#8A877D' }}>Ninguno todavía</span>
                                                </>
                                              ) : null}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#8A877D',
                                                }}
                                              >
                                                Objeciones detectadas
                                              </span>
                                              {v.d?.an?.hasObjeciones ? (
                                                <>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {(v.d?.an?.objeciones || []).map((o, oI) => (
                                                      <Fragment key={oI}>
                                                        <span
                                                          style={{
                                                            fontSize: '13px',
                                                            display: 'flex',
                                                            gap: '6px',
                                                            alignItems: 'flex-start',
                                                          }}
                                                        >
                                                          <span
                                                            style={{
                                                              fontFamily: "'Material Symbols Rounded'",
                                                              fontSize: '15px',
                                                              lineHeight: '1.3',
                                                              color: '#C98500',
                                                            }}
                                                          >
                                                            report
                                                          </span>
                                                          {o?.o}
                                                        </span>
                                                      </Fragment>
                                                    ))}
                                                  </div>
                                                </>
                                              ) : null}
                                              {v.d?.an?.noObjeciones ? (
                                                <>
                                                  <span style={{ fontSize: '13px', color: '#8A877D' }}>Sin objeciones</span>
                                                </>
                                              ) : null}
                                            </div>
                                            <div
                                              style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                background: '#FFF6CC',
                                                border: '1px solid #F0DC8A',
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#6B5300',
                                                }}
                                              >
                                                Próximo paso sugerido
                                              </span>
                                              <span style={{ fontSize: '13.5px', lineHeight: '1.45' }}>{v.d?.an?.proximo}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  letterSpacing: '.07em',
                                                  textTransform: 'uppercase',
                                                  color: '#8A877D',
                                                }}
                                              >
                                                Evaluación del vendedor
                                              </span>
                                              {(v.d?.an?.crit || []).map((c, cI) => (
                                                <Fragment key={cI}>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <div
                                                      style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'baseline',
                                                        gap: '8px',
                                                      }}
                                                    >
                                                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        {c?.nombre}{' '}
                                                        <span style={{ fontWeight: '400', color: '#8A877D', fontSize: '11.5px' }}>
                                                          {c?.peso}
                                                        </span>
                                                      </span>
                                                      <span
                                                        style={{
                                                          fontFamily: "'IBM Plex Mono',monospace",
                                                          fontSize: '13px',
                                                          fontWeight: '600',
                                                          color: c?.color,
                                                        }}
                                                      >
                                                        {c?.puntaje}/10
                                                      </span>
                                                    </div>
                                                    <div
                                                      style={{
                                                        height: '6px',
                                                        borderRadius: '3px',
                                                        background: '#EEECE5',
                                                        overflow: 'hidden',
                                                      }}
                                                    >
                                                      <div
                                                        style={{ height: '100%', width: c?.w, background: c?.color, borderRadius: '3px' }}
                                                      />
                                                    </div>
                                                    <span style={{ fontSize: '12.5px', color: '#5E5B52', lineHeight: '1.4' }}>
                                                      {c?.comentario}
                                                    </span>
                                                  </div>
                                                </Fragment>
                                              ))}
                                            </div>
                                          </div>
                                        </>
                                      ) : null}
                                      {v.d?.noAn ? (
                                        <>
                                          <div
                                            style={{
                                              padding: '16px',
                                              borderRadius: '10px',
                                              background: '#FAF9F6',
                                              border: '1px dashed #DEDBD1',
                                              fontSize: '13px',
                                              color: '#5E5B52',
                                              lineHeight: '1.5',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '4px',
                                            }}
                                          >
                                            <b style={{ color: '#17160F' }}>Todavía sin análisis</b>
                                            {v.d?.noAnText}
                                          </div>
                                        </>
                                      ) : null}
                                    </>
                                  ) : null}
                                </section>
                                {v.d?.showAlerts ? (
                                  <>
                                    <section
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
                                      <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '700' }}>Alertas de la conversación</h3>
                                      {v.d?.noAlerts ? (
                                        <>
                                          <span style={{ fontSize: '13px', color: '#8A877D' }}>Sin alertas.</span>
                                        </>
                                      ) : null}
                                      {(v.d?.alerts || []).map((a, aI) => (
                                        <Fragment key={aI}>
                                          <div
                                            style={{
                                              border: '1px solid #E4E1D8',
                                              borderRadius: '10px',
                                              padding: '12px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '8px',
                                            }}
                                          >
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                              <span
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '5px',
                                                  fontSize: '11.5px',
                                                  fontWeight: '700',
                                                  padding: '3px 8px',
                                                  borderRadius: '6px',
                                                  background: a?.lvBg,
                                                  color: a?.lvFg,
                                                }}
                                              >
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: a?.lvDot }} />
                                                {a?.nivelLabel}
                                              </span>
                                              <span style={{ fontSize: '13px', fontWeight: '600', flex: '1', minWidth: '0' }}>
                                                {a?.titulo}
                                              </span>
                                            </div>
                                            <span style={{ fontSize: '12.5px', color: '#5E5B52', lineHeight: '1.45' }}>{a?.motivo}</span>
                                            {a?.atendida ? (
                                              <>
                                                <span
                                                  style={{
                                                    fontSize: '12px',
                                                    color: '#16703D',
                                                    display: 'flex',
                                                    gap: '5px',
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  <span
                                                    style={{ fontFamily: "'Material Symbols Rounded'", fontSize: '15px', lineHeight: '1' }}
                                                  >
                                                    check_circle
                                                  </span>
                                                  {a?.atendidaTxt}
                                                </span>
                                              </>
                                            ) : null}
                                            {a?.hasComentario ? (
                                              <>
                                                <span style={{ fontSize: '12.5px', color: '#5E5B52', fontStyle: 'italic' }}>
                                                  “{a?.comentario}”
                                                </span>
                                              </>
                                            ) : null}
                                            {a?.canResolve ? (
                                              <>
                                                <button
                                                  onClick={a?.onResolve}
                                                  style={{
                                                    alignSelf: 'flex-start',
                                                    height: '34px',
                                                    padding: '0 12px',
                                                    border: '1px solid #DEDBD1',
                                                    borderRadius: '8px',
                                                    background: '#fff',
                                                    color: '#17160F',
                                                    fontSize: '12.5px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                  }}
                                                >
                                                  Marcar como atendida
                                                </button>
                                              </>
                                            ) : null}
                                            {a?.isResolving ? (
                                              <>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                  <textarea
                                                    value={a?.resolveComment}
                                                    onChange={a?.onResolveComment}
                                                    rows="2"
                                                    placeholder="Comentario opcional…"
                                                    style={{
                                                      padding: '9px 11px',
                                                      border: '1px solid #DEDBD1',
                                                      borderRadius: '8px',
                                                      fontSize: '13px',
                                                      resize: 'vertical',
                                                      color: '#17160F',
                                                    }}
                                                  />
                                                  <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                      onClick={a?.onConfirm}
                                                      style={{
                                                        height: '34px',
                                                        padding: '0 12px',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        background: '#17160F',
                                                        color: '#fff',
                                                        fontSize: '12.5px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                      }}
                                                    >
                                                      Confirmar
                                                    </button>
                                                    <button
                                                      onClick={a?.onCancel}
                                                      style={{
                                                        height: '34px',
                                                        padding: '0 12px',
                                                        border: '1px solid #DEDBD1',
                                                        borderRadius: '8px',
                                                        background: '#fff',
                                                        color: '#17160F',
                                                        fontSize: '12.5px',
                                                        cursor: 'pointer',
                                                      }}
                                                    >
                                                      Cancelar
                                                    </button>
                                                  </div>
                                                </div>
                                              </>
                                            ) : null}
                                          </div>
                                        </Fragment>
                                      ))}
                                    </section>
                                  </>
                                ) : null}
                                {v.d?.showNotes ? (
                                  <>
                                    <section
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
                                      <h3
                                        style={{
                                          margin: '0',
                                          fontSize: '14px',
                                          fontWeight: '700',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontFamily: "'Material Symbols Rounded'",
                                            fontSize: '17px',
                                            lineHeight: '1',
                                            color: '#6B6960',
                                          }}
                                        >
                                          lock
                                        </span>
                                        Notas internas
                                      </h3>
                                      {v.d?.noNotas ? (
                                        <>
                                          <span style={{ fontSize: '13px', color: '#8A877D' }}>
                                            Sin notas. Solo supervisión y administración las ven.
                                          </span>
                                        </>
                                      ) : null}
                                      {(v.d?.notas || []).map((n, nI) => (
                                        <Fragment key={nI}>
                                          <div
                                            style={{
                                              padding: '10px 12px',
                                              borderRadius: '9px',
                                              background: '#FAF9F6',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '4px',
                                            }}
                                          >
                                            <span style={{ fontSize: '13px', lineHeight: '1.45' }}>{n?.texto}</span>
                                            <span style={{ fontSize: '11.5px', color: '#8A877D' }}>
                                              {n?.autor}
                                              {' · '}
                                              <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{n?.fecha}</span>
                                            </span>
                                          </div>
                                        </Fragment>
                                      ))}
                                      <textarea
                                        value={v.d?.noteDraft}
                                        onChange={v.d?.onNote}
                                        rows="2"
                                        placeholder="Agregar una nota interna…"
                                        style={{
                                          padding: '9px 11px',
                                          border: '1px solid #DEDBD1',
                                          borderRadius: '8px',
                                          fontSize: '13.5px',
                                          resize: 'vertical',
                                          color: '#17160F',
                                        }}
                                      />
                                      <button
                                        onClick={v.d?.onAddNote}
                                        style={{
                                          alignSelf: 'flex-end',
                                          height: '36px',
                                          padding: '0 14px',
                                          border: 'none',
                                          borderRadius: '8px',
                                          background: '#17160F',
                                          color: '#fff',
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          cursor: 'pointer',
                                          opacity: v.d?.noteBtnOp,
                                        }}
                                      >
                                        Agregar nota
                                      </button>
                                    </section>
                                  </>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
        {v.isKanban ? (
          <>
            <div
              style={{
                flex: '1',
                minHeight: '0',
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: 'minmax(250px,1fr)',
                gap: '12px',
                overflowX: 'auto',
                padding: '16px 28px 20px',
              }}
            >
              {(v.kCols || []).map((col, colI) => (
                <Fragment key={colI}>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '0', background: '#ECEAE3', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 12px 8px', flex: 'none' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: col?.color }} />
                      <span style={{ fontSize: '13.5px', fontWeight: '700', flex: '1' }}>{col?.nombre}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', color: '#6B6960' }}>{col?.count}</span>
                    </div>
                    <div
                      style={{
                        flex: '1',
                        minHeight: '0',
                        overflowY: 'auto',
                        padding: '4px 8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {col?.empty ? (
                        <>
                          <div
                            style={{
                              padding: '18px 8px',
                              textAlign: 'center',
                              fontSize: '12.5px',
                              color: '#8A877D',
                              border: '1px dashed #D3D0C6',
                              borderRadius: '9px',
                            }}
                          >
                            Sin conversaciones
                          </div>
                        </>
                      ) : null}
                      {(col?.cards || []).map((it, itI) => (
                        <Fragment key={itI}>
                          <button
                            onClick={it?.onClick}
                            style={{
                              textAlign: 'left',
                              background: '#fff',
                              border: '1px solid #E4E1D8',
                              borderRadius: '10px',
                              padding: '11px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              cursor: 'pointer',
                              color: '#17160F',
                            }}
                            className="hv-1"
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: it?.chDot, flex: 'none' }} />
                              <span
                                style={{
                                  flex: '1',
                                  minWidth: '0',
                                  fontSize: '13.5px',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <Resaltado partes={it?.nombrePartes} />
                              </span>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', color: '#8A877D' }}>
                                {it?.hora}
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
                              <Resaltado partes={it?.previewPartes} />
                            </span>
                            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {it?.esInterna ? <ChipInterna /> : null}
                              {it?.hasMatch ? (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '2px 7px',
                                    borderRadius: '999px',
                                    background: '#FFF0B3',
                                    color: '#7A5A00',
                                  }}
                                >
                                  {'🔍 ' + it?.matchLabel}
                                </span>
                              ) : null}
                              {it?.hasScore ? (
                                <span
                                  title={it?.scoreTitle}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '2px 7px',
                                    borderRadius: '999px',
                                    background: it?.scoreBg,
                                    color: it?.scoreFg,
                                  }}
                                >
                                  {'★ ' + it?.scoreLabel}
                                </span>
                              ) : null}
                              {it?.esperando ? (
                                <>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      padding: '2px 7px',
                                      borderRadius: '999px',
                                      background: it?.espBg,
                                      color: it?.espFg,
                                    }}
                                  >
                                    {it?.espLabel}
                                  </span>
                                </>
                              ) : null}
                              {it?.hasAlert ? (
                                <>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      padding: '2px 7px',
                                      borderRadius: '999px',
                                      background: it?.alertBg,
                                      color: '#fff',
                                    }}
                                  >
                                    {it?.alertN}
                                    {' alerta'}
                                  </span>
                                </>
                              ) : null}
                            </span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
