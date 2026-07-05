// AI Chatbot Service - Emotion-Aware Conversational AI
class ChatbotService {
  constructor() {
    this.responses = {
      greetings: [
        "Hello! I'm here to support you emotionally. How are you feeling today?",
        "Hi there! I'd love to help you understand your emotions better. What's on your mind?",
        "Welcome! I'm your emotional support companion. How can I help?"
      ],
      happy: {
        prompts: ["That's wonderful!", "Your happiness is inspiring!", "I love seeing you happy!"],
        responses: [
          "It sounds like you're in a great place! What's making you feel so happy?",
          "That's amazing! Share what brought you joy - I'd love to hear about it!",
          "Your positive energy is contagious! How can we celebrate this moment?",
          "This is wonderful! How can you maintain this happiness?"
        ],
        suggestions: [
          "💡 Suggestion: Share your joy with someone who matters to you",
          "💡 Tip: Capture this moment - write about what makes you happy",
          "💡 Idea: Do an activity that amplifies your happiness",
          "💡 Remember: Happiness is a choice - keep choosing it!"
        ]
      },
      sad: {
        prompts: ["I'm here for you", "It's okay to feel sad", "Let's talk about it"],
        responses: [
          "I sense you're feeling down. That's completely valid. Want to talk about what's bothering you?",
          "It's okay to feel sad sometimes. I'm here to listen. What happened?",
          "Your feelings matter. I'm here to support you through this. What's going on?",
          "Sadness is a natural emotion. Would you like to share what's on your heart?"
        ],
        suggestions: [
          "💚 Suggestion: Reach out to someone you trust",
          "💚 Idea: Try a calming activity like meditation or a warm bath",
          "💚 Reminder: This feeling will pass. You've overcome difficult times before",
          "💚 Tip: Write down your feelings to process them better",
          "💚 Consider: Would talking to a professional counselor help?"
        ]
      },
      angry: {
        prompts: ["Take a moment", "Let's calm down", "What triggered this?"],
        responses: [
          "I notice you're feeling angry. That's a powerful emotion. Would you like to talk about what triggered it?",
          "Anger is valid, but let's channel it constructively. What's making you upset?",
          "I can sense the intensity of your feelings. Let's work through this together. What happened?",
          "It's okay to be angry - it means something matters to you. What's the source?"
        ],
        suggestions: [
          "🔥 Suggestion: Try deep breathing exercises (5-4-3-2-1 technique)",
          "🔥 Idea: Physical exercise can help release anger safely",
          "🔥 Tip: Write a letter expressing your anger, then decide if you'll send it",
          "🔥 Remember: React less, respond more - take time before acting",
          "🔥 Practice: Progressive muscle relaxation to release tension"
        ]
      },
      fearful: {
        prompts: ["You're safe here", "Let's face this", "What scares you?"],
        responses: [
          "I sense some fear or anxiety. That's very human. What's worrying you?",
          "Fear is your mind trying to protect you. Let's identify what you're afraid of.",
          "It's okay to feel afraid. Courage is not the absence of fear - it's acting despite it. What concerns you?",
          "I'm here to help you feel safer. Can you tell me what's causing this fear?"
        ],
        suggestions: [
          "💙 Suggestion: Practice the 5-4-3-2-1 grounding technique to calm your nervous system",
          "💙 Idea: Break down your fear into smaller, manageable steps",
          "💙 Reminder: Most of our fears never come true - focus on what you can control",
          "💙 Tip: Create a safety plan to reduce anxiety",
          "💙 Remember: You've overcome fears before - you're stronger than you think"
        ]
      },
      disgusted: {
        prompts: ["Trust your gut", "Set boundaries", "What bothers you?"],
        responses: [
          "I sense some disgust or displeasure. Your instincts matter. What's bothering you?",
          "Disgust is your mind telling you something doesn't feel right. What triggered this?",
          "It's important to honor your boundaries. What or who is making you feel this way?",
          "Your gut feeling is valid. Let's explore what's causing this reaction."
        ],
        suggestions: [
          "⚠️ Suggestion: Trust your instincts and set healthy boundaries",
          "⚠️ Idea: Distance yourself from what's bothering you",
          "⚠️ Tip: Cleanse your space or environment (both physically and mentally)",
          "⚠️ Remember: It's okay to say 'no' to things that don't align with your values",
          "⚠️ Practice: Visualize removing negativity from your life"
        ]
      },
      surprised: {
        prompts: ["Tell me more", "What surprised you?", "How do you feel?"],
        responses: [
          "Wow, something surprised you! Tell me more - I'm curious!",
          "Surprise is an interesting emotion. What happened that caught you off guard?",
          "Life is full of surprises! What unexpected thing occurred?",
          "Surprises can be good or challenging. What was yours?"
        ],
        suggestions: [
          "✨ Suggestion: Take time to process this new information",
          "✨ Idea: Reflect on how this surprise changes your perspective",
          "✨ Tip: Journal about this moment to remember it",
          "✨ Remember: Surprises often lead to growth and new opportunities",
          "✨ Question: How can you learn from this surprise?"
        ]
      },
      neutral: {
        prompts: ["How are you?", "Anything on your mind?", "Let's chat"],
        responses: [
          "You seem calm. Is everything okay, or are you just having a neutral day?",
          "A neutral mood can be peaceful. How are you really doing?",
          "Sometimes neutral is good - it means balance. What's going on in your life?",
          "You're in a stable place emotionally. Anything you'd like to explore or discuss?"
        ],
        suggestions: [
          "☀️ Suggestion: Use this calm time for planning or reflection",
          "☀️ Idea: Set goals or intentions for your emotional well-being",
          "☀️ Tip: This is a great time for learning or trying something new",
          "☀️ Remember: Balance is a strength - maintain this stability"
        ]
      }
    }

    this.copingStrategies = {
      quick: [
        { name: "Box Breathing", time: "2 min", desc: "4-4-4-4 breathing pattern" },
        { name: "5-4-3-2-1 Grounding", time: "3 min", desc: "Engage all 5 senses" },
        { name: "Progressive Muscle", time: "5 min", desc: "Tense and release muscles" },
        { name: "Cold Water Splash", time: "1 min", desc: "Splash face with cold water" }
      ],
      medium: [
        { name: "Guided Meditation", time: "10 min", desc: "Calm the mind" },
        { name: "Journaling", time: "15 min", desc: "Process emotions on paper" },
        { name: "Nature Walk", time: "20 min", desc: "Connect with nature" },
        { name: "Creative Expression", time: "30 min", desc: "Art, music, or writing" }
      ],
      professional: [
        { name: "Therapy", desc: "Work with a licensed professional" },
        { name: "Counseling", desc: "Mental health support" },
        { name: "Crisis Line", desc: "Immediate support (988 in US)" },
        { name: "Support Groups", desc: "Connect with others" }
      ]
    }

    this.affirmations = {
      happy: [
        "I deserve this happiness and joy",
        "I'm grateful for this positive moment",
        "My happiness inspires others"
      ],
      sad: [
        "This pain is temporary and I will heal",
        "I am stronger than my sadness",
        "It's okay to not be okay, and that's okay"
      ],
      angry: [
        "I choose to respond with wisdom",
        "My anger is valid, and I handle it with grace",
        "I have the power to control my reactions"
      ],
      fearful: [
        "I am brave and capable",
        "Fear is just an opportunity to grow",
        "I trust myself to handle whatever comes"
      ],
      disgusted: [
        "I honor my boundaries and values",
        "I choose what enters my life",
        "I trust my instincts"
      ],
      surprised: [
        "I embrace change and growth",
        "Surprises are opportunities for learning",
        "I'm adaptable and resilient"
      ],
      neutral: [
        "I am balanced and at peace",
        "Calm waters allow for clear thinking",
        "I appreciate this moment of stability"
      ]
    }
  }

