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
        La <strong>EVEM</strong>, respectarea intimității tale și securitatea
        datelor tale personale reprezintă o prioritate absolută. Prezenta
        Politică de Confidențialitate a fost elaborată în conformitate cu{" "}
        <strong>Regulamentul (UE) 2016/679 (GDPR)</strong> și cu legislația
        națională aplicabilă privind protecția datelor.
      </p>

      <h2>1. Cine suntem noi (Operatorul de date)</h2>
      <p>
        Platforma EVEM (accesibilă la www.evem.ro) este deținută și operată de{" "}
        <strong>Tufan Logistic Expert SRL</strong>, o societate înregistrată în
        România, cu sediul social în Prelungirea Ghencea 124D, Sector 6,
        București, înregistrată la Registrul Comerțului sub nr. J2025024172009,
        având Codul Unic de Înregistrare (CUI) RO51574431.
      </p>
      <p>
        Pentru orice aspect legat de protecția datelor, Responsabilul nostru cu
        Protecția Datelor (DPO) poate fi contactat direct la adresa de email:{" "}
        <a
          href="mailto:daniel.tufan@consultant.com"
          className="font-bold text-[var(--royal-violet)] hover:underline"
        >
          daniel.tufan@consultant.com
        </a>{" "}
        sau telefonic la <strong>+40 735 928 664</strong>.
      </p>

      <h2>2. Ce date cu caracter personal colectăm?</h2>
      <p>
        Colectăm doar datele strict necesare pentru a-ți oferi o experiență de
        cumpărături sigură, rapidă și personalizată:
      </p>
      <ul>
        <li>
          <strong>Date de identificare și contact:</strong> Nume, prenume,
          adresa de email, număr de telefon.
        </li>
        <li>
          <strong>Date de livrare și facturare:</strong> Adresa de
          domiciliu/livrare, date de facturare (inclusiv CUI/CIF dacă reprezinți
          o persoană juridică), și locațiile GLS Locker preferate.
        </li>
        <li>
          <strong>Date financiare și de tranzacționare:</strong> Detalii privind
          comenzile plasate, voucherele aplicate.{" "}
          <em>
            Notă: EVEM nu stochează niciodată datele cardului tău bancar.
            Acestea sunt procesate direct și exclusiv de către partenerul nostru
            securizat (Stripe).
          </em>
        </li>
        <li>
          <strong>Date tehnice și de navigare:</strong> Adresa IP, tipul de
          browser, sistemul de operare, istoricul de căutare internă, și
          interacțiunile cu platforma (pentru a asigura securitatea și a preveni
          frauda).
        </li>
      </ul>

      <h2>3. Scopurile și temeiurile legale ale prelucrării</h2>
      <p>
        Prelucrăm datele tale personale exclusiv în următoarele scopuri legale:
      </p>
      <ul>
        <li>
          <strong>
            Executarea unui contract (Art. 6 alin. 1 lit. b GDPR):
          </strong>{" "}
          Preluarea, validarea, expedierea și facturarea comenzilor tale;
          gestionarea contului de utilizator; procesarea retururilor.
        </li>
        <li>
          <strong>
            Îndeplinirea unei obligații legale (Art. 6 alin. 1 lit. c GDPR):
          </strong>{" "}
          Arhivarea documentelor financiar-contabile (facturi) conform
          legislației fiscale din România; răspunsul la solicitările
          autorităților publice.
        </li>
        <li>
          <strong>Interesul legitim (Art. 6 alin. 1 lit. f GDPR):</strong>{" "}
          Prevenirea și detectarea fraudelor; asigurarea securității platformei;
          optimizarea motorului de căutare intern și a funcționalităților
          tehnice.
        </li>
        <li>
          <strong>Consimțământ (Art. 6 alin. 1 lit. a GDPR):</strong> Trimiterea
          de comunicări comerciale (newsletter, oferte promoționale), doar dacă
          te-ai abonat în mod explicit.
        </li>
      </ul>

      <h2>4. Cu cine partajăm datele tale?</h2>
      <p>
        Pentru a-ți putea livra produsele și a menține platforma funcțională,
        folosim servicii terțe de încredere. Datele tale sunt partajate strict
        în scopul vizat și sub clauze de confidențialitate stricte cu:
      </p>
      <ul>
        <li>
          <strong>Procesatori de plăți:</strong> Stripe (pentru procesarea
          plăților cu cardul).
        </li>
        <li>
          <strong>Firme de curierat:</strong> GLS România (pentru generarea
          AWB-urilor și livrarea la domiciliu sau la rețeaua GLS Lockers).
        </li>
        <li>
          <strong>Furnizori de infrastructură IT și Cloud:</strong> Găzduire
          web, baze de date, motor de căutare și stocare documente (precum
          Amazon Web Services - AWS S3).
        </li>
        <li>
          <strong>Autorități ale statului:</strong> ANAF sau alte instituții
          publice, exclusiv în cazul în care există o obligație legală.
        </li>
      </ul>
      <p>
        <strong>
          EVEM nu va vinde, închiria sau tranzacționa niciodată datele tale
          personale către terți în scopuri de marketing.
        </strong>
      </p>

      <h2>5. Transferul datelor în afara Spațiului Economic European (SEE)</h2>
      <p>
        În anumite situații, unii dintre furnizorii noștri de servicii (ex:
        Stripe, AWS) pot procesa date pe servere aflate în afara SEE. Ne
        asigurăm întotdeauna că aceste transferuri sunt realizate în condiții de
        maximă siguranță, pe baza Clauzelor Contractuale Standard (SCC) aprobate
        de Comisia Europeană sau a altor mecanisme legale de transfer.
      </p>

      <h2>6. Cât timp păstrăm datele?</h2>
      <p>
        Stocăm datele tale doar atât timp cât este necesar pentru scopurile
        menționate:
      </p>
      <ul>
        <li>
          <strong>Datele aferente contului:</strong> Pe întreaga durată de
          existență a contului tău activ. Dacă soliciți ștergerea contului,
          datele vor fi anonimizate sau șterse în termen de 30 de zile.
        </li>
        <li>
          <strong>Datele financiar-contabile:</strong> Facturile și documentele
          de plată sunt păstrate timp de <strong>10 ani</strong>, conform
          legislației fiscale din România.
        </li>
      </ul>

      <h2>7. Securitatea datelor</h2>
      <p>
        Am implementat măsuri tehnice și organizatorice de top pentru a-ți
        proteja datele (ex: criptare SSL pe 256-biți pentru transferul datelor,
        parole stocate doar sub formă de hash ireversibil, limitări de acces la
        baza de date și monitorizare activă împotriva atacurilor cibernetice).
      </p>

      <h2>8. Drepturile tale prevăzute de GDPR</h2>
      <p>
        În calitate de persoană vizată, ai următoarele drepturi garantate de
        lege:
      </p>
      <ul>
        <li>
          <strong>Dreptul de acces:</strong> Poți solicita o copie a datelor pe
          care le deținem despre tine.
        </li>
        <li>
          <strong>Dreptul la rectificare:</strong> Poți corecta datele inexacte
          sau incomplete direct din contul tău sau contactându-ne.
        </li>
        <li>
          <strong>Dreptul la ștergere („Dreptul de a fi uitat”):</strong> Poți
          solicita ștergerea datelor tale, cu excepția cazurilor în care legea
          ne obligă să le păstrăm (ex: facturi emise).
        </li>
        <li>
          <strong>Dreptul la restricționarea prelucrării:</strong> Poți cere
          blocarea prelucrării datelor tale în anumite condiții.
        </li>
        <li>
          <strong>Dreptul la portabilitatea datelor:</strong> Poți primi datele
          într-un format structurat, ce poate fi citit automat.
        </li>
        <li>
          <strong>Dreptul la opoziție:</strong> Te poți opune oricând
          prelucrării datelor în scopuri de marketing direct.
        </li>
      </ul>
      <p>
        Dacă dorești să îți exerciți oricare dintre aceste drepturi, te rugăm să
        ne trimiți un email la <strong>daniel.tufan@consultant.com</strong> sau
        să ne contactezi la numărul <strong>+40 735 928 664</strong>. Vom
        răspunde solicitării tale în termen de maxim 30 de zile.
      </p>
      <p>
        De asemenea, ai dreptul de a depune o plângere la{" "}
        <strong>
          Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
          Caracter Personal (ANSPDCP)
        </strong>{" "}
        -{" "}
        <a
          href="https://www.dataprotection.ro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--royal-violet)] hover:underline"
        >
          www.dataprotection.ro
        </a>
        , în cazul în care consideri că drepturile ți-au fost încălcate.
      </p>

      <h2>9. Modificări ale Politicii de Confidențialitate</h2>
      <p>
        Ne rezervăm dreptul de a actualiza acest document ori de câte ori au loc
        schimbări legislative sau operaționale. Cea mai recentă versiune va fi
        mereu disponibilă la această adresă, iar data ultimei actualizări va fi
        menționată în antet.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
