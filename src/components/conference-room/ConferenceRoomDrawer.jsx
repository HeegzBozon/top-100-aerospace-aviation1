import { useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, ExternalLink, Crown, Radio, Clock, Paperclip, MessageSquare, Send, Loader2, FileText, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta, disciplineLabel, domainAccent, roomCountdown } from './conferenceRoomConfig';
import AvatarCluster from './AvatarCluster';
import RsvpControl from './RsvpControl';
import VolunteerHostButton from './VolunteerHostButton';
import useConferenceNotes from './useConferenceNotes';

const hostLabel = (url) => {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

// Jira-style detail panel for a Conference Room. Surfaces the full record,
// a discussion thread, file attachments, and the attendance + volunteer CTAs.
export default function ConferenceRoomDrawer({ room, attendees, user, accent, open, onOpenChange, onRsvpChanged }) {
  const { notes, loading } = useConferenceNotes(open && room ? room.id : null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  if (!room) return null;
  const meta = statusMeta(room.status);
  const domainColor = domainAccent(room.domain_focus);
  const countdown = roomCountdown(room);
  const list = attendees || [];
  const myRsvp = list.find((a) => a.fellow_email === user?.email);
  const volunteers = list.filter((a) => a.volunteer);
  const host = hostLabel(room.official_url);

  const comments = notes.filter((n) => n.kind === 'comment' || n.kind === 'note');
  const files = notes.filter((n) => n.kind === 'attachment');

  const dateRange = room.start_date && room.end_date
    ? `${format(parseISO(room.start_date), 'MMM d')}–${format(parseISO(room.end_date), 'MMM d, yyyy')}`
    : room.start_date ? format(parseISO(room.start_date), 'MMM d, yyyy') : '';

  const sendComment = async () => {
    if (!draft.trim() || !user?.email) return;
    setSending(true);
    try {
      await base44.entities.ConferenceRoomNote.create({
        room_id: room.id,
        conference_name: room.conference_name,
        author_email: user.email,
        author_name: user.full_name || '',
        author_avatar_url: user.avatar_url || '',
        kind: 'comment',
        content: draft.trim(),
      });
      setDraft('');
    } catch {
    } finally {
      setSending(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ConferenceRoomNote.create({
        room_id: room.id,
        conference_name: room.conference_name,
        author_email: user.email,
        author_name: user.full_name || '',
        author_avatar_url: user.avatar_url || '',
        kind: 'attachment',
        attachment_url: file_url,
        attachment_name: file.name,
      });
    } catch {
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0">
        <SheetHeader className="p-4 border-b" style={{ borderColor: B.border }}>
          <div className="flex items-center gap-2 pr-8">
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
            {room.conference_series && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: domainColor }}>{room.conference_series}</span>
            )}
          </div>
          <SheetTitle className="text-base font-bold" style={{ color: B.navy }}>{room.conference_name}</SheetTitle>
          <SheetDescription className="sr-only">Mission Room detail</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: B.muted }}>
            {dateRange && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateRange}</span>}
            {countdown && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: countdown.kind === 'live' ? `${B.gold}22` : `${domainColor}14`, color: countdown.kind === 'live' ? B.gold : domainColor }}>
                {countdown.kind === 'live' ? <Radio className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />} {countdown.label}
              </span>
            )}
            {(room.city || room.country) && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {[room.city, room.country].filter(Boolean).join(', ')}</span>}
            {room.domain_focus && <span>· {disciplineLabel(room.domain_focus)}</span>}
          </div>

          {room.description && <p className="text-xs leading-relaxed" style={{ color: B.navy }}>{room.description}</p>}

          {(room.focus_areas || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(room.focus_areas || []).map((f) => (
                <span key={f.key} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${domainColor}12`, color: domainColor }}>{f.label}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AvatarCluster items={list} accent={domainColor} size={24} />
              <span className="text-[11px] font-semibold" style={{ color: B.navy }}>{list.length} attending</span>
            </div>
            {host && (
              <a href={room.official_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: B.muted }}>
                {host} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {volunteers.length > 0 && (
            <div className="rounded-lg p-2" style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: accent }}>Volunteered to host</p>
              <AvatarCluster items={volunteers} accent={accent} size={20} />
            </div>
          )}

          {room.facilitator_name && (
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: B.sand, color: B.navy }}>{room.facilitator_name[0]}</span>
              <span className="text-[10px]" style={{ color: B.muted }}>{room.facilitator_name} · facilitating</span>
            </div>
          )}

          {room.patron_of_record_name && (
            <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: `${B.gold}12`, border: `1px solid ${B.gold}33` }}>
              <Crown className="w-3 h-3 shrink-0" style={{ color: B.gold }} />
              <span className="text-[10px] font-semibold" style={{ color: B.gold }}>Patron of Record</span>
              <span className="text-[10px]" style={{ color: B.navy }}>{room.patron_of_record_name}</span>
            </div>
          )}

          <Tabs defaultValue="discussion" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="discussion" className="flex-1 text-[11px]"><MessageSquare className="w-3 h-3 mr-1" /> Discussion ({comments.length})</TabsTrigger>
              <TabsTrigger value="files" className="flex-1 text-[11px]"><Paperclip className="w-3 h-3 mr-1" /> Files ({files.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-3 flex flex-col gap-2">
              {comments.length === 0 ? (
                <p className="text-[11px] italic text-center py-4" style={{ color: B.muted }}>No coordination notes yet. Start the thread.</p>
              ) : (
                comments.map((n) => (
                  <div key={n.id} className="flex gap-2">
                    <span className="w-6 h-6 rounded-full overflow-hidden shrink-0" style={{ background: B.cream }}>
                      {n.author_avatar_url
                        ? <img src={n.author_avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-[9px] font-bold" style={{ color: domainColor }}>{(n.author_name || '?')[0]}</span>}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold" style={{ color: B.navy }}>
                        {n.author_name || n.author_email} <span className="font-normal" style={{ color: B.muted }}>· {format(parseISO(n.created_date), 'MMM d, h:mm a')}</span>
                      </p>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{n.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div className="flex items-end gap-2 mt-1">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Coordination note — who you want to meet, what you're bringing…"
                  rows={2}
                  className="flex-1 text-xs rounded-md px-2 py-1.5 resize-none"
                  style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
                />
                <button
                  type="button"
                  onClick={sendComment}
                  disabled={sending || !draft.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
                  style={{ background: accent, color: '#fff' }}
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send
                </button>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-3 flex flex-col gap-2">
              {files.length === 0 ? (
                <p className="text-[11px] italic text-center py-4" style={{ color: B.muted }}>No attachments yet. Share an agenda, deck, or roster.</p>
              ) : (
                files.map((n) => (
                  <a
                    key={n.id}
                    href={n.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg p-2 transition-colors"
                    style={{ border: `1px solid ${B.border}`, background: B.cream }}
                  >
                    <FileText className="w-4 h-4 shrink-0" style={{ color: domainColor }} />
                    <span className="flex-1 text-xs truncate" style={{ color: B.navy }}>{n.attachment_name || 'Attachment'}</span>
                    <Download className="w-3.5 h-3.5 shrink-0" style={{ color: B.muted }} />
                  </a>
                ))
              )}
              <div className="mt-1">
                <input ref={fileRef} type="file" onChange={onFile} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
                  style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Attach file
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-3 pb-[88px] border-t flex flex-wrap items-center gap-2" style={{ borderColor: B.border, background: B.cream }}>
          <div onClick={(e) => e.stopPropagation()}>
            <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <VolunteerHostButton room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}