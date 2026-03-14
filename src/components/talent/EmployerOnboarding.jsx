import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Employer } from '@/entities/Employer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const industryOptions = [
  'Commercial Aviation',
  'Aerospace Manufacturing',
  'Space',
  'Defense',
  'MRO',
  'UAS/Drones',
  'eVTOL/AAM',
  'Avionics',
  'Airports/Infrastructure',
  'R&D',
  'Education/Academia',
  'Venture Capital',
  'Government/Policy',
  'Other'
];

export default function EmployerOnboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry_segments: [],
    headquarters_location: '',
    company_size: '',
    company_type: '',
    overview_short: '',
    website_url: '',
    primary_contact_name: user?.full_name || '',
    primary_contact_email: user?.email || '',
    primary_contact_role: '',
    terms_accepted: false,
    owner_email: user?.email || ''
  });

  const updateForm = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const toggleIndustry = (industry) => {
    const current = form.industry_segments || [];
    if (current.includes(industry)) {
      updateForm('industry_segments', current.filter(i => i !== industry));
    } else {
      updateForm('industry_segments', [...current, industry]);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const employer = await Employer.create(form);
      onComplete(employer);
    } catch (error) {
      console.error('Error creating employer:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: brandColors.cream }}>
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
            <Building2 className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: brandColors.navyDeep }}>
            Join the Talent Exchange
          </h1>
          <p className="text-slate-600 mt-2">Set up your employer profile to start hiring exceptional aerospace talent</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ 
                  background: step >= s ? brandColors.goldPrestige : '#e2e8f0',
                  color: step >= s ? 'white' : '#64748b'
                }}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-12 h-0.5 mx-1" style={{ background: step > s ? brandColors.goldPrestige : '#e2e8f0' }} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold" style={{ color: brandColors.navyDeep }}>Company Information</h2>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Company Name *</label>
                  <Input 
                    value={form.company_name}
                    onChange={(e) => updateForm('company_name', e.target.value)}
                    placeholder="Acme Aerospace Inc."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Headquarters Location *</label>
                  <Input 
                    value={form.headquarters_location}
                    onChange={(e) => updateForm('headquarters_location', e.target.value)}
                    placeholder="City, State, Country"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Company Size</label>
                    <Select value={form.company_size} onValueChange={(v) => updateForm('company_size', v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="501-1000">501-1,000</SelectItem>
                        <SelectItem value="1001-5000">1,001-5,000</SelectItem>
                        <SelectItem value="5000+">5,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Company Type</label>
                    <Select value={form.company_type} onValueChange={(v) => updateForm('company_type', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="NGO">NGO</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Industry Segments *</label>
                  <div className="flex flex-wrap gap-2">
                    {industryOptions.map(industry => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleIndustry(industry)}
                        className="px-3 py-1.5 rounded-full text-sm border transition-all"
                        style={{
                          background: form.industry_segments?.includes(industry) ? brandColors.goldPrestige : 'white',
                          color: form.industry_segments?.includes(industry) ? 'white' : '#64748b',
                          borderColor: form.industry_segments?.includes(industry) ? brandColors.goldPrestige : '#e2e8f0'
                        }}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => setStep(2)}
                  disabled={!form.company_name || !form.headquarters_location || form.industry_segments.length === 0}
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold" style={{ color: brandColors.navyDeep }}>Company Profile</h2>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Company Overview</label>
                  <Textarea 
                    value={form.overview_short}
                    onChange={(e) => updateForm('overview_short', e.target.value)}
                    placeholder="Brief description of your company (250 characters)"
                    maxLength={250}
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.overview_short?.length || 0}/250</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Website URL</label>
                  <Input 
                    value={form.website_url}
                    onChange={(e) => updateForm('website_url', e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setStep(3)}
                    style={{ background: brandColors.goldPrestige, color: 'white' }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold" style={{ color: brandColors.navyDeep }}>Contact Information</h2>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Primary Contact Name</label>
                  <Input 
                    value={form.primary_contact_name}
                    onChange={(e) => updateForm('primary_contact_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Primary Contact Email</label>
                  <Input 
                    value={form.primary_contact_email}
                    onChange={(e) => updateForm('primary_contact_email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Your Role</label>
                  <Input 
                    value={form.primary_contact_role}
                    onChange={(e) => updateForm('primary_contact_role', e.target.value)}
                    placeholder="e.g., Talent Acquisition Manager"
                  />
                </div>

                <div className="flex items-start gap-2 pt-4">
                  <Checkbox 
                    checked={form.terms_accepted}
                    onCheckedChange={(v) => updateForm('terms_accepted', v)}
                  />
                  <label className="text-sm text-slate-600">
                    I agree to the TOP 100 Talent Exchange Terms of Service and Privacy Policy
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={!form.terms_accepted || saving}
                    style={{ background: brandColors.goldPrestige, color: 'white' }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Employer Profile
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}