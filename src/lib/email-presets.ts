/**
 * Luxury email design presets for Unlayer (react-email-editor).
 * Each preset returns a Unlayer JSON design ready for `loadDesign()`.
 *
 * Brand colors are passed in at runtime so emails always match the active theme.
 */

export interface EmailPreset {
  id: string;
  name: string;
  event_name: string;
  subject: string;
  description: string;
  category: "auth" | "order" | "marketing";
}

export const EMAIL_PRESETS: EmailPreset[] = [
  {
    id: "welcome",
    name: "Bun venit (creare cont)",
    event_name: "user_welcome",
    subject: "Bun venit la Linea, {{customerName}}",
    description: "Email de bun venit trimis automat după înregistrare.",
    category: "auth",
  },
  {
    id: "forgot-password",
    name: "Resetare parolă",
    event_name: "password_reset",
    subject: "Resetează parola contului tău Linea",
    description: "Link securizat pentru resetarea parolei.",
    category: "auth",
  },
  {
    id: "two-factor",
    name: "Cod 2FA",
    event_name: "two_factor_code",
    subject: "Codul tău Linea: {{code}}",
    description: "Cod de verificare 2FA cu valabilitate limitată.",
    category: "auth",
  },
  {
    id: "order-confirmation",
    name: "Confirmare comandă",
    event_name: "order_confirmation",
    subject: "Comanda #{{orderNumber}} — confirmată",
    description:
      "Trimis automat după plasarea unei comenzi. Include detalii și total.",
    category: "order",
  },
  {
    id: "order-shipped",
    name: "Comandă expediată",
    event_name: "order_shipped",
    subject: "Comanda #{{orderNumber}} este pe drum",
    description: "Notificare cu AWB și link de tracking.",
    category: "order",
  },
  {
    id: "order-delivered",
    name: "Comandă livrată",
    event_name: "order_delivered",
    subject: "Comanda #{{orderNumber}} a fost livrată",
    description: "Confirmare livrare + invitație review.",
    category: "order",
  },
];

/**
 * Builds an Unlayer design JSON for the given preset, themed with brand colors.
 */
