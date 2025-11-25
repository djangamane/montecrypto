import { Level, LevelStatus, QuestionType, Lesson } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Foundation",
    description: "Bitcoin Fundamentals & Context",
    status: LevelStatus.UNLOCKED,
    color: "bg-emerald-500",
    lessons: [
      {
        id: "l1-1",
        levelId: 1,
        title: "Fiat Mechanics",
        description: "How money is created",
        xpReward: 10,
        content: "Before understanding crypto, we must understand Fiat. Modern money is essentially debt created by central banks.",
        questions: [
          {
            id: "q1-1",
            type: QuestionType.FILL_BLANK,
            prompt: "The government creates ___ which are sold to banks.",
            options: ["Gold Reserves", "Glorified IOUs", "Stock Options", "Land Deeds"],
            correctAnswer: "Glorified IOUs",
            explanation: "Fiat currency is not backed by physical commodities, making it a promise to pay rather than a store of intrinsic value."
          },
          {
            id: "q1-1b",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Who prints the money in the US system?",
            options: ["The People", "The Federal Reserve", "Local Banks", "Amazon"],
            correctAnswer: "The Federal Reserve",
            explanation: "The Federal Reserve is the central banking system responsible for monetary policy."
          }
        ]
      },
      {
        id: "l1-2",
        levelId: 1,
        title: "Bitcoin Origins",
        description: "Separating State from Finance",
        xpReward: 15,
        content: "Satoshi Nakamoto released the Bitcoin whitepaper in 2008 as a response to the financial crisis.",
        questions: [
          {
            id: "q1-2",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Bitcoin was created to separate State from what?",
            options: ["Law", "Finance", "Military", "Religion"],
            correctAnswer: "Finance",
            explanation: "Bitcoin creates a decentralized financial layer separate from government control."
          },
          {
            id: "q1-2b",
            type: QuestionType.FILL_BLANK,
            prompt: "Bitcoin is considered sound money because it is ___.",
            options: ["Infinite", "Decentralized", "Physical", "Government-issued"],
            correctAnswer: "Decentralized",
            explanation: "No single entity controls Bitcoin, making it resistant to censorship and manipulation."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Mechanics",
    description: "Blockchain & Decentralization",
    status: LevelStatus.LOCKED,
    color: "bg-blue-500",
    lessons: [
      {
        id: "l2-1",
        levelId: 2,
        title: "Mining 101",
        description: "How transactions are secured",
        xpReward: 20,
        content: "Miners use computational power to secure the network and are rewarded in BTC.",
        questions: [
          {
            id: "q2-1",
            type: QuestionType.SORTING,
            prompt: "Order the transaction lifecycle:",
            options: ["Miner solves math problem", "Bitcoin leaves wallet", "Transaction sent to block", "Transaction confirmed"],
            correctAnswer: ["Bitcoin leaves wallet", "Transaction sent to block", "Miner solves math problem", "Transaction confirmed"],
            explanation: "Transactions must be broadcast, grouped into blocks, and mathematically verified."
          },
          {
            id: "q2-2",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What prevents double-spending in Bitcoin?",
            options: ["The Government", "The Blockchain", "Visa", "Banks"],
            correctAnswer: "The Blockchain",
            explanation: "The public ledger (blockchain) records every transaction history, making it impossible to spend the same coin twice."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Strategy",
    description: "Scarcity & Halving",
    status: LevelStatus.LOCKED,
    color: "bg-purple-500",
    lessons: [
      {
        id: "l3-1",
        levelId: 3,
        title: "The Halving",
        description: "Supply shocks explained",
        xpReward: 25,
        content: "Every 210,000 blocks, the mining reward is cut in half.",
        questions: [
          {
            id: "q3-1",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is the max supply of Bitcoin?",
            options: ["21 Million", "100 Million", "Infinite", "Unknown"],
            correctAnswer: "21 Million",
            explanation: "Digital scarcity is guaranteed by the code cap of 21 million coins."
          },
          {
            id: "q3-2",
            type: QuestionType.FILL_BLANK,
            prompt: "Every 4 years, Bitcoin supply issuance drops by ___.",
            options: ["10%", "25%", "50%", "100%"],
            correctAnswer: "50%",
            explanation: "This event is known as 'The Halving' and creates a supply shock."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Risk Decoding",
    description: "AI-Powered Risk Analysis",
    status: LevelStatus.LOCKED,
    color: "bg-orange-500",
    lessons: [
      {
        id: "l4-1",
        levelId: 4,
        title: "Layering Signals",
        description: "Spotting what NOT to buy",
        xpReward: 50,
        content: "Risk assessment requires looking at On-chain data, Social sentiment, and Institutional flows.",
        questions: [
          {
            id: "q4-1",
            type: QuestionType.SORTING,
            prompt: "Prioritize risk checks (First to Last):",
            options: ["Check Social Hype", "Verify Liquidity Lock", "Read Whitepaper", "Check Team Wallets"],
            correctAnswer: ["Verify Liquidity Lock", "Check Team Wallets", "Read Whitepaper", "Check Social Hype"],
            explanation: "Hard on-chain data (Liquidity/Wallets) always trumps soft social signals."
          },
          {
            id: "q4-2",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is the biggest red flag in a new token?",
            options: ["Unlocked Liquidity", "No Website", "Low Twitter Followers", "Ugly Logo"],
            correctAnswer: "Unlocked Liquidity",
            explanation: "If liquidity is unlocked, the developers can pull the money (Rug Pull) at any moment."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Advanced",
    description: "DeFi & Exchanges",
    status: LevelStatus.LOCKED,
    color: "bg-red-500",
    lessons: []
  }
];

export const BADGES = [
  { id: 'b1', name: 'Fiat Breaker', icon: '💸', description: 'Completed Level 1' },
  { id: 'b2', name: 'Proof of Work', icon: '⛏️', description: 'Completed Level 2' },
  { id: 'b3', name: 'Risk Scout', icon: '🛡️', description: 'Used AI Scanner 5 times' },
  { id: 'b4', name: '8-Bit Hero', icon: '🕹️', description: 'Won Crypto Crash Coder' },
];