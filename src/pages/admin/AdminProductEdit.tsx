import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductAttributesEditor from "./ProductAttributesEditor"; // Asigură-te că e calea corectă
import { Loader2 } from "lucide-react";

const AdminProductEdit = () => {
  const { sku } = useParams<{ sku: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/products/admin/detail/${sku}`,
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [sku]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Aici ai restul detaliilor produsului (Nume, Preț, etc.) */}

      {/* INTEGRAREA EDITORULUI DE ATRIBUTE */}
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
        <ProductAttributesEditor
          sku={product.sku}
          categoryId={product.category_id}
          // Convertim string-ul JSON în obiect dacă este necesar
          initialAttributes={
            typeof product.attributes_json === "string"
              ? JSON.parse(product.attributes_json)
              : product.attributes_json || {}
          }
          onSaved={(newAttrs) => {
            // Opțional: updatează local state-ul pentru a reflecta schimbările
            console.log("Atribute salvate:", newAttrs);
          }}
        />
      </div>
    </div>
  );
};

export default AdminProductEdit;
