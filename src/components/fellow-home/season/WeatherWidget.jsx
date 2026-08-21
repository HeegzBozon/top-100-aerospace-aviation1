import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// WMO weather code → icon + plain label
function describe(code) {
  if (code === 0) return { Icon: Sun, label: 'Clear' };
  if (code <= 3) return { Icon: Cloud, label: 'Partly cloudy' };
  if (code <= 48) return { Icon: CloudFog, label: 'Fog' };
  if (code <= 67) return { Icon: CloudRain, label: 'Rain' };
  if (code <= 77) return { Icon: CloudSnow, label: 'Snow' };
  if (code <= 82) return { Icon: CloudRain, label: 'Showers' };
  if (code <= 86) return { Icon: CloudSnow, label: 'Snow showers' };
  return { Icon: CloudLightning, label: 'Thunderstorms' };
}

const DEFAULT = { lat: 39.7684, lon: -86.1581, name: 'Indianapolis' };

export default function WeatherWidget({ accent }) {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let cancelled = false;

    const load = async ({ lat, lon, name }) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
        );
        if (!res.ok) throw new Error('weather');
        const json = await res.json();
        if (cancelled) return;
        setState({
          status: 'ready',
          data: {
            name,
            temp: Math.round(json.current.temperature_2m),
            code: json.current.weather_code,
            high: Math.round(json.daily.temperature_2m_max[0]),
            low: Math.round(json.daily.temperature_2m_min[0]),
          },
        });
      } catch {
        if (!cancelled) setState({ status: 'error', data: null });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Your location' }),
        () => load(DEFAULT),
        { timeout: 6000 }
      );
    } else {
      load(DEFAULT);
    }

    return () => { cancelled = true; };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="animate-pulse h-4 w-32 rounded" style={{ background: `${B.navy}14` }} />
    );
  }

  if (state.status === 'error') {
    return (
      <p className="text-[10px]" style={{ color: B.muted }}>
        Local conditions unavailable.
      </p>
    );
  }

  const { Icon, label } = describe(state.data.code);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
        <p className="text-sm font-bold leading-none tabular-nums" style={{ color: B.navy }}>
          {state.data.temp}°
        </p>
        <p className="text-[10px] truncate" style={{ color: B.muted }}>
          {label} · {state.data.high}°/{state.data.low}° · {state.data.name}
        </p>
      </div>
    </div>
  );
}