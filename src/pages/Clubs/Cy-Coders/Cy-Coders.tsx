import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import './Cy-Coders.css';

interface Member {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar: string;
  github?: string;
  linkedin?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'workshop' | 'hackathon' | 'meetup' | 'competition';
  participants: number;
  maxParticipants: number;
}

const CyCoders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [clubStats, setClubStats] = useState({
    members: 0,
    projects: 0,
    events: 0
  });
  const [loading, setLoading] = useState(true);

  const clubInfo = {
    name: 'Cy-Coders',
    tagline: 'Building the Future, One Line at a Time',
    description: 'A community of passionate developers, hackers, and tech enthusiasts pushing the boundaries of what\'s possible through code.',
    founded: '2023'
  };

  const members: Member[] = [
    {
      id: '1',
      name: 'Alex Chen',
      role: 'Club President',
      skills: ['React', 'Node.js', 'Python', 'AI/ML'],
      avatar: '👨‍💻',
      github: 'alexchen',
      linkedin: 'alexchen'
    },
    {
      id: '2',
      name: 'Sarah Kim',
      role: 'Vice President',
      skills: ['JavaScript', 'TypeScript', 'AWS', 'DevOps'],
      avatar: '👩‍💻',
      github: 'sarahkim',
      linkedin: 'sarahkim'
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      role: 'Tech Lead',
      skills: ['C++', 'Java', 'System Design', 'Algorithms'],
      avatar: '👨‍💻',
      github: 'mikerod',
      linkedin: 'mikerod'
    }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'AI Hackathon 2024',
      date: 'March 15-17, 2024',
      description: 'Build innovative AI solutions in 48 hours. Prizes worth $5000!',
      type: 'hackathon',
      participants: 45,
      maxParticipants: 100
    },
    {
      id: '2',
      title: 'React Advanced Workshop',
      date: 'March 25, 2024',
      description: 'Deep dive into React hooks, context, and performance optimization.',
      type: 'workshop',
      participants: 28,
      maxParticipants: 40
    },
    {
      id: '3',
      title: 'Code Review Night',
      date: 'March 30, 2024',
      description: 'Collaborative code review session. Bring your projects!',
      type: 'meetup',
      participants: 15,
      maxParticipants: 25
    }
  ];

  useEffect(() => {
    const text = "Welcome to Cy-Coders";
    let index = 0;
    setIsTyping(true);
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Fetch club statistics from Firebase
  useEffect(() => {
    const fetchClubStats = async () => {
      try {
        setLoading(true);
        
        // Find the Cy-Coders club
        const clubsRef = collection(db, 'clubs');
        const clubQuery = query(clubsRef, where('name', '==', 'Cy-Coders'));
        const clubSnap = await getDocs(clubQuery);
        
        if (!clubSnap.empty) {
          const clubDoc = clubSnap.docs[0];
          const clubId = clubDoc.id;
          
          // Fetch members count
          const membersRef = collection(db, `clubs/${clubId}/members`);
          const membersSnap = await getDocs(membersRef);
          
          // Fetch events count
          const eventsRef = collection(db, `clubs/${clubId}/events`);
          const eventsSnap = await getDocs(eventsRef);
          
          // Fetch projects count (assuming projects are stored in a projects subcollection)
          let projectsCount = 0;
          try {
            const projectsRef = collection(db, `clubs/${clubId}/projects`);
            const projectsSnap = await getDocs(projectsRef);
            projectsCount = projectsSnap.size;
          } catch (error) {
            // If projects collection doesn't exist, use 0
            console.log('Projects collection not found, using default value');
          }
          
          setClubStats({
            members: membersSnap.size,
            projects: projectsCount,
            events: eventsSnap.size
          });
        }
      } catch (error) {
        console.error('Error fetching club stats:', error);
        // Fallback to default values if there's an error
        setClubStats({
          members: 0,
          projects: 0,
          events: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClubStats();
  }, []);

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'hackathon': return '🚀';
      case 'workshop': return '📚';
      case 'meetup': return '🤝';
      case 'competition': return '🏆';
      default: return '📅';
    }
  };

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'hackathon': return '#ff6b6b';
      case 'workshop': return '#4ecdc4';
      case 'meetup': return '#45b7d1';
      case 'competition': return '#f9ca24';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="cy-coders">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="club-name">
              <span className="typing-text">{typedText}</span>
              {isTyping && <span className="cursor">|</span>}
            </h1>
            <p className="tagline">{clubInfo.tagline}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">
                  {loading ? '...' : clubStats.members}
                </span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {loading ? '...' : clubStats.projects}
                </span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {loading ? '...' : clubStats.events}
                </span>
                <span className="stat-label">Events</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-block">
              <div className="code-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="file-name">cy-coders.tsx</span>
              </div>
              <div className="code-content">
                <pre><code>{`class CyCoders {
  constructor() {
    this.passion = "unlimited";
    this.creativity = "boundless";
    this.future = "bright";
  }
  
  buildAmazing() {
    return "🚀 Innovation";
  }
  
  collaborate() {
    return "🤝 Community";
  }
  
  learn() {
    return "📚 Growth";
  }
}`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members ({loading ? '...' : clubStats.members})
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎯 Events ({loading ? '...' : clubStats.events})
        </button>
        <button 
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          💻 Projects ({loading ? '...' : clubStats.projects})
        </button>
      </div>

      {/* Content Sections */}
      <div className="content-section">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>🎯 Mission</h3>
                <p>Empower students to become innovative developers through hands-on projects, collaborative learning, and real-world experience.</p>
              </div>
              <div className="info-card">
                <h3>🌟 Vision</h3>
                <p>To be the leading student tech community that bridges the gap between academic learning and industry practice.</p>
              </div>
              <div className="info-card">
                <h3>🚀 What We Do</h3>
                <ul>
                  <li>Hackathons & Competitions</li>
                  <li>Technical Workshops</li>
                  <li>Project Collaboration</li>
                  <li>Industry Networking</li>
                  <li>Mentorship Programs</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>📅 Founded</h3>
                <p className="founded-date">{clubInfo.founded}</p>
                <p>Started by passionate students who wanted to create a space for tech enthusiasts to grow together.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-content">
            <h2>Meet Our Team ({loading ? '...' : clubStats.members} members)</h2>
            <div className="members-grid">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <div className="member-skills">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <div className="member-links">
                    {member.github && (
                      <a href={`https://github.com/${member.github}`} className="social-link">
                        <span>🐙</span>
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={`https://linkedin.com/in/${member.linkedin}`} className="social-link">
                        <span>💼</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-content">
            <h2>Upcoming Events ({loading ? '...' : clubStats.events} total)</h2>
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card" style={{ borderLeftColor: getEventColor(event.type) }}>
                  <div className="event-header">
                    <span className="event-icon">{getEventIcon(event.type)}</span>
                    <span className="event-type">{event.type.toUpperCase()}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="event-date">{event.date}</p>
                  <p className="event-description">{event.description}</p>
                  <div className="event-participants">
                    <div className="participants-bar">
                      <div 
                        className="participants-fill" 
                        style={{ 
                          width: `${(event.participants / event.maxParticipants) * 100}%`,
                          backgroundColor: getEventColor(event.type)
                        }}
                      ></div>
                    </div>
                    <span className="participants-text">
                      {event.participants}/{event.maxParticipants} participants
                    </span>
                  </div>
                  <button className="join-event-btn">Join Event</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-content">
            <h2>Featured Projects ({loading ? '...' : clubStats.projects} total)</h2>
            <div className="projects-grid">
              <div className="project-card">
                <div className="project-header">
                  <h3>AI Study Assistant</h3>
                  <span className="project-status active">Active</span>
                </div>
                <p>An intelligent study companion that adapts to your learning style using machine learning.</p>
                <div className="project-tech">
                  <span className="tech-tag">Python</span>
                  <span className="tech-tag">TensorFlow</span>
                  <span className="tech-tag">React</span>
                </div>
                <div className="project-stats">
                  <span>👥 8 contributors</span>
                  <span>⭐ 127 stars</span>
                </div>
              </div>
              <div className="project-card">
                <div className="project-header">
                  <h3>Club Management System</h3>
                  <span className="project-status completed">Completed</span>
                </div>
                <p>A comprehensive platform for managing club activities, events, and member communications.</p>
                <div className="project-tech">
                  <span className="tech-tag">Node.js</span>
                  <span className="tech-tag">MongoDB</span>
                  <span className="tech-tag">Vue.js</span>
                </div>
                <div className="project-stats">
                  <span>👥 12 contributors</span>
                  <span>⭐ 89 stars</span>
                </div>
              </div>
              <div className="project-card">
                <div className="project-header">
                  <h3>Code Review Bot</h3>
                  <span className="project-status planning">Planning</span>
                </div>
                <p>An automated code review assistant that helps maintain code quality and consistency.</p>
                <div className="project-tech">
                  <span className="tech-tag">TypeScript</span>
                  <span className="tech-tag">GitHub API</span>
                  <span className="tech-tag">Docker</span>
                </div>
                <div className="project-stats">
                  <span>👥 5 contributors</span>
                  <span>⭐ 34 stars</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="footer-cta">
        <h2>Ready to Join the Code Revolution?</h2>
        <p>Connect with fellow developers, build amazing projects, and shape the future of technology.</p>
        <div className="cta-buttons">
          <button className="cta-btn primary">Join Cy-Coders</button>
          <button className="cta-btn secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default CyCoders;
