import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Clock, Coffee, Sun, Moon, Bell, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePomodoroStore, PomodoroSettings } from '@/store/pomodoroStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { settings, updateSettings } = usePomodoroStore();
  
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with store settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setIsDirty(false);
    }
  }, [isOpen, settings]);

  const handleSettingChange = (key: keyof PomodoroSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Validate settings
    if (localSettings.pomodoroDuration < 1 || localSettings.pomodoroDuration > 60) {
      toast({
        title: '⚠️ Invalid Duration',
        description: 'Pomodoro duration must be between 1 and 60 minutes.',
        variant: 'destructive'
      });
      return;
    }

    if (localSettings.shortBreakDuration < 1 || localSettings.shortBreakDuration > 30) {
      toast({
        title: '⚠️ Invalid Duration', 
        description: 'Short break duration must be between 1 and 30 minutes.',
        variant: 'destructive'
      });
      return;
    }

    if (localSettings.longBreakDuration < 1 || localSettings.longBreakDuration > 60) {
      toast({
        title: '⚠️ Invalid Duration',
        description: 'Long break duration must be between 1 and 60 minutes.',
        variant: 'destructive'
      });
      return;
    }

    // Update store
    updateSettings(localSettings);
    
    // Apply theme
    applyTheme(localSettings.theme);
    
    setIsDirty(false);
    
    toast({
      title: '✅ Settings Saved',
      description: 'Your preferences have been updated successfully!',
    });
    
    onClose();
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.className = systemTheme;
    } else {
      root.className = theme;
    }
  };

  const handleReset = () => {
    setLocalSettings({
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notifications: true,
      sounds: true,
      theme: 'system'
    });
    setIsDirty(true);
  };

  const presetConfigurations = [
    {
      name: 'Classic Pomodoro',
      description: 'Traditional 25/5/15 minute intervals',
      settings: { pomodoroDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 }
    },
    {
      name: 'Extended Focus',
      description: 'Longer focus sessions for deep work',
      settings: { pomodoroDuration: 45, shortBreakDuration: 10, longBreakDuration: 20 }
    },
    {
      name: 'Quick Sprints',
      description: 'Short bursts for quick tasks',
      settings: { pomodoroDuration: 15, shortBreakDuration: 3, longBreakDuration: 10 }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-glass backdrop-blur-sm border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary flex items-center gap-2">
            ⚙️ Settings
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Customize your Pomodoro timer to match your workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer Configuration */}
          <Card className="bg-gradient-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Clock className="w-5 h-5" />
                Timer Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pomodoro-duration" className="text-text-primary font-medium">
                    🍅 Pomodoro Duration
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pomodoro-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={localSettings.pomodoroDuration}
                      onChange={(e) => handleSettingChange('pomodoroDuration', parseInt(e.target.value))}
                      className="bg-input/50 border-glass-border"
                    />
                    <span className="text-text-secondary text-sm">minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-break-duration" className="text-text-primary font-medium">
                    ☕ Short Break
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="short-break-duration"
                      type="number"
                      min="1"
                      max="30"
                      value={localSettings.shortBreakDuration}
                      onChange={(e) => handleSettingChange('shortBreakDuration', parseInt(e.target.value))}
                      className="bg-input/50 border-glass-border"
                    />
                    <span className="text-text-secondary text-sm">minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long-break-duration" className="text-text-primary font-medium">
                    🛋️ Long Break
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="long-break-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={localSettings.longBreakDuration}
                      onChange={(e) => handleSettingChange('longBreakDuration', parseInt(e.target.value))}
                      className="bg-input/50 border-glass-border"
                    />
                    <span className="text-text-secondary text-sm">minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long-break-interval" className="text-text-primary font-medium">
                    🔄 Long Break Interval
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="2"
                      max="8"
                      value={localSettings.longBreakInterval}
                      onChange={(e) => handleSettingChange('longBreakInterval', parseInt(e.target.value))}
                      className="bg-input/50 border-glass-border"
                    />
                    <span className="text-text-secondary text-sm">pomodoros</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card className="bg-gradient-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                🎨 Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-text-primary font-medium">Theme</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Coffee }
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={localSettings.theme === value ? 'default' : 'outline'}
                      onClick={() => handleSettingChange('theme', value)}
                      className={cn(
                        "flex items-center gap-2 transition-all duration-200",
                        localSettings.theme === value && 'bg-gradient-primary shadow-glow'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Automation */}
          <Card className="bg-gradient-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Bell className="w-5 h-5" />
                Notifications & Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-text-primary font-medium">Notifications</Label>
                  <p className="text-sm text-text-secondary">Show browser notifications when timer completes</p>
                </div>
                <Switch
                  checked={localSettings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-text-primary font-medium">Sounds</Label>
                  <p className="text-sm text-text-secondary">Play notification sounds</p>
                </div>
                <Switch
                  checked={localSettings.sounds}
                  onCheckedChange={(checked) => handleSettingChange('sounds', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-text-primary font-medium">Auto-start Breaks</Label>
                  <p className="text-sm text-text-secondary">Automatically start break timers</p>
                </div>
                <Switch
                  checked={localSettings.autoStartBreaks}
                  onCheckedChange={(checked) => handleSettingChange('autoStartBreaks', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-text-primary font-medium">Auto-start Pomodoros</Label>
                  <p className="text-sm text-text-secondary">Automatically start focus sessions after breaks</p>
                </div>
                <Switch
                  checked={localSettings.autoStartPomodoros}
                  onCheckedChange={(checked) => handleSettingChange('autoStartPomodoros', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preset Configurations */}
          <Card className="bg-gradient-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                🚀 Quick Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {presetConfigurations.map((preset) => (
                  <div
                    key={preset.name}
                    className="p-4 rounded-lg border border-glass-border bg-gradient-glass hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      handleSettingChange('pomodoroDuration', preset.settings.pomodoroDuration);
                      handleSettingChange('shortBreakDuration', preset.settings.shortBreakDuration);
                      handleSettingChange('longBreakDuration', preset.settings.longBreakDuration);
                    }}
                  >
                    <h4 className="font-semibold text-text-primary mb-1">{preset.name}</h4>
                    <p className="text-sm text-text-secondary mb-2">{preset.description}</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {preset.settings.pomodoroDuration}m
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {preset.settings.shortBreakDuration}m
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {preset.settings.longBreakDuration}m
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-glass-border" />

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            Reset to Defaults
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty}
              className={cn(
                "bg-gradient-primary hover:shadow-glow transition-all duration-300",
                isDirty && "animate-pulse"
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};