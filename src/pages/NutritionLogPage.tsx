
import React, { useState, useEffect, useCallback } from 'react';
import { useFitness } from '../context/FitnessContext';
import { MealType } from '../types';

import {
  Utensils,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Loader2,
  Pencil,
  X,
  Save,
} from 'lucide-react';

import { motion } from 'motion/react';
import toast from 'react-hot-toast';

import {
  getNutrition,
  updateNutrition,
  deleteNutrition as deleteNutritionApi,
} from '../services/nutritionService';

interface NutritionItem {
  _id?: string;
  id: string;
  foodItem: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  date: string;
}

interface NutritionForm {
  foodItem: string;
  quantity: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  mealType: MealType;
  date: string;
}

export const NutritionLogPage: React.FC = () => {
const { navigate, user, refreshNotifications } = useFitness();
  const [nutrition, setNutrition] = useState<NutritionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [editingItem, setEditingItem] = useState<NutritionItem | null>(null);

  const [editForm, setEditForm] = useState<NutritionForm>({
    foodItem: '',
    quantity: '1',
    calories: '0',
    protein: '0',
    carbs: '0',
    fat: '0',
    mealType: 'Breakfast',
    date: selectedDate,
  });

  const mealTypes: MealType[] = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
  ];

  // FETCH NUTRITION
  const fetchNutrition = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getNutrition({
        date: selectedDate,
      });

      const records = Array.isArray(data)
        ? data
        : data?.nutrition ??
          data?.data?.nutrition ??
          data?.data ??
          [];

      if (!Array.isArray(records)) {
        throw new Error('Invalid nutrition API response.');
      }

      const formatted: NutritionItem[] = records.map((item: any) => ({
        ...item,
        id: String(item._id || item.id),
        quantity: Number(item.quantity) || 0,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      }));

      setNutrition(formatted);
    } catch (error: any) {
      console.error('Nutrition fetch error:', error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load nutrition.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  // OPEN EDIT MODAL
  const handleEdit = (item: NutritionItem) => {
    setEditingItem(item);

    setEditForm({
      foodItem: item.foodItem || '',
      quantity: String(item.quantity ?? 1),
      calories: String(item.calories ?? 0),
      protein: String(item.protein ?? 0),
      carbs: String(item.carbs ?? 0),
      fat: String(item.fat ?? 0),
      mealType: item.mealType,
      date: item.date
        ? String(item.date).slice(0, 10)
        : selectedDate,
    });
  };

  // UPDATE NUTRITION
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem || isSaving) return;

    const quantityNumber = Number(editForm.quantity);
    const caloriesNumber = Number(editForm.calories);
    const proteinNumber = Number(editForm.protein);
    const carbsNumber = Number(editForm.carbs);
    const fatNumber = Number(editForm.fat);

    if (!editForm.foodItem.trim()) {
      toast.error('Please enter food item name.');
      return;
    }

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      toast.error('Quantity must be a positive number.');
      return;
    }

    const values = [
      caloriesNumber,
      proteinNumber,
      carbsNumber,
      fatNumber,
    ];

    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      toast.error('Calories and macros must be valid non-negative numbers.');
      return;
    }

    const nutritionData = {
      foodItem: editForm.foodItem.trim(),
      quantity: quantityNumber,
      calories: caloriesNumber,
      protein: proteinNumber,
      carbs: carbsNumber,
      fat: fatNumber,
      mealType: editForm.mealType,
      date: editForm.date,
    };

    try {
      setIsSaving(true);

   await updateNutrition(editingItem.id, nutritionData);

// Refresh Navbar notifications
await refreshNotifications();

toast.success('Nutrition updated successfully!');

setEditingItem(null);

await fetchNutrition();

    } catch (error: any) {
      console.error('Nutrition update error:', error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update nutrition.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE CONFIRMATION USING REACT HOT TOAST
  const handleDelete = (id: string) => {
    if (deletingId) return;

    const item = nutrition.find((food) => food.id === id);

    if (!item) return;

    toast(
      (t) => (
        <div className="w-full min-w-[280px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-full bg-rose-100 text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Delete Food Item?
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{' '}
                <strong>{item.foodItem}</strong>?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  setDeletingId(id);

                await deleteNutritionApi(id);

setNutrition((previous) =>
  previous.filter((food) => food.id !== id)
);

// Refresh Navbar notifications
await refreshNotifications();

toast.success('Food item deleted successfully!');

                } catch (error: any) {
                  console.error('Nutrition delete error:', error);

                  toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to delete food item.'
                  );
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: '#ffffff',
          color: '#0f172a',
          padding: '16px',
          borderRadius: '14px',
          maxWidth: '380px',
        },
      }
    );
  };

  // EDIT FORM HANDLER
  const handleFormChange = (
    field: keyof NutritionForm,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // DAILY TOTALS
  const totalCalories = nutrition.reduce(
    (acc, item) => acc + item.calories, 0
  );

  const totalProtein = nutrition.reduce(
    (acc, item) => acc + item.protein, 0
  );

  const totalCarbs = nutrition.reduce(
    (acc, item) => acc + item.carbs, 0
  );

  const totalFat = nutrition.reduce(
    (acc, item) => acc + item.fat, 0
  );

  // TARGETS
  const targetCalories = Number(user?.targetCalories) || 2450;
  const targetProtein = 175;
  const targetCarbs = 240;
  const targetFat = 65;

  const getPercentage = (value: number, target: number) => {
    return Math.min(100, (value / target) * 100);
  };

  const handleAddFoodToMeal = (meal: MealType) => {
    navigate('add-nutrition', {
      preselectedMeal: meal,
    });
  };

  return (
    <div className="space-y-6 pb-12">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Nutrition & Macro Diary</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track daily caloric intake and macronutrients.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* DATE FILTER */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm">

            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('add-nutrition')}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food</span>
          </motion.button>

        </div>
      </div>

      {/* DAILY SUMMARY */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400" />

            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Calorie & Macro Budget
            </h2>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? 'Showing Today'
              : `Date: ${selectedDate}`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* CALORIES */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">

            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Energy Intake
              </span>

              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {totalCalories} / {targetCalories} kcal
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${getPercentage(totalCalories, targetCalories)}%`,
                }}
              />
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Remaining: {Math.max(0, targetCalories - totalCalories)} kcal
            </div>
          </div>

          {/* PROTEIN */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">

            <div className="flex justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Protein
              </span>

              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {totalProtein}g / {targetProtein}g
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${getPercentage(totalProtein, targetProtein)}%`,
                }}
              />
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              {((totalProtein / targetProtein) * 100).toFixed(0)}% of target
            </div>
          </div>

          {/* CARBS */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">

            <div className="flex justify-between text-xs">
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                Carbohydrates
              </span>

              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {totalCarbs}g / {targetCarbs}g
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all"
                style={{
                  width: `${getPercentage(totalCarbs, targetCarbs)}%`,
                }}
              />
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              {((totalCarbs / targetCarbs) * 100).toFixed(0)}% of target
            </div>
          </div>

          {/* FAT */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">

            <div className="flex justify-between text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Fats
              </span>

              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {totalFat}g / {targetFat}g
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${getPercentage(totalFat, targetFat)}%`,
                }}
              />
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              {((totalFat / targetFat) * 100).toFixed(0)}% of target
            </div>
          </div>

        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (

        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
          <p className="text-sm font-medium">
            Loading meals from database...
          </p>
        </div>

      ) : (

        /* MEAL CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {mealTypes.map((meal) => {

            const items = nutrition.filter(
              (item) => item.mealType === meal
            );

            const mealKcal = items.reduce(
              (acc, item) => acc + item.calories, 0
            );

            const mealProtein = items.reduce(
              (acc, item) => acc + item.protein, 0
            );

            return (
              <div
                key={meal}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >

                <div className="space-y-3">

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {meal}
                      </h3>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {items.length} {items.length === 1 ? 'item' : 'items'} logged
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {mealKcal} kcal
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                        {mealProtein}g protein
                      </span>
                    </div>

                  </div>

                  {/* FOOD ITEMS */}
                  {items.length === 0 ? (

                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      No foods logged for {meal} yet.
                    </div>

                  ) : (

                    <div className="space-y-2">

                      {items.map((item) => (

                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                        >

                          <div className="space-y-0.5 truncate pr-2">

                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                              {item.foodItem}
                            </h4>

                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Quantity: {item.quantity}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-0.5">
                              <span className="text-emerald-600 dark:text-emerald-400">
                                P: {item.protein}g
                              </span>

                              <span>·</span>

                              <span className="text-cyan-600 dark:text-cyan-400">
                                C: {item.carbs}g
                              </span>

                              <span>·</span>

                              <span className="text-amber-600 dark:text-amber-400">
                                F: {item.fat}g
                              </span>
                            </div>

                          </div>

                          <div className="flex items-center gap-2 shrink-0">

                            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                              {item.calories} kcal
                            </span>

                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                              title="Edit Food"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Delete Food"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  onClick={() => handleAddFoodToMeal(meal)}
                  className="w-full py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food to {meal}</span>
                </button>

              </div>
            );
          })}

        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (

        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl"
          >

            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Nutrition
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Update food details and nutritional values.
                </p>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-4">

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Food Item *
                </label>

                <input
                  type="text"
                  value={editForm.foodItem}
                  onChange={(e) =>
                    handleFormChange('foodItem', e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={editForm.quantity}
                    onChange={(e) =>
                      handleFormChange('quantity', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Meal Category *
                  </label>

                  <select
                    value={editForm.mealType}
                    onChange={(e) =>
                      handleFormChange(
                        'mealType',
                        e.target.value as MealType
                      )
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    {mealTypes.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Date *
                </label>

                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    handleFormChange('date', e.target.value)
                  }
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Calories
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.calories}
                    onChange={(e) =>
                      handleFormChange('calories', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-emerald-600 mb-1">
                    Protein (g)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.protein}
                    onChange={(e) =>
                      handleFormChange('protein', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-cyan-600 mb-1">
                    Carbs (g)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.carbs}
                    onChange={(e) =>
                      handleFormChange('carbs', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-amber-600 mb-1">
                    Fat (g)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.fat}
                    onChange={(e) =>
                      handleFormChange('fat', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Food
                    </>
                  )}
                </button>

              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
