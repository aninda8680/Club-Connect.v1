import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { FiCalendar, FiBell, FiUser, FiMessageCircle, FiAward, FiImage, FiClipboard, FiLink } from "react-icons/fi";

export default function MemberPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("events");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchClubData = async () => {
      if (!user) return;

      try {
        const clubsSnapshot = await getDocs(collection(db, "clubs"));

        for (const clubDoc of clubsSnapshot.docs) {
          const clubId = clubDoc.id;
          const memberDocRef = doc(db, `clubs/${clubId}/members/${user.uid}`);
          const memberDocSnap = await getDoc(memberDocRef);

          if (memberDocSnap.exists()) {
            setClubName(clubDoc.data().name);
            await fetchClubDetails(clubId);
            break;
          }
        }
      } catch (error) {
        console.error("Error checking club membership:", error);
      }
    };

    const fetchClubDetails = async (clubId: string) => {
      // Fetch upcoming events
      const eventsSnapshot = await getDocs(collection(db, `clubs/${clubId}/events`));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      setUpcomingEvents(eventsData.filter(event => event.date > new Date()));

      // Fetch announcements
      const announcementsSnapshot = await getDocs(collection(db, `clubs/${clubId}/announcements`));
      setAnnouncements(announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })));

      // Fetch user's registered events
      const userEventsRef = doc(db, `users/${user.uid}/registeredEvents/${clubId}`);
      const userEventsSnap = await getDoc(userEventsRef);
      if (userEventsSnap.exists()) {
        setRegisteredEvents(userEventsSnap.data().events || []);
      }

      // Fetch tasks assigned to user
      const tasksSnapshot = await getDocs(collection(db, `clubs/${clubId}/tasks`));
      const userTasks = tasksSnapshot.docs
        .filter(doc => doc.data().assignedTo === user.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate()
        }));
      setTasks(userTasks);
    };

    fetchClubData();
  }, [user]);

  const handleEventRegistration = (eventId: string, register: boolean) => {
    if (register) {
      setRegisteredEvents([...registeredEvents, eventId]);
    } else {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
    }
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "completed" } : task
    ));
  };

  return (
    <div className="p-4 md:p-6 bg-gray-800 rounded-lg text-white max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {clubName 
            ? `Welcome back, ${user?.displayName || 'Member'}!` 
            : "You are not in any club yet."}
        </h1>
        {clubName && (
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm md:text-base">
            <span className="bg-blue-600 px-3 py-1 rounded-full">
              {clubName}
            </span>
            <span className="text-gray-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto mb-6 scrollbar-hide">
        <div className="flex border-b border-gray-700 min-w-full">
          {["events", "announcements", "tasks", "participation", "resources"].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-400 text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Primary Content - 2/3 width */}
        <div className="lg:w-2/3">
          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-600">
                <h3 className="flex items-center text-xl font-semibold">
                  <FiCalendar className="mr-2" /> Upcoming Events
                </h3>
              </div>
              <div className="divide-y divide-gray-600">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="p-4 hover:bg-gray-650 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-300">
                            <span className="flex items-center">
                              <FiCalendar className="mr-1.5" />
                              {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {event.location && (
                              <span className="flex items-center">
                                <FiUser className="mr-1.5" /> {event.location}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="mt-2 text-gray-200">{event.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEventRegistration(event.id, !registeredEvents.includes(event.id))}
                          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                            registeredEvents.includes(event.id)
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {registeredEvents.includes(event.id) ? "Cancel Registration" : "Register Now"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No upcoming events scheduled
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === "announcements" && (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-600">
                <h3 className="flex items-center text-xl font-semibold">
                  <FiBell className="mr-2" /> Club Announcements
                </h3>
              </div>
              <div className="divide-y divide-gray-600">
                {announcements.length > 0 ? (
                  announcements.map(announcement => (
                    <div key={announcement.id} className="p-4 hover:bg-gray-650 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{announcement.title}</h4>
                          <span className="text-sm text-gray-300">
                            {announcement.date.toLocaleDateString()}
                          </span>
                        </div>
                        {announcement.important && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-600">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-200 whitespace-pre-line">
                        {announcement.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No announcements available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-600">
                <h3 className="flex items-center text-xl font-semibold">
                  <FiClipboard className="mr-2" /> Your Tasks
                </h3>
              </div>
              <div className="divide-y divide-gray-600">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <div key={task.id} className="p-4 hover:bg-gray-650 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{task.title}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                            {task.dueDate && (
                              <span>
                                Due: {task.dueDate.toLocaleDateString()}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.status === "completed" 
                                ? "bg-green-600" 
                                : "bg-yellow-600"
                            }`}>
                              {task.status || "pending"}
                            </span>
                          </div>
                        </div>
                        {task.status !== "completed" && (
                          <button
                            onClick={() => markTaskComplete(task.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-2 text-gray-200 whitespace-pre-line">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No tasks assigned to you
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:w-1/3 space-y-5">
          {/* Participation Stats */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Your Participation</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-600 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {registeredEvents.length}
                </div>
                <div className="text-sm text-gray-300">Events</div>
              </div>
              <div className="bg-gray-600 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {tasks.filter(t => t.status === "completed").length}
                </div>
                <div className="text-sm text-gray-300">Tasks Completed</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="flex items-center text-lg font-semibold mb-3">
              <FiLink className="mr-2" /> Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { icon: FiMessageCircle, label: "Club Discussion", color: "text-blue-400" },
                { icon: FiImage, label: "Media Gallery", color: "text-purple-400" },
                { icon: FiAward, label: "Leaderboard", color: "text-yellow-400" },
                { icon: FiUser, label: "Member Directory", color: "text-green-400" }
              ].map((link, index) => (
                <li key={index}>
                  <a href="#" className={`flex items-center ${link.color} hover:opacity-80 p-2 rounded hover:bg-gray-600`}>
                    <link.icon className="mr-2" /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback Card */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Feedback & Suggestions</h3>
            <p className="text-sm text-gray-300 mb-4">
              Help us improve your club experience. Share your thoughts anonymously.
            </p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-md font-medium">
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}