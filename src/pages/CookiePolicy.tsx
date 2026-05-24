import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const CookiePolicy = () => {
  useEffect(() => {
    document.title = "Politică de Cookie-uri · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Politică de Cookie-uri"
      updated="15 mai 2026"
    >
      <p>
        <strong>EVEM</strong> folosește cookie-uri pentru a-ți oferi o
        experiență de navigare rapidă, sigură și personalizată.
      </p>

      <h2>Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere mici de text stocate de browserul tău. Ele
        ne ajută să recunoaștem dispozitivul tău și să îmbunătățim experiența
        pe site.
      </p>

      <h2>Tipuri de cookie-uri folosite</h2>
      <ul>
        <li>
          <strong>Esențiale</strong> – pentru autentificare, coș și checkout
        </li>
        <li>
          <strong>Preferințe</strong> – temă, limbă, dispozitiv
        </li>
        <li>
          <strong>Analitice</strong> – statistici de utilizare anonimizate
        </li>
        <li>
          <strong>Marketing</strong> – campanii personalizate (opțional)
        </li>
      </ul>

      <h2>Cum gestionezi cookie-urile</h2>
      <p>
        Poți accepta sau refuza cookie-urile direct din bannerul afișat la
        prima vizită, sau le poți șterge oricând din setările browserului.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru detalii suplimentare, scrie-ne la{" "}
        <a href="mailto:privacy@evem.ro">privacy@evem.ro</a>.
      </p>
    </LegalLayout>
  );
};

export default CookiePolicy;
