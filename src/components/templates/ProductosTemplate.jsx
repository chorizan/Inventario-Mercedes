import styled from "styled-components";
import { Header, Btnfiltro, v, RegistrarCategorias, Title, Lottieanimacion, TablaCategorias, Buscador, RegistrarProductos, useProductosStore, TablaProductos, useEmpresaStore } from "../../index";
import { useState } from "react";
import vacio from "../../assets/vacio.json";
import { useRef } from "react";

function ScanInput() {
  const [valor, setValor] = useState("");
  const inputRef = useRef(null);
  const { dataempresa } = useEmpresaStore();
  const { incrementarStockPorCodigo } = useProductosStore();

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      const code = valor.trim();
      if (!code) return;
      incrementarStockPorCodigo({ id_empresa: dataempresa?.id, codigobarras: code, cantidad: 1 }).then((res) => {
        if (res?.ok) {
          alert(`Stock incrementado. Nuevo stock: ${res.stock}`);
        } else {
          alert(res?.message || "No se encontró el producto");
        }
        setValor("");
        inputRef.current && inputRef.current.focus();
      });
    }
  }

  return (
    <input
      ref={inputRef}
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Escanear código"
      style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
    />
  );
}
export function ProductosTemplate({data}) {
  const {setBuscador} = useProductosStore();
  const [state, setState] = useState(false);
  const [openRegistro, SetopenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarProductos
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
            Productos
          </Title>
          <Btnfiltro
            funcion={nuevoRegistro}
            bgcolor="#f6f3f3"
            textcolor="#353535"
            icono={<v.agregar />}
          />
        </ContentFiltro>
      </section>
      <section className="area2">
        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'end',width:'100%'}}>
          <Buscador setBuscador={setBuscador}/>
          <ScanInput/>
        </div>
      </section>
      <section className="main">
      {data?.length == 0 && (
          <Lottieanimacion
            alto="300"
            ancho="300"
            animacion={vacio}
          />
        )}

        <TablaProductos
          data={data}
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect}
          setAccion={setAccion}
        />
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
