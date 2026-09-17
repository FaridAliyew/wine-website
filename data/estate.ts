// Domaine Auris is a fictional estate made for a design portfolio; every detail here is invented.

export const ESTATE = {
  name: "Domaine Auris",
  location: "Tovuz, Azerbaijan",
  address: ["Domaine Auris", "Tovuz", "Azerbaijan"],
  phone: "+994 00 000 00 00",
  hours: ["Tuesday – Saturday", "10:00 – 18:00, by appointment"],
};

export const DEPARTMENTS = [
  {
    id: "general",
    title: "General Enquiries",
    note: "Questions about our wines and the estate.",
    email: "hello@domaineauris.com",
  },
  {
    id: "allocations",
    title: "Private Allocations",
    note: "Reserve numbered bottles from upcoming vintages.",
    email: "allocations@domaineauris.com",
  },
  {
    id: "visits",
    title: "Estate Visits",
    note: "Tastings and cellar tours, by appointment.",
    email: "visits@domaineauris.com",
  },
  {
    id: "trade",
    title: "Trade & Press",
    note: "Importers, restaurants and media.",
    email: "trade@domaineauris.com",
  },
] as const;

export function departmentEmail(id: (typeof DEPARTMENTS)[number]["id"]) {
  return DEPARTMENTS.find((department) => department.id === id)!.email;
}
