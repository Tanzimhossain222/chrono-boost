import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface PomodoroSettings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  sounds: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  currentCycle: number;
}

export interface PomodoroState {
  // Timer
  timer: TimerState;
  
  // Tasks
  tasks: Task[];
  
  // Settings
  settings: PomodoroSettings;
  
  // Statistics
  dailyStats: {
    date: string;
    completedPomodoros: number;
    totalFocusTime: number;
    completedTasks: number;
  }[];
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  completeTimer: () => void;
  
  // Task actions
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  
  // Stats actions
  updateDailyStats: () => void;
}

const defaultSettings: PomodoroSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notifications: true,
  sounds: true,
  theme: 'system'
};

const defaultTimer: TimerState = {
  minutes: 25,
  seconds: 0,
  isRunning: false,
  mode: 'pomodoro',
  completedPomodoros: 0,
  currentCycle: 1
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      timer: defaultTimer,
      tasks: [],
      settings: defaultSettings,
      dailyStats: [],

      startTimer: () => {
        set((state) => ({
          timer: { ...state.timer, isRunning: true }
        }));
      },

      pauseTimer: () => {
        set((state) => ({
          timer: { ...state.timer, isRunning: false }
        }));
      },

      resetTimer: () => {
        const { settings, timer } = get();
        const duration = timer.mode === 'pomodoro' 
          ? settings.pomodoroDuration 
          : timer.mode === 'shortBreak' 
            ? settings.shortBreakDuration 
            : settings.longBreakDuration;

        set((state) => ({
          timer: {
            ...state.timer,
            minutes: duration,
            seconds: 0,
            isRunning: false
          }
        }));
      },

      completeTimer: () => {
        const { timer, settings } = get();
        let newMode: TimerState['mode'];
        let newCompletedPomodoros = timer.completedPomodoros;
        let newCycle = timer.currentCycle;

        if (timer.mode === 'pomodoro') {
          newCompletedPomodoros += 1;
          // Determine break type
          if (newCompletedPomodoros % settings.longBreakInterval === 0) {
            newMode = 'longBreak';
          } else {
            newMode = 'shortBreak';
          }
        } else {
          newMode = 'pomodoro';
          if (timer.mode === 'longBreak') {
            newCycle += 1;
          }
        }

        const duration = newMode === 'pomodoro' 
          ? settings.pomodoroDuration 
          : newMode === 'shortBreak' 
            ? settings.shortBreakDuration 
            : settings.longBreakDuration;

        set((state) => ({
          timer: {
            ...state.timer,
            mode: newMode,
            minutes: duration,
            seconds: 0,
            isRunning: settings.autoStartBreaks || (newMode === 'pomodoro' && settings.autoStartPomodoros),
            completedPomodoros: newCompletedPomodoros,
            currentCycle: newCycle
          }
        }));

        get().updateDailyStats();
      },

      addTask: (text: string) => {
        const newTask: Task = {
          id: Date.now().toString(),
          text: text.trim(),
          completed: false,
          createdAt: new Date()
        };

        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id 
              ? { 
                  ...task, 
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date() : undefined
                }
              : task
          )
        }));
        get().updateDailyStats();
      },

      updateTask: (id: string, text: string) => {
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, text: text.trim() } : task
          )
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      updateSettings: (newSettings: Partial<PomodoroSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));

        // Reset timer if duration changed
        const { timer, settings } = get();
        if (newSettings.pomodoroDuration && timer.mode === 'pomodoro') {
          set((state) => ({
            timer: {
              ...state.timer,
              minutes: settings.pomodoroDuration,
              seconds: 0,
              isRunning: false
            }
          }));
        }
      },

      updateDailyStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const { dailyStats, timer, tasks } = get();
        
        const todayStats = dailyStats.find(stat => stat.date === today);
        const completedTasksToday = tasks.filter(task => 
          task.completed && 
          task.completedAt && 
          new Date(task.completedAt).toISOString().split('T')[0] === today
        ).length;

        if (todayStats) {
          set((state) => ({
            dailyStats: state.dailyStats.map(stat => 
              stat.date === today 
                ? {
                    ...stat,
                    completedPomodoros: timer.completedPomodoros,
                    totalFocusTime: timer.completedPomodoros * get().settings.pomodoroDuration,
                    completedTasks: completedTasksToday
                  }
                : stat
            )
          }));
        } else {
          set((state) => ({
            dailyStats: [...state.dailyStats, {
              date: today,
              completedPomodoros: timer.completedPomodoros,
              totalFocusTime: timer.completedPomodoros * get().settings.pomodoroDuration,
              completedTasks: completedTasksToday
            }]
          }));
        }
      }
    }),
    {
      name: 'pomodoro-storage',
      version: 1
    }
  )
);