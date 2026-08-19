import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, PlusCircle, PenTool, Sprout, Sparkles } from 'lucide-react';

export default function PlantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    category: 'Indoor',
    description: '',
    sunlightRequirement: 'Medium Light',
    wateringFrequency: 7,
    lastWateredDate: new Date().toISOString().split('T')[0],
    soilType: 'General Potting Mix',
    temperatureRange: '18°C - 24°C',
    humidityRequirement: 'Medium',
    imageUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Suggested default images for quick fill in
  const imagePresets = [
    { label: 'Monstera/Foliage', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600' },
    { label: 'Succulent/Cactus', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600' },
    { label: 'Boston Fern', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600' },
    { label: 'Snake Plant', url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600' },
    { label: 'Pothos Vine', url: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?w=600' }
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchPlant = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8080/api/plants/${id}`);
          const plant = response.data;
          
          // Map to state
          setFormData({
            name: plant.name || '',
            species: plant.species || '',
            category: plant.category || 'Indoor',
            description: plant.description || '',
            sunlightRequirement: plant.sunlightRequirement || 'Medium Light',
            wateringFrequency: plant.wateringFrequency || 7,
            lastWateredDate: plant.lastWateredDate || '',
            soilType: plant.soilType || '',
            temperatureRange: plant.temperatureRange || '',
            humidityRequirement: plant.humidityRequirement || 'Medium',
            imageUrl: plant.imageUrl || ''
          });
        } catch (error) {
          console.error('Error fetching plant:', error);
          alert('Failed to load plant details.');
          navigate('/plants');
        } finally {
          setLoading(false);
        }
      };

      fetchPlant();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'wateringFrequency' ? parseInt(value, 10) || '' : value
    }));
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validations
    if (!formData.name.trim()) return alert('Plant Name is required.');
    if (!formData.species.trim()) return alert('Plant Species is required.');
    if (!formData.wateringFrequency || formData.wateringFrequency < 1) {
      return alert('Watering frequency must be at least 1 day.');
    }

    try {
      setSubmitting(true);
      
      const payload = { ...formData };
      if (!payload.lastWateredDate) {
        payload.lastWateredDate = new Date().toISOString().split('T')[0];
      }

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/plants/${id}`, payload);
        navigate(`/plants/${id}`);
      } else {
        await axios.post('http://localhost:8080/api/plants', payload);
        navigate('/plants');
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      const backendError = error.response?.data?.message || 'Error occurred while saving plant details.';
      alert(backendError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <div>
        <Link 
          to={isEditMode ? `/plants/${id}` : '/plants'} 
          className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-50 pb-5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            {isEditMode ? <PenTool size={24} /> : <PlusCircle size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Plant Details' : 'Add New Plant'}</h1>
            <p className="text-sm text-gray-400">Specify details to track watering schedules and care tasks.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plant Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Living Room Monstera"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Species *</label>
              <input
                type="text"
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                placeholder="e.g. Monstera Deliciosa"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Succulent">Succulent / Cactus</option>
                <option value="Fern">Fern</option>
                <option value="Herbs">Herbs</option>
                <option value="Tropical">Tropical Foliage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Watering Frequency (days) *</label>
              <input
                type="number"
                name="wateringFrequency"
                required
                min="1"
                value={formData.wateringFrequency}
                onChange={handleChange}
                placeholder="e.g. 7"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Watered Date</label>
              <input
                type="date"
                name="lastWateredDate"
                value={formData.lastWateredDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sunlight Requirement</label>
              <select
                name="sunlightRequirement"
                value={formData.sunlightRequirement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                <option value="Bright Direct">☀️ Bright Direct Light</option>
                <option value="Bright Indirect">🌤️ Bright Indirect Light</option>
                <option value="Medium Light">⛅ Medium Light</option>
                <option value="Low Light">🌑 Low Light</option>
              </select>
            </div>
          </div>

          {/* Section 2: Soil & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-50 pt-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Soil Type</label>
              <input
                type="text"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                placeholder="e.g. Well-draining soil"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Temp Range</label>
              <input
                type="text"
                name="temperatureRange"
                value={formData.temperatureRange}
                onChange={handleChange}
                placeholder="e.g. 18°C - 24°C"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Humidity</label>
              <select
                name="humidityRequirement"
                value={formData.humidityRequirement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                <option value="High">💦 High</option>
                <option value="Medium">☁️ Medium</option>
                <option value="Low">🌵 Low</option>
              </select>
            </div>
          </div>

          {/* Image & Presets */}
          <div className="border-t border-gray-50 pt-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plant Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Paste an image URL (Unsplash, etc.) or select a preset below"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>
            
            {/* Quick Fill presets */}
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center space-x-1.5 mb-2">
                <Sparkles size={11} className="text-yellow-500" />
                <span>Quick Preset Images</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {imagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      formData.imageUrl === preset.url
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-50 pt-5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plant Description / Notes</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Gifted by mom. Needs fertilizer in spring. Keep away from cold drafts."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:bg-emerald-300 cursor-pointer"
          >
            <Save size={18} />
            <span>{submitting ? 'Saving...' : isEditMode ? 'Update Plant' : 'Create Plant'}</span>
          </button>

        </form>
      </div>
    </div>
  );
}
