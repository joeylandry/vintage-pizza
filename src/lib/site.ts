export const SITE = {
  name: "Vintage Pizza",
  tagline: "Best Pizza · Best Tenders · Best Wings",
  street: "241 Candia Rd",
  city: "Manchester",
  state: "NH",
  zip: "03109",
  phone: "(603) 518-7800",
  phoneHref: "tel:+16035187800",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Vintage+Pizza+241+Candia+Rd+Manchester+NH+03109",
  mapsEmbed: "https://www.google.com/maps?q=Vintage+Pizza,+241+Candia+Rd,+Manchester,+NH+03109&output=embed",
  pdfMenu: "https://www.vintagepizzanh.com/s/MENU-SEPT-2025.pdf",
  founded: 2014,
} as const;

export const fullAddress = `${SITE.street}, ${SITE.city}, ${SITE.state} ${SITE.zip}`;
