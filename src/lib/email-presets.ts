/**
 * Luxury email design presets for Unlayer (react-email-editor).
 * Each preset returns a Unlayer JSON design ready for `loadDesign()`.
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
    subject: "Bun venit la Evem, {{customerName}}",
    description: "Email de bun venit trimis automat după înregistrare.",
    category: "auth",
  },
  {
    id: "forgot-password",
    name: "Resetare parolă",
    event_name: "password_reset",
    subject: "Resetează parola contului tău Evem",
    description: "Link securizat pentru resetarea parolei.",
    category: "auth",
  },
  {
    id: "two-factor",
    name: "Cod 2FA",
    event_name: "two_factor_code",
    subject: "Codul tău Evem: {{code}}",
    description: "Cod de verificare 2FA cu valabilitate limitată.",
    category: "auth",
  },
  // --- EVENIMENTE COMENZI (Sincronizate cu Backend-ul) ---
  {
    id: "order-received",
    name: "1. Comandă primită (Plasată de client)",
    event_name: "order_received",
    subject: "Am primit comanda ta #{{orderNumber}}",
    description: "Trimis imediat după checkout. Comanda e în așteptare.",
    category: "order",
  },
  {
    id: "admin-order-notification",
    name: "Notificare Admin (Comandă Nouă)",
    event_name: "admin_order_notification",
    subject: "🚨 Comandă Nouă: #{{orderNumber}}",
    description:
      "Notificare internă pentru administrator la plasarea unei comenzi noi.",
    category: "order",
  },
  {
    id: "order-confirmed",
    name: "2. Comandă Confirmată (de Admin)",
    event_name: "order_confirmed_by_admin",
    subject: "Comanda #{{orderNumber}} a fost confirmată",
    description: "Trimis când adminul aprobă comanda. Se atașează PROFORMA.",
    category: "order",
  },
  {
    id: "order-shipped",
    name: "3. Comandă Expediată (AWB Generat)",
    event_name: "order_shipped",
    subject: "Comanda #{{orderNumber}} este pe drum",
    description: "Notificare cu AWB, tracking și sumar produse.",
    category: "order",
  },
  {
    id: "order-delivered",
    name: "4. Comandă Livrată (Webhook GLS)",
    event_name: "order_delivered",
    subject: "Comanda #{{orderNumber}} a fost livrată",
    description: "Confirmare livrare trimisă automat. Se atașează FACTURA.",
    category: "order",
  },
  {
    id: "order-rejected",
    name: "Comandă Respinsă/Anulată",
    event_name: "order_rejected",
    subject: "Actualizare privind comanda #{{orderNumber}}",
    description: "Trimis când adminul respinge comanda.",
    category: "order",
  },
  // --- MARKETING ---
  {
    id: "newsletter",
    name: "Newsletter Promoțional",
    event_name: "marketing_newsletter",
    subject: "Descoperă noua colecție Evem ✨",
    description: "Template pentru lansări de produse sau oferte speciale.",
    category: "marketing",
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
    `<p style="text-align:center;font-family:Georgia,serif;font-size:32px;letter-spacing:0.4em;color:${deep};margin:0;font-weight:300;">Evem</p><p style="text-align:center;font-family:Arial;font-size:9px;letter-spacing:0.3em;color:${accent};margin:8px 0 0;text-transform:uppercase;font-weight:bold;">Luxury Jewelry</p>`,
    { paddingTop: "32px", paddingBottom: "24px" },
  );

  const divider = dividerBlock(deep);
  const footer = textBlock(
    `<p style="text-align:center;font-family:Arial;font-size:11px;color:#888;margin:0;">Evem Jewelry Inc. — București, România</p><p style="text-align:center;font-family:Arial;font-size:10px;color:#aaa;margin:8px 0 0;">Acest email a fost generat automat. Pentru asistență scrie la <a href="mailto:hello@Evem.ro" style="color:${accent};">hello@Evem.ro</a></p>`,
    { paddingTop: "32px", paddingBottom: "24px" },
  );

  // --- HTML INJECTAT PENTRU SUMARUL COMENZII (PRODUSE + TOTALURI) ---
  const orderSummaryHtml = `
    {% if items %}
    <div style="margin-top: 8px; margin-bottom: 16px;">
        <h3 style="font-family: Georgia, serif; font-size: 18px; color: ${deep}; margin-bottom: 12px; font-weight: normal; border-bottom: 1px solid #eee; padding-bottom: 8px;">Produse comandate</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #555;">
            {% for item in items %}
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;" width="60" valign="middle">
                    <img src="{{item.image_url}}" width="50" style="display: block; border-radius: 4px; border: 1px solid #eee; max-height: 50px;" alt="{{item.name}}" />
                </td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; vertical-align: middle;" valign="middle">
                    <strong style="color: ${deep}; font-size: 13px;">{{item.name}}</strong><br/>
                    <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Cantitate: {{item.quantity}}</span>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: ${deep}; vertical-align: middle; white-space: nowrap;" valign="middle">
                    {{item.price}}
                </td>
            </tr>
            {% endfor %}
        </table>
    </div>
    {% endif %}

    {% if totalAmount %}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #555; margin-bottom: 24px;">
        <tr>
            <td style="padding: 4px 0;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right;">{{subtotalAmount}}</td>
        </tr>
        <tr>
            <td style="padding: 4px 0;">Transport:</td>
            <td style="padding: 4px 0; text-align: right;">{{shippingFee}}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; font-weight: bold; font-size: 16px; color: ${deep}; border-top: 1px solid #eee;">TOTAL:</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 16px; color: ${deep}; text-align: right; border-top: 1px solid #eee;">{{totalAmount}}</td>
        </tr>
    </table>
    {% endif %}
    
    {% if shippingAddress %}
    <div style="margin-bottom: 32px; padding: 16px; background-color: #fafaf7; border: 1px solid #eee; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Adresă de livrare</h4>
        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5;">{{shippingAddress}}</p>
    </div>
    {% endif %}
  `;

  const presets: Record<string, any[]> = {
    // --- AUTENTIFICARE ---
    welcome: [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:42px;color:${deep};margin:0;font-weight:400;">Bun venit, {{customerName}}</h1>`,
        { paddingTop: "40px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Suntem onorați să te avem în comunitatea Evem. Bijuteriile noastre sunt create pentru a celebra momente unice. Descoperă colecțiile noastre și transformă-ți garderoba cu piese atemporale.</p>`,
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
        `<p style="text-align:center;font-family:Arial;font-size:11px;color:#999;">Nu împărtăși acest cod cu nimeni. Echipa Evem nu îți va cere niciodată codul.</p>`,
      ),
      divider,
      footer,
    ],

    // --- COMENZI ---
    "order-received": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Mulțumim, {{customerName}}</h1><p style="text-align:center;font-family:Arial;font-size:11px;color:#888;letter-spacing:0.3em;text-transform:uppercase;margin:12px 0 0;font-weight:bold;">Comandă Primita</p>`,
        { paddingTop: "40px", paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:#fafaf7;padding:24px;text-align:center;border:1px solid #eee;"><p style="margin:0;font-family:Arial;font-size:11px;color:#888;letter-spacing:0.2em;text-transform:uppercase;">Număr comandă</p><p style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;color:${deep};font-style:italic;">#{{orderNumber}}</p></div>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<p style="font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Comanda ta a fost înregistrată cu succes și este <strong>în așteptarea confirmării</strong> de către echipa noastră. Te vom notifica pe email imediat ce o aprobăm.</p>`,
        { paddingBottom: "16px" },
      ),
      htmlBlock(orderSummaryHtml),
      buttonBlock("VEZI STAREA COMENZII", "{{orderUrl}}", accent),
      divider,
      footer,
    ],

    // NOU: Notificare internă pentru administrator
    "admin-order-notification": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Comandă Nouă!</h1>`,
        { paddingTop: "40px", paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:${soft}1A;padding:24px;text-align:center;border:1px solid ${accent};">
            <p style="margin:0;font-family:Arial;font-size:11px;color:#888;letter-spacing:0.2em;text-transform:uppercase;">Identificator Comandă</p>
            <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;color:${deep};font-weight:bold;">#{{orderNumber}}</p>
        </div>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;border-left:3px solid ${accent};padding-left:16px;">
            <p style="margin:0 0 8px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;font-weight:bold;">Detalii Client</p>
            <strong>Nume:</strong> {{customerName}}<br/>
            <strong>Email:</strong> <a href="mailto:{{customerEmail}}" style="color:${accent};">{{customerEmail}}</a><br/>
            <strong>Telefon:</strong> <a href="tel:{{customerPhone}}" style="color:${accent};">{{customerPhone}}</a>
        </div>`,
        { paddingBottom: "16px" },
      ),
      htmlBlock(orderSummaryHtml),
      buttonBlock("VEZI ÎN PANOU", "{{orderUrl}}", accent),
      divider,
      footer,
    ],

    "order-confirmed": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Comandă Confirmată</h1>`,
        { paddingTop: "40px", paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:#fafaf7;padding:24px;text-align:center;border:1px solid #eee;"><p style="margin:0;font-family:Arial;font-size:11px;color:#888;letter-spacing:0.2em;text-transform:uppercase;">Număr comandă</p><p style="margin:8px 0 0;font-family:Georgia,serif;font-size:28px;color:${deep};font-style:italic;">#{{orderNumber}}</p></div>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<p style="font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Salut {{customerName}}, comanda ta a fost acceptată! Am început pregătirea produselor și vei primi detaliile de livrare în scurt timp. <strong>Factura Proformă este atașată acestui email.</strong></p>`,
        { paddingBottom: "16px" },
      ),
      htmlBlock(orderSummaryHtml),
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
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Salut {{customerName}}, comanda <strong>#{{orderNumber}}</strong> a fost predată curierului GLS și va ajunge la tine curând.</p>`,
        { paddingBottom: "24px" },
      ),
      textBlock(
        `<div style="background:${soft}1A;padding:24px;text-align:center;border-left:3px solid ${accent};"><p style="margin:0;font-family:Arial;font-size:11px;color:${deep};letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">AWB Curier</p><p style="margin:8px 0 0;font-family:'Courier New',monospace;font-size:20px;color:${deep};font-weight:bold;">{{awbNumber}}</p></div>`,
        { paddingBottom: "16px" },
      ),
      htmlBlock(orderSummaryHtml),
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
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Salut {{customerName}}, coletul aferent comenzii <strong>#{{orderNumber}}</strong> a fost livrat cu succes.<br/><strong>Factura fiscală este atașată acestui email.</strong> Sperăm să te bucuri de fiecare detaliu!</p>`,
        { paddingBottom: "16px" },
      ),
      htmlBlock(orderSummaryHtml),
      buttonBlock("VEZI DETALII COMANDĂ", "{{orderUrl}}", accent),
      divider,
      footer,
    ],

    "order-rejected": [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:#D32F2F;margin:0;font-weight:400;">Comandă Anulată</h1>`,
        { paddingTop: "40px", paddingBottom: "16px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Salut {{customerName}}, din păcate comanda <strong>#{{orderNumber}}</strong> a fost anulată.</p>`,
        { paddingBottom: "16px" },
      ),
      textBlock(
        `<div style="background:#FFF3F3;padding:16px;text-align:center;border-left:3px solid #D32F2F;"><p style="margin:0;font-family:Arial;font-size:13px;color:#D32F2F;"><strong>Motivul anulării:</strong><br/>{{reason}}</p></div>`,
        { paddingBottom: "32px" },
      ),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;">Dacă o plată cu cardul a fost efectuată, aceasta va fi rambursată automat în contul tău în următoarele zile lucrătoare.</p>`,
        { paddingBottom: "32px" },
      ),
      divider,
      footer,
    ],

    // --- MARKETING ---
    newsletter: [
      headerLogo,
      textBlock(
        `<h1 style="text-align:center;font-family:Georgia,serif;font-style:italic;font-size:36px;color:${deep};margin:0;font-weight:400;">Colecția Nouă</h1>`,
        { paddingTop: "40px", paddingBottom: "24px" },
      ),
      imageBlock("https://via.placeholder.com/600x400?text=Imagine+Campanie"),
      textBlock(
        `<p style="text-align:center;font-family:Arial;font-size:14px;color:#555;line-height:1.7;max-width:480px;margin:0 auto;">Am pregătit ceva special pentru tine. Descoperă piesele noi care definesc luxul și eleganța în acest sezon.</p>`,
        { paddingTop: "24px", paddingBottom: "32px" },
      ),
      buttonBlock("VEZI NOUTĂȚILE", "{{shopUrl}}", accent),
      divider,
      footer,
    ],
  };

  const contents = presets[presetId] || presets["welcome"];

  return {
    counters: {
      u_row: contents.length,
      u_column: contents.length,
      u_content_text: contents.length,
      u_content_button: 1,
      u_content_html: contents.filter((c) => c.type === "html").length,
    },
    body: {
      id: "luxury-body",
      rows: contents.map((c, i) => ({
        id: `row-${i}`,
        cells: [1],
        columns: [
          {
            id: `col-${i}`,
            contents: [c],
            values: {
              _meta: { htmlID: `u_column_${i}`, htmlClassNames: "u_column" },
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
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
        popupBackgroundImage: {
          url: "",
          fullWidth: true,
          repeat: "no-repeat",
          size: "cover",
          position: "center",
        },
        popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
        popupCloseButton_position: "top-right",
        popupCloseButton_backgroundColor: "#DDDDDD",
        popupCloseButton_iconColor: "#000000",
        popupCloseButton_borderRadius: "0px",
        popupCloseButton_margin: "0px",
        popupCloseButton_action: {
          name: "close_popup",
          attrs: {
            onClick:
              "document.querySelector('.u-popup-container').style.display = 'none';",
          },
        },
        backgroundColor: bg,
        backgroundImage: {
          url: "",
          fullWidth: true,
          repeat: "no-repeat",
          size: "custom",
          position: "center",
        },
        preheaderText: "",
        linkStyle: {
          body: true,
          linkColor: accent,
          linkHoverColor: deep,
          linkUnderline: true,
          linkHoverUnderline: true,
        },
        _meta: { htmlID: "u_body", htmlClassNames: "u_body" },
      },
    },
    schemaVersion: 12,
  };
}

/* -------- helpers -------- */

