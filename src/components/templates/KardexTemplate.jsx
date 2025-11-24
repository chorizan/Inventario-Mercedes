import styled from "styled-components";
import { Header, v, Title, Lottieanimacion, Buscador, RegistrarSalidaEntrada, Btnsave, Tabs, useKardexStore } from "../../index";
import { useState } from "react";
import vacio from "../../assets/vacio.json";

export function KardexTemplate({ data }) {
  const { setBuscador } = useKardexStore();
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

  const handleExportCsv = async () => {
    const rows = (data || []).map((p) => ({
      id: p.id,
      descripcion: p.descripcion || "",
      codigobarras: p.codigobarras || "",
    }));
    if (rows.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    const header = Object.keys(rows[0]);
    const csv = [header.join(","), ...rows.map(r => header.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codigos_productos_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrintCodigos = async () => {
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      const items = data || [];

      const itemsHtml = items.map((p) => {
        const code = String(p.codigobarras ?? "");
        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        try {
          JsBarcode(svgEl, code, { format: "CODE128", displayValue: true, fontSize: 14, height: 60 });
        } catch (err) {
          console.error("JsBarcode error for", code, err);
        }
        try {
          svgEl.removeAttribute("class");
          svgEl.removeAttribute("id");
          const nodesWithClass = svgEl.querySelectorAll("[class]");
          nodesWithClass.forEach((n) => n.removeAttribute("class"));
          const nodesWithId = svgEl.querySelectorAll("[id]");
          nodesWithId.forEach((n) => n.removeAttribute("id"));
        } catch (e) {
          /* no crítico */
        }
        const sku = p.codigointerno || p.sku || "";
        return `<div class="item"><div class="title">${(p.descripcion || "")} </div><div class="barcode-wrap">${svgEl.outerHTML}</div><div class="sku">${sku}</div></div>`;
      });

      // Agrupar en páginas de 3 items (una fila horizontal por página)
      const pages = [];
      for (let i = 0; i < itemsHtml.length; i += 3) {
        const chunk = itemsHtml.slice(i, i + 3);
        while (chunk.length < 3) chunk.push('<div class="item" style="visibility:hidden"></div>');
        pages.push(`<div class="page">${chunk.join("")}</div>`);
      }

      if (pages.length === 0) {
        pages.push('<div class="page">' + '<div class="item" style="visibility:hidden"></div>'.repeat(3) + '</div>');
      }

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Códigos de barras</title><style>
        :root{--label-w:30mm;--label-h:40mm;--gap:4mm}
        html,body{height:100%;width:100%;margin:0;padding:0}
        body{font-family:Arial,Helvetica,sans-serif;padding:0;background:#fff}
        .page{width:90mm;height:40mm;display:flex;align-items:flex-start;justify-content:space-between;box-sizing:border-box;margin:0;padding:0}
        .item{width:var(--label-w);height:var(--label-h);box-sizing:border-box;margin:0;padding:4mm 3mm;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;border:0}
        .item .title{font-weight:600;margin:0 0 2mm 0;text-align:center;font-size:10px;line-height:1}
        .barcode-wrap{flex:1;display:flex;align-items:center;justify-content:center;width:100%}
        .item svg{width:100%;height:auto;max-height:18mm;display:block}
        .sku{margin-top:2mm;font-size:9px;font-weight:600;text-align:center;color:#111}
        @page{size:90mm 40mm;margin:0}
        @media print{body{padding:0}.item{page-break-inside:avoid;break-inside:avoid-column}}
      </style></head><body>${pages.join("")}<script>window.onload=function(){window.print()}</script></body></html>`;

      const w = window.open();
      if (!w) {
        alert("Permite popups para imprimir/exportar");
        return;
      }
      w.document.write(html);
      w.document.close();
    } catch (err) {
      console.error(err);
      alert("Error generando códigos: " + (err?.message || err));
    }
  };

  return (
    <Container>
      {openRegistro && (
        <RegistrarSalidaEntrada
          tipo={tipo}
          dataSelect={dataSelect}
          onClose={() => SetopenRegistro(!openRegistro)}
          accion={accion}
        />
      )}
      <header className="header">
        <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>Kardex</Title>
          <Btnsave titulo="Entrada" bgcolor="#52de65" icono={<v.iconoflechaderecha />} funcion={nuevaentrada} />
          <Btnsave titulo="Salida" bgcolor="#fb6661" funcion={nuevasalida} />
          <Btnsave titulo="Exportar Códigos" bgcolor="#3b82f6" funcion={handleExportCsv} />
          <Btnsave titulo="Imprimir Códigos" bgcolor="#757710ff" funcion={handlePrintCodigos} />
        </ContentFiltro>
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador} />
      </section>
      <section className="main">
        <Tabs />
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
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    display: flex;
    align-items: center;
  }
  .area2 {
    grid-area: area2;
    display: flex;
    align-items: center;
    justify-content: end;
  }
  .main {
    margin-top: 20px;
    grid-area: main;
  }
`;

const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  width: 100%;
  gap: 15px;
`;
