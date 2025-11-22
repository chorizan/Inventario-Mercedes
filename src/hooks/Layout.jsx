import styled from "styled-components";
import { useEmpresaStore } from "../store/EmpresaStore";
import { usePermisosStore } from "../store/PermisosStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sidebar } from "../components/organismos/sidebar/Sidebar";
import { Menuambur } from "../components/organismos/Menuambur";
import { Device } from "../styles/breakpoints";
import { useUsuariosStore } from "../store/UsuariosStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mostrarUsuarios, datausuarios } = useUsuariosStore();
  const { mostrarEmpresa } = useEmpresaStore();
  const { mostrarPermisos } = usePermisosStore();
  const {
    data: usuarios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: () => mostrarUsuarios(),
  });

  const { data: empresa } = useQuery({
    queryKey: ["mostrar empresa", { idusuarios: datausuarios?.id }],
    queryFn: () => mostrarEmpresa({ idusuario: datausuarios?.id }),
    enabled: !!usuarios,
  });
  const { data: permisos } = useQuery({
    queryKey: ["mostrar permisos", { id_usuario: usuarios?.id }],
    queryFn: () => mostrarPermisos({ id_usuario: usuarios?.id }),
    enabled: !!usuarios,
  });
  if (isLoading == true) {
    return <SpinnerLoader />;
  }
  if (error) {
    return <h1>Error..</h1>;
  }

  return (
    <Container className={sidebarOpen ? "active" : ""}>
      <DebugBadge>
        <div>DEBUG</div>
        <div>user: {datausuarios?.id ?? "-"}</div>
        <div>permisos: {Array.isArray(permisos) ? permisos.length : "-"}</div>
      </DebugBadge>
      <div className="ContentSidebar">
        <Sidebar
          state={sidebarOpen}
          setState={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="ContentMenuambur">
        <Menuambur />
      </div>

      <Containerbody>{children}</Containerbody>
    </Container>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  background: ${({ theme }) => theme.bgtotal};
  transition: all 0.2s ease-in-out;

  .ContentSidebar {
    display: none;
  }
  .ContentMenuambur {
    display: block;
    position: absolute;
    left: 20px;
  }
  @media ${Device.tablet} {
    grid-template-columns: 65px 1fr;
    &.active {
      grid-template-columns: 220px 1fr;
    }
    .ContentSidebar {
      display: initial;
    }
    .ContentMenuambur {
      display: none;
    }
  }
`;
const DebugBadge = styled.div`
  position: fixed;
  right: 12px;
  top: 12px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const Containerbody = styled.div`
  grid-column: 1;
  width: 100%;
  @media ${Device.tablet} {
    grid-column: 2;
  }
`;
