
import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { MealType } from '../types';
import { PRESET_FOODS } from '../data/mockData';
import { createNutrition } from '../services/nutritionService';

import {
  Utensils,
  Save,
  ArrowLeft,
  Sparkles,
  Calendar,
  Loader2,
} from 'lucide-react';

import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const AddNutritionPage: React.FC = () => {
const {
  navigate,
  preselectedMeal,
  refreshNotifications,
} = useFitness();
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');

  const [calories, setCalories] = useState<number>(350);
  const [protein, setProtein] = useState<number>(30);
  const [carbs, setCarbs] = useState<number>(35);
  const [fat, setFat] = useState<number>(10);

  const [mealType, setMealType] = useState<MealType>(
    preselectedMeal || 'Breakfast'
  );

  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [isSaving, setIsSaving] = useState(false);

  // Convert quantity text into a positive number.
  // Examples:
  // "200g fillet" => 200
  // "1 medium bowl" => 1
  // "2 scoops" => 2
  // "1 scoop (30g)" => 30

  const getNumericQuantity = (value: string): number => {
    const text = value.trim();

    if (!text) return 1;

    const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*g\b/i);

    if (gramMatch) {
      return Number(gramMatch[1]);
    }

    const numberMatch = text.match(/\d+(?:\.\d+)?/);

    if (numberMatch) {
      return Number(numberMatch[0]);
    }

    return NaN;
  };

  // APPLY FOOD PRESET
  const applyPreset = (preset: typeof PRESET_FOODS[0]) => {
    setFoodItem(preset.foodItem);
    setQuantity(String(preset.quantity));
    setCalories(preset.calories);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFat(preset.fat);

    if (!preselectedMeal) {
      setMealType(preset.mealType);
    }
  };

  // SAVE NUTRITION TO DATABASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    if (!foodItem.trim()) {
      toast.error('Please enter food item name.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login again.');
      return;
    }

    const numericQuantity = getNumericQuantity(quantity);

    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    const nutritionData = {
      foodItem: foodItem.trim(),
      quantity: numericQuantity,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      mealType,
      date,
    };

    try {
      setIsSaving(true);

      console.log('Saving nutrition:', nutritionData);

   const response = await createNutrition(nutritionData);

console.log('Nutrition API response:', response);

// Refresh Navbar notifications
await refreshNotifications();

toast.success(
  response?.message || 'Food item saved successfully!'
);

navigate('nutrition');

    } catch (error: any) {
      console.error('Nutrition save error:', error);
      console.error('Nutrition error response:', error?.response?.data);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save nutrition.'
      );

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">

        <button
          type="button"
          onClick={() => navigate('nutrition')}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Nutrition Log</span>
        </button>

        <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
          Dietary Logger
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6"
      >

        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Add Food to {mealType}</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Input macronutrients and caloric values to maintain your nutritional balance.
          </p>
        </div>

        {/* QUICK FOOD PRESETS */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Quick Select Standard Food Items (1-Click Fill)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {PRESET_FOODS.map((item) => (
              <button
                key={item.foodItem}
                type="button"
                onClick={() => applyPreset(item)}
                className="text-left p-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/30 transition-colors group shadow-xs"
              >
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                  {item.foodItem}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.calories} kcal
                  </span>

                  <span className="text-emerald-600 dark:text-emerald-400">
                    P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* FOOD AND MEAL */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">

            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Food Item Description *
              </label>

              <input
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                placeholder="e.g. Grilled Chicken Breast with Brown Rice"
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Meal Category *
              </label>

              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

          </div>

          {/* QUANTITY AND DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Portion / Quantity (Optional)
              </label>

              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 200g fillet, 1 medium bowl, 2 scoops"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Log Date *
              </label>

              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:bg-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

          </div>

          {/* MACROS */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">

            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Nutritional Breakdown
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Calories (kcal) *
                </label>

                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                  Protein (g) *
                </label>

                <input
                  type="number"
                  min="0"
                  max="500"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-cyan-600 dark:text-cyan-400 mb-1">
                  Carbs (g) *
                </label>

                <input
                  type="number"
                  min="0"
                  max="800"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-1">
                  Fat (g) *
                </label>

                <input
                  type="number"
                  min="0"
                  max="300"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">

            <button
              type="button"
              disabled={isSaving}
              onClick={() => navigate('nutrition')}
              className="px-4 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <motion.button
              whileHover={!isSaving ? { scale: 1.02 } : undefined}
              whileTap={!isSaving ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Food Item</span>
                </>
              )}
            </motion.button>

          </div>
        </form>
      </motion.div>
    </div>
  );
};
