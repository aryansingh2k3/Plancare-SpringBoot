import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sprout, Droplets, Calendar, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all plants
      const response = await axios.get('http://localhost:8080/api/plants');
      setPlants(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick water action
  const handleQuickWater = async (plantId) => {
    try {
      setActionLoading(plantId);
      await axios.post(`http://localhost:8080/api/plants/${plantId}/care`, {
        careType: 'Watering',
        careDate: new Date().toISOString(),
        notes: 'Quick watered from Dashboard'
      });
      // Refresh list to update next watering date and thirsty count
      await fetchDashboardData();
    } catch (error) {
      console.error('Error logging watering:', error);
      alert('Failed to log watering. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper calculations
  const totalPlants = plants.length;
  const today = new Date().toISOString().split('T')[0];
  
  const thirstyPlants = plants.filter(p => {
    if (!p.nextWateringDate) return false;
    return p.nextWateringDate <= today;
  });

  const upcomingPlants = plants.filter(p => {
    if (!p.nextWateringDate) return false;
    return p.nextWateringDate > today;
  }).sort((a, b) => new Date(a.nextWateringDate) - new Date(b.nextWateringDate));

  if (loading && plants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">PlantCare AI Dashboard</h1>
        <p className="text-gray-500 mt-1">Keep your leafy companions healthy, hydrated, and happy.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Plants Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sprout size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Plants</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{totalPlants}</h3>
          </div>
        </div>

        {/* Thirsty Plants Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className={`p-4 rounded-xl ${thirstyPlants.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            <Droplets size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Thirsty Plants</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
              {thirstyPlants.length}
            </h3>
          </div>
        </div>

        {/* Calendar / Watering Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Watering Status</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">
              {thirstyPlants.length > 0 ? `${thirstyPlants.length} need water` : 'All hydrated!'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Hydration Alert List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-amber-500" size={22} />
                <h2 className="text-xl font-bold text-gray-800">Hydration Needed Today</h2>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                Action Required
              </span>
            </div>

            {thirstyPlants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <CheckCircle2 size={48} className="text-emerald-500 mb-3" />
                <p className="text-lg font-medium text-gray-600">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No plants are currently dry.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {thirstyPlants.map((plant) => (
                  <div key={plant.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=150'} 
                        alt={plant.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=150';
                        }}
                      />
                      <div>
                        <Link to={`/plants/${plant.id}`} className="font-semibold text-gray-800 hover:text-emerald-600 transition-colors">
                          {plant.name}
                        </Link>
                        <p className="text-xs text-gray-400">{plant.species}</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Watering due: {plant.nextWateringDate || 'Pending'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickWater(plant.id)}
                      disabled={actionLoading === plant.id}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Droplets size={16} />
                      <span>{actionLoading === plant.id ? 'Saving...' : 'Watered'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info - Upcoming Schedules */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center space-x-2">
              <Activity size={20} className="text-purple-500" />
              <span>Upcoming Watering</span>
            </h2>

            {upcomingPlants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No scheduled tasks.</p>
            ) : (
              <div className="space-y-4">
                {upcomingPlants.slice(0, 4).map((plant) => {
                  const daysLeft = Math.ceil(
                    (new Date(plant.nextWateringDate) - new Date(today)) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={plant.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <img
                          src={plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=150'}
                          alt={plant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=150';
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{plant.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">due on {plant.nextWateringDate}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                        in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  );
                })}
                {upcomingPlants.length > 4 && (
                  <Link to="/plants" className="text-xs text-emerald-600 font-bold hover:text-emerald-700 mt-2 block text-center flex items-center justify-center space-x-1">
                    <span>View all plants</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
