import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookingExport({ bookings, services }) {
  const getServiceTitle = (serviceId) => services?.find(s => s.id === serviceId)?.title || 'Service';

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Service', 'Client', 'Provider', 'Status', 'Notes'];
    const rows = bookings.map(b => [
      format(new Date(b.start_time), 'yyyy-MM-dd'),
      format(new Date(b.start_time), 'HH:mm'),
      getServiceTitle(b.service_id),
      b.client_user_email,
      b.provider_user_email,
      b.status,
      b.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = bookings.map(b => ({
      date: format(new Date(b.start_time), 'yyyy-MM-dd'),
      time: format(new Date(b.start_time), 'HH:mm'),
      service: getServiceTitle(b.service_id),
      client: b.client_user_email,
      provider: b.provider_user_email,
      status: b.status,
      notes: b.notes || ''
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileText className="w-4 h-4 mr-2" /> Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}