export function buildPresetDesign(
  presetId: string,
  brand: {
    deep: string; // dark_amethyst
    accent: string; // royal_violet
    soft: string; // mauve_magic
    bg?: string; // surface_bg (default white)
  },
): any {
  const { deep, accent, soft } = brand;
  const bg = brand.bg || "#ffffff";

  // Shared building blocks
  const headerLogo = textBlock(
    `<p style="text-align:center;font-family:Georgia,serif;font-size:32px;letter-spacing:0.4em;color:${deep};margin:0;font-weight:300;">LINEA</p><p style="text-align:center;font-family:Arial;font-size:9px;letter-spacing:0.3em;color:${accent};margin:8px 0 0;text-transform:uppercase;font-weight:bold;">Luxury Jewelry</p>`,
    { paddingTop: "32px", paddingBottom: "24px" },
  );

  const divider = dividerBlock(deep);
  const footer = textBlock(
    `<p style="text-align:center;font-family:Arial;font-size:11px;color:#888;margin:0;">Linea Jewelry Inc. — București, România</p><p style="text-align:center;font-family:Arial;font-size:10px;color:#aaa;margin:8px 0 0;">Acest email a fost generat automat. Pentru asistență scrie la <a href="mailto:hello@linea.ro" style="color:${accent};">hello@linea.ro</a></p>`,
    { paddingTop: "32px", paddingBottom: "24px" },
  );

  const presets: Record<string, any[]> = {
    welcome: [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:42px;color:${deep};margin:0;font-weight:400;">Bun venit, {{customerName}}</h1>`,
        { paddingTop: "40px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Suntem onorați să te avem în comunitatea Linea. Bijuteriile noastre sunt create pentru a celebra momente unice. Descoperă colecțiile noastre și transformă-ți garderoba cu piese atemporale.</p>`,
        { paddingBottom: "32px" },
      ),
      buttonBlock("DESCOPERĂ COLECȚIA", "{{shopUrl}}", accent),
      divider,
      footer,
    ],

    "forgot-password": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Resetare parolă</h1>`,
        { paddingTop: "32px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Salut {{customerName}},<br/><br/>Am primit o cerere de resetare a parolei pentru contul tău. Apasă butonul de mai jos pentru a alege o parolă nouă. Linkul este valabil <strong>60 de minute</strong>.</p>`,
        { paddingBottom: "32px" },
      ),
      buttonBlock("RESETEAZĂ PAROLA", "{{resetUrl}}", accent),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:11px;color:#999;margin-top:24px;">Dacă nu ai cerut această resetare, ignoră emailul. Parola contului tău rămâne neschimbată.</p>`,
        { paddingTop: "24px" },
      ),
      divider,
      footer,
    ],

    "two-factor": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Cod de verificare</h1>`,
        { paddingTop: "32px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Folosește codul de mai jos pentru a finaliza autentificarea. Valabil <strong>10 minute</strong>.</p>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:${bg};border:2px solid ${deep};padding:32px;text-align:center;font-family:'Courier New',monospace;font-size:42px;letter-spacing:0.6em;color:${deep};font-weight:bold;margin:0 auto;max-width:320px;">{{code}}</div>`,
        { paddingBottom: "32px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:11px;color:#999;">Nu împărtăși acest cod cu nimeni. Echipa Linea nu îți va cere niciodată codul.</p>`,
      ),
      divider,
      footer,
    ],

    "order-confirmation": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Mulțumim, {{customerName}}</h1><p style="text-align:center;font-family:Arial;font-size:11px;color:${accent};letter-spacing:0.3em;text-transform:uppercase;margin:12px 0 0;font-weight:bold;">Comandă confirmată</p>`,
        { paddingTop: "40px", paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:#fafaf7;padding:24px;text-align:center;border:1px solid #eee;"><p style="margin:0;font-family:Arial;font-size:11px;color:#888;letter-spacing:0.2em;text-transform:uppercase;">Număr comandă</p><p style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;color:${deep};font-style:italic;">#{{orderNumber}}</p></div>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<p style="font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Comanda ta este în procesare și va fi pregătită cu grijă în următoarele 24-48h. Vei primi un email cu numărul de tracking imediat ce comanda va fi expediată.</p><p style="font-family:Arial;font-size:14px;color:#555;line-height:1.7;margin-top:16px;"><strong>Total plată:</strong> {{totalAmount}}<br/><strong>Adresa livrare:</strong> {{shippingAddress}}</p>`,
        { paddingBottom: "32px" },
      ),
      buttonBlock("VEZI DETALII COMANDĂ", "{{orderUrl}}", accent),
      divider,
      footer,
    ],

    "order-shipped": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Comanda ta este pe drum</h1>`,
        { paddingTop: "40px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Salut {{customerName}}, comanda <strong>#{{orderNumber}}</strong> a fost expediată și va ajunge la tine în 1-3 zile lucrătoare.</p>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:${soft}1A;padding:24px;text-align:center;border-left:3px solid ${accent};"><p style="margin:0;font-family:Arial;font-size:11px;color:${deep};letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">AWB Curier</p><p style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:20px;color:${deep};font-weight:bold;">{{awbNumber}}</p></div>`,
        { paddingBottom: "32px" },
      ),
      buttonBlock("URMĂREȘTE COLETUL", "{{trackingUrl}}", accent),
      divider,
      footer,
    ],

    "order-delivered": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Comanda a ajuns la tine</h1>`,
        { paddingTop: "40px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Salut {{customerName}}, comanda <strong>#{{orderNumber}}</strong> a fost livrată cu succes.<br/>Sperăm să te bucuri de fiecare detaliu.</p>`,
        { paddingBottom: "32px" },
      ),
      buttonBlock("LASĂ UN REVIEW", "{{reviewUrl}}", accent),
      divider,
      footer,
    ],
  };

  const contents = presets[presetId] || presets["welcome"];

  return {
    counters: { u_row: contents.length, u_column: contents.length, u_content_text: contents.length, u_content_button: 1 },
    body: {
      id: "luxury-body",
      rows: contents.map((c, i) => ({
        id: `row-${i}`,
        cells: [1],
        columns: [
          {
            id: `col-${i}`,
            contents: [c],
            values: { _meta: { htmlID: `u_column_${i}`, htmlClassNames: "u_column" } },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "",
          backgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "custom", position: "center" },
          padding: "0px",
          anchor: "",
          hideDesktop: false,
          _meta: { htmlID: `u_row_${i}`, htmlClassNames: "u_row" },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideable: true,
        },
      })),
      values: {
        popupPosition: "center",
        popupWidth: "600px",
        popupHeight: "auto",
        borderRadius: "10px",
        contentAlign: "center",
        contentVerticalAlign: "center",
        contentWidth: "600px",
        fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        textColor: "#000000",
        popupBackgroundColor: bg,
        popupBackgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "cover", position: "center" },
        popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
        popupCloseButton_position: "top-right",
        popupCloseButton_backgroundColor: "#DDDDDD",
        popupCloseButton_iconColor: "#000000",
        popupCloseButton_borderRadius: "0px",
        popupCloseButton_margin: "0px",
        popupCloseButton_action: { name: "close_popup", attrs: { onClick: "document.querySelector('.u-popup-container').style.display = 'none';" } },
        backgroundColor: bg,
        backgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "custom", position: "center" },
        preheaderText: "",
        linkStyle: { body: true, linkColor: accent, linkHoverColor: deep, linkUnderline: true, linkHoverUnderline: true },
        _meta: { htmlID: "u_body", htmlClassNames: "u_body" },
      },
    },
    schemaVersion: 12,
  };
}

