interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ContentSection = ({
  title,
  children,
  className = "",
}: ContentSectionProps) => {
  return (
    <section className={`py-12 md:py-16 border-b border-border last:border-0 ${className}`}>
      {title && (
        <h2 className="heading-serif text-2xl md:text-4xl font-light text-foreground mb-8 md:mb-10">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default ContentSection;
