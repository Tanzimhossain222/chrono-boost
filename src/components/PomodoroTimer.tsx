import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Plus, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import pomodoroIcon from '@/assets/pomodoro-icon.png';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'break';
  completedPomodoros: number;
}

interface PomodoroTimerProps {
  onOpenSettings?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onOpenSettings }) => {
  const { toast } = useToast();
  
  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'pomodoro',
    completedPomodoros: 0
  });
  
  // Task management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Settings
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  // Timer logic
  const resetTimer = useCallback(() => {
    const duration = timer.mode === 'pomodoro' ? pomodoroDuration : breakDuration;
    setTimer(prev => ({
      ...prev,
      minutes: duration,
      seconds: 0,
      isRunning: false
    }));
  }, [timer.mode, pomodoroDuration, breakDuration]);

  const toggleTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  }, []);

  const switchMode = useCallback(() => {
    const newMode = timer.mode === 'pomodoro' ? 'break' : 'pomodoro';
    const duration = newMode === 'pomodoro' ? pomodoroDuration : breakDuration;
    
    setTimer(prev => ({
      ...prev,
      mode: newMode,
      minutes: duration,
      seconds: 0,
      isRunning: false,
      completedPomodoros: newMode === 'break' ? prev.completedPomodoros + 1 : prev.completedPomodoros
    }));

    // Show notification
    toast({
      title: newMode === 'break' ? '🍅 Pomodoro Complete!' : '🎯 Break Time Over!',
      description: newMode === 'break' 
        ? `Great job! Time for a ${breakDuration} minute break.`
        : 'Ready to start your next Pomodoro session?',
    });
  }, [timer.mode, pomodoroDuration, breakDuration, toast]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer completed
            return { ...prev, isRunning: false };
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning]);

  // Check if timer completed
  useEffect(() => {
    if (timer.minutes === 0 && timer.seconds === 0 && !timer.isRunning) {
      switchMode();
    }
  }, [timer.minutes, timer.seconds, timer.isRunning, switchMode]);

  // Task management functions
  const addTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    
    toast({
      title: '✅ Task Added',
      description: 'New task added to your list!',
    });
  }, [newTaskText, toast]);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: '🗑️ Task Deleted',
      description: 'Task removed from your list.',
    });
  }, [toast]);

  const updateTask = useCallback((taskId: string, newText: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, text: newText }
        : task
    ));
  }, []);

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerGradient = () => {
    return timer.mode === 'pomodoro' ? 'bg-gradient-primary' : 'bg-gradient-success';
  };

  const getButtonVariant = () => {
    return timer.mode === 'pomodoro' ? 'default' : 'success';
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={pomodoroIcon} 
              alt="Pomodoro Timer" 
              className="w-12 h-12 drop-shadow-lg" 
            />
            <h1 className="text-3xl font-bold text-text-primary">
              Pomodoro Timer
            </h1>
          </div>
          <p className="text-text-secondary">
            Stay focused and boost your productivity
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="relative overflow-hidden backdrop-blur-sm bg-glass-bg border-glass-border shadow-xl">
          <div className={cn(
            "absolute inset-0 opacity-10",
            getTimerGradient()
          )} />
          
          <CardContent className="relative p-8 text-center space-y-6">
            {/* Mode Badge */}
            <Badge 
              variant={timer.mode === 'pomodoro' ? 'default' : 'secondary'}
              className={cn(
                "px-4 py-2 text-sm font-medium",
                timer.mode === 'pomodoro' ? getTimerGradient() : 'bg-gradient-success'
              )}
            >
              {timer.mode === 'pomodoro' ? '🍅 Focus Time' : '☕ Break Time'}
            </Badge>

            {/* Timer Display */}
            <div className="space-y-2">
              <div className={cn(
                "text-6xl md:text-7xl font-bold tracking-tight",
                timer.mode === 'pomodoro' ? 'text-primary' : 'text-success'
              )}>
                {formatTime(timer.minutes, timer.seconds)}
              </div>
              <p className="text-text-secondary">
                {timer.mode === 'pomodoro' 
                  ? 'Stay focused on your current task'
                  : 'Take a well-deserved break'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={cn(
                  "px-8 py-3 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-glow",
                  getTimerGradient()
                )}
              >
                {timer.isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="px-6 py-3 hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>

              <Button
                onClick={onOpenSettings}
                variant="outline"
                size="lg"
                className="px-3 py-3 hover:scale-105 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Completed Pomodoros */}
            {timer.completedPomodoros > 0 && (
              <div className="text-center pt-4 border-t border-glass-border">
                <p className="text-text-secondary">
                  Completed Pomodoros: <span className="font-bold text-primary">{timer.completedPomodoros}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card className="backdrop-blur-sm bg-glass-bg border-glass-border shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              📝 Today's Tasks
            </h3>

            {/* Add Task Input */}
            <div className="flex gap-2">
              <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="What are you working on?"
                className="flex-1 bg-input/50 border-glass-border focus:bg-input"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <Button 
                onClick={addTask}
                className="bg-gradient-success hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-text-muted text-center py-4">
                  No tasks yet. Add one to get started! 🚀
                </p>
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Task Item Component
interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, newText: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:shadow-md",
      "bg-gradient-glass border border-glass-border",
      task.completed && "opacity-75"
    )}>
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          task.completed 
            ? "bg-gradient-success border-success text-success-foreground" 
            : "border-text-muted hover:border-success"
        )}
      >
        {task.completed && <span className="text-xs">✓</span>}
      </button>

      {isEditing ? (
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          className="flex-1 h-8 text-sm"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 text-sm cursor-pointer hover:text-primary transition-colors",
            task.completed 
              ? "line-through text-text-muted" 
              : "text-text-primary"
          )}
        >
          {task.text}
        </span>
      )}

      <Button
        onClick={() => onDelete(task.id)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};