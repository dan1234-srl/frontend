import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Politică de Confidențialitate · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Politică de Confidențialitate"
      updated="15 mai 2026"
    >
      <p>
        La <strong>EVEM</strong> respectăm intimitatea ta și ne angajăm să
        protejăm datele tale personale. Această politică explică ce informații
        colectăm, cum le folosim și ce drepturi ai în calitate de utilizator.
      </p>

      <h2>Ce date colectăm</h2>
      <ul>
        <li>Nume, email, telefon și adresă de livrare</li>
        <li>Detalii despre comenzi și istoric de cumpărături</li>
        <li>Date de plată procesate securizat prin Stripe</li>
        <li>Cookie-uri și date analitice de navigare</li>
      </ul>

      <h2>Cum folosim datele</h2>
      <p>
        Procesăm informațiile strict pentru a-ți livra comenzile, a-ți oferi
        suport, a personaliza experiența și a respecta obligațiile legale.
      </p>

      <h2>Drepturile tale</h2>
      <ul>
        <li>Dreptul de acces, rectificare și ștergere</li>
        <li>Dreptul la portabilitatea datelor</li>
        <li>Dreptul de opoziție la prelucrare</li>
        <li>Dreptul de a depune o plângere la ANSPDCP</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Pentru orice solicitare privind datele tale, scrie-ne la{" "}
        <a href="mailto:privacy@evem.ro">privacy@evem.ro</a>.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
