
class WellnessService {
  constructor() {
    this.activities = {
      happy: [
        {
          id: 1,
          title: 'Share Your Joy',
          description: 'Call a friend or family member and share what made you happy',
          duration: '15-30 min',
          category: 'social',
          difficulty: 'easy'
        },
        {
          id: 2,
          title: 'Create Something',
          description: 'Draw, write, or create something to express your happiness',
          duration: '30-60 min',
          category: 'creative',
          difficulty: 'medium'
        },
        {
          id: 3,
          title: 'Spread Kindness',
          description: 'Do a random act of kindness for someone',
          duration: '15 min',
          category: 'social',
          difficulty: 'easy'
        },
        {
          id: 4,
          title: 'Dance & Move',
          description: 'Dance to your favorite songs to celebrate your happiness',
          duration: '20 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 5,
          title: 'Gratitude Journal',
          description: 'Write down things you are grateful for today',
          duration: '10-15 min',
          category: 'mindfulness',
          difficulty: 'easy'
        }
      ],
      sad: [
        {
          id: 6,
          title: 'Self-Care Time',
          description: 'Take a warm bath, shower, or engage in self-care activities',
          duration: '30-45 min',
          category: 'self-care',
          difficulty: 'easy'
        },
        {
          id: 7,
          title: 'Talk to Someone',
          description: 'Reach out to a trusted friend or family member',
          duration: '20-30 min',
          category: 'social',
          difficulty: 'easy'
        },
        {
          id: 8,
          title: 'Gentle Walk',
          description: 'Take a slow, peaceful walk in nature or around your home',
          duration: '20-30 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 9,
          title: 'Listen to Music',
          description: 'Listen to uplifting or calming music that makes you feel better',
          duration: '20 min',
          category: 'relaxation',
          difficulty: 'easy'
        },
        {
          id: 10,
          title: 'Meditation',
          description: 'Try guided meditation or mindfulness exercises',
          duration: '15-20 min',
          category: 'mindfulness',
          difficulty: 'easy'
        },
        {
          id: 11,
          title: 'Write Your Feelings',
          description: 'Journal about what you are feeling without judgment',
          duration: '20-30 min',
          category: 'creative',
          difficulty: 'easy'
        }
      ],
      angry: [
        {
          id: 12,
          title: 'Physical Exercise',
          description: 'Do intense exercise like running, boxing, or gym workout',
          duration: '30-45 min',
          category: 'physical',
          difficulty: 'medium'
        },
        {
          id: 13,
          title: 'Deep Breathing',
          description: 'Practice deep breathing exercises to calm your nervous system',
          duration: '10-15 min',
          category: 'mindfulness',
          difficulty: 'easy'
        },
        {
          id: 14,
          title: 'Release Tension',
          description: 'Punch a pillow, scream into a pillow, or tear paper safely',
          duration: '10 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 15,
          title: 'Cold Water Splash',
          description: 'Splash cold water on your face or take a cold shower',
          duration: '5 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 16,
          title: 'Express Creatively',
          description: 'Paint, draw, or create art to express your anger constructively',
          duration: '30-60 min',
          category: 'creative',
          difficulty: 'medium'
        },
        {
          id: 17,
          title: 'Yoga Flow',
          description: 'Practice power yoga or dynamic stretching',
          duration: '30 min',
          category: 'physical',
          difficulty: 'medium'
        }
      ],
      surprised: [
        {
          id: 18,
          title: 'Celebrate Moment',
          description: 'Take time to fully absorb and appreciate the surprise',
          duration: '10-15 min',
          category: 'mindfulness',
          difficulty: 'easy'
        },
        {
          id: 19,
          title: 'Share the News',
          description: 'Tell someone about the surprising event',
          duration: '15-30 min',
          category: 'social',
          difficulty: 'easy'
        },
        {
          id: 20,
          title: 'Document It',
          description: 'Take photos or write about the surprising moment',
          duration: '15-20 min',
          category: 'creative',
          difficulty: 'easy'
        },
        {
          id: 21,
          title: 'Reflect & Learn',
          description: 'Journal about what you learned from this surprise',
          duration: '20 min',
          category: 'mindfulness',
          difficulty: 'medium'
        }
      ],
      neutral: [
        {
          id: 22,
          title: 'Productive Work',
          description: 'Focus on important tasks or projects',
          duration: '1-2 hours',
          category: 'productivity',
          difficulty: 'medium'
        },
        {
          id: 23,
          title: 'Learn Something New',
          description: 'Take an online course or learn a new skill',
          duration: '30-60 min',
          category: 'learning',
          difficulty: 'medium'
        },
        {
          id: 24,
          title: 'Organize Space',
          description: 'Clean and organize your room or workspace',
          duration: '30-45 min',
          category: 'productivity',
          difficulty: 'easy'
        },
        {
          id: 25,
          title: 'Read a Book',
          description: 'Read something interesting or educational',
          duration: '30-60 min',
          category: 'learning',
          difficulty: 'easy'
        },
        {
          id: 26,
          title: 'Plan Your Day',
          description: 'Set goals and plan your tasks for the day',
          duration: '15-20 min',
          category: 'productivity',
          difficulty: 'easy'
        }
      ],
      fearful: [
        {
          id: 27,
          title: 'Grounding Technique',
          description: 'Practice 5-4-3-2-1 sensory grounding exercise',
          duration: '10-15 min',
          category: 'mindfulness',
          difficulty: 'easy'
        },
        {
          id: 28,
          title: 'Safe Space',
          description: 'Create a comfortable safe space to relax',
          duration: '20-30 min',
          category: 'self-care',
          difficulty: 'easy'
        },
        {
          id: 29,
          title: 'Supportive Talk',
          description: 'Talk to someone you trust about your fears',
          duration: '20-30 min',
          category: 'social',
          difficulty: 'easy'
        },
        {
          id: 30,
          title: 'Gentle Yoga',
          description: 'Practice gentle, restorative yoga',
          duration: '30 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 31,
          title: 'Progressive Relaxation',
          description: 'Practice muscle relaxation techniques',
          duration: '20 min',
          category: 'relaxation',
          difficulty: 'easy'
        }
      ],
      disgusted: [
        {
          id: 32,
          title: 'Environmental Cleanse',
          description: 'Clean your space, shower, or change clothes',
          duration: '20-30 min',
          category: 'self-care',
          difficulty: 'easy'
        },
        {
          id: 33,
          title: 'Mindful Eating',
          description: 'Prepare and enjoy healthy, clean food mindfully',
          duration: '30-45 min',
          category: 'self-care',
          difficulty: 'easy'
        },
        {
          id: 34,
          title: 'Set Boundaries',
          description: 'Identify triggers and set healthy boundaries',
          duration: '20-30 min',
          category: 'mindfulness',
          difficulty: 'medium'
        },
        {
          id: 35,
          title: 'Nature Immersion',
          description: 'Spend time in nature to cleanse your mind',
          duration: '30-45 min',
          category: 'physical',
          difficulty: 'easy'
        },
        {
          id: 36,
          title: 'Positive Affirmations',
          description: 'Practice positive affirmations to reframe thoughts',
          duration: '10-15 min',
          category: 'mindfulness',
          difficulty: 'easy'
        }
      ]
    }

    this.tips = {
      happy: [
        'Maintain your happy energy by staying connected with people you care about',
        'Capture this moment - take a photo or write about what makes you happy',
        'Happy emotions are contagious - spread your joy to others',
        'Use this energy to tackle challenges you\'ve been avoiding'
      ],
      sad: [
        'It\'s okay to feel sad - allow yourself to experience the emotion',
        'Reach out to someone - don\'t isolate yourself',
        'Small actions like a walk or calling a friend can help',
        'This feeling is temporary - better days are coming'
      ],
      angry: [
        'Channel your anger into something productive',
        'Take a break before making decisions',
        'Physical activity can help release anger safely',
        'Express your feelings constructively through writing or art'
      ],
      surprised: [
        'Take time to process this new information',
        'Surprises are opportunities for growth and learning',
        'Share your experience with trusted people',
        'Reflect on how this changes your perspective'
      ],
      neutral: [
        'This is a good time to focus on productivity',
        'Use this calm state to plan for the future',
        'A neutral mood is perfect for learning new things',
        'Take advantage of this balance to organize your life'
      ],
      fearful: [
        'Remember: you are safe in this moment',
        'Fear often feels bigger than it actually is',
        'Break down your fears into smaller, manageable steps',
        'Seeking professional help is a sign of strength'
      ],
      disgusted: [
        'Trust your instincts about what feels wrong',
        'Setting boundaries is healthy and necessary',
        'Distance yourself from triggers if possible',
        'Focus on things that feel clean and positive'
      ]
    }
  }