  /**
   * Get initial greeting
   */
  getGreeting() {
    return this.responses.greetings[
      Math.floor(Math.random() * this.responses.greetings.length)
    ]
  }

  /**
   * Get emotion-aware response
   */
  getEmotionResponse(emotion) {
    const emotionLower = emotion.toLowerCase()
    const emotionData = this.responses[emotionLower] || this.responses.neutral

    return {
      prompt: emotionData.prompts[
        Math.floor(Math.random() * emotionData.prompts.length)
      ],
      response: emotionData.responses[
        Math.floor(Math.random() * emotionData.responses.length)
      ],
      suggestion: emotionData.suggestions[
        Math.floor(Math.random() * emotionData.suggestions.length)
      ]
    }
  }

  /**
   * Get affirmation for emotion
   */
  getAffirmation(emotion) {
    const emotionLower = emotion.toLowerCase()
    const affirmationList = this.affirmations[emotionLower] || this.affirmations.neutral

    return affirmationList[Math.floor(Math.random() * affirmationList.length)]
  }

  /**
   * Suggest coping strategies
   */
  getCopingStrategies(timeAvailable = "any") {
    if (timeAvailable === "quick") {
      return this.copingStrategies.quick
    } else if (timeAvailable === "medium") {
      return this.copingStrategies.medium
    }
    return [
      ...this.copingStrategies.quick,
      ...this.copingStrategies.medium
    ]
  }

