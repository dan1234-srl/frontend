import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Termeni și Condiții · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Termeni și Condiții de Utilizare"
      updated="25 iunie 2026"
    >
      <p>
        Bine ai venit pe <strong>EVEM</strong>. Prezentul document („Termeni și
        Condiții”) reprezintă contractul cu putere de lege care guvernează
        utilizarea platformei noastre și achiziționarea produselor
        comercializate prin intermediul acesteia.
      </p>
      <p>
        Prin navigarea pe acest site, crearea unui cont sau plasarea unei
        comenzi, confirmi că ai citit, înțeles și acceptat integral acești
        Termeni și Condiții.
      </p>

      <h2>1. Datele de identificare ale Vânzătorului</h2>
      <p>
        Platforma EVEM (www.evem.ro) este proprietatea exclusivă a și este
        operată de:
      </p>
      <ul className="not-prose space-y-1 mb-6 text-sm text-zinc-700">
        <li>
          <strong>Companie:</strong> Tufan Logistic Expert SRL
        </li>
        <li>
          <strong>CUI:</strong> RO51574431 / <strong>Reg. Com.:</strong>{" "}
          J2025024172009
        </li>
        <li>
          <strong>Sediul social:</strong> Prelungirea Ghencea 124D, Sector 6,
          București
        </li>
        <li>
          <strong>Contact:</strong>{" "}
          <a
            href="mailto:daniel.tufan@consultant.com"
            className="font-bold text-[var(--royal-violet)] hover:underline"
          >
            daniel.tufan@consultant.com
          </a>{" "}
          | Telefon: <strong>+40 735 928 664</strong>
        </li>
      </ul>

      <h2>2. Momentul încheierii contractului la distanță</h2>
      <p>
        Informațiile prezentate pe EVEM nu reprezintă o ofertă angajantă din
        punct de vedere juridic, ci o invitație de a face o ofertă (invitație la
        ofertă).
      </p>
      <ul>
        <li>
          <strong>Plasarea Comenzii:</strong> Finalizarea comenzii de către tine
          constituie oferta ta fermă de a achiziționa produsele adăugate în coș.
        </li>
        <li>
          <strong>Confirmarea Automată:</strong> E-mailul automat primit imediat
          după plasarea comenzii are doar rolul de a confirma recepționarea
          solicitării tale în sistemul nostru,{" "}
          <strong>nu reprezintă acceptarea comenzii</strong> și nu încheie
          contractul de vânzare-cumpărare.
        </li>
        <li>
          <strong>Încheierea Contractului:</strong> Contractul la distanță se
          consideră încheiat în momentul în care îți trimitem e-mailul prin care
          confirmăm <strong>expedierea produselor</strong> (sau la emiterea
          facturii fiscale finale). Ne rezervăm dreptul de a refuza o comandă
          din motive justificate (ex: epuizarea stocului, erori grave de
          sistem).
        </li>
      </ul>

      <h2>3. Politica de Prețuri și Erorile de Sistem (Preț Derizoriu)</h2>
      <p>
        Toate prețurile afișate pe platformă sunt exprimate în{" "}
        <strong>RON</strong> și includ TVA conform legislației în vigoare.
        Costurile de transport vor fi afișate distinct înainte de finalizarea
        comenzii.
      </p>
      <p>
        <strong>Erori de afișare a prețurilor:</strong> Deși depunem eforturi
        considerabile pentru a asigura acuratețea prețurilor și a stocurilor,
        sistemele informatice pot genera erori tehnice. EVEM își rezervă dreptul
        de a <strong>anula orice comandă</strong> în cazul în care un produs
        este afișat cu un preț derizoriu, disproporționat față de valoarea reală
        a acestuia (ex: preț de 1 RON în loc de 1000 RON), conform prevederilor
        art. 1665 alin. 2 din Codul Civil Român.
      </p>

      <h2>4. Modalități de Plată</h2>
      <p>
        Pentru a asigura o experiență impecabilă, îți oferim următoarele metode
        de plată:
      </p>
      <ul>
        <li>
          <strong>Plata online cu cardul bancar:</strong> Tranzacțiile sunt
          procesate în siguranță prin intermediul platformei globale{" "}
          <strong>Stripe</strong>. Datele cardului tău sunt criptate la cel mai
          înalt standard (PCI-DSS) și nu sunt niciodată stocate pe serverele
          noastre.
        </li>
        <li>
          <strong>Plata la livrare (Ramburs):</strong> Achitarea contravalorii
          se face direct la curier în momentul recepționării coletului. *Notă:
          Această metodă poate să nu fie disponibilă pentru livrările în
          locațiile de tip Locker.
        </li>
      </ul>

      <h2>5. Politica de Livrare</h2>
      <p>
        Expediem produsele prin intermediul partenerului nostru,{" "}
        <strong>GLS România</strong>, oferind opțiuni de livrare la domiciliu
        sau la punctele de ridicare (GLS Lockers).
      </p>
      <ul>
        <li>
          <strong>Termen de livrare:</strong> De regulă, între 1 și 3 zile
          lucrătoare de la confirmarea expedierii. Nu ne asumăm răspunderea
          pentru întârzierile cauzate de firma de curierat, de factori
          meteorologici extremi sau de situații de forță majoră.
        </li>
        <li>
          <strong>Transferul riscului:</strong> Riscul de pierdere sau
          deteriorare a produselor îți este transferat în momentul în care intri
          în posesia fizică a acestora (când preiei coletul de la curier sau îl
          ridici din Locker).
        </li>
      </ul>

      <h2>6. Dreptul de Retragere și Garanția Legală</h2>
      <p>
        Pentru informații complete privind condițiile în care poți returna un
        produs în 14 zile și procedura de restituire a contravalorii, te rugăm
        să consulți{" "}
        <Link
          to="/legal/return-policy"
          className="text-[var(--royal-violet)] font-bold hover:underline"
        >
          Politica noastră de Retur
        </Link>
        .
      </p>
      <p>
        <strong>Garanția Legală de Conformitate:</strong> Toate produsele
        comercializate de EVEM beneficiază de garanția legală de conformitate
        potrivit prevederilor OUG nr. 140/2021. Dacă produsul primit nu
        corespunde descrierii sau prezintă defecte de fabricație, ai dreptul de
        a solicita aducerea la conformitate (reparare, înlocuire) sau, după caz,
        returnarea banilor.
      </p>

      <h2>7. Contul de Utilizator și Securitatea</h2>
      <p>
        La crearea unui cont pe EVEM, ești responsabil pentru menținerea
        confidențialității datelor de acces (adresa de email și parola). Orice
        activitate desfășurată din contul tău va fi considerată ca fiind
        autorizată de tine. Ne rezervăm dreptul de a suspenda sau șterge
        conturile care încalcă acești termeni (ex: tentative de fraudă, atacuri
        cibernetice, folosirea de limbaj injurios).
      </p>

      <h2>8. Drepturi de Proprietate Intelectuală</h2>
      <p>
        Întregul conținut al platformei EVEM – incluzând, dar fără a se limita
        la, elemente de grafică, text, imagini, logo-uri, algoritmi de căutare
        (inclusiv motoarele bazate pe Meilisearch) și cod sursă – este
        proprietatea intelectuală exclusivă a Tufan Logistic Expert SRL și este
        protejat de Legea nr. 8/1996 privind dreptul de autor.
      </p>
      <p>
        Este strict interzisă copierea, reproducerea, extragerea automată a
        datelor (data scraping) sau utilizarea conținutului în scopuri
        comerciale fără acordul nostru prealabil scris.
      </p>

      <h2>9. Forța Majoră</h2>
      <p>
        Niciuna dintre părți nu va fi răspunzătoare pentru neexecutarea
        obligațiilor sale contractuale, dacă o astfel de neexecutare este
        datorată unui eveniment de forță majoră, așa cum este definit de legea
        română (ex: pandemii, catastrofe naturale, războaie, greve, căderi
        generale ale infrastructurii terțe de internet/cloud).
      </p>

      <h2>10. Soluționarea Litigiilor și Legea Aplicabilă</h2>
      <p>
        Prezentul contract este supus legislației din România. Orice litigii
        apărute între EVEM și clienți vor fi soluționate, în primul rând, pe
        cale amiabilă. În cazul în care acest lucru nu este posibil, litigiul va
        fi soluționat de instanțele judecătorești competente din București.
      </p>
      <p>
        În plus, pentru rezolvarea extrajudiciară a disputelor, ai la dispoziție
        platforma europeană de{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--royal-violet)] font-bold hover:underline"
        >
          Soluționare Online a Litigiilor (SOL)
        </a>{" "}
        sau te poți adresa{" "}
        <a
          href="https://anpc.ro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--royal-violet)] font-bold hover:underline"
        >
          Autorității Naționale pentru Protecția Consumatorilor (ANPC)
        </a>
        .
      </p>

      <h2>11. Actualizarea Termenilor</h2>
      <p>
        EVEM își rezervă dreptul de a modifica acești Termeni și Condiții în
        orice moment. Modificările vor intra în vigoare imediat la publicarea pe
        site, însă comenzile vor fi guvernate de versiunea T&C valabilă la
        momentul exact al finalizării acestora.
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
