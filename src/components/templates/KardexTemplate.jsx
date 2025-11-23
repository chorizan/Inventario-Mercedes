import styled from "styled-components";
import { Header, Btnfiltro, v,  Title, Lottieanimacion, TablaCategorias, Buscador, RegistrarMarca, TablaMarca, useMarcaStore, Btnsave, Tabs, useProductosStore, RegistrarSalidaEntrada, useKardexStore } from "../../index";
import { useState } from "react";
import vacio from "../../assets/vacio.json";
export function KardexTemplate({data}) {
  const {setBuscador} = useKardexStore();
  const [state, setState] = useState(false);
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [tipo, setTipo] = useState("");
  function nuevaentrada() {
    SetopenRegistro(true);
    setTipo("entrada");
    
  }
  function nuevasalida() {
    SetopenRegistro(true);
    setTipo("salida");
   
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarSalidaEntrada tipo={tipo}
          dataSelect={dataSelect}
          onClose={() => SetopenRegistro(!openRegistro)}
          accion={accion}
        />
      )}
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>
            Kardex
          </Title>
          <Btnsave titulo="Entrada" bgcolor="#52de65"
            icono={<v.iconoflechaderecha/>} funcion={nuevaentrada}/>
          
           <Btnsave titulo="Salida" bgcolor="#fb6661"
             funcion={nuevasalida} 
            />
          <Btnsave
            titulo="Exportar Códigos"
            bgcolor="#3b82f6"
            funcion={async () => {
              // descargar CSV
              const rows = (data || []).map((p) => ({
                id: p.id,
                descripcion: p.descripcion,
                codigobarras: p.codigobarras,
              }));
              const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map(r => Object.values(r).map(v=>`"${String(v ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `codigos_productos_${new Date().toISOString()}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
          />
          <Btnsave
            titulo="Imprimir Códigos"
            bgcolor="#757710ff"
            funcion={async () => {
              // generar página imprimible con SVGs hechos por JsBarcode
              try {
                const JsBarcode = (await import("jsbarcode")).default;
                const items = data || [];
                const svgs = items.map((p) => {
                  const code = String(p.codigobarras ?? "");
                  // crear elemento SVG en memoria
                  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  try {
                    JsBarcode(svgEl, code, { format: "CODE128", displayValue: true, fontSize: 14, height: 60 });
                  } catch (err) {
                    console.error("JsBarcode error for", code, err);
                  }
                  // limpiar atributos de clase/id para evitar que aparezcan clases de styled-components
                  try {
                    svgEl.removeAttribute('class');
                    svgEl.removeAttribute('id');
                    // eliminar clases en nodos internos si las hubiera
                    const nodesWithClass = svgEl.querySelectorAll('[class]');
                    nodesWithClass.forEach((n) => n.removeAttribute('class'));
                    // eliminar ids internos
                    const nodesWithId = svgEl.querySelectorAll('[id]');
                    nodesWithId.forEach((n) => n.removeAttribute('id'));
                  } catch (e) {
                    /* no crítico */
                  }
                  const sku = p.codigointerno || p.sku || "";
                  const wrapper = `<div class=\"item\"><div class=\"title\">${(p.descripcion||"")}</div>${svgEl.outerHTML}<div class=\"sku\">${sku}</div></div>`;
                  return wrapper;
                }).join("");
                  const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Códigos de barras</title><style>
                  /* Zebra ZD230 optimized print styles - 3 labels per row */
                  :root{--gap:6px}
                  html,body{height:100%;width:100%;margin:0;padding:0}
                  body{font-family:Arial,Helvetica,sans-serif;padding:4mm;background:#fff}
                  .grid{display:flex;flex-wrap:wrap;gap:var(--gap);justify-content:flex-start}
                  /* each .item represents a single label; 3 columns per row */
                  .item{width:calc(33.333% - var(--gap));box-sizing:border-box;margin:0;padding:6px;border:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
                  .item .title{font-weight:600;margin-bottom:4px;text-align:center;font-size:11px}
                  .item svg{width:100%;height:auto;display:block}
                  .sku{margin-top:6px;font-size:9px;font-weight:600;text-align:center;color:#111}
                  /* print page rules: remove default margins and avoid splitting labels */
                  @page{size:auto;margin:0}
                  @media print{
                    body{padding:2mm}
                    .item{page-break-inside:avoid;break-inside:avoid-column}
                    /* Disable browser headers/footers where possible (user may need to set margins to none) */
                  }
                  </style></head><body><div class=\"grid\">${svgs}</div><script>window.onload=function(){window.print()}</script></body></html>`;
                const w = window.open();
                if (!w) {
                  alert("Permite popups para imprimir/exportar");
                  return;
                }
                w.document.write(html);
                w.document.close();
              } catch (err) {
                console.error(err);
                alert("Error generando códigos: " + err.message);
              }
            }}
          />
        </ContentFiltro>
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador}/>
      </section>
    
      <section className="main">
         <Tabs/>
      {/* {data.length == 0 && (
          <Lottieanimacion
            alto="300"
            ancho="300"
            animacion={vacio}
          />
        )}

        <TablaMarca
          data={data}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        /> */}
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 100px
    "area1" 100px
    "area2" 60px
   
    "main" auto;

  .header {
    grid-area: header;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    /* background-color: rgba(229, 67, 26, 0.14); */
    display: flex;
    align-items: center;
  }
  .area2 {
    grid-area: area2;
    /* background-color: rgba(77, 237, 106, 0.14); */
    display: flex;
    align-items: center;
    justify-content:end;

  }
 
  .main {
    margin-top:20px;
    grid-area: main;
    /* background-color: rgba(179, 46, 241, 0.14); */
  }
`;
const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content:end;
  width:100%;
  gap:15px;
`;
