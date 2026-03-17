import { useState } from 'react';
import { motion } from 'framer-motion';
import { products, formatPrice } from '@/data/products';
import type { ProductSize } from '@/data/products';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const standardSizes: ProductSize[] = ['PP', 'P', 'M', 'G', 'GG'];

const Orders = () => {
  const { user } = useAuth();
  const customizableProducts = products.filter(p => p.customizable);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [sizeType, setSizeType] = useState<'padrao' | 'personalizado'>('padrao');
  const [selectedSize, setSelectedSize] = useState<ProductSize | ''>('');
  const [customMeasures, setCustomMeasures] = useState({ busto: '', cintura: '', quadril: '', comprimento: '' });
  const [selectedColor, setSelectedColor] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProduct = customizableProducts.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para enviar uma encomenda.');
      return;
    }
    if (!selectedProduct || !selectedColor || (!selectedSize && sizeType === 'padrao')) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!phone.trim()) {
      toast.error('Informe seu WhatsApp');
      return;
    }
    setLoading(true);
    try {
      const basePrice = selectedProduct.price;
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'new',
          total: basePrice,
          notes: notes.trim() || null,
          has_custom_orders: true,
        })
        .select('id')
        .single();
      if (orderErr) throw orderErr;

      const measurements =
        sizeType === 'personalizado'
          ? {
              busto: customMeasures.busto || null,
              cintura: customMeasures.cintura || null,
              quadril: customMeasures.quadril || null,
              comprimento: customMeasures.comprimento || null,
            }
          : null;

      const { error: itemErr } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_price: selectedProduct.price,
        quantity: 1,
        size: sizeType === 'padrao' ? (selectedSize as string) : null,
        measurements,
        is_custom_order: true,
      });
      if (itemErr) throw itemErr;

      await supabase.rpc('assign_artisan_to_order', { _order_id: order.id }).catch(() => null);

      await supabase
        .from('profiles')
        .upsert(
          { user_id: user.id, phone: phone.trim() || null },
          { onConflict: 'user_id' }
        )
        .catch(() => null);

      toast.success('Encomenda enviada! Uma artesã vai assumir e entraremos em contato.');
      setSelectedProductId('');
      setSelectedColor('');
      setSelectedSize('');
      setSizeType('padrao');
      setCustomMeasures({ busto: '', cintura: '', quadril: '', comprimento: '' });
      setPhone('');
      setNotes('');
    } catch {
      toast.error('Não foi possível enviar sua encomenda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Encomendas</h1>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Escolha o produto, personalize ao seu gosto e receba uma peça feita especialmente para você.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-semibold mb-3">Escolha o produto *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customizableProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedProductId(p.id); setSelectedColor(''); setSelectedSize(''); }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedProductId === p.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatPrice(p.price)}</p>
                      </div>
                      {selectedProductId === p.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {selectedProduct && (
              <>
                {/* Size */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-sm font-semibold mb-3">Tamanho *</label>
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => { setSizeType('padrao'); setCustomMeasures({ busto: '', cintura: '', quadril: '', comprimento: '' }); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        sizeType === 'padrao' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}
                    >
                      Tamanho Padrão
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSizeType('personalizado'); setSelectedSize(''); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        sizeType === 'personalizado' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}
                    >
                      Tamanho Personalizado
                    </button>
                  </div>

                  {sizeType === 'padrao' ? (
                    <div className="flex flex-wrap gap-2">
                      {(selectedProduct.sizes[0] === 'unico' ? ['unico' as ProductSize] : standardSizes).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selectedSize === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-card'
                          }`}
                        >
                          {s === 'unico' ? 'Único' : s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries({ busto: 'Busto (cm)', cintura: 'Cintura (cm)', quadril: 'Quadril (cm)', comprimento: 'Comprimento (cm)' }).map(([key, label]) => (
                        <div key={key}>
                          <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                          <input
                            type="text"
                            value={customMeasures[key as keyof typeof customMeasures]}
                            onChange={(e) => setCustomMeasures(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Ex: 90"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Color */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-sm font-semibold mb-1">Cor *</label>
                  <p className="text-xs text-muted-foreground mb-3">Fio: {selectedProduct.yarnType.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.yarnType.colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedColor === color ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-card'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* Contact info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="font-display text-xl font-semibold">Seus Dados</h3>
              {[
                { label: 'WhatsApp *', value: phone, set: setPhone, type: 'tel', placeholder: '(27) 99999-9999' },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-sm font-medium mb-1 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium mb-1 block">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Algum detalhe especial? Conte para nós..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </motion.div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {loading ? 'Enviando...' : 'Enviar Encomenda'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Orders;
