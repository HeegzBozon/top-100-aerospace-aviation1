import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import IntroRequestModal from '@/components/talent/IntroRequestModal';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const brandColors = {
    navyDeep: '#1e3a5a',
    goldPrestige: '#c9a87c',
};

export default function ProviderServicesList({ providerEmail, userName }) {
    const [introModal, setIntroModal] = useState({ open: false, service: null });

    const { data: services = [], isLoading } = useQuery({
        queryKey: ['provider-services', providerEmail],
        queryFn: () => base44.entities.Service.filter({ provider_user_email: providerEmail, is_active: true }),
        enabled: !!providerEmail,
    });

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
                Available Services ({services.length})
            </h2>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(n => (
                        <div key={n} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : services.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                        No services currently active
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                        <Card key={service.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
                                            {service.title}
                                        </h3>
                                        {service.is_featured && (
                                            <Badge className="mt-1" style={{ background: brandColors.goldPrestige, color: 'white' }}>
                                                <Star className="w-3 h-3 mr-1" /> Featured
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-lg font-bold" style={{ color: brandColors.goldPrestige }}>
                                        ${service.base_price}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {service.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {service.duration_minutes} min
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIntroModal({ open: true, service })}
                                            className="gap-1"
                                        >
                                            <Send className="w-3 h-3" /> Intro
                                        </Button>
                                        <Link to={`${createPageUrl('ServiceDetail')}?id=${service.id}`}>
                                            <Button size="sm" style={{ background: brandColors.navyDeep, color: 'white' }}>
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {introModal.service && (
                <IntroRequestModal
                    isOpen={introModal.open}
                    onClose={() => setIntroModal({ open: false, service: null })}
                    targetType="service"
                    targetId={introModal.service.id}
                    targetTitle={introModal.service.title}
                    recipientEmail={providerEmail}
                    companyName={userName || 'User'}
                />
            )}
        </div>
    );
}
