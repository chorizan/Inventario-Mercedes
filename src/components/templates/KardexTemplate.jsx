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
                  /* Zebra ZD230 label settings: labels are 30mm (W) x 40mm (H), 3 columns per row */
                  :root{--label-w:30mm;--label-h:40mm;--gap:4mm}
                  html,body{height:100%;width:100%;margin:0;padding:0}
                  body{font-family:Arial,Helvetica,sans-serif;padding:0;background:#fff}
                  .sheet{width:100%;display:flex;justify-content:center}
                  .grid{display:flex;flex-wrap:wrap;gap:var(--gap);justify-content:flex-start;max-width:calc(var(--label-w) * 3 + var(--gap) * 2)}
                  /* each .item represents a single 30x40mm label */
                  .item{width:var(--label-w);height:var(--label-h);box-sizing:border-box;margin:0;padding:4mm 3mm;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;border:0}
                  .item .title{font-weight:600;margin:0 0 2mm 0;text-align:center;font-size:10px;line-height:1}
                  .barcode-wrap{flex:1;display:flex;align-items:center;justify-content:center;width:100%}
                  .item svg{width:100%;height:auto;max-height:18mm;display:block}
                  .sku{margin-top:2mm;font-size:9px;font-weight:600;text-align:center;color:#111}
                  /* print page rules: set page width to exactly 3 labels wide (90mm) and minimal margins */
                  @page{size:90mm auto;margin:0}
                  @media print{
                    body{padding:0}
                    .item{page-break-inside:avoid;break-inside:avoid-column}
                  }
                  </style></head><body><div class=\"sheet\"><div class=\"grid\">${svgs}</div></div><script>window.onload=function(){window.print()}</script></body></html>`;
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
          <Btnsave
            titulo="Generar ZPL"
            bgcolor="#ff8c00"
            funcion={async () => {
              try {
                const items = data || [];
                if (!items.length) {
                  alert("No hay productos para generar ZPL");
                  return;
                }
                // Assumption: Zebra ZD230 at 203 dpi (~8 dots/mm)
                const dpi = 203;
                const dotsPerMm = dpi / 25.4;
                const labelWmm = 30; // 30 mm width
                const labelHmm = 40; // 40 mm height
                const gapMm = 4; // gap between labels
                const labelW = Math.round(labelWmm * dotsPerMm);
                const labelH = Math.round(labelHmm * dotsPerMm);
                const gap = Math.round(gapMm * dotsPerMm);
                const cols = 3;
                const pageWidth = labelW * cols + gap * (cols - 1);

                let zpl = "";
                // start label format - we'll generate batches of rows
                // iterate rows of 3 labels
                for (let i = 0; i < items.length; i += cols) {
                  zpl += "^XA\n"; // start label
                  zpl += `^PW${pageWidth}\n`;
                  zpl += `^LH0,0\n`;
                  const rowIndex = Math.floor(i / cols);
                  const yOffset = 0; // each label block will print sequentially; length controlled by labelH

                  for (let c = 0; c < cols; c++) {
                    const idx = i + c;
                    if (idx >= items.length) continue;
                    const p = items[idx];
                    const code = String(p.codigobarras ?? "");
                    const descripcion = String(p.descripcion ?? "");
                    const sku = String(p.codigointerno || p.sku || "");
                    const x = c * (labelW + gap);
                    const y = 10; // small top margin in dots
                    // Barcode (Code128) - use module width 2 and height ~18mm
                    const barcodeHeight = Math.round(18 * dotsPerMm);
                    zpl += `^FO${x},${y}^BY2,2,${barcodeHeight}^BCN,${barcodeHeight},Y,N,N^FD${code}^FS\n`;
                    // Description text above barcode (small)
                    const textY = y + barcodeHeight + 6;
                    const fontHeight = Math.round(6 * dotsPerMm); // ~6mm font height
                    zpl += `^FO${x + 6},${textY}^A0N,${fontHeight},${fontHeight}^FD${descripcion.substring(0,40)}^FS\n`;
                    // SKU below
                    const skuY = textY + fontHeight + 6;
                    zpl += `^FO${x + 6},${skuY}^A0N,${fontHeight},${fontHeight}^FDSKU:${sku}^FS\n`;
                  }
                  // set label length and print one row
                  zpl += `^XZ\n`;
                }

                const blob = new Blob([zpl], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `codigos_zebra_${new Date().toISOString()}.zpl`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert("Error generando ZPL: " + (err.message || err));
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
