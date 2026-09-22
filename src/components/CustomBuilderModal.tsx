import React, { useState } from 'react';
import { Pizza, Flame, Check, Sparkles, X, Plus } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { CartItem, MenuItem } from '../types';

interface CustomBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItemToCart: (item: CartItem) => void;
}

export const CustomBuilderModal: React.FC<CustomBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItemToCart,
}) => {
  if (!isOpen) return null;

  const [builderType, setBuilderType] = useState<'pizza' | 'doner'>('pizza');

  // Pizza Custom Options
  const pizzaCrusts = [
    { id: 'thin-napoli', name: 'Yupqa Neapol Xamiri', price: 0, cal: 400 },
    { id: 'thick-classic', name: 'Qalin An\'anaviy Xamir', price: 5000, cal: 550 },
    { id: 'cheese-crust', name: 'Pishloqli Bortik (Cheesy Crust)', price: 15000, cal: 720 },
  ];

  const pizzaSauces = [
    { id: 'sauce-tomato', name: 'San Marzano Pomidor Sousi', price: 0, cal: 50 },
    { id: 'sauce-cream', name: 'Oq Qaymoqli Sarimsoqli Sous', price: 4000, cal: 120 },
    { id: 'sauce-bbq', name: 'Dudlangan BBQ Sousi', price: 4000, cal: 90 },
    { id: 'sauce-spicy', name: 'Olovli Achchiq Sous', price: 4000, cal: 60 },
  ];

  const pizzaMeats = [
    { id: 'meat-doner', name: 'Mol Go\'shti Döner Bo\'laklari', price: 18000, cal: 260 },
    { id: 'meat-chicken', name: 'Shirali Gril Tovuq Filesi', price: 14000, cal: 190 },
    { id: 'meat-pepperoni', name: 'Italiyan Pepperoni Kolbasasi', price: 16000, cal: 240 },
    { id: 'meat-turkey', name: 'Dudlangan Kurka Go\'shti', price: 15000, cal: 170 },
  ];

  const pizzaCheeses = [
    { id: 'cheese-mozzarella', name: 'Cho\'ziluvchan Motsarella (Asosiy)', price: 0, cal: 220 },
    { id: 'cheese-cheddar', name: 'Oltinrang Chedder', price: 8000, cal: 180 },
    { id: 'cheese-parmesan', name: 'Xushbo\'y Parmezan', price: 10000, cal: 140 },
  ];

  const pizzaVeggies = [
    { id: 'veg-mushrooms', name: 'Qovurilgan Qo\'ziqorin', price: 5000, cal: 30 },
    { id: 'veg-olives', name: 'Qora Zaytun', price: 4000, cal: 40 },
    { id: 'veg-jalapeno', name: 'Achchiq Jalapeño', price: 4000, cal: 15 },
    { id: 'veg-corn', name: 'Shirin Makkajo\'xori', price: 4000, cal: 45 },
    { id: 'veg-tomatoes', name: 'Cherry Pomidor', price: 4000, cal: 20 },
    { id: 'veg-onion', name: 'Karamellangan Qizil Piyoz', price: 3000, cal: 25 },
  ];

  // Döner Custom Options
  const donerBreads = [
    { id: 'bread-tombik', name: 'Tandirda Yopilgan Tombik Non', price: 0, cal: 250 },
    { id: 'bread-lavash', name: 'Yupqa Qarsildoq Lavash', price: 0, cal: 210 },
    { id: 'bread-pide', name: 'Turk Pide Noni', price: 5000, cal: 290 },
  ];

  const donerMeats = [
    { id: 'doner-beef', name: 'Marinadlangan Mol Go\'shti (Döner)', price: 22000, cal: 280 },
    { id: 'doner-chicken', name: 'Tandirda Qovurilgan Tovuq Go\'shti', price: 17000, cal: 210 },
    { id: 'doner-mix', name: 'Miks: Mol va Tovuq Go\'shti', price: 20000, cal: 250 },
  ];

  const donerSauces = [
    { id: 'dsauce-white', name: "Oq Sarimsoqli Sous", price: 0, cal: 90 },
    { id: 'dsauce-red', name: "O'tkir Qizil Sous", price: 3000, cal: 50 },
    { id: 'dsauce-cheesy', name: "Eritilgan Pishloqli Sous", price: 6000, cal: 130 },
  ];

  const donerFillings = [
    { id: 'fill-fries', name: 'Ichiga Kartoshka Fri', price: 5000, cal: 120 },
    { id: 'fill-cheese', name: 'Cho\'ziluvchan Motsarella', price: 7000, cal: 140 },
    { id: 'fill-jalapeno', name: 'Achchiq Jalapeño', price: 3000, cal: 10 },
    { id: 'fill-pickles', name: 'Marinadlangan Bodring', price: 3000, cal: 15 },
    { id: 'fill-fresh-salad', name: 'Barra Pomidor va Ko\'katlar', price: 3000, cal: 20 },
  ];

  // State for Pizza
  const [selectedCrust, setSelectedCrust] = useState(pizzaCrusts[0].id);
  const [selectedSauce, setSelectedSauce] = useState(pizzaSauces[0].id);
  const [selectedMeats, setSelectedMeats] = useState<string[]>([pizzaMeats[0].id]);
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>([pizzaCheeses[0].id]);
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([pizzaVeggies[0].id, pizzaVeggies[4].id]);

  // State for Döner
  const [selectedDonerBread, setSelectedDonerBread] = useState(donerBreads[0].id);
  const [selectedDonerMeat, setSelectedDonerMeat] = useState(donerMeats[0].id);
  const [selectedDonerSauces, setSelectedDonerSauces] = useState<string[]>([donerSauces[0].id]);
  const [selectedDonerFillings, setSelectedDonerFillings] = useState<string[]>([
    donerFillings[0].id,
    donerFillings[4].id,
  ]);

  // Toggle helper
  const toggleSelection = (list: string[], setList: (val: string[]) => void, id: string) => {
    if (list.includes(id)) {
      if (list.length > 1) {
        setList(list.filter((x) => x !== id));
      }
    } else {
      setList([...list, id]);
    }
  };

  // Price & Calorie calculation for Pizza
  let pizzaPrice = 55000; // Base pizza dough + oven cost
  let pizzaCalories = 0;

  const curCrust = pizzaCrusts.find((c) => c.id === selectedCrust);
  if (curCrust) {
    pizzaPrice += curCrust.price;
    pizzaCalories += curCrust.cal;
  }

  const curSauce = pizzaSauces.find((s) => s.id === selectedSauce);
  if (curSauce) {
    pizzaPrice += curSauce.price;
    pizzaCalories += curSauce.cal;
  }

  selectedMeats.forEach((mId) => {
    const m = pizzaMeats.find((x) => x.id === mId);
    if (m) {
      pizzaPrice += m.price;
      pizzaCalories += m.cal;
    }
  });

  selectedCheeses.forEach((cId) => {
    const c = pizzaCheeses.find((x) => x.id === cId);
    if (c) {
      pizzaPrice += c.price;
      pizzaCalories += c.cal;
    }
  });

  selectedVeggies.forEach((vId) => {
    const v = pizzaVeggies.find((x) => x.id === vId);
    if (v) {
      pizzaPrice += v.price;
      pizzaCalories += v.cal;
    }
  });

  // Price & Calorie calculation for Döner
  let donerPrice = 18000; // Base prep & bread
  let donerCalories = 0;

  const curBread = donerBreads.find((b) => b.id === selectedDonerBread);
  if (curBread) {
    donerPrice += curBread.price;
    donerCalories += curBread.cal;
  }

  const curDMeat = donerMeats.find((m) => m.id === selectedDonerMeat);
  if (curDMeat) {
    donerPrice += curDMeat.price;
    donerCalories += curDMeat.cal;
  }

  selectedDonerSauces.forEach((sId) => {
    const s = donerSauces.find((x) => x.id === sId);
    if (s) {
      donerPrice += s.price;
      donerCalories += s.cal;
    }
  });

  selectedDonerFillings.forEach((fId) => {
    const f = donerFillings.find((x) => x.id === fId);
    if (f) {
      donerPrice += f.price;
      donerCalories += f.cal;
    }
  });

  const handleAddToCart = () => {
    if (builderType === 'pizza') {
      const ingredientNames: string[] = [
        curCrust?.name || '',
        curSauce?.name || '',
        ...selectedMeats.map((id) => pizzaMeats.find((m) => m.id === id)?.name || ''),
        ...selectedCheeses.map((id) => pizzaCheeses.find((c) => c.id === id)?.name || ''),
        ...selectedVeggies.map((id) => pizzaVeggies.find((v) => v.id === id)?.name || ''),
      ].filter(Boolean);

      const customPizzaItem: MenuItem = {
        id: `custom-pizza-${Date.now()}`,
        name: "Mualliflik Pizzasi (Shaxsiy Retsept)",
        category: 'pizza',
        description: ingredientNames.join(', '),
        basePrice: pizzaPrice,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        calories: pizzaCalories,
        prepTimeMinutes: 20,
        isChefChoice: true,
      };

      const cartItem: CartItem = {
        cartItemId: `cart-custom-pizza-${Date.now()}`,
        menuItem: customPizzaItem,
        selectedAddons: [],
        customIngredients: ingredientNames,
        unitPrice: pizzaPrice,
        quantity: 1,
      };

      onAddCustomItemToCart(cartItem);
    } else {
      const donerIngredientNames: string[] = [
        curBread?.name || '',
        curDMeat?.name || '',
        ...selectedDonerSauces.map((id) => donerSauces.find((s) => s.id === id)?.name || ''),
        ...selectedDonerFillings.map((id) => donerFillings.find((f) => f.id === id)?.name || ''),
      ].filter(Boolean);

      const customDonerItem: MenuItem = {
        id: `custom-doner-${Date.now()}`,
        name: "Mualliflik Döneri (Shaxsiy Retsept)",
        category: 'doner',
        description: donerIngredientNames.join(', '),
        basePrice: donerPrice,
        image: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=800&q=80',
        calories: donerCalories,
        prepTimeMinutes: 14,
        isChefChoice: true,
      };

      const cartItem: CartItem = {
        cartItemId: `cart-custom-doner-${Date.now()}`,
        menuItem: customDonerItem,
        selectedAddons: [],
        customIngredients: donerIngredientNames,
        unitPrice: donerPrice,
        quantity: 1,
      };

      onAddCustomItemToCart(cartItem);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#131724] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#0f121c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-md">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                Interaktiv Taom Konstruktori
              </h2>
              <p className="text-xs text-zinc-400">
                O'zingiz xohlagan masalliqlardan noyob Döner yoki Pizza yarating
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Type Selector (Pizza vs Doner) */}
        <div className="p-4 bg-[#181d2c] border-b border-white/5 flex gap-2">
          <button
            onClick={() => setBuilderType('pizza')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              builderType === 'pizza'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <Pizza className="w-4 h-4" />
            <span>🍕 O'z Pizzangni Yarat</span>
          </button>

          <button
            onClick={() => setBuilderType('doner')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              builderType === 'doner'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>🌯 O'z Doneringni Yarat</span>
          </button>
        </div>

        {/* Builder Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {builderType === 'pizza' ? (
            /* --- PIZZA BUILDER STEPS --- */
            <div className="space-y-6">
              {/* Step 1: Crust */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    1. Xamir turi (Asos):
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {pizzaCrusts.map((crust) => (
                    <button
                      key={crust.id}
                      onClick={() => setSelectedCrust(crust.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCrust === crust.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{crust.name}</div>
                      <div className="text-[11px] text-amber-400 font-semibold mt-1">
                        {crust.price > 0 ? `+${formatPrice(crust.price)}` : 'Asosiy narxda'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Sauce */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  2. Sous (Asosga surtiladi):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pizzaSauces.map((sauce) => (
                    <button
                      key={sauce.id}
                      onClick={() => setSelectedSauce(sauce.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedSauce === sauce.id
                          ? 'bg-orange-500/15 border-orange-500 text-white'
                          : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{sauce.name}</div>
                      <div className="text-[11px] text-orange-400 font-semibold mt-1">
                        {sauce.price > 0 ? `+${formatPrice(sauce.price)}` : 'Tekin'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Meat & Proteins */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    3. Go'sht va oqsillar (Bir yoki bir nechtasini tanlang):
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pizzaMeats.map((meat) => {
                    const isChecked = selectedMeats.includes(meat.id);
                    return (
                      <div
                        key={meat.id}
                        onClick={() => toggleSelection(selectedMeats, setSelectedMeats, meat.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-500/15 border-red-500 text-white'
                            : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{meat.name}</span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold">
                          +{formatPrice(meat.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Cheeses */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  4. Pishloqlar:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {pizzaCheeses.map((cheese) => {
                    const isChecked = selectedCheeses.includes(cheese.id);
                    return (
                      <div
                        key={cheese.id}
                        onClick={() => toggleSelection(selectedCheeses, setSelectedCheeses, cheese.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-yellow-500/15 border-yellow-500 text-white'
                            : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-yellow-500 border-yellow-500 text-black'
                                : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{cheese.name}</span>
                        </div>
                        <span className="text-xs text-yellow-400 font-bold">
                          {cheese.price > 0 ? `+${formatPrice(cheese.price)}` : 'Asosiy'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Veggies */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  5. Sabzavotlar va Ziravorlar:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {pizzaVeggies.map((veg) => {
                    const isChecked = selectedVeggies.includes(veg.id);
                    return (
                      <div
                        key={veg.id}
                        onClick={() => toggleSelection(selectedVeggies, setSelectedVeggies, veg.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500 text-white'
                            : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{veg.name}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          +{formatPrice(veg.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* --- DONER BUILDER STEPS --- */
            <div className="space-y-6">
              {/* Doner Bread */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  1. Non yoki Xamir turi:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {donerBreads.map((bread) => (
                    <button
                      key={bread.id}
                      onClick={() => setSelectedDonerBread(bread.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedDonerBread === bread.id
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{bread.name}</div>
                      <div className="text-[11px] text-amber-400 font-semibold mt-1">
                        {bread.price > 0 ? `+${formatPrice(bread.price)}` : 'Asosiy'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doner Meat */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  2. Asosiy Shirali Go'sht:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {donerMeats.map((meat) => (
                    <button
                      key={meat.id}
                      onClick={() => setSelectedDonerMeat(meat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedDonerMeat === meat.id
                          ? 'bg-red-500/15 border-red-500 text-white'
                          : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{meat.name}</div>
                      <div className="text-[11px] text-amber-400 font-bold mt-1">
                        +{formatPrice(meat.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doner Sauces */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  3. Maxsus Souslar:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {donerSauces.map((sauce) => {
                    const isChecked = selectedDonerSauces.includes(sauce.id);
                    return (
                      <div
                        key={sauce.id}
                        onClick={() => toggleSelection(selectedDonerSauces, setSelectedDonerSauces, sauce.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-orange-500/15 border-orange-500 text-white'
                            : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-orange-500 border-orange-500 text-black'
                                : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{sauce.name}</span>
                        </div>
                        <span className="text-xs text-orange-400 font-bold">
                          {sauce.price > 0 ? `+${formatPrice(sauce.price)}` : 'Tekin'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doner Fillings */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  4. To'ldiruvchilar va Qo'shimchalar:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {donerFillings.map((fill) => {
                    const isChecked = selectedDonerFillings.includes(fill.id);
                    return (
                      <div
                        key={fill.id}
                        onClick={() => toggleSelection(selectedDonerFillings, setSelectedDonerFillings, fill.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#181d2a] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500 text-black'
                                : 'border-zinc-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium">{fill.name}</span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold">
                          +{formatPrice(fill.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Add to Cart */}
        <div className="p-6 bg-[#0e111a] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Jami Narx</span>
              <span className="text-2xl font-black text-amber-400 font-['Outfit']">
                {formatPrice(builderType === 'pizza' ? pizzaPrice : donerPrice)}
              </span>
            </div>

            <div className="text-right sm:text-left border-l border-white/10 pl-4">
              <span className="text-[11px] text-zinc-400 block font-medium">Energiya</span>
              <span className="text-sm font-semibold text-zinc-300">
                ~{builderType === 'pizza' ? pizzaCalories : donerCalories} kkal
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Savatga Qo'shish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
