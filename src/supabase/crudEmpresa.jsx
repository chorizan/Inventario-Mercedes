import Swal from "sweetalert2";
import { supabase } from "../index";

export const MostrarEmpresa = async (p) => {
  try {
    const { data, error } = await supabase
      .rpc("mostrarempresaasignaciones", {
        _id_usuario: p.idusuario,
      })
      .maybeSingle();
    if (error) {
      console.error("MostrarEmpresa error:", error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error("MostrarEmpresa exception:", e);
    return null;
  }
};
export const ContarUsuariosXempresa = async (p) => {
  try {
    const { data, error } = await supabase
      .rpc("contar_usuarios_por_empresa", {
        _id_empresa: p.id_empresa,
      })
      .maybeSingle();
    if (error) {
      console.error("ContarUsuariosXempresa error:", error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error("ContarUsuariosXempresa exception:", e);
    return null;
  }
};
