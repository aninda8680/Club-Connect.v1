import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { FiCalendar, FiBell, FiUser, FiMessageCircle, FiAward, FiImage, FiClipboard, FiLink } from "react-icons/fi";

// Type definitions
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  important?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  status?: string;
  assignedTo: string;
}

export default function MemberPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("events");
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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
            // Fetch additional data for this club
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
      } as Event));
      setUpcomingEvents(eventsData.filter(event => event.date > new Date()));

      // Fetch announcements
      const announcementsSnapshot = await getDocs(collection(db, `clubs/${clubId}/announcements`));
      setAnnouncements(announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as Announcement)));

      // Fetch user's registered events
      if (user?.uid) {
        const userEventsRef = doc(db, `users/${user.uid}/registeredEvents/${clubId}`);
        const userEventsSnap = await getDoc(userEventsRef);
        if (userEventsSnap.exists()) {
          setRegisteredEvents(userEventsSnap.data().events || []);
        }
      }

      // Fetch tasks assigned to user
      const tasksSnapshot = await getDocs(collection(db, `clubs/${clubId}/tasks`));
      const userTasks = tasksSnapshot.docs
        .filter(doc => user && doc.data().assignedTo === user.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate()
        } as Task));
      setTasks(userTasks);
    };

    fetchClubData();
  }, [user]);

  const handleEventRegistration = (eventId: string, register: boolean) => {
    // Implement event registration logic
    if (register) {
      setRegisteredEvents([...registeredEvents, eventId]);
    } else {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
    }
  };

  const markTaskComplete = (taskId: string) => {
    // Implement task completion logic
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "completed" } : task
    ));
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {clubName 
            ? `Welcome back, ${user?.displayName || 'Member'}! 🎉` 
            : "You are not in any club yet."}
        </h1>
        {clubName && (
          <p className="text-gray-300">
            Current Club: <span className="font-semibold text-blue-300">{clubName}</span> • {new Date().toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {["events", "announcements", "tasks", "participation", "resources"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-400 text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "events" && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="flex items-center text-xl font-semibold mb-4">
                <FiCalendar className="mr-2" /> Upcoming Events
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 bg-gray-600 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{event.title}</h4>
                          <p className="text-sm text-gray-300">
                            {event.date.toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEventRegistration(event.id, !registeredEvents.includes(event.id))}
                          className={`px-3 py-1 rounded text-sm ${registeredEvents.includes(event.id) 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                          {registeredEvents.includes(event.id) ? "Cancel" : "Register"}
                        </button>
                      </div>
                      <p className="mt-2 text-gray-200">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No upcoming events scheduled.</p>
              )}
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="flex items-center text-xl font-semibold mb-4">
                <FiBell className="mr-2" /> Club Announcements
              </h3>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="p-3 bg-gray-600 rounded-lg">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{announcement.title}</h4>
                        <span className="text-sm text-gray-300">
                          {announcement.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-200">{announcement.content}</p>
                      {announcement.important && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 text-xs rounded">
                          Important
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No announcements available.</p>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="flex items-center text-xl font-semibold mb-4">
                <FiClipboard className="mr-2" /> Your Tasks
              </h3>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-600 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{task.title}</h4>
                          <p className="text-sm text-gray-300">
                            Due: {task.dueDate?.toLocaleDateString() || "No deadline"}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.status === "completed" 
                            ? "bg-green-600" 
                            : "bg-yellow-600"
                        }`}>
                          {task.status || "pending"}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-200">{task.description}</p>
                      {task.status !== "completed" && (
                        <button
                          onClick={() => markTaskComplete(task.id)}
                          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No tasks assigned to you.</p>
              )}
            </div>
          )}

          {/* Add similar sections for other tabs */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Your Participation</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-600 p-3 rounded text-center">
                <div className="text-2xl font-bold">{registeredEvents.length}</div>
                <div className="text-sm text-gray-300">Events Registered</div>
              </div>
              <div className="bg-gray-600 p-3 rounded text-center">
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "completed").length}
                </div>
                <div className="text-sm text-gray-300">Tasks Completed</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-semibold mb-3">
              <FiLink className="mr-2" /> Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center text-blue-300 hover:text-blue-400">
                  <FiMessageCircle className="mr-2" /> Club Discussion
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-300 hover:text-blue-400">
                  <FiImage className="mr-2" /> Media Gallery
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-300 hover:text-blue-400">
                  <FiAward className="mr-2" /> Leaderboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-300 hover:text-blue-400">
                  <FiUser className="mr-2" /> Member Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Feedback */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Feedback & Suggestions</h3>
            <p className="text-sm text-gray-300 mb-3">
              Have ideas to improve the club? Share them anonymously!
            </p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded">
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}