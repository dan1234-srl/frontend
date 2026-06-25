import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const ReturnPolicy = () => {
  useEffect(() => {
    document.title = "Politică de Retur · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Politica de Retur și Anulare"
      updated="25 iunie 2026"
    >
      <p>
        La <strong>EVEM</strong> (administrat de{" "}
        <strong>Tufan Logistic Expert SRL</strong>), ne dorim să fii pe deplin
        mulțumit de achizițiile tale. Totuși, dacă te răzgândești, politica
        noastră de retur este simplă, transparentă și construită în strictă
        conformitate cu prevederile <strong>O.U.G. nr. 34/2014</strong> privind
        drepturile consumatorilor.
      </p>

      <h2>1. Dreptul de retragere (Returul în 14 zile)</h2>
      <p>
        În calitate de consumator (persoană fizică), ai dreptul legal de a te
        retrage din contractul de vânzare-cumpărare la distanță, fără a fi
        nevoit să justifici decizia de retragere și fără a suporta alte costuri
        decât cele de transport, în termen de{" "}
        <strong>14 zile calendaristice</strong>, calculate începând cu ziua în
        care tu sau o terță parte indicată de tine ați intrat în posesia fizică
        a produselor.
      </p>
      <p>
        <em>
          Notă: Persoanele juridice (CUI/CIF) nu beneficiază de dreptul legal de
          retragere în 14 zile, conform legii, însă încercăm să găsim soluții
          amiabile în funcție de situație.
        </em>
      </p>

      <h2>2. Condiții de acceptare a returului</h2>
      <p>
        Pentru a putea fi returnat, produsul trebuie să îndeplinească
        următoarele condiții:
      </p>
      <ul>
        <li>
          Să fie în aceeași stare în care a fost livrat: nepurtat, nespălat,
          fără urme de utilizare sau deteriorare, fără mirosuri improprii
          (parfum, fum de țigară etc.).
        </li>
        <li>
          Să aibă toate etichetele originale atașate și sigiliile intacte (acolo
          unde este cazul).
        </li>
        <li>Să fie însoțit de toate accesoriile cu care a fost livrat.</li>
      </ul>
      <p>
        <strong>Diminuarea valorii produselor:</strong> Conform art. 14 alin. 3
        din O.U.G. nr. 34/2014, consumatorul este responsabil doar pentru
        diminuarea valorii produselor care rezultă din manipulări, altele decât
        cele necesare pentru determinarea naturii, calităților și funcționării
        produselor. Dacă produsul returnat prezintă semne clare de uzură, ne
        rezervăm dreptul de a reține o sumă din valoarea acestuia pentru a
        acoperi deprecierea (până la 100% din valoare dacă produsul devine
        nevandabil).
      </p>

      <h2>3. Excepții de la dreptul de retur</h2>
      <p>
        Sunt exceptate de la dreptul de retragere din contract (nu pot fi
        returnate), conform legislației în vigoare:
      </p>
      <ul>
        <li>
          Produsele confecționate după specificațiile prezentate de consumator
          sau personalizate în mod clar.
        </li>
        <li>
          Produsele sigilate care nu pot fi returnate din motive de protecție a
          sănătății sau din motive de igienă și care au fost desigilate de
          consumator (ex: lenjerie intimă, costume de baie, cosmetice
          desigilate).
        </li>
        <li>
          Produse care sunt, după livrare, potrivit naturii acestora,
          inseparabil amestecate cu alte elemente.
        </li>
      </ul>

      <h2>4. Procedura de retur (Pas cu Pas)</h2>
      <p>Am digitalizat procesul pentru a fi cât mai simplu:</p>
      <ol>
        <li>
          <strong>Cererea RMA:</strong> Autentifică-te în contul tău de pe EVEM,
          accesează secțiunea „Comenzile mele”, alege comanda dorită și apasă pe
          butonul <strong>„Cere Retur”</strong>.
        </li>
        <li>
          <strong>Aprobarea:</strong> Vom analiza cererea ta. Odată aprobată
          (status PENDING/APPROVED), vei fi instruit cu privire la predarea
          coletului către firma de curierat (GLS România).
        </li>
        <li>
          <strong>Expedierea:</strong> Ambalează produsul corespunzător pentru a
          nu se deteriora în timpul transportului. Predă coletul curierului în
          maximum <strong>14 zile</strong> de la notificarea deciziei de retur.
        </li>
      </ol>

      <h2>5. Costurile de transport</h2>
      <ul>
        <li>
          <strong>Retur standard (răzgândire):</strong> Costul transportului
          pentru returnarea produsului va fi suportat integral de către tine
          (consumator). Dacă alegi ca noi să emitem AWB-ul de retur, costul
          transportului de retur va fi dedus din suma finală ce urmează a fi
          rambursată.
        </li>
        <li>
          <strong>Produs defect / Livrare greșită:</strong> Dacă produsul primit
          prezintă defecte de fabricație sau este diferit de cel comandat, EVEM
          va suporta integral costurile de transport pentru retur și înlocuire.
        </li>
      </ul>

      <h2>6. Procedura de Rambursare</h2>
      <p>
        Rambursarea contravalorii produsului va fi procesată în termen de maxim{" "}
        <strong>14 zile calendaristice</strong> de la data la care suntem
        informați de decizia ta de retragere, cu condiția recepționării
        produsului în depozitul nostru sau a primirii unei dovezi clare a
        expedierii.
      </p>
      <p>Modalități de rambursare:</p>
      <ul>
        <li>
          <strong>
            Pentru comenzile plătite online cu cardul (prin Stripe):
          </strong>{" "}
          Rambursarea se va efectua automat în același cont / pe același card
          utilizat la tranzacția inițială.
        </li>
        <li>
          <strong>Pentru comenzile plătite la livrare (Ramburs / COD):</strong>{" "}
          Suma va fi rambursată prin transfer bancar. În formularul de retur, va
          trebui să ne furnizezi un cont IBAN valid în RON și numele titularului
          de cont.
        </li>
      </ul>
      <p>
        <em>
          Costurile livrării inițiale vor fi rambursate doar în cazul în care se
          returnează întreaga comandă, la valoarea livrării standard (nu se
          rambursează costurile suplimentare pentru livrări express speciale).
        </em>
      </p>

      <h2>7. Date de Contact și Soluționarea Litigiilor</h2>
      <p>
        Departamentul nostru este aici pentru a te ajuta cu orice nelămurire:
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
          <strong>Adresă:</strong> Prelungirea Ghencea 124D, Sector 6, București
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:daniel.tufan@consultant.com"
            className="font-bold text-[var(--royal-violet)] hover:underline"
          >
            daniel.tufan@consultant.com
          </a>
        </li>
        <li>
          <strong>Telefon:</strong> +40 735 928 664
        </li>
      </ul>
      <p>
        Dacă întâmpini o problemă care nu a putut fi rezolvată amiabil cu echipa
        noastră, ai posibilitatea de a te adresa{" "}
        <strong>
          Autorității Naționale pentru Protecția Consumatorilor (ANPC)
        </strong>{" "}
        sau poți folosi platforma europeană de{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--royal-violet)] hover:underline font-bold"
        >
          Soluționare Online a Litigiilor (SOL)
        </a>
        .
      </p>
    </LegalLayout>
  );
};

export default ReturnPolicy;
