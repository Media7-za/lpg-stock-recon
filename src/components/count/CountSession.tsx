import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhysicalCountSessions } from '../../hooks/useDatabase';
import type { ZoneCount, CountCategory, CylinderSize, CountEntry } from '../../types';
import { ZoneCard } from './ZoneCard';
import clsx from 'clsx';
import { Plus, X } from 'lucide-react';
import { ReviewSummary } from './ReviewSummary';

const SIZES: CylinderSize[] = ['9kg', '14kg', '19kg', 'SV', 'DV'];
const FULL_BRANDS = ['Oryx', 'Multibrand'];
const EMPTY_BRANDS = ['Oryx', 'Easigas', 'Afrox', 'Total Gaz', 'Foreign', 'Top-Ups'];

export default function CountSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getSession, addSession, updateSession } = usePhysicalCountSessions();

  const [category, setCategory] = useState<CountCategory>('empties');
  const [size, setSize] = useState<CylinderSize>('9kg');

  const [sessionType, setSessionType] = useState<'AM' | 'PM'>('AM');
  const [zones, setZones] = useState<ZoneCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  const initializeNewSession = useCallback(() => {
    const defaultZone: ZoneCount = {
      id: crypto.randomUUID(),
      name: 'Zone 1 - Main Yard',
      entries: [],
    };
    setZones(populateMissingEntries([defaultZone]));
    setLoading(false);
  }, []);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    const session = await getSession(sessionId);
    if (session) {
      setSessionType(session.sessionType);
      setZones(populateMissingEntries(session.zones));
    }
    setLoading(false);
  }, [sessionId, getSession]);

  // Load session or initialize defaults
  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      initializeNewSession();
    }
  }, [sessionId, loadSession, initializeNewSession]);

  // Helper: ensures zones have all required entries for the current categories/sizes
  const populateMissingEntries = (currentZones: ZoneCount[]): ZoneCount[] => {
    return currentZones.map(zone => {
      const missingEntries: CountEntry[] = [];
      for (const cat of ['fulls', 'empties'] as CountCategory[]) {
        const brandsToUse = cat === 'fulls' ? FULL_BRANDS : EMPTY_BRANDS;
        for (const s of SIZES) {
          for (const brand of brandsToUse) {
            const exists = zone.entries.find(e => e.category === cat && e.size === s && e.brand === brand);
            if (!exists) {
              missingEntries.push({
                category: cat,
                size: s,
                brand,
                quantity: 0
              });
            }
          }
        }
      }
      if (missingEntries.length > 0) {
        return { ...zone, entries: [...zone.entries, ...missingEntries] };
      }
      return zone;
    });
  };

  const handleUpdateCount = (zoneId: string, brand: string, newQuantity: number) => {
    setZones(prev => prev.map(z => {
      if (z.id !== zoneId) return z;
      const newEntries = z.entries.map(e => {
        if (e.category === category && e.size === size && e.brand === brand) {
          return { ...e, quantity: newQuantity };
        }
        return e;
      });
      return { ...z, entries: newEntries };
    }));
  };

  const handleAddZone = () => {
    const newZone: ZoneCount = {
      id: crypto.randomUUID(),
      name: `Zone ${zones.length + 1} `,
      entries: []
    };
    const populatedZones = populateMissingEntries([newZone]);
    setZones(prev => [...prev, populatedZones[0]]);
  };

  const handleEditZoneName = (zoneId: string) => {
    const name = prompt('Enter new zone name:');
    if (name) {
      setZones(prev => prev.map(z => z.id === zoneId ? { ...z, name } : z));
    }
  };

  const handleReviewClick = () => {
    setIsReviewing(true);
  };

  const handleFinalSubmit = async () => {
    try {
      const sessionData = {
        sessionType,
        status: 'completed' as const,
        zones,
      };

      let navId = sessionId;
      if (sessionId) {
        await updateSession(sessionId, sessionData);
      } else {
        navId = await addSession(sessionData);
      }
      alert('Physical Stock Count Submitted Successfully!');
      navigate(`/results?countId=${navId}`);
    } catch (e) {
      console.error(e);
      alert('Failed to save session');
    }
  };

  const totalCounted = useMemo(() => {
    return zones.reduce((sum, z) => sum + z.entries.reduce((s, e) => s + e.quantity, 0), 0);
  }, [zones]);

  // Calculate progress purely on whether a counter has been touched (quantity > 0) for demonstration
  // In a real scenario, you'd track 'touched' vs 'untouched' state directly.
  const totalCombinations = zones.length * SIZES.length * (FULL_BRANDS.length + EMPTY_BRANDS.length);
  const itemsCounted = zones.reduce((sum, z) => sum + z.entries.filter(e => e.quantity > 0).length, 0);
  const progressPercent = totalCombinations > 0 ? Math.round((itemsCounted / totalCombinations) * 100) : 0;

  if (loading) return null;

  const currentSizeIndex = SIZES.indexOf(size);
  const isLastSize = currentSizeIndex === SIZES.length - 1;

  const handleFooterAction = () => {
    if (!isLastSize) {
      setSize(SIZES[currentSizeIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const switchCategoryFromFooter = () => {
    setCategory(category === 'fulls' ? 'empties' : 'fulls');
    setSize('9kg');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isReviewing) {
    return (
      <ReviewSummary
        sessionType={sessionType}
        zones={zones}
        totalCounted={totalCounted}
        onBack={() => setIsReviewing(false)}
        onSubmit={handleFinalSubmit}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Physical Stock Count</h1>
          </div>
          <select
            className="text-sm border-gray-300 rounded-md bg-gray-50 font-medium py-1 px-2"
            value={sessionType}
            onChange={e => setSessionType(e.target.value as 'AM' | 'PM')}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
          <button
            className={clsx("flex-1 py-2 text-sm font-bold rounded-md transition-colors", category === 'fulls' ? 'bg-white text-green-600 shadow' : 'text-gray-500')}
            onClick={() => {
              setCategory('fulls');
              setSize('9kg');
            }}
          >
            Fulls
          </button>
          <button
            className={clsx("flex-1 py-2 text-sm font-bold rounded-md transition-colors", category === 'empties' ? 'bg-white text-green-600 shadow' : 'text-gray-500')}
            onClick={() => {
              setCategory('empties');
              setSize('9kg');
            }}
          >
            Empties
          </button>
        </div>

        {/* Size Tabs */}
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide px-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={clsx(
                "pb-3 pt-2 px-1 text-base sm:text-lg font-bold whitespace-nowrap transition-colors border-b-4",
                size === s ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 space-y-4">
        {zones.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            category={category}
            size={size}
            onUpdateCount={handleUpdateCount}
            onEditZoneName={handleEditZoneName}
          />
        ))}

        <button
          onClick={handleAddZone}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center hover:border-gray-400 hover:text-gray-600 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Zone
        </button>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Counted</div>
            <div className="text-2xl font-black text-gray-900">{totalCounted} <span className="text-sm font-medium text-gray-500">Cylinders</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Progress</div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPercent}% ` }}></div>
              </div>
              <span className="text-sm font-bold text-gray-900">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {isLastSize ? (
          <div className="flex space-x-3">
            <button
              onClick={switchCategoryFromFooter}
              className="flex-1 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg rounded-xl shadow-sm transition flex justify-center items-center"
            >
              Next: {category === 'fulls' ? 'Empties' : 'Fulls'}
            </button>
            <button
              onClick={handleReviewClick}
              className="flex-[2] py-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-lg rounded-xl transition flex justify-center items-center space-x-2"
            >
              <span>Review & Submit</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleFooterAction}
            className="w-full py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg rounded-xl shadow-sm transition flex justify-center items-center space-x-2"
          >
            <span>Next: {SIZES[currentSizeIndex + 1]}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
