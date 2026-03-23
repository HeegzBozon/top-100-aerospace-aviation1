import { useState } from 'react';
import { Job } from '@/entities/Job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Plus } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function JobPostForm({ employer, onClose, onSave }) {
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    employer_id: employer.id,
    title: '',
    description: '',
    summary: '',
    department: '',
    job_type: 'full_time',
    experience_level: 'mid',
    location: employer.headquarters_location || '',
    remote_policy: 'onsite',
    salary_min: '',
    salary_max: '',
    salary_display: 'show',
    function_area: '',
    required_skills: [],
    security_clearance: 'none',
    education_requirement: 'bachelors',
    years_experience_min: 0,
    status: 'active',
    poster_email: '',
    posted_date: new Date().toISOString()
  });

  const updateForm = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.required_skills.includes(skillInput.trim())) {
      updateForm('required_skills', [...form.required_skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateForm('required_skills', form.required_skills.filter(s => s !== skill));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const job = await Job.create({
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      });
      onSave(job);
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: brandColors.navyDeep }}>Post a New Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Job Title *</label>
            <Input 
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="e.g., Senior Avionics Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Job Type</label>
              <Select value={form.job_type} onValueChange={(v) => updateForm('job_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="fellowship">Fellowship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Experience Level</label>
              <Select value={form.experience_level} onValueChange={(v) => updateForm('experience_level', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Internship</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Location *</label>
              <Input 
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Remote Policy</label>
              <Select value={form.remote_policy} onValueChange={(v) => updateForm('remote_policy', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Job Description *</label>
            <Textarea 
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Full job description..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Short Summary (for cards)</label>
            <Textarea 
              value={form.summary}
              onChange={(e) => updateForm('summary', e.target.value)}
              placeholder="Brief summary (250 chars)"
              maxLength={250}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Min Salary (USD)</label>
              <Input 
                type="number"
                value={form.salary_min}
                onChange={(e) => updateForm('salary_min', e.target.value)}
                placeholder="80000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Max Salary (USD)</label>
              <Input 
                type="number"
                value={form.salary_max}
                onChange={(e) => updateForm('salary_max', e.target.value)}
                placeholder="120000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Display</label>
              <Select value={form.salary_display} onValueChange={(v) => updateForm('salary_display', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">Show Salary</SelectItem>
                  <SelectItem value="hide">Hide Salary</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Security Clearance</label>
              <Select value={form.security_clearance} onValueChange={(v) => updateForm('security_clearance', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None Required</SelectItem>
                  <SelectItem value="us_citizen">US Citizen Only</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                  <SelectItem value="top_secret">Top Secret</SelectItem>
                  <SelectItem value="ts_sci">TS/SCI</SelectItem>
                  <SelectItem value="itar">ITAR Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Education</label>
              <Select value={form.education_requirement} onValueChange={(v) => updateForm('education_requirement', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="associates">Associate's</SelectItem>
                  <SelectItem value="bachelors">Bachelor's</SelectItem>
                  <SelectItem value="masters">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Required Skills</label>
            <div className="flex gap-2">
              <Input 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.required_skills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!form.title || !form.description || !form.location || saving}
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Post Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}