import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Termeni și Condiții · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Termeni și Condiții"
      updated="15 mai 2026"
    >
      <p>
        Prin accesarea și utilizarea site-ului <strong>EVEM</strong> ești de
        acord cu termenii și condițiile descrise mai jos. Te rugăm să le
        citești cu atenție înainte de a plasa o comandă.
      </p>

      <h2>Comenzi și plată</h2>
      <p>
        Comenzile devin definitive după confirmarea plății. Acceptăm carduri
        prin procesatorul securizat Stripe. Prețurile sunt afișate în RON și
        includ TVA.
      </p>

      <h2>Livrare</h2>
      <p>
        Timpul standard de livrare este de 2–5 zile lucrătoare în România.
        Detaliile complete sunt disponibile în pagina de livrare.
      </p>

      <h2>Drept de proprietate</h2>
      <p>
        Tot conținutul site-ului (texte, imagini, logo, design) este
        proprietatea EVEM și este protejat de legea drepturilor de autor.
      </p>

      <h2>Limitarea răspunderii</h2>
      <p>
        EVEM nu este responsabil pentru daune indirecte rezultate din
        utilizarea site-ului în afara scopului comercial al achiziției.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru întrebări legate de acești termeni, scrie-ne la{" "}
        <a href="mailto:contact@evem.ro">contact@evem.ro</a>.
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
