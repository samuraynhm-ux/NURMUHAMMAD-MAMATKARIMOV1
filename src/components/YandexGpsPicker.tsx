import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Crosshair,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Compass,
  Car,
  Layers,
} from 'lucide-react';
import { triggerTelegramHaptic } from '../utils/telegram';

export interface GpsLocation {
  lat: number;
  lng: number;
  addressText?: string;
  accuracy?: number;
}

interface YandexGpsPickerProps {
  currentAddress: string;
  onLocationSelected: (location: GpsLocation) => void;
  initialCoords?: { lat: number; lng: number };
}

// Default center: User requested exact Fergana location (AL DONER PIZZA)
const DEFAULT_COORDS = { lat: 40.376488, lng: 71.808105 };

const FERGANA_DISTRICTS = [
  { name: 'AL DONER PIZZA', lat: 40.376488, lng: 71.808105, label: "AL DONER PIZZA (Farg'ona, asosiy manzil)" },
  { name: "Farg'ona Markaz", lat: 40.3864, lng: 71.7864, label: "Farg'ona shahar, Markaz (Sayilgoh)" },
  { name: 'Qirguli', lat: 40.4285, lng: 71.8152, label: 'Qirguli mavzesi' },
  { name: "Al-Farg'oniy", lat: 40.3845, lng: 71.7910, label: "Al-Farg'oniy shoh ko'chasi" },
  { name: "B. Marg'inoniy (FDU)", lat: 40.3792, lng: 71.7925, label: "B. Marg'inoniy ko'chasi / FDU" },
  { name: 'Yangi Asr', lat: 40.3950, lng: 71.7720, label: "Yangi Asr / Do'stlik mavzesi" },
  { name: 'Aeroport hududi', lat: 40.3582, lng: 71.7456, label: "Farg'ona Aeroport hududi" },
  { name: "Marg'ilon yo'li", lat: 40.4120, lng: 71.7580, label: "Marg'ilon shoh ko'chasi" },
  { name: "Toshloq yo'li", lat: 40.4180, lng: 71.8420, label: "Toshloq yo'nalishi" },
];

