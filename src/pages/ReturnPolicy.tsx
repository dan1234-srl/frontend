import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const ReturnPolicy = () => {
  useEffect(() => {
    document.title = "Politică de Retur · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Politică de Retur"
      updated="15 mai 2026"
    >
      <p>
        În calitate de consumator, ai dreptul legal să returnezi orice produs
        achiziționat de pe <strong>EVEM</strong> în termen de{" "}
        <strong>14 zile calendaristice</strong> de la primire, fără a invoca
        un motiv.
      </p>

      <h2>Condiții pentru retur</h2>
      <ul>
        <li>Produsul trebuie să fie în starea originală, nefolosit</li>
        <li>Etichetele și ambalajul original să fie intacte</li>
        <li>Factura sau dovada de achiziție atașată</li>
      </ul>

      <h2>Cum returnezi un produs</h2>
      <ol>
        <li>Completezi formularul de retur din contul tău EVEM</li>
        <li>Primești AWB-ul de retur pe email</li>
        <li>Predai coletul curierului în maximum 5 zile lucrătoare</li>
      </ol>

      <h2>Rambursare</h2>
      <p>
        Banii sunt rambursați în maximum <strong>14 zile</strong> de la
        primirea coletului, folosind aceeași metodă de plată utilizată la
        comandă.
      </p>

      <h2>Excepții</h2>
      <p>
        Nu pot fi returnate produsele personalizate, sigilate din motive de
        igienă sau cosmetice odată desfăcute.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru asistență la retur, scrie-ne la{" "}
        <a href="mailto:retur@evem.ro">retur@evem.ro</a>.
      </p>
    </LegalLayout>
  );
};

export default ReturnPolicy;