  /**
   * Get professional help suggestions
   */
  getProfessionalHelp() {
    return this.copingStrategies.professional
  }

  /**
   * Analyze user message for keywords
   */
  detectIntention(message) {
    const lowerMsg = message.toLowerCase()

    if (lowerMsg.includes("help") || lowerMsg.includes("support")) {
      return "help"
    }
    if (lowerMsg.includes("affirmation") || lowerMsg.includes("positive")) {
      return "affirmation"
    }
    if (lowerMsg.includes("coping") || lowerMsg.includes("strategy") || lowerMsg.includes("exercise")) {
      return "coping"
    }
    if (lowerMsg.includes("professional") || lowerMsg.includes("therapist") || lowerMsg.includes("counselor")) {
      return "professional"
    }
    if (lowerMsg.includes("goodbye") || lowerMsg.includes("bye") || lowerMsg.includes("see you")) {
      return "goodbye"
    }

    return "chat"
  }

  /**
   * Generate farewell message
   */
  getGoodbyeMessage() {
    const messages = [
      "Remember, you're stronger than you think. Take care of yourself! 💙",
      "I'm always here when you need to talk. Be kind to yourself! 💚",
      "Thank you for sharing with me. You've got this! 💜",
      "Keep breathing, keep going. I believe in you! ✨",
      "Until next time, be gentle with yourself. 🌟"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  /**
   * Generate contextual response based on emotion and message
   */
  generateResponse(emotion, userMessage) {
    const intention = this.detectIntention(userMessage)

    let response = ""

    if (intention === "goodbye") {
      return {
        message: this.getGoodbyeMessage(),
        type: "goodbye"
      }
    }

    if (intention === "help") {
      const emotionResponse = this.getEmotionResponse(emotion)
      response = emotionResponse.response + "\n\n" + emotionResponse.suggestion
    } else if (intention === "affirmation") {
      response = `Here's an affirmation for you:\n\n"${this.getAffirmation(emotion)}"\n\nRepeat this to yourself and believe it. You've got this! 💪`
    } else if (intention === "coping") {
      const strategies = this.getCopingStrategies()
      response = "Here are some coping strategies you can try:\n\n"
      strategies.slice(0, 3).forEach((strategy, i) => {
        response += `${i + 1}. **${strategy.name}** (${strategy.time || "Anytime"})\n   ${strategy.desc}\n\n`
      })
    } else if (intention === "professional") {
      response = "If you're struggling, professional support can be invaluable:\n\n"
      this.getProfessionalHelp().forEach((help, i) => {
        response += `${i + 1}. **${help.name}**: ${help.desc}\n`
      })
    } else {
      // Default chat response
      const emotionResponse = this.getEmotionResponse(emotion)
      response = emotionResponse.response
    }

    return {
      message: response,
      type: "response"
    }
  }
}

export default new ChatbotService()
