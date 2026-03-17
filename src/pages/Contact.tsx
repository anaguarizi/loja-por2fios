import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    toast.success('Mensagem enviada! Responderemos em breve.');
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Contato</h1>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Tem alguma dúvida ou quer conversar? Estamos sempre prontas para ajudar.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">E-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Como podemos ajudar?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Enviar Mensagem
              </button>
            </motion.form>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-display text-xl font-semibold mb-4">Outras formas de contato</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Prefere falar diretamente? Entre em contato pelo WhatsApp ou siga nossas redes sociais 
                  para acompanhar novidades e bastidores.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://wa.me/5527999999999?text=Olá! Vim pelo site da Por Dois Fios e gostaria de saber mais."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-secondary">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">(27) 99999-9999</p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/pordoisfios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-secondary">
                    <Instagram className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Instagram</p>
                    <p className="text-xs text-muted-foreground">@pordoisfios</p>
                  </div>
                </a>

                <a
                  href="mailto:contato@pordoisfios.com.br"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-secondary">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">E-mail</p>
                    <p className="text-xs text-muted-foreground">contato@pordoisfios.com.br</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
