import { supabase } from "../index";
import Swal from "sweetalert2";
export async function InsertarPermisos(p) {

    const { data, error } = await supabase
      .from("permisos")
      .insert(p)
      .select();
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al insertar permisos "+ error.message,
        footer: '<a href="">error</a>',
      });
    }
    

}
export async function MostrarPermisos(p) {
    try {
      console.debug("MostrarPermisos called with:", p);
      const { data, error } = await supabase
        .from("permisos")
        .select(`id, id_usuario, idmodulo, modulos(nombre)`) 
        .eq("id_usuario", p.id_usuario);
      if (error) {
        console.error("MostrarPermisos error:", error);
        return [];
      }
      console.debug("MostrarPermisos response:", data);
      return data;
    } catch (err) {
      console.error("MostrarPermisos unexpected error:", err);
      return [];
    }
 
}
export async function EliminarPermisos(p) {
 
    const { error } = await supabase
      .from("permisos")
      .delete()
      .eq("id_usuario", p.id_usuario);
    if (error) {
      alert("Error al eliminar", error);
    }
  
}