/* -------- helpers -------- */
function textBlock(html: string, padding: { paddingTop?: string; paddingBottom?: string } = {}) {
  return {
    type: "text",
    values: {
      containerPadding: `${padding.paddingTop || "16px"} 32px ${padding.paddingBottom || "16px"} 32px`,
      anchor: "",
      fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
      fontWeight: 400,
      fontSize: "14px",
      textAlign: "left",
      lineHeight: "160%",
      linkStyle: { inherit: true, linkColor: "#0000ee", linkHoverColor: "#0000ee", linkUnderline: true, linkHoverUnderline: true },
      hideDesktop: false,
      displayCondition: null,
      _meta: { htmlID: `u_content_text_${Math.random().toString(36).slice(2, 8)}`, htmlClassNames: "u_content_text" },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
      text: html,
    },
  };
}

function buttonBlock(text: string, href: string, color: string) {
  return {
    type: "button",
    values: {
      containerPadding: "16px 32px",
      anchor: "",
      href: { name: "web", values: { href, target: "_blank" } },
      buttonColors: { color: "#FFFFFF", backgroundColor: color, hoverColor: "#FFFFFF", hoverBackgroundColor: color },
      size: { autoWidth: false, width: "240px" },
      fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
      fontWeight: 700,
      fontSize: "11px",
      textAlign: "center",
      lineHeight: "120%",
      padding: "16px 24px",
      border: {},
      borderRadius: "0px",
      hideDesktop: false,
      displayCondition: null,
      _meta: { htmlID: `u_content_button_${Math.random().toString(36).slice(2, 8)}`, htmlClassNames: "u_content_button" },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
      text: `<span style="letter-spacing: 4px; line-height: 13.2px;">${text}</span>`,
      calculatedWidth: 240,
      calculatedHeight: 45,
    },
  };
}

function dividerBlock(color: string) {
  return {
    type: "divider",
    values: {
      width: "100%",
      border: { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: color },
      textAlign: "center",
      containerPadding: "24px 32px",
      anchor: "",
      hideDesktop: false,
      displayCondition: null,
      _meta: { htmlID: `u_content_divider_${Math.random().toString(36).slice(2, 8)}`, htmlClassNames: "u_content_divider" },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
    },
  };
}
