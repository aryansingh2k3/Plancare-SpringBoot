import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Droplets, Calendar, Sparkles, Plus, Trash2, ShieldAlert, Heart, Thermometer, Wind, Compass } from 'lucide-react';

export default function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [careRecords, setCareRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Care Form State
  const [careType, setCareType] = useState('Watering');
  const [careDate, setCareDate] = useState(new Date().toISOString().substring(0, 16));
  const [notes, setNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // AI Assistant State
  const [aiTips, setAiTips] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      // Fetch plant details
      const plantResponse = await axios.get(`http://localhost:8080/api/plants/${id}`);
      setPlant(plantResponse.data);

      // Fetch care records
      const careResponse = await axios.get(`http://localhost:8080/api/plants/${id}/care`);
      setCareRecords(careResponse.data);
    } catch (error) {
      console.error('Error fetching plant details:', error);
      if (error.response?.status === 404) {
        alert('Plant not found!');
        navigate('/plants');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantData();
  }, [id]);

  const handleLogCare = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      await axios.post(`http://localhost:8080/api/plants/${id}/care`, {
        careType,
        careDate: new Date(careDate).toISOString(),
        notes
      });
      
      // Reset form
      setNotes('');
      setCareDate(new Date().toISOString().substring(0, 16));
      
      // Refresh plant info (dates recalculated) and history timeline
      await fetchPlantData();
    } catch (error) {
      console.error('Error logging care record:', error);
      alert('Failed to log care activity.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCare = async (recordId) => {
    if (window.confirm('Delete this care record?')) {
      try {
        await axios.delete(`http://localhost:8080/api/care/${recordId}`);
        // Refresh
        await fetchPlantData();
      } catch (error) {
        console.error('Error deleting care record:', error);
        alert('Failed to delete care record.');
      }
    }
  };

  const handleAskAI = async () => {
    if (!plant) return;
    try {
      setAiLoading(true);
      setAiTips('');
      const response = await axios.get('http://localhost:8080/api/ai/tips', {
        params: { species: plant.species }
      });
      setAiTips(response.data.tips);
    } catch (error) {
      console.error('Error fetching AI tips:', error);
      setAiTips('Failed to load AI suggestions. Please check backend log or API keys.');
    } finally {
      setAiLoading(false);
    }
  };

  // Custom regex-based markdown parser to avoid external dependencies in interviews
  const formatMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h4 class="text-md font-bold text-emerald-200 mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-emerald-100 mt-5 mb-3">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-4">$1</h2>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-sm text-emerald-200/90 mb-1.5">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .split('\n').map((line) => {
        if (line.trim().startsWith('<li') || line.trim().startsWith('<h')) return line;
        if (line.trim() === '') return '';
        return `<p class="text-sm text-emerald-100/95 leading-relaxed mb-2">${line}</p>`;
      }).join('');
  };

  if (loading && !plant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!plant) return null;

  const today = new Date().toISOString().split('T')[0];
  const isDue = plant.nextWateringDate && plant.nextWateringDate <= today;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button */}
      <div>
        <Link to="/plants" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors font-semibold">
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </Link>
      </div>

      {/* Main Grid: Details Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Plant Image */}
        <div className="lg:col-span-5 h-80 lg:h-auto min-h-[300px] relative bg-gray-100">
          <img
            src={plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'}
            alt={plant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800';
            }}
          />
          {isDue && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1.5">
              <Droplets size={14} className="fill-current" />
              <span>Watering Due Today</span>
            </span>
          )}
        </div>

        {/* Specs Content */}
        <div className="lg:col-span-7 p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {plant.category || 'General'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">{plant.name}</h1>
            <p className="text-sm italic text-gray-400 font-medium">{plant.species}</p>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              {plant.description || 'No description added for this plant.'}
            </p>
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-gray-100 py-6 my-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                <Compass size={12} className="text-yellow-500" /> Sunlight
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">{plant.sunlightRequirement || 'Not Specified'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                <Wind size={12} className="text-blue-400" /> Soil
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">{plant.soilType || 'Not Specified'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                <Thermometer size={12} className="text-red-400" /> Temp
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">{plant.temperatureRange || 'Not Specified'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                <Heart size={12} className="text-purple-400" /> Humidity
              </span>
              <span className="text-sm font-semibold text-gray-700 mt-1">{plant.humidityRequirement || 'Not Specified'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Watering Frequency</p>
              <p className="font-semibold text-gray-700 mt-0.5">Every {plant.wateringFrequency} days</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Watering Scheduled</p>
              <p className={`font-bold mt-0.5 ${isDue ? 'text-amber-600' : 'text-gray-700'}`}>
                {plant.nextWateringDate || 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Care logging column */}
        <div className="space-y-6">
          {/* Log care form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Calendar size={18} className="text-emerald-500" />
              <span>Log Care Event</span>
            </h3>
            
            <form onSubmit={handleLogCare} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Care Type</label>
                <select
                  value={careType}
                  onChange={(e) => setCareType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer font-semibold"
                >
                  <option value="Watering">💧 Watering</option>
                  <option value="Fertilization">🧪 Fertilization</option>
                  <option value="Repotting">🪴 Repotting</option>
                  <option value="Pruning">✂️ Pruning</option>
                  <option value="Mist">💨 Misting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Care Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={careDate}
                  onChange={(e) => setCareDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes / Observations</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Added diluted liquid fertilizer, checked soil moisture."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>{formSubmitting ? 'Logging...' : 'Save Entry'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Assistant Section */}
          <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
              <Sparkles size={160} />
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-emerald-400 fill-emerald-400 animate-pulse" size={20} />
                <h3 className="text-lg font-bold text-emerald-100">AI Care Assistant</h3>
              </div>
              <button
                onClick={handleAskAI}
                disabled={aiLoading}
                className="px-4 py-2 bg-white text-emerald-950 rounded-xl text-xs font-bold hover:bg-emerald-50 shadow-sm disabled:bg-emerald-800 disabled:text-emerald-400 transition-colors cursor-pointer"
              >
                {aiLoading ? 'Thinking...' : aiTips ? 'Ask Again' : 'Get Care Tips'}
              </button>
            </div>

            {aiLoading ? (
              <div className="py-6 flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-emerald-300 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-emerald-300 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-emerald-300 rounded-full animate-bounce delay-200"></div>
              </div>
            ) : aiTips ? (
              <div 
                className="prose prose-sm prose-invert max-w-none bg-emerald-900/40 p-4 rounded-xl border border-emerald-800/50 mt-2 max-h-[300px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(aiTips) }}
              />
            ) : (
              <p className="text-sm text-emerald-200 mt-2 leading-relaxed">
                Click above to generate intelligent watering, sunlight, and humidity tips specifically tailored for the **{plant.species}** species.
              </p>
            )}
          </div>

          {/* Care History list */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center space-x-2">
              <Calendar size={18} className="text-purple-500" />
              <span>Care History Timeline</span>
            </h3>

            {careRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShieldAlert className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm font-semibold">No care activities recorded yet.</p>
                <p className="text-xs text-gray-400 mt-0.5">Use the form to record watering, feeding, etc.</p>
              </div>
            ) : (
              <div className="relative border-l border-gray-100 ml-3 pl-6 space-y-6">
                {careRecords.map((record) => {
                  const dateObj = new Date(record.careDate);
                  const formattedDate = dateObj.toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Setup icons and styling for careTypes
                  let typeColor = 'bg-blue-50 text-blue-600 border-blue-100';
                  let emoji = '💧';
                  if (record.careType.toLowerCase().contains?.('fertil') || record.careType.toLowerCase().includes('fertil')) {
                    typeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    emoji = '🧪';
                  } else if (record.careType.toLowerCase().contains?.('repot') || record.careType.toLowerCase().includes('repot')) {
                    typeColor = 'bg-amber-50 text-amber-600 border-amber-100';
                    emoji = '🪴';
                  } else if (record.careType.toLowerCase().contains?.('prun') || record.careType.toLowerCase().includes('prun')) {
                    typeColor = 'bg-purple-50 text-purple-600 border-purple-100';
                    emoji = '✂️';
                  } else if (record.careType.toLowerCase().contains?.('mist') || record.careType.toLowerCase().includes('mist')) {
                    typeColor = 'bg-sky-50 text-sky-600 border-sky-100';
                    emoji = '💨';
                  }

                  return (
                    <div key={record.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-purple-500 shadow-xs"></span>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${typeColor}`}>
                              <span className="mr-1">{emoji}</span>
                              {record.careType}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">{formattedDate} at {formattedTime}</span>
                          </div>
                          
                          {record.notes && (
                            <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50 leading-relaxed">
                              {record.notes}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteCare(record.id)}
                          className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete care entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
