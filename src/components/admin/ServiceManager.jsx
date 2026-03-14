import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Search, Edit, Trash2, MoreHorizontal, 
  CheckCircle2, XCircle, Package, DollarSign, Clock, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ServiceManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // --- Form State ---
  const initialFormState = {
    title: "",
    description: "",
    long_description: "",
    provider_type: "platform",
    price_model: "fixed",
    base_price: 0,
    duration_minutes: 60,
    category: [], // array of strings
    image_url: "",
    is_active: true,
    requires_google_calendar: false,
    provider_user_email: "" // usually current user or specific email
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Queries ---
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => base44.entities.Service.list('-created_date'),
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create({
        ...data,
        provider_user_email: data.provider_user_email || currentUser?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      setIsDialogOpen(false);
      resetForm();
      toast.success("Service created successfully");
    },
    onError: (err) => toast.error("Failed to create service: " + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      setIsDialogOpen(false);
      resetForm();
      toast.success("Service updated successfully");
    },
    onError: (err) => toast.error("Failed to update service: " + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success("Service deleted");
    },
    onError: (err) => toast.error("Failed to delete service: " + err.message)
  });

  // --- Handlers ---
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingService(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    // Default provider email to current admin
    if (currentUser) {
        setFormData(prev => ({...prev, provider_user_email: currentUser.email}));
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
        ...service,
        // Ensure category is array
        category: Array.isArray(service.category) ? service.category : []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title || !formData.base_price) {
        toast.error("Title and Base Price are required");
        return;
    }

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // --- Filter ---
  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Service Offerings</h2>
          <p className="text-slate-500">Manage the unified offer stack and platform services</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search services..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-[40%]">Service Detail</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading services...</td></tr>
              ) : filteredServices.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No services found</td></tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                            {service.image_url ? (
                                <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-5 h-5 m-auto text-slate-400" />
                            )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{service.title}</div>
                          <div className="text-slate-500 text-xs line-clamp-1">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        ${service.base_price.toLocaleString()}
                        {service.price_model === 'hourly' && '/hr'}
                        {service.price_model === 'custom' && '+'}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">{service.price_model}</div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={service.provider_type === 'platform' ? 'default' : 'secondary'} className="capitalize">
                         {service.provider_type}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {service.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Create New Service"}</DialogTitle>
            <DialogDescription>
              Define the offer details, pricing, and presentation.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Service Title *</label>
                    <Input 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Strategy Session"
                    />
                </div>
                
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Short Description</label>
                    <Input 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief summary for list view"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Provider Type</label>
                    <Select 
                        value={formData.provider_type} 
                        onValueChange={val => setFormData({...formData, provider_type: val})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="platform">Platform (Pineapple)</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Pricing Model</label>
                    <Select 
                        value={formData.price_model} 
                        onValueChange={val => setFormData({...formData, price_model: val})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                            <SelectItem value="hourly">Hourly Rate</SelectItem>
                            <SelectItem value="custom">Custom / Range</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Base Price ($) *</label>
                    <Input 
                        type="number"
                        min="0"
                        value={formData.base_price}
                        onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value) || 0})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (Minutes)</label>
                    <Input 
                        type="number"
                        min="0"
                        value={formData.duration_minutes}
                        onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                        placeholder="e.g. 60"
                    />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                        value={formData.image_url}
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                        placeholder="https://..."
                    />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Detailed Description</label>
                    <Textarea 
                        className="h-32"
                        value={formData.long_description}
                        onChange={e => setFormData({...formData, long_description: e.target.value})}
                        placeholder="Full details, rich text support..."
                    />
                </div>

                <div className="col-span-2 flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">Active Status</label>
                        <p className="text-xs text-slate-500">Visible in marketplace</p>
                    </div>
                    <Switch 
                        checked={formData.is_active}
                        onCheckedChange={checked => setFormData({...formData, is_active: checked})}
                    />
                </div>

                <div className="col-span-2 flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">Google Calendar Integration</label>
                        <p className="text-xs text-slate-500">Automatically create calendar events on booking</p>
                    </div>
                    <Switch 
                        checked={formData.requires_google_calendar}
                        onCheckedChange={checked => setFormData({...formData, requires_google_calendar: checked})}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingService ? "Save Changes" : "Create Service"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}