  getRecommendations(emotion, limit = 5) {
    const emotionActivities = this.activities[emotion] || this.activities.neutral
    return emotionActivities.slice(0, limit)
  }

  getTips(emotion, limit = 3) {
    const emotionTips = this.tips[emotion] || this.tips.neutral
    return emotionTips.slice(0, limit)
  }

  getAllActivities() {
    return this.activities
  }

  getActivityCategories() {
    return [
      'physical',
      'creative',
      'social',
      'mindfulness',
      'self-care',
      'relaxation',
      'learning',
      'productivity'
    ]
  }

  filterActivitiesByCategory(emotion, category) {
    const emotionActivities = this.activities[emotion] || this.activities.neutral
    return emotionActivities.filter(activity => activity.category === category)
  }

  getPersonalizedWellnessPlan(recentEmotions) {
    /**
     * Create a personalized wellness plan based on recent emotions
     */
    const emotionFrequency = {}
    recentEmotions.forEach(emotion => {
      emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1
    })

    const emotionEntries = Object.entries(emotionFrequency)
    const dominantEmotion = emotionEntries.length > 0
      ? emotionEntries.reduce((prev, current) => current[1] > prev[1] ? current : prev)[0]
      : 'neutral'

    const recommendations = this.getRecommendations(dominantEmotion, 3)
    const tips = this.getTips(dominantEmotion, 4)

    return {
      dominantEmotion,
      emotionFrequency,
      recommendations,
      tips,
      message: `Based on your recent emotions, focus on ${dominantEmotion} management`
    }
  }
}

module.exports = new WellnessService()