export const YandexGpsPicker: React.FC<YandexGpsPickerProps> = ({
  currentAddress,
  onLocationSelected,
  initialCoords,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    initialCoords || DEFAULT_COORDS
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(Boolean(initialCoords));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'map' | 'sat'>('map');
  const [isExpanded, setIsExpanded] = useState(false);

  // Exact Yandex Navigator & Maps URLs for Fergana (10336)
  const yandexNaviWebUrl = `https://yandex.uz/maps/10336/fergana/?ll=71.781649%2C40.362410&mode=routes&rtext=~${coords.lat}%2C${coords.lng}&rtt=auto&ruri=~&z=16`;
  const yandexMapsWebUrl = `https://yandex.uz/maps/10336/fergana/?ll=${coords.lng}%2C${coords.lat}&z=16&pt=${coords.lng},${coords.lat},pm2rdm`;

  // Reverse geocode to get street name if possible
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=uz,ru`
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
        const houseNumber = data.address?.house_number ? `, ${data.address.house_number}` : '';
        const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || "Farg'ona";
        if (road) {
          return `${city}, ${road}${houseNumber}`;
        }
      }
    } catch {
      // Ignore geocoding network fail
    }
    return null;
  };

  // Get current device GPS location
  const handleGetGps = () => {
    triggerTelegramHaptic('medium');
    setIsLocating(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage("Qurilmangizda Geolocation (GPS) qo'llab-quvvatlanmaydi");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords = { lat, lng };
        setCoords(newCoords);
        setLocationSuccess(true);
        setIsLocating(false);
        triggerTelegramHaptic('success');

        const resolvedName = await reverseGeocode(lat, lng);
        onLocationSelected({
          lat,
          lng,
          accuracy: position.coords.accuracy,
          addressText: resolvedName || currentAddress || `Farg'ona (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        });
      },
      (error) => {
        setIsLocating(false);
        triggerTelegramHaptic('error');
        let msg = 'GPS aniqlab bo\'lmadi.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Geolokatsiyaga ruxsat berilmadi. Iltimos, brauzerda geolokatsiyani yoqing yoki pastdan hududni tanlang.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signali topilmadi. Hududlar ro\'yxatidan tanlashingiz mumkin.';
        }
        setErrorMessage(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectDistrict = (district: typeof FERGANA_DISTRICTS[0]) => {
    triggerTelegramHaptic('light');
    const newCoords = { lat: district.lat, lng: district.lng };
    setCoords(newCoords);
    setLocationSuccess(true);
    setErrorMessage(null);
    onLocationSelected({
      lat: district.lat,
      lng: district.lng,
      addressText: currentAddress.trim() ? currentAddress : `${district.label}, Farg'ona`,
    });
  };

  // Click on map to adjust coordinates slightly
  const handleMapAdjust = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Small offset adjustment based on click
    const newLat = coords.lat - y * 0.008;
    const newLng = coords.lng + x * 0.008;

    triggerTelegramHaptic('light');
    setCoords({ lat: newLat, lng: newLng });
    setLocationSuccess(true);
    onLocationSelected({
      lat: newLat,
      lng: newLng,
      addressText: currentAddress,
    });
  };

  return (
    <div className="rounded-2xl bg-[#11141c] border border-amber-500/30 overflow-hidden shadow-xl">
      {/* Top Banner / Status */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-['Syne']">
                Yandex Navigator GPS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-red-500/20 border border-red-500/40 text-[9px] font-bold text-red-300 font-['Space_Grotesk']">
                Jonli Marshrut
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Mijoz manzilini belgilang — botga Yandex Navigator havolasi tushadi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetGps}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-all font-['Syne'] disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Aniqlanmoqda...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>GPS Aniqlash</span>
            </>
          )}
        </button>
      </div>

      {/* Error / Feedback */}
      {errorMessage && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Map Visual Stage */}
      <div className="relative">
        <div
          onClick={handleMapAdjust}
          className={`relative w-full ${
            isExpanded ? 'h-64 sm:h-72' : 'h-44 sm:h-52'
          } bg-[#0b0e14] overflow-hidden cursor-crosshair group transition-all duration-300`}
        >
          {/* Embedded Interactive Map Preview */}
          <iframe
            title="Yandex Navigator Map"
            src={`https://yandex.uz/map-widget/v1/?ll=${coords.lng}%2C${coords.lat}&z=16&pt=${coords.lng},${coords.lat},pm2rdm`}
            className="w-full h-full border-0 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
          />

          {/* Central Target Pin Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center -translate-y-5 animate-bounce">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-red-500/40">
                <MapPin className="w-5 h-5 fill-white" />
              </div>
              <div className="w-3 h-1 bg-black/60 rounded-full blur-[1px] mt-1" />
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white font-['Space_Grotesk']"
            >
              {isExpanded ? 'Kichraytirish' : 'Kattalashtirish'}
            </button>
            <a
              href={yandexNaviWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md font-['Space_Grotesk']"
            >
              <Car className="w-3 h-3" />
              <span>Yandex Navi</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Map Click Hint */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 flex items-center gap-1 font-['Space_Grotesk']">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Xaritani bosib nuqtani o'zgartiring
            </span>
          </div>
        </div>

        {/* Selected Coordinates Status Strip */}
        <div className="p-3 bg-[#0d1017] border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-['Space_Grotesk']">
                Aniq GPS koordinatalari:
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={yandexNaviWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
            >
              <span>Xaritada ochish</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Fergana District Shortcuts */}
      <div className="p-3 bg-[#131620] border-t border-white/5">
        <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium font-['Space_Grotesk']">
          Tezkor hududlar (Farg'ona shahri & atrofi):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FERGANA_DISTRICTS.map((district) => (
            <button
              key={district.name}
              type="button"
              onClick={() => handleSelectDistrict(district)}
              className="px-2 py-1 rounded-lg bg-black/40 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/5 text-[11px] text-zinc-300 hover:text-amber-300 transition-all font-['Space_Grotesk']"
            >
              {district.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
