import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Activity, Users, MapPin, Trophy, Zap, Home, Building2, Flame, AlertTriangle, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import des DEUX fichiers de données
import rawDataCities from './data.json';
import rawDataFires from './fires.json';

// --- NETTOYAGE DES DONNÉES ---
const dataCities = rawDataCities.map(d => ({
  ...d,
  population_15_29: Math.round(d.population_15_29 || 0),
  nb_equipements: d.nb_equipements || 0,
  consototale: d.consototale || 0,
  z_sport: d.population_15_29, 
})).filter(d => d.lat && d.lng);

const dataFires = rawDataFires.map(d => ({
    ...d,
    // On ajoute un petit "jitter" (bruit aléatoire) aux coordonnées 
    // pour éviter que les feux d'une même ville se superposent parfaitement
    lat: d.lat + (Math.random() - 0.5) * 0.02,
    lng: d.lng + (Math.random() - 0.5) * 0.02
}));

function App() {
  const [activeTab, setActiveTab] = useState('sport'); // 'sport', 'energy', 'fire'

  // --- 1. CONFIGURATION DYNAMIQUE (THEME) ---
  const config = useMemo(() => {
      switch(activeTab) {
          case 'sport': return {
              theme: '#38bdf8', sec: '#c084fc', 
              mapData: dataCities, type: 'city',
              radius: (d) => Math.max(3, Math.min(d.nb_equipements / 1.5, 25)),
              title: 'Offre Sportive'
          };
          case 'energy': return {
              theme: '#fbbf24', sec: '#f97316', 
              mapData: dataCities, type: 'city',
              radius: (d) => Math.max(3, Math.min(Math.sqrt(d.consototale) / 10, 30)),
              title: 'Intensité Énergétique'
          };
          case 'fire': return {
              theme: '#ef4444', sec: '#7f1d1d', 
              mapData: dataFires, type: 'event', // Attention: source de données différente
              radius: (d) => Math.max(4, Math.min(Math.sqrt(d.surface_ha) * 2, 40)), // Gros cercles pour gros feux
              title: 'Historique Incendies'
          };
          default: return {};
      }
  }, [activeTab]);

  // --- 2. CALCUL DES KPIS ---
  const kpis = useMemo(() => {
    if (activeTab === 'sport') {
      const totalEquip = dataCities.reduce((acc, curr) => acc + curr.nb_equipements, 0);
      const totalJeunes = dataCities.reduce((acc, curr) => acc + curr.population_15_29, 0);
      return [
        { label: "Total Équipements", val: totalEquip, icon: Trophy, color: "text-yellow-400" },
        { label: "Jeunes (15-29 ans)", val: totalJeunes.toLocaleString(), icon: Users, color: "text-neon-blue" },
        { label: "Ville Top Sport", val: "Ajaccio", sub: "193 équipements", icon: MapPin, color: "text-neon-purple" },
      ];
    } else if (activeTab === 'energy') {
      const totalConso = dataCities.reduce((acc, curr) => acc + curr.consototale, 0);
      return [
        { label: "Conso. Totale", val: `${Math.round(totalConso/1000)} GWh`, icon: Zap, color: "text-amber-400" },
        { label: "Part Résidentielle", val: `54%`, icon: Home, color: "text-green-400" },
        { label: "Pic Conso", val: "Bastia", sub: "Haute densité tertiaire", icon: Building2, color: "text-orange-500" },
      ];
    } else {
      // KPIS INCENDIES
      const totalFires = dataFires.length;
      const totalSurface = Math.round(dataFires.reduce((acc, curr) => acc + curr.surface_ha, 0));
      const worstYearData = dataFires.reduce((acc, curr) => {
          acc[curr.annee] = (acc[curr.annee] || 0) + curr.surface_ha;
          return acc;
      }, {});
      const worstYear = Object.keys(worstYearData).reduce((a, b) => worstYearData[a] > worstYearData[b] ? a : b);

      return [
        { label: "Incendies (>1ha)", val: totalFires, icon: AlertTriangle, color: "text-orange-500" },
        { label: "Surface Brûlée", val: `${totalSurface.toLocaleString()} ha`, icon: Flame, color: "text-red-500" },
        { label: "Année Noire", val: worstYear, sub: `${Math.round(worstYearData[worstYear])} ha brûlés`, icon: Calendar, color: "text-red-700" },
      ];
    }
  }, [activeTab]);

  // --- 3. PRÉPARATION GRAPHIQUE HISTORIQUE (POUR INCENDIES) ---
  const fireHistoryData = useMemo(() => {
      if (activeTab !== 'fire') return [];
      const history = {};
      dataFires.forEach(f => {
          history[f.annee] = (history[f.annee] || 0) + f.surface_ha;
      });
      return Object.keys(history).sort().map(year => ({
          name: year,
          value: Math.round(history[year])
      }));
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 p-4 md:p-8 font-sans transition-colors duration-500">
      
      {/* HEADER + TABS */}
      <header className="mb-8 border-b border-dark-700 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Corse <span style={{ color: config.theme }}>DataViz</span>
          </h1>
          <p className="text-slate-400 mt-2">Exploration territoriale interactive : Sport, Énergie & Risques</p>
        </div>

        <div className="bg-dark-800 p-1 rounded-lg border border-dark-700 flex flex-wrap gap-1">
          {[
              { id: 'sport', label: 'Sport', icon: Trophy, color: 'text-neon-blue' },
              { id: 'energy', label: 'Énergie', icon: Zap, color: 'text-amber-400' },
              { id: 'fire', label: 'Incendies', icon: Flame, color: 'text-red-500' }
          ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex items-start justify-between hover:border-slate-500 transition-colors">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{k.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{k.val}</h3>
              {k.sub && <p className="text-xs text-slate-500 mt-1">{k.sub}</p>}
            </div>
            <k.icon className={`w-8 h-8 ${k.color} opacity-80`} />
          </div>
        ))}
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[800px] lg:h-[600px]">
        
        {/* CARTE */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-dark-700 bg-dark-800 z-10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: config.theme }} /> Cartographie : {config.title}
            </h2>
          </div>
          <div className="flex-1 relative z-0">
             <MapContainer center={[42.15, 9.15]} zoom={8} className="w-full h-full bg-dark-900">
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {config.mapData.map((item, idx) => (
                  <CircleMarker 
                    key={idx} 
                    center={[item.lat, item.lng]}
                    pathOptions={{ color: config.theme, fillColor: config.theme, fillOpacity: activeTab === 'fire' ? 0.4 : 0.6, weight: 0 }}
                    radius={config.radius(item)} 
                  >
                    <Popup className="custom-popup bg-white border border-slate-200 rounded shadow-lg">
                      <div className="text-slate-900 min-w-[150px]">
                        {/* TITRE : Nom de la ville */}
                        <strong className="text-lg block border-b border-slate-200 mb-2 pb-1 font-bold">
                            {item.nom || item.commune}
                        </strong>

                        {/* CAS 1 : SPORT */}
                        {activeTab === 'sport' && (
                            <>
                                <span className="text-sky-600 font-bold block text-base">
                                    🏅 {item.nb_equipements} Équipements
                                </span>
                                <span className="text-slate-500 text-sm block mt-1">
                                    👥 {item.population_15_29} Jeunes (15-29)
                                </span>
                            </>
                        )}

                        {/* CAS 2 : ÉNERGIE */}
                        {activeTab === 'energy' && (
                            <>
                                <span className="text-amber-600 font-bold block text-base">
                                    ⚡ {Math.round(item.consototale)} MWh
                                </span>
                                <div className="text-xs text-slate-500 grid grid-cols-2 gap-x-2 gap-y-1 mt-2 bg-slate-100 p-1 rounded">
                                   <span>🏠 Résid: {item.part_residentiel}%</span>
                                   <span>🏢 Tert: {item.part_tertiaire}%</span>
                                   <span>🏭 Indu: {item.part_industrie}%</span>
                                   <span>🚜 Agri: {item.part_agriculture}%</span>
                                </div>
                            </>
                        )}

                        {/* CAS 3 : INCENDIES */}
                        {activeTab === 'fire' && (
                            <>
                                <span className="text-red-600 font-bold block text-base">
                                    🔥 {item.surface_ha} hectares
                                </span>
                                <span className="text-slate-500 text-sm block mt-1">
                                    📅 Date : {item.date}
                                </span>
                            </>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
            
            {/* Légende rapide sur la carte */}
            <div className="absolute bottom-4 right-4 bg-dark-900/80 p-3 rounded border border-dark-700 text-xs backdrop-blur-sm">
                <p className="text-white font-bold mb-1">Légende</p>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: config.theme}}></span>
                    <span className="text-slate-300">
                        {activeTab === 'fire' ? 'Surface brûlée' : 'Intensité'}
                    </span>
                </div>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE (Dynamique selon l'onglet) */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex flex-col shadow-2xl">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: config.sec }} /> Analyse des données
            </h2>
          </div>
          
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'fire' ? (
                  // --- GRAPHIQUE INCENDIES (BARRES) ---
                  <BarChart data={fireHistoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} label={{ value: 'Surface (ha)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                    <RechartsTooltip 
                        // 1. Le fond et la bordure de la boite
                        contentStyle={{ 
                            backgroundColor: '#0f172a', // Fond très sombre (Slate 900)
                            borderColor: '#334155',     // Bordure grise (Slate 700)
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        // 2. Le style du TITRE (l'année, ex: "2003") -> Couleur du thème
                        labelStyle={{ 
                            color: config.theme, 
                            fontWeight: 'bold',
                            marginBottom: '0.25rem'
                        }}
                        // 3. Le style de la VALEUR (ex: "Surface : 500ha") -> Blanc
                        itemStyle={{ 
                            color: '#e2e8f0' // Blanc cassé (Slate 200) pour être lisible
                        }}
                        // 4. La couleur au survol de la barre
                        cursor={{ fill: '#1e293b', opacity: 0.5 }}
                    />
                    <Bar dataKey="value" name="Surface brûlée (ha)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
              ) : (
                  // --- GRAPHIQUE SPORT & ENERGIE (SCATTER) ---
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      type="number" 
                      dataKey="population_15_29" 
                      name="Pop. Jeune" 
                      stroke="#94a3b8" 
                      tick={{fill: '#94a3b8'}} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey={activeTab === 'sport' ? 'nb_equipements' : 'consototale'} 
                      name="Y" 
                      stroke="#94a3b8" 
                      tick={{fill: '#94a3b8'}} 
                    />
                    <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                <div className="bg-dark-900 border border-dark-700 p-3 rounded-lg shadow-xl text-xs z-50 min-w-[120px]">
                                    {/* Le Nom de la ville en BLANC et GRAS */}
                                    <p className="font-bold text-white text-sm mb-2 border-b border-dark-700 pb-1">
                                        {d.nom}
                                    </p>
                                    
                                    {/* Conditionnel selon l'onglet */}
                                    {activeTab === 'energy' && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-slate-400">Conso:</span>
                                                {/* Valeur en couleur du thème */}
                                                <span className="font-mono font-bold" style={{ color: config.theme }}>
                                                    {Math.round(d.consototale)} MWh
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                Résidentiel: {d.part_residentiel}%
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'sport' && (
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-slate-400">Équipements:</span>
                                            {/* Valeur en couleur du thème */}
                                            <span className="font-mono font-bold" style={{ color: config.theme }}>
                                                {d.nb_equipements}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Info Population (commune aux deux) */}
                                    <div className="mt-2 pt-2 border-t border-dark-700 flex justify-between text-[10px]">
                                        <span className="text-slate-500">Pop. Jeune:</span>
                                        <span className="text-slate-300">{d.population_15_29}</span>
                                    </div>
                                </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter 
                        name="Communes" 
                        data={dataCities} 
                        fill={config.sec} 
                        fillOpacity={0.7} 
                    />
                  </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;