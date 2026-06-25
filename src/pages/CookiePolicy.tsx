import { useEffect } from "react";
import LegalLayout from "../components/legal/LegalLayout";

const CookiePolicy = () => {
  useEffect(() => {
    document.title = "Politică de Cookie-uri · EVEM";
  }, []);

  return (
    <LegalLayout
      eyebrow="Documente Legale"
      title="Politică de Cookie-uri și Tehnologii de Stocare"
      updated="25 iunie 2026"
    >
      <p>
        Această politică explică modul în care <strong>EVEM</strong> (platformă
        deținută și operată de <strong>Tufan Logistic Expert SRL</strong>)
        utilizează cookie-uri și tehnologii similare (cum ar fi{" "}
        <em>Local Storage</em> și <em>Session Storage</em>) pentru a-ți oferi o
        experiență de navigare rapidă, sigură și personalizată.
      </p>
      <p>
        Documentul este redactat în conformitate cu prevederile{" "}
        <strong>Regulamentului (UE) 2016/679 (GDPR)</strong> și ale{" "}
        <strong>Directivei 2002/58/CE (Directiva ePrivacy)</strong>.
      </p>

      <h2>1. Ce sunt cookie-urile și tehnologiile similare?</h2>
      <p>
        <strong>Cookie-urile</strong> sunt fișiere text de mici dimensiuni pe
        care un site web le salvează pe calculatorul sau dispozitivul tău mobil
        atunci când îl vizitezi.
      </p>
      <p>
        Pe lângă cookie-urile tradiționale, platforma noastră modernă utilizează
        și tehnologii de stocare specifice browserului web (
        <strong>Local Storage</strong> și <strong>Session Storage</strong>).
        Acestea ne permit să salvăm date esențiale direct în browserul tău
        pentru o performanță ridicată (ex: salvarea temporară a produselor în
        „Lista de dorințe” atunci când nu ești autentificat).
      </p>

      <h2>2. Ce tipuri de tehnologii folosim și de ce?</h2>
      <p>
        Clasificăm tehnologiile noastre de stocare în următoarele categorii:
      </p>

      <h3>A. Strict Necesare (Esențiale)</h3>
      <p>
        Aceste tehnologii sunt vitale pentru funcționarea corectă a site-ului și
        nu pot fi dezactivate din sistemele noastre. Nu necesită consimțământul
        tău prealabil. Le folosim pentru:
      </p>
      <ul>
        <li>
          <strong>Autentificare și Securitate:</strong> Păstrarea sesiunii tale
          active (prin token-uri JWT) și prevenirea atacurilor cibernetice
          (CSRF/XSS).
        </li>
        <li>
          <strong>Gestionarea Coșului de Cumpărături:</strong> Memorarea
          produselor adăugate în coș pe durata sesiunii de navigare.
        </li>
        <li>
          <strong>Procesarea Plăților (Stripe):</strong> Partenerul nostru de
          plăți, Stripe, plasează cookie-uri strict necesare pentru detectarea
          fraudelor financiare și procesarea securizată a tranzacțiilor (conform
          standardelor PCI-DSS).
        </li>
      </ul>

      <h3>B. Funcționalitate și Preferințe</h3>
      <p>
        Acestea permit site-ului să memoreze alegerile pe care le faci, pentru
        a-ți oferi funcționalități personalizate. Dacă nu accepți aceste
        tehnologii, anumite servicii s-ar putea să nu funcționeze corect.
      </p>
      <ul>
        <li>
          <strong>Lista de Dorințe (Wishlist):</strong> Folosim{" "}
          <code>localStorage</code> pentru a păstra produsele favorite (chiar și
          ca vizitator / guest) astfel încât să nu le pierzi la închiderea
          paginii.
        </li>
        <li>
          <strong>Filtre de căutare:</strong> Reținerea preferințelor tale de
          filtrare și ordonare a produselor.
        </li>
      </ul>

      <h3>C. Analitice și de Performanță</h3>
      <p>
        Ne ajută să înțelegem modul în care vizitatorii interacționează cu
        site-ul (ex: cele mai vizitate pagini, timpul petrecut pe site, erorile
        întâlnite). Toate datele colectate de aceste cookie-uri sunt agregate
        și, prin urmare, anonime.
      </p>

      <h3>D. Marketing și Publicitate</h3>
      <p>
        Aceste cookie-uri sunt setate de partenerii noștri de publicitate (ex:
        Google, Meta). Ele sunt folosite pentru a-ți construi un profil de
        interese și a-ți afișa reclame relevante pe alte site-uri. Acestea
        funcționează prin identificarea unică a browserului și a dispozitivului
        tău. Sunt activate <strong>doar</strong> cu consimțământul tău explicit.
      </p>

      <h2>3. Cookie-uri plasate de Terți (Third-Party)</h2>
      <p>
        Pentru a-ți oferi servicii premium, integrăm soluții externe care pot
        plasa propriile cookie-uri sau tehnologii de stocare:
      </p>
      <ul>
        <li>
          <strong>Stripe:</strong> Pentru securitatea plăților și detecția
          fraudelor (module esențiale).
        </li>
        <li>
          <strong>Servicii de curierat (GLS):</strong> Pentru integrarea
          hărților de Lockere și statusul expedierilor.
        </li>
        <li>
          <strong>Furnizori de Analytics/Reclame:</strong> (ex. Google
          Analytics, Facebook Pixel) - doar dacă ți-ai exprimat acordul.
        </li>
      </ul>

      <h2>4. Durata de stocare</h2>
      <p>Durata de viață a acestor tehnologii variază:</p>
      <ul>
        <li>
          <strong>De sesiune:</strong> Sunt șterse automat imediat ce închizi
          browserul web.
        </li>
        <li>
          <strong>Persistente:</strong> Rămân pe dispozitivul tău o perioadă
          prestabilită (de la câteva zile până la maximum 2 ani) sau până când
          le ștergi manual din setările browserului ori folosești opțiunea de
          "Clear Data" a site-ului.
        </li>
      </ul>

      <h2>5. Cum poți controla sau șterge cookie-urile?</h2>
      <p>
        Ai control total asupra tehnologiilor non-esențiale (Analitice și de
        Marketing) prin intermediul panoului nostru de setări de cookie-uri,
        afișat la prima vizită (sau accesibil din subsolul paginii).
      </p>
      <p>
        Adițional, poți seta browserul să blocheze toate cookie-urile sau să te
        avertizeze când sunt plasate. Iată cum poți face acest lucru pe cele mai
        populare browsere:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--royal-violet)] hover:underline font-medium"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--royal-violet)] hover:underline font-medium"
          >
            Apple Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--royal-violet)] hover:underline font-medium"
          >
            Mozilla Firefox
          </a>
        </li>
      </ul>
      <p>
        <em>
          Atenție: Blocarea cookie-urilor sau a tehnologiilor de stocare strict
          necesare poate duce la imposibilitatea autentificării sau a
          finalizării comenzilor pe site-ul EVEM.
        </em>
      </p>

      <h2>6. Date de Contact Operator</h2>
      <p>Site-ul EVEM este deținut de:</p>
      <ul className="not-prose space-y-1 mb-6 text-sm text-zinc-700">
        <li>
          <strong>Tufan Logistic Expert SRL</strong>
        </li>
        <li>
          <strong>CUI:</strong> RO51574431
        </li>
        <li>
          <strong>Reg. Com.:</strong> J2025024172009
        </li>
        <li>
          <strong>Sediul social:</strong> Prelungirea Ghencea 124D, Sector 6,
          București
        </li>
      </ul>
      <p>
        Pentru orice solicitare legată de preferințele tale privind cookie-urile
        sau prelucrarea datelor cu caracter personal, ne poți contacta la:
      </p>
      <ul>
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
    </LegalLayout>
  );
};

export default CookiePolicy;
