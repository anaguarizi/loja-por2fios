const Footer = () => (
  <footer className="bg-foreground py-10">
    <div className="container mx-auto px-6 text-center">
      <p className="font-display text-2xl font-semibold text-background mb-2">Por Dois Fios</p>
      <p className="font-body text-sm text-background/60">
        Vitória, Espírito Santo — Feito à mão com amor ♡
      </p>
      <p className="font-body text-xs text-background/40 mt-4">
        © {new Date().getFullYear()} Por Dois Fios. Todos os direitos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
