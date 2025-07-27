import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Plus, Trash2, Settings, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePomodoroStore } from '@/store/pomodoroStore';
import pomodoroIcon from '@/assets/pomodoro-icon.png';

interface PomodoroTimerExtensionProps {
  onOpenSettings?: () => void;
}

export const PomodoroTimerExtension: React.FC<PomodoroTimerExtensionProps> = ({ onOpenSettings }) => {
  const { toast } = useToast();
  
  const {
    timer,
    tasks,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    completeTimer,
    addTask,
    toggleTask,
    updateTask,
    deleteTask
  } = usePomodoroStore();

  const [newTaskText, setNewTaskText] = React.useState('');

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        usePomodoroStore.setState((state) => {
          const { minutes, seconds } = state.timer;
          
          if (seconds > 0) {
            return {
              timer: { ...state.timer, seconds: seconds - 1 }
            };
          } else if (minutes > 0) {
            return {
              timer: { ...state.timer, minutes: minutes - 1, seconds: 59 }
            };
          } else {
            // Timer completed
            state.completeTimer();
            return state;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning]);

  // Check if timer completed and show notification
  useEffect(() => {
    if (timer.minutes === 0 && timer.seconds === 0 && !timer.isRunning) {
      const nextMode = timer.mode === 'pomodoro' 
        ? (timer.completedPomodoros % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak')
        : 'pomodoro';
        
      toast({
        title: timer.mode === 'pomodoro' ? '🍅 Pomodoro Complete!' : '✅ Break Over!',
        description: nextMode === 'pomodoro' 
          ? 'Ready for your next focus session?'
          : `Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break!`,
      });

      // Trigger Chrome notification
      if (settings.notifications && typeof window !== 'undefined' && (window as any).chrome?.notifications) {
        try {
          (window as any).chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/pomodoro-48.png',
            title: timer.mode === 'pomodoro' ? '🍅 Pomodoro Complete!' : '✅ Break Over!',
            message: nextMode === 'pomodoro' 
              ? 'Ready for your next focus session?'
              : `Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break!`,
          });
        } catch (error) {
          console.log('Chrome notifications not available');
        }
      }
    }
  }, [timer.minutes, timer.seconds, timer.isRunning, timer.mode, timer.completedPomodoros, settings, toast]);

  const handleAddTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    addTask(newTaskText);
    setNewTaskText('');
    toast({
      title: '✅ Task Added',
      description: 'New task added to your list!',
    });
  }, [newTaskText, addTask, toast]);

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    switch (timer.mode) {
      case 'pomodoro':
        return 'text-primary';
      case 'shortBreak':
        return 'text-success';
      case 'longBreak':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  const getTimerGradient = () => {
    switch (timer.mode) {
      case 'pomodoro':
        return 'bg-gradient-primary';
      case 'shortBreak':
        return 'bg-gradient-success';
      case 'longBreak':
        return 'bg-gradient-secondary';
      default:
        return 'bg-gradient-primary';
    }
  };

  const getModeIcon = () => {
    switch (timer.mode) {
      case 'pomodoro':
        return '🍅';
      case 'shortBreak':
        return '☕';
      case 'longBreak':
        return '🛋️';
      default:
        return '🍅';
    }
  };

  const getModeText = () => {
    switch (timer.mode) {
      case 'pomodoro':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <div className="w-[380px] h-[600px] bg-gradient-bg p-4 overflow-hidden">
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="text-center space-y-2 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <img 
              src={pomodoroIcon} 
              alt="Pomodoro Timer" 
              className="w-8 h-8" 
            />
            <h1 className="text-xl font-bold text-text-primary">
              Pomodoro Pro
            </h1>
          </div>
        </div>

        {/* Main Timer Card */}
        <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-glass border-glass-border flex-shrink-0">
          <div className={cn(
            "absolute inset-0 opacity-5",
            getTimerGradient()
          )} />
          
          <CardContent className="relative p-4 text-center space-y-3">
            {/* Mode Badge */}
            <Badge 
              variant="secondary"
              className={cn(
                "px-3 py-1 text-xs font-medium",
                getTimerGradient()
              )}
            >
              {getModeIcon()} {getModeText()}
            </Badge>

            {/* Timer Display */}
            <div className="space-y-1">
              <div className={cn(
                "text-4xl font-bold tracking-tight",
                getTimerColor()
              )}>
                {formatTime(timer.minutes, timer.seconds)}
              </div>
              <p className="text-text-secondary text-xs">
                {timer.mode === 'pomodoro' 
                  ? 'Stay focused'
                  : 'Take a break'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={timer.isRunning ? pauseTimer : startTimer}
                size="sm"
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-300",
                  getTimerGradient()
                )}
              >
                {timer.isRunning ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
                className="px-3 py-2"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>

              <Button
                onClick={onOpenSettings}
                variant="outline"
                size="sm"
                className="px-3 py-2"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>

            {/* Stats */}
            {timer.completedPomodoros > 0 && (
              <div className="text-xs text-text-secondary pt-2 border-t border-glass-border">
                Completed: <span className="font-semibold text-primary">{timer.completedPomodoros}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card className="backdrop-blur-sm bg-gradient-glass border-glass-border flex-1 flex flex-col">
          <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1">
              📝 Tasks
            </h3>

            {/* Add Task Input */}
            <div className="flex gap-2">
              <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 h-8 text-xs bg-input/50 border-glass-border"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button 
                onClick={handleAddTask}
                size="sm"
                className="h-8 w-8 p-0 bg-gradient-success"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-1 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-text-muted text-center py-4 text-xs">
                  No tasks yet 🚀
                </p>
              ) : (
                tasks.map((task) => (
                  <TaskItemExtension
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

// Compact Task Item for extension
interface TaskItemExtensionProps {
  task: any;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, newText: string) => void;
}

const TaskItemExtension: React.FC<TaskItemExtensionProps> = ({ task, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-md transition-all duration-200",
      "bg-gradient-glass border border-glass-border hover:shadow-sm",
      task.completed && "opacity-60"
    )}>
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
          task.completed 
            ? "bg-gradient-success border-success text-white" 
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditText(task.text);
              setIsEditing(false);
            }
          }}
          className="flex-1 h-6 text-xs"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 text-xs cursor-pointer hover:text-primary transition-colors truncate",
            task.completed 
              ? "line-through text-text-muted" 
              : "text-text-primary"
          )}
          title={task.text}
        >
          {task.text}
        </span>
      )}

      <Button
        onClick={() => onDelete(task.id)}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};