function htmlBlock(html: string) {
  return {
    type: "html",
    values: {
      html: html,
      containerPadding: "0px 32px 16px 32px",
      anchor: "",
      hideDesktop: false,
      displayCondition: null,
      _meta: {
        htmlID: `u_content_html_${Math.random().toString(36).slice(2, 8)}`,
        htmlClassNames: "u_content_html",
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
    },
  };
}

function textBlock(
  html: string,
  padding: { paddingTop?: string; paddingBottom?: string } = {},
) {
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
      linkStyle: {
        inherit: true,
        linkColor: "#0000ee",
        linkHoverColor: "#0000ee",
        linkUnderline: true,
        linkHoverUnderline: true,
      },
      hideDesktop: false,
      displayCondition: null,
      _meta: {
        htmlID: `u_content_text_${Math.random().toString(36).slice(2, 8)}`,
        htmlClassNames: "u_content_text",
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
      text: html,
    },
  };
}

function imageBlock(url: string) {
  return {
    type: "image",
    values: {
      containerPadding: "10px",
      anchor: "",
      src: { url, width: "auto", height: "auto" },
      textAlign: "center",
      altText: "Imagine Campanie",
      action: {
        name: "web",
        values: { href: "{{shopUrl}}", target: "_blank" },
      },
      hideDesktop: false,
      _meta: {
        htmlID: `u_content_image_${Math.random().toString(36).slice(2, 8)}`,
        htmlClassNames: "u_content_image",
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
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
      buttonColors: {
        color: "#FFFFFF",
        backgroundColor: color,
        hoverColor: "#FFFFFF",
        hoverBackgroundColor: color,
      },
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
      _meta: {
        htmlID: `u_content_button_${Math.random().toString(36).slice(2, 8)}`,
        htmlClassNames: "u_content_button",
      },
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
      border: {
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: color,
      },
      textAlign: "center",
      containerPadding: "24px 32px",
      anchor: "",
      hideDesktop: false,
      displayCondition: null,
      _meta: {
        htmlID: `u_content_divider_${Math.random().toString(36).slice(2, 8)}`,
        htmlClassNames: "u_content_divider",
      },
      selectable: true,
      draggable: true,
      duplicatable: true,
      deletable: true,
      hideable: true,
    },
  };
}
