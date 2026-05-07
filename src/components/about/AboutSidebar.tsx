import { NavLink } from "react-router-dom";

const aboutPages = [
  { name: "Our Story", path: "/about/our-story" },
  { name: "Sustainability", path: "/about/sustainability" },
  { name: "Size Guide", path: "/about/size-guide" },
  { name: "Customer Care", path: "/about/customer-care" },
  { name: "Store Locator", path: "/about/store-locator" },
];

const AboutSidebar = () => {
  return (
    <aside className="w-64 sticky top-32 h-fit pr-8">
      <p className="label-luxury mb-6">The Maison</p>
      <nav className="space-y-1 border-l border-border">
        {aboutPages.map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            className={({ isActive }) =>
              `block py-2.5 pl-5 -ml-px text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ease-luxury border-l ${
                isActive
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border-strong"
              }`
            }
          >
            {page.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AboutSidebar;
