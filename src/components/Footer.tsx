import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-3">Por Dois Fios</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Feito à mão com carinho em Vitória, ES. Cada peça é única, assim como quem a usa.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-medium text-foreground mb-3">Navegação</h4>
            <div className="flex flex-col gap-2">
              <Link to="/produtos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Produtos</Link>
              <Link to="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre</Link>
              <Link to="/encomendas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Encomendas</Link>
              <Link to="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-medium text-foreground mb-3">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/5527999999999" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Por Dois Fios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
