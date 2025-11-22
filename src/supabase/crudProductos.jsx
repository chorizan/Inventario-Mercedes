import { supabase } from "../index";
import Swal from "sweetalert2";
const tabla = "productos";
export async function InsertarProductos(p) {
  try {
    const { error } = await supabase.rpc("insertarproductos", p);
    if (error) {
      console.log("parametros", p);
      console.log("parametros", error.message);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
        footer: '<a href="">Agregue una nueva descripcion</a>',
      });
    }
  } catch (error) {
    throw error
  }
}
export async function MostrarProductos(p) {
  try {
    const { data } = await supabase.rpc("mostrarproductos", {
      _id_empresa: p._id_empresa,
    });
    return data;
  } catch (error) {}
}
export async function EliminarProductos(p) {
  try {
    const { error } = await supabase.from("productos").delete().eq("id", p.id);
    if (error) {
      // Si hay una violación de FK (producto referenciado en kardex)
      // intentamos desvincular el producto en kardex (set id_producto = NULL) y reintentar
      console.error('Error al eliminar producto:', error);
      if (error.code === '23503' || (error.details && String(error.details).includes('kardex'))) {
        // intentar setear id_producto a NULL en kardex para conservar movimientos
        try {
          const upd = await supabase.from('kardex').update({ id_producto: null }).eq('id_producto', p.id);
          if (upd.error) {
            console.error('Error al desvincular kardex antes de eliminar:', upd.error);
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: 'No fue posible desvincular movimientos en kardex: ' + (upd.error.message || upd.error) });
            return { ok: false, error: upd.error };
          }
          // una vez desvinculado, reintentar eliminar el producto
          const retry = await supabase.from('productos').delete().eq('id', p.id);
          if (retry.error) {
            console.error('Error reintentando eliminar producto:', retry.error);
            Swal.fire({ icon: 'error', title: 'Error al eliminar', text: retry.error.message || retry.error });
            return { ok: false, error: retry.error };
          }
          Swal.fire({ icon: 'success', title: 'Producto eliminado', text: 'Producto eliminado. Movimientos en kardex conservados.' });
          return { ok: true };
        } catch (e) {
          console.error('Excepción al manejar FK 23503:', e);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo completar la operación de eliminación.' });
          return { ok: false, error: e };
        }
      }
      alert("Error al eliminar", error);
    }
  } catch (error) {
    alert(error.error_description || error.message + " eliminar productos");
  }
}
export async function EditarProductos(p) {
  try {
    const { error } = await supabase.from("productos").update(p).eq("id", p.id);
    if (error) {
      alert("Error al editar producto", error);
    }
  } catch (error) {
    alert(error.error_description || error.message + " editar categorias");
  }
}

export async function BuscarProductos(p) {
  try {
    const { data } = await supabase.rpc("buscarproductos", {
      _id_empresa: p.id_empresa,
      buscador: p.descripcion,
    });
    return data;
  } catch (error) {}
}
//REPORTES
export async function ReportStockProductosTodos(p) {
  const { data, error } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa);
  if (error) {
    return;
  }
  return data;
}
export async function ReportStockXProducto(p) {
  const { data, error } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa)
    .eq("id",p.id);
  if (error) {
    return;
  }
  return data;
}
export async function ReportStockBajoMinimo(p) {
  const { data, error } = await supabase.rpc("reportproductosbajominimo",p)
  
  if (error) {
    return;
  }
  return data;
}
export async function ReportKardexEntradaSalida(p) {
  const { data, error } = await supabase.rpc("mostrarkardexempresa",p)
  if (error) {
    return;
  }
  return data;
}
export async function ReportInventarioValorado(p) {
  const { data, error } = await supabase.rpc("inventariovalorado",p)
  
  if (error) {
   
    return;
  }
  return data;
}

export async function IncrementarStockPorCodigo(p) {
  try {
    // buscar producto por codigo de barras y empresa
    const { data: producto, error: selectError } = await supabase
      .from(tabla)
      .select("id, stock")
      .eq("id_empresa", p.id_empresa)
      .eq("codigobarras", p.codigobarras)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }
    if (!producto) {
      return { ok: false, message: "Producto no encontrado" };
    }

    const nuevaCantidad = (producto.stock || 0) + (p.cantidad || 1);
    const { error: updateError } = await supabase
      .from(tabla)
      .update({ stock: nuevaCantidad })
      .eq("id", producto.id);

    if (updateError) {
      throw updateError;
    }

    return { ok: true, id: producto.id, stock: nuevaCantidad };
  } catch (error) {
    console.error("IncrementarStockPorCodigo error", error);
    return { ok: false, message: error.message || error };
  }
}