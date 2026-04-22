import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Mail, Bell, Smartphone } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const DEFAULT_PREFS = {
  email: { general_updates: true, personal_messages: true, new_content: true, mentions: true, marketing: false },
  in_app: { general_updates: true, personal_messages: true, new_content: true, mentions: true },
  sms: { personal_messages: false, critical_alerts: true },
};

const CHANNEL_CONFIG = [
  {
    key: 'email',
    label: 'Email Notifications',
    icon: Mail,
    description: 'Delivered to your registered email address.',
    options: [
      { key: 'general_updates', label: 'Platform Updates', desc: 'Newsletters, announcements, and season updates' },
      { key: 'personal_messages', label: 'Messages & Intros', desc: 'Direct messages and introduction requests' },
      { key: 'new_content', label: 'New Content', desc: 'Articles, tips, events, and community posts' },
      { key: 'mentions', label: 'Mentions', desc: 'When someone mentions you in a post or comment' },
      { key: 'marketing', label: 'Promotions & Offers', desc: 'Sponsor content, partnerships, and special offers' },
    ],
  },
  {
    key: 'in_app',
    label: 'In-App Notifications',
    icon: Bell,
    description: 'Notifications within the platform.',
    options: [
      { key: 'general_updates', label: 'Platform Updates', desc: 'General updates and announcements' },
      { key: 'personal_messages', label: 'Messages & Intros', desc: 'In-app messages and introduction requests' },
      { key: 'new_content', label: 'New Content', desc: 'Alerts for new articles, tips, and events' },
      { key: 'mentions', label: 'Mentions', desc: 'In-app alerts when you are mentioned' },
    ],
  },
  {
    key: 'sms',
    label: 'Text Message (SMS)',
    icon: Smartphone,
    description: 'Requires a verified phone number.',
    options: [
      { key: 'personal_messages', label: 'Messages & Intros', desc: 'Urgent messages via text' },
      { key: 'critical_alerts', label: 'Critical Alerts', desc: 'Account security and time-sensitive alerts' },
    ],
  },
];

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function NotificationSettingsEditor({ user }) {
  const prefs = user?.notification_preferences || {};
  const [formData, setFormData] = useState({
    email: { ...DEFAULT_PREFS.email, ...prefs.email },
    in_app: { ...DEFAULT_PREFS.in_app, ...prefs.in_app },
    sms: { ...DEFAULT_PREFS.sms, ...prefs.sms },
  });
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleToggle = (channel, key, value) => {
    setFormData(prev => ({
      ...prev,
      [channel]: { ...prev[channel], [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      notification_preferences: formData,
      phone_number: phoneNumber || undefined,
    });
    toast({ title: 'Preferences saved!' });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Phone number section */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          <Label className="text-xs uppercase tracking-wider font-bold" style={{ color: brandColors.navyDeep }}>Phone Number</Label>
        </div>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="h-10 text-sm bg-white max-w-xs"
        />
        <p className="text-[11px] text-slate-400 mt-1.5">Required for SMS notifications. Standard message rates may apply.</p>
      </div>

      {/* Channel sections */}
      {CHANNEL_CONFIG.map(channel => {
        const Icon = channel.icon;
        return (
          <div key={channel.key} className="rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100" style={{ background: `${brandColors.navyDeep}05` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${brandColors.goldPrestige}15` }}>
                <Icon className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>{channel.label}</h3>
                <p className="text-[11px] text-slate-400">{channel.description}</p>
              </div>
            </div>
            <div className="px-4">
              {channel.options.map(opt => (
                <ToggleRow
                  key={opt.key}
                  label={opt.label}
                  desc={opt.desc}
                  checked={formData[channel.key]?.[opt.key] ?? false}
                  onChange={val => handleToggle(channel.key, opt.key, val)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}