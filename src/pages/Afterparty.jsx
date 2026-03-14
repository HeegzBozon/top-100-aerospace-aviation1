
import React, { useState, useEffect } from "react";
import { Event } from '@/entities/Event';
import { Achievement } from '@/entities/Achievement';
import { User } from '@/entities/User';
import { Photo } from '@/entities/Photo';
import { Send, PartyPopper, MessageCircle, ExternalLink, Users, Calendar, Award, Camera, UploadCloud, MapPin, User as UserIcon, Loader2, Check } from "lucide-react";
import PhotoUploadForm from "@/components/afterparty/PhotoUploadForm";
import { Button } from "@/components/ui/button";
import { progressQuest } from '@/functions/progressQuest';

export default function Afterparty() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the after party! 🎉", sender: "System", timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { id: 2, text: "Great work everyone on the sprint!", sender: "Alex", timestamp: new Date(Date.now() - 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { id: 3, text: "Looking forward to celebrating with you all!", sender: "Sam", timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [photos, setPhotos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const [upcomingEvents, recentAchievements, allPhotos] = await Promise.all([
        Event.filter({ status: 'upcoming' }, '-event_date', 5),
        Achievement.list('-created_date', 10),
        Photo.filter({ status: 'approved' }, '-created_date', 50) // Only load approved photos
      ]);

      setCurrentUser(user);
      setEvents(upcomingEvents);
      setAchievements(recentAchievements);
      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error loading afterparty data:', error);
    }
  };

  const handleSendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: currentUser?.full_name || "You",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleJoinEvent = async (eventId) => {
    setJoiningEventId(eventId);
    try {
      const event = events.find(e => e.id === eventId);
      if (event && currentUser) {
        // Ensure attendees is an array before spreading
        const currentAttendees = Array.isArray(event.attendees) ? event.attendees : [];
        if (!currentAttendees.includes(currentUser.email)) {
          const updatedAttendees = [...currentAttendees, currentUser.email];
          await Event.update(eventId, { attendees: updatedAttendees });

          // Trigger quest progress for attending an event
          await progressQuest({ action: 'event_attended', context: eventId });

          loadData();
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleOpenGather = () => {
    window.open("https://app.gather.town/app/4j3pAeBNwjIZQ8fw/pineappleempire", "_blank");
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'celebration': 'from-yellow-500 to-orange-400',
      'training': 'from-blue-500 to-cyan-400',
      'social': 'from-purple-500 to-indigo-400',
      'awards': 'from-pink-500 to-rose-400',
      'meetup': 'from-green-500 to-emerald-400'
    };
    return colors[type] || 'from-gray-500 to-slate-400';
  };

  const getAchievementIcon = (type) => {
    const icons = {
      'nomination_submitted': '🏆',
      'vote_cast': '🗳️',
      'tip_shared': '💡',
      'sprint_completed': '🚀',
      'top_contributor': '⭐'
    };
    return icons[type] || '🎉';
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <PartyPopper className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">After Party Hub</h1>
        <p className="text-[var(--muted)]">Celebrate, connect, and unwind with the community!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-1">
          <div className="flex gap-1">
            {['chat', 'events', 'achievements', 'photos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-3 py-2 rounded-lg font-medium transition-all duration-200 capitalize text-sm
                  ${activeTab === tab
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-400 text-white shadow-lg'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gather.town Integration */}
      <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold">Virtual Meetup Space</h2>
        </div>
        <p className="text-[var(--muted)] mb-4">
          Join our interactive virtual space for face-to-face conversations, games, and networking!
        </p>

        <button
          onClick={handleOpenGather}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
        >
          <PartyPopper className="w-5 h-5" />
          <span>Enter Gather.town Space</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Community Chat</h2>
            <div className="flex-1"></div>
            <div className="bg-green-500/20 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
              {messages.length} messages
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="h-80 overflow-y-auto mb-4 p-4 border border-white/20 rounded-lg bg-black/10 space-y-3"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.3) transparent'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'You' || msg.sender === currentUser?.full_name ? 'items-end' : 'items-start'}`}
              >
                <div className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
                  ${msg.sender === 'You' || msg.sender === currentUser?.full_name
                    ? 'bg-blue-500 text-white ml-auto'
                    : msg.sender === 'System'
                      ? 'bg-purple-500/20 text-purple-800 border border-purple-500/30'
                      : 'bg-white/10 text-[var(--text)] border border-white/20'
                  }
                `}>
                  {msg.sender !== 'You' && msg.sender !== currentUser?.full_name && (
                    <div className="text-xs text-[var(--muted)] mb-1 font-medium">
                      {msg.sender}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className="text-xs text-[var(--muted)] mt-1 px-2">
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts, celebrate wins, or just say hello..."
              className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="text-right text-[var(--muted)] text-xs mt-2">
            {newMessage.length}/300
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xl font-bold">
            <Calendar className="w-6 h-6 text-purple-500" />
            <h2>Upcoming Events</h2>
          </div>
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-[var(--muted)] mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{(event.attendees || []).length} attending</span>
                    </div>
                  </div>
                </div>
                <div className={`mt-3 sm:mt-0 sm:ml-4 px-3 py-1 bg-gradient-to-r ${getEventTypeColor(event.event_type)} text-white rounded-full text-xs font-medium self-start flex-shrink-0`}>
                  {event.event_type}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center text-sm text-[var(--muted)] gap-4">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.location}</div>
                  {event.organizer && <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4" /> {event.organizer}</div>}
                </div>
                <button
                  onClick={() => handleJoinEvent(event.id)}
                  disabled={(event.attendees || []).includes(currentUser?.email) || joiningEventId === event.id}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joiningEventId === event.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (event.attendees || []).includes(currentUser?.email) ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  {joiningEventId === event.id ? 'Joining...' : (event.attendees || []).includes(currentUser?.email) ? 'Joined' : 'Join Event'}
                </button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-12 bg-[var(--card)]/50 rounded-lg">
              <Calendar className="w-16 h-16 text-[var(--muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--muted)] mb-2">No upcoming events</h3>
              <p className="text-[var(--muted)] opacity-70">Check back later for exciting community events!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 flex items-center gap-4"
            >
              <div className="text-4xl">
                {getAchievementIcon(achievement.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{achievement.title}</h3>
                <p className="text-[var(--muted)] text-sm mb-1">{achievement.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">Earned by someone</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-[var(--muted)]">+{achievement.points} points</span>
                </div>
              </div>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
          ))}

          {achievements.length === 0 && (
            <div className="text-center py-12 bg-[var(--card)]/50 rounded-lg">
              <Award className="w-16 h-16 text-[var(--muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--muted)] mb-2">No recent achievements</h3>
              <p className="text-[var(--muted)] opacity-70">Keep participating to unlock achievements!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-pink-400" />
              <h2 className="text-xl font-bold">Photo Wall</h2>
            </div>
            <Button onClick={() => setShowUploadForm(true)}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {photos.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid bg-black/10 rounded-lg shadow-sm overflow-hidden group">
                  <img src={photo.image_url} alt={photo.caption || 'User upload'} className="w-full h-auto object-cover" />
                  {(photo.caption || photo.uploader_name) && (
                    <div className="p-3">
                      {photo.caption && <p className="text-sm">{photo.caption}</p>}
                      {photo.uploader_name && <p className="text-xs text-[var(--muted)] mt-1">by {photo.uploader_name}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--card)]/50 rounded-lg">
              <Camera className="w-16 h-16 text-[var(--muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--muted)] mb-2">No photos yet!</h3>
              <p className="text-[var(--muted)] opacity-70">Be the first to share a moment from an event.</p>
            </div>
          )}
        </div>
      )}

      {showUploadForm && (
        <PhotoUploadForm
          onClose={() => setShowUploadForm(false)}
          onUploadSuccess={loadData}
        />
      )}
    </div>
  );
}
