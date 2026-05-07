interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <header className="py-12 md:py-20 border-b border-border">
      <p className="label-luxury mb-4">Linea Maison</p>
      <h1 className="heading-serif text-4xl md:text-6xl text-foreground font-light mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
