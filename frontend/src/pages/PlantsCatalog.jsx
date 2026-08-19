import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Droplet, Plus, Trash2, Edit3, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function PlantsCatalog() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [wateringDue, setWateringDue] = useState(false);

  // Available categories list for filter options
  const categories = ['Indoor', 'Outdoor', 'Succulent', 'Fern', 'Herbs', 'Tropical', 'Other'];

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (wateringDue) params.wateringDue = true;

      const response = await axios.get('http://localhost:8080/api/plants', { params });
      setPlants(response.data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic debounce for search input to prevent firing rapid network requests
    const delayDebounceFn = setTimeout(() => {
      fetchPlants();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, wateringDue]);

  const handleDelete = async (e, id, name) => {
    e.preventDefault(); // Stop navigation if clicked card wrapper
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/plants/${id}`);
        // Refresh catalog list
        fetchPlants();
      } catch (error) {
        console.error('Error deleting plant:', error);
        alert('Failed to delete plant.');
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">My Plants</h1>
          <p className="text-gray-500 mt-1">Manage and track your plant collection.</p>
        </div>
        <Link
          to="/plants/new"
          className="inline-flex items-center space-x-1.5 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-sm transition-colors cursor-pointer w-fit"
        >
          <Plus size={18} />
          <span>Add Plant</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="relative md:col-span-3">
          <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white appearance-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Watering Due Checkbox */}
        <div className="md:col-span-4 flex items-center md:justify-end px-2">
          <label className="inline-flex items-center cursor-pointer select-none space-x-2.5">
            <input
              type="checkbox"
              checked={wateringDue}
              onChange={(e) => setWateringDue(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
            <span className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Droplet size={14} className="text-blue-500" />
              <span>Needs Watering</span>
            </span>
          </label>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : plants.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-4">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Plants Found</h3>
          <p className="text-sm text-gray-400 mt-1">Try clearing filters or search to view items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => {
            const isDue = plant.nextWateringDate && plant.nextWateringDate <= today;
            return (
              <div 
                key={plant.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300"
              >
                {/* Image Section */}
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=500'}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=500';
                    }}
                  />
                  {/* Category Pill */}
                  {plant.category && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      {plant.category}
                    </span>
                  )}
                  {/* Watering Due Badge */}
                  {isDue && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                      <Droplet size={12} className="fill-current" />
                      <span>Thirsty</span>
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-600 transition-colors leading-tight">
                        {plant.name}
                      </h3>
                      <Link 
                        to={`/plants/${plant.id}`} 
                        className="text-gray-400 hover:text-emerald-600 transition-colors p-1"
                        title="View details"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                    <p className="text-xs italic text-gray-400">{plant.species}</p>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                      {plant.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-gray-50 mt-4 pt-4 flex justify-between items-center text-xs text-gray-500">
                    <div>
                      <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">Water Frequency</p>
                      <p className="font-semibold text-gray-700 mt-0.5">Every {plant.wateringFrequency} {plant.wateringFrequency === 1 ? 'day' : 'days'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-400 uppercase tracking-wider text-[10px]">Next Watering</p>
                      <p className={`font-semibold mt-0.5 ${isDue ? 'text-amber-600 font-bold' : 'text-gray-700'}`}>
                        {plant.nextWateringDate || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex border-t border-gray-100 mt-4 pt-3 gap-2">
                    <Link
                      to={`/plants/${plant.id}/edit`}
                      className="flex-1 inline-flex justify-center items-center space-x-1 py-2 border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 rounded-xl font-semibold text-xs transition-colors"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, plant.id, plant.name)}
                      className="inline-flex justify-center items-center py-2 px-3 border border-gray-100 hover:border-red-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                      title="Delete plant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
