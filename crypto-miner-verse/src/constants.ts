import type { Level } from './types';
import { LevelStatus, QuestionType } from './types';

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
          },
          {
            id: "q1-1c",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Before currency existed, what did people trade to represent value?",
            options: [
              "Only gold bars",
              "Goods, tools, cattle, grain, and shells",
              "Company stock certificates",
              "Paper IOUs"
            ],
            correctAnswer: "Goods, tools, cattle, grain, and shells",
            explanation: "Barter economies relied on tangible items—livestock, crops, and even shells—as media of exchange."
          },
          {
            id: "q1-1d",
            type: QuestionType.FILL_BLANK,
            prompt: "The final stage in money's evolution is digital currency made of ___.",
            options: ["Ones and zeros", "Paper bills", "Silver coins", "Private bank vaults"],
            correctAnswer: "Ones and zeros",
            explanation: "Most modern money is electronic—database entries rather than physical notes or coins."
          },
          {
            id: "q1-1e",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Who buys bonds from the Treasury before selling them to the Federal Reserve?",
            options: ["Hedge funds", "The banks", "Retail investors", "Foreign governments"],
            correctAnswer: "The banks",
            explanation: "Primary dealer banks buy the bonds first, then offload them to the Fed at a profit."
          },
          {
            id: "q1-1f",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "How does the Federal Reserve pay for the bonds it buys from banks?",
            options: [
              "With tax revenue",
              "By selling gold reserves",
              "It writes checks on an account with a zero balance",
              "By printing physical bills only"
            ],
            correctAnswer: "It writes checks on an account with a zero balance",
            explanation: "The Fed creates new currency electronically; there is no pre-funded balance."
          },
          {
            id: "q1-1g",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is the practice of lending out a portion of everyone's deposits, magnifying the money supply?",
            options: [
              "Open market operations",
              "Fractional reserve lending",
              "Quantitative tightening",
              "Capital adequacy testing"
            ],
            correctAnswer: "Fractional reserve lending",
            explanation: "Banks lend most deposits and keep only a fraction as reserves, expanding credit."
          },
          {
            id: "q1-1h",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Why does the IRS turn tax receipts over to the Treasury in this system?",
            options: [
              "To buy more gold",
              "To invest in startups",
              "To pay principal and interest on the bonds the Fed bought",
              "To subsidize retail banking fees"
            ],
            correctAnswer: "To pay principal and interest on the bonds the Fed bought",
            explanation: "Taxes service the debt created when the government issued bonds to fund spending."
          },
          {
            id: "q1-1i",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "The 'debt ceiling delusion' refers to the system needing what to stay afloat?",
            options: [
              "Zero interest rates forever",
              "Ever-increasing levels of debt",
              "A constant gold peg",
              "Unlimited foreign investment"
            ],
            correctAnswer: "Ever-increasing levels of debt",
            explanation: "The fiat system expands through new debt issuance; stopping growth would stall the system."
          },
          {
            id: "q1-1j",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Who are described as the 'secret owners' of the Federal Reserve that profit from the system?",
            options: [
              "University endowments",
              "The world's largest banks",
              "Retail investors",
              "Regional credit unions"
            ],
            correctAnswer: "The world's largest banks",
            explanation: "Major banks own shares in the regional Feds and benefit from the structure."
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
          },
          {
            id: "q1-2c",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Early physical currency included copper, gold, silver, and what shell-based money?",
            options: ["Polymer notes", "Wampum", "Fiat paper", "Sea bonds"],
            correctAnswer: "Wampum",
            explanation: "Shell beads (wampum) were used as money in some early economies."
          },
          {
            id: "q1-2d",
            type: QuestionType.FILL_BLANK,
            prompt: "Paper money 'waved goodbye to value' because it let governments _____.",
            options: ["Print unlimited amounts", "Freeze all accounts", "Eliminate coins", "Return to a gold peg"],
            correctAnswer: "Print unlimited amounts",
            explanation: "Once money became paper, issuance could expand far beyond commodity backing."
          },
          {
            id: "q1-2e",
            type: QuestionType.FILL_BLANK,
            prompt: "In the digital era of money, value is mostly represented by ___.",
            options: ["Ink security strips", "Ones and zeros", "Stacks of coins", "Physical vaults"],
            correctAnswer: "Ones and zeros",
            explanation: "Balances are electronic ledger entries rather than physical cash."
          },
          {
            id: "q1-2f",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "After the Fed buys bonds, who deposits the newly created currency into government accounts?",
            options: ["The IMF", "The Treasury", "The SEC", "Commercial borrowers"],
            correctAnswer: "The Treasury",
            explanation: "The Treasury receives the proceeds and spends them through government branches."
          },
          {
            id: "q1-2g",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "According to the course, what does the government spend the freshly created numbers on?",
            options: [
              "Public works, promises, social programs, and war",
              "Only military hardware",
              "Exclusive foreign aid",
              "Private bank dividends"
            ],
            correctAnswer: "Public works, promises, social programs, and war",
            explanation: "Newly issued funds flow to a mix of domestic programs and defense spending."
          },
          {
            id: "q1-2h",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "The banks that own the Fed collect a six percent ___ on their ownership.",
            options: ["Dividend", "Capital gain", "Income tax credit", "Late fee"],
            correctAnswer: "Dividend",
            explanation: "Member banks earn a fixed dividend on their Federal Reserve stock."
          },
          {
            id: "q1-2i",
            type: QuestionType.FILL_BLANK,
            prompt: "Bitcoin was created after corporate bailouts and ____. ",
            options: ["High gold demand", "Excessive money printing", "A commodity boom", "An energy shortage"],
            correctAnswer: "Excessive money printing",
            explanation: "The 2008–2009 crisis and monetary response highlighted the need for hard-capped money."
          },
          {
            id: "q1-2j",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Why does the course argue the fiat system eventually collapses?",
            options: [
              "Politicians always kick the can down the road",
              "Too many gold reserves",
              "It collects too much tax",
              "No one uses credit cards"
            ],
            correctAnswer: "Politicians always kick the can down the road",
            explanation: "Continual deferral of hard fiscal choices keeps debt growing until trust erodes."
          },
          {
            id: "q1-2k",
            type: QuestionType.SORTING,
            prompt: "Order the historical progression of money:",
            options: ["Paper notes", "Digital entries", "Metal coins"],
            correctAnswer: ["Metal coins", "Paper notes", "Digital entries"],
            explanation: "Money evolved from metals to paper claims to purely digital ledger balances."
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
          },
          {
            id: "q2-3",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What discipline underpins Bitcoin's security and protects data?",
            options: ["Biology", "Cryptography", "Macroeconomics", "Chemistry"],
            correctAnswer: "Cryptography",
            explanation: "Bitcoin relies on cryptographic proofs to secure transactions and identities."
          },
          {
            id: "q2-4",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "How does a miner 'win the block' reward?",
            options: [
              "By holding the most BTC",
              "By being first to solve a math problem",
              "By paying the highest fee",
              "By owning government bonds"
            ],
            correctAnswer: "By being first to solve a math problem",
            explanation: "Proof-of-work miners compete to find a valid hash; the fastest wins the block reward."
          },
          {
            id: "q2-5",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Every computer on the Bitcoin network acts as what to keep the system trustless?",
            options: ["A central bank", "A public ledger", "A hardware wallet", "A trading bot"],
            correctAnswer: "A public ledger",
            explanation: "Full nodes hold and verify the ledger, removing reliance on a single authority."
          },
          {
            id: "q2-6",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Bitcoin enables online payments to be sent peer-to-peer without going through what?",
            options: [
              "A financial institution",
              "A postal service",
              "A hardware manufacturer",
              "A courtroom"
            ],
            correctAnswer: "A financial institution",
            explanation: "Peer-to-peer cash removes the bank middleman for value transfer."
          },
          {
            id: "q2-7",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What are the two core technologies the Bitcoin blockchain relies on?",
            options: [
              "Cryptography and miners",
              "Flash loans and bridges",
              "Email and PDFs",
              "Physical bearer bonds"
            ],
            correctAnswer: "Cryptography and miners",
            explanation: "Proof-of-work miners plus cryptography secure the ledger."
          }
        ]
      },
      {
        id: "l2-2",
        levelId: 2,
        title: "Network Properties",
        description: "Open, neutral, and unstoppable design",
        xpReward: 20,
        content: "Bitcoin and other blockchains stay resilient by being public, open source, and censorship resistant.",
        questions: [
          {
            id: "q2-8",
            type: QuestionType.FILL_BLANK,
            prompt: "A key characteristic of blockchains like Bitcoin is that the code is ___.",
            options: ["Closed", "Open source", "Proprietary", "Patented"],
            correctAnswer: "Open source",
            explanation: "Open-source code lets anyone audit and build on the protocol."
          },
          {
            id: "q2-9",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What does it mean for a blockchain to be 'public'?",
            options: [
              "Only banks can see it",
              "Transactions and wallets are visible to everyone",
              "It requires a passport to join",
              "It hides transaction history"
            ],
            correctAnswer: "Transactions and wallets are visible to everyone",
            explanation: "Public chains keep transparent ledgers so anyone can verify activity."
          },
          {
            id: "q2-10",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "The property that a chain doesn't care about identity, location, or religion is called what?",
            options: ["Neutrality", "Illiquidity", "Custody", "Rehypothecation"],
            correctAnswer: "Neutrality",
            explanation: "Neutral networks apply rules uniformly without discrimination."
          },
          {
            id: "q2-11",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Which property means no single person or government can shut the network down?",
            options: ["Inflationary design", "Censorship resistance", "Capital controls", "Centralization"],
            correctAnswer: "Censorship resistance",
            explanation: "Distributed nodes make it extremely hard to block or stop transactions."
          },
          {
            id: "q2-12",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Bitcoin's borderless nature means what?",
            options: [
              "It only works in one country",
              "Transactions flow globally without geographic barriers",
              "It requires physical shipping",
              "It stops at customs"
            ],
            correctAnswer: "Transactions flow globally without geographic barriers",
            explanation: "Digital transfers are not constrained by national borders or banking hours."
          },
          {
            id: "q2-13",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Internet 1.0 was the internet of information; Bitcoin ushered in the internet of ___.",
            options: ["Entertainment", "Value", "Hardware", "Television"],
            correctAnswer: "Value",
            explanation: "Blockchains enable native digital value transfer, not just information sharing."
          },
          {
            id: "q2-14",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Which five traits make blockchains like Bitcoin unique in this course?",
            options: [
              "Fast, cheap, private, local, insured",
              "Open source, public, neutral, borderless, censorship resistant",
              "Government-backed, insured, private, reversible, regional",
              "Offline, anonymous, opaque, taxed, centralized"
            ],
            correctAnswer: "Open source, public, neutral, borderless, censorship resistant",
            explanation: "These properties together create resilient, permissionless networks."
          },
          {
            id: "q2-15",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Cryptography draws from math, computer science, electrical engineering, and which other field?",
            options: ["Communication science", "Marine biology", "Archaeology", "Astrology"],
            correctAnswer: "Communication science",
            explanation: "Secure communication theory underpins modern cryptography."
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
          },
          {
            id: "q3-3",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is Bitcoin's primary use case in the course?",
            options: ["Daily cash", "Store of value like digital gold", "Gaming credits", "Government bond"],
            correctAnswer: "Store of value like digital gold",
            explanation: "Bitcoin is framed as a long-term value store due to its capped supply and security."
          },
          {
            id: "q3-4",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Bitcoin's price behavior is explained by which principle?",
            options: [
              "Price ceilings",
              "The laws of supply and demand",
              "Import tariffs",
              "Tax rebates"
            ],
            correctAnswer: "The laws of supply and demand",
            explanation: "A capped supply with rising demand drives price appreciation over time."
          }
        ]
      },
      {
        id: "l3-2",
        levelId: 3,
        title: "Investor Playbook",
        description: "Positioning and accumulation",
        xpReward: 20,
        content: "Adoption curves and portfolio tactics help stack sats over time.",
        questions: [
          {
            id: "q3-5",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "According to the S-curve, investors want to be in before which adoption group?",
            options: ["Innovators", "Laggards", "Early adopters", "Early majority"],
            correctAnswer: "Laggards",
            explanation: "Late entrants (laggards) arrive after most growth; the goal is to be earlier."
          },
          {
            id: "q3-6",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "In this course, what is any coin that is not Bitcoin called?",
            options: ["Utility coin", "Stablecoin", "Altcoin", "Security"],
            correctAnswer: "Altcoin",
            explanation: "Altcoin is shorthand for every non-BTC crypto asset."
          },
          {
            id: "q3-7",
            type: QuestionType.FILL_BLANK,
            prompt: "The 'Bitcoining out' strategy means selling altcoins for ___.",
            options: ["Dollars", "Gold", "Bitcoin", "Real estate"],
            correctAnswer: "Bitcoin",
            explanation: "Profits from altcoins are rotated into BTC rather than cashed to fiat."
          },
          {
            id: "q3-8",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What simple accumulation method buys a fixed dollar amount on a schedule?",
            options: [
              "Averaging down leverage",
              "Dollar-cost averaging",
              "Short squeezing",
              "Laddered limit orders only"
            ],
            correctAnswer: "Dollar-cost averaging",
            explanation: "DCA smooths entry price by purchasing regularly, regardless of market swings."
          },
          {
            id: "q3-9",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What term refers to a coin's characteristics like supply and distribution?",
            options: ["Tokenomics", "Market cap", "Slippage", "Gas limit"],
            correctAnswer: "Tokenomics",
            explanation: "Tokenomics covers issuance, allocation, and supply traits that shape value."
          },
          {
            id: "q3-10",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is the smallest unit of Bitcoin called?",
            options: ["Wei", "Gwei", "Satoshi", "Litoshi"],
            correctAnswer: "Satoshi",
            explanation: "A satoshi is one hundred millionth of a bitcoin."
          },
          {
            id: "q3-11",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Bitcoin's decimal system extends out to how many places?",
            options: ["2", "6", "8", "12"],
            correctAnswer: "8",
            explanation: "Bitcoin supports eight decimal places, enabling tiny fractional ownership."
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
          },
          {
            id: "q4-3",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is the #1 reference source suggested for researching cryptocurrencies?",
            options: ["Reddit", "CoinMarketCap.com", "Telegram chats", "Stock tickers"],
            correctAnswer: "CoinMarketCap.com",
            explanation: "CoinMarketCap aggregates price, supply, and project data for quick due diligence."
          },
          {
            id: "q4-4",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "The app's guidance focuses on helping users quickly spot what _____ to buy.",
            options: ["Hardware wallets", "NFT mints", "Not", "Margin pairs"],
            correctAnswer: "Not",
            explanation: "The mission is to filter out bad or risky assets before committing funds."
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
    lessons: [
      {
        id: "l5-1",
        levelId: 5,
        title: "DeFi & Exchanges",
        description: "On-ramps and decentralized markets",
        xpReward: 30,
        content: "Learn the difference between CEX and DEX, DeFi building blocks, and where people on-ramp.",
        questions: [
          {
            id: "q5-1",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What did Ethereum add to Bitcoin's philosophy?",
            options: ["Stablecoin reserves", "Smart contracts", "Higher fees", "Fixed 1% inflation"],
            correctAnswer: "Smart contracts",
            explanation: "Smart contracts let code automate agreements without middlemen."
          },
          {
            id: "q5-2",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Why might Ethereum overtake Bitcoin according to the course?",
            options: [
              "It has more physical branches",
              "More applications are being built on Ethereum",
              "It prints more money",
              "It is older"
            ],
            correctAnswer: "More applications are being built on Ethereum",
            explanation: "A richer app ecosystem could drive broader utility and demand."
          },
          {
            id: "q5-3",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is a decentralized exchange (DEX)?",
            options: [
              "An exchange run by a government",
              "A code-run exchange without a halt switch",
              "A physical Bitcoin ATM",
              "A custodial stock broker"
            ],
            correctAnswer: "A code-run exchange without a halt switch",
            explanation: "DEXs rely on smart contracts instead of centralized operators to match trades."
          },
          {
            id: "q5-4",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What is Decentralized Finance (DeFi)?",
            options: [
              "Traditional banking on weekends",
              "Rebuilding financial services on blockchains",
              "Only lending to banks",
              "A fixed savings account"
            ],
            correctAnswer: "Rebuilding financial services on blockchains",
            explanation: "DeFi replicates lending, trading, and more through smart contracts."
          },
          {
            id: "q5-5",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Which centralized exchange is recommended as an easy on-ramp?",
            options: ["Coinbase", "Craigslist", "A local pawn shop", "Fedwire"],
            correctAnswer: "Coinbase",
            explanation: "Coinbase is cited as a beginner-friendly fiat-to-crypto gateway."
          },
          {
            id: "q5-6",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "Examples of centralized exchanges taught in the course include Bittrex, Binance, and ___.",
            options: ["KuCoin", "Reddit", "PayPal", "Discord"],
            correctAnswer: "KuCoin",
            explanation: "KuCoin is another centralized venue for spot and futures trading."
          }
        ]
      },
      {
        id: "l5-2",
        levelId: 5,
        title: "Smart Contracts & NFTs",
        description: "Token creation and digital ownership",
        xpReward: 25,
        content: "Smart contracts enable NFTs and programmable money; creators can mint and sell their own assets.",
        questions: [
          {
            id: "q5-7",
            type: QuestionType.MULTIPLE_CHOICE,
            prompt: "What does the NFT course teach?",
            options: [
              "How to mint, create, and sell NFTs",
              "How to print paper shares",
              "How to run a bank branch",
              "How to farm physical crops"
            ],
            correctAnswer: "How to mint, create, and sell NFTs",
            explanation: "The course guides users through launching and selling NFTs."
          },
          {
            id: "q5-8",
            type: QuestionType.FILL_BLANK,
            prompt: "To receive a discount on advanced courses, payment must be made in ____.",
            options: ["Ether", "Bitcoin Cash", "Dogecoin", "Stablecoins"],
            correctAnswer: "Bitcoin Cash",
            explanation: "The promotion specifies BCH as the discount-eligible payment method."
          }
        ]
      }
    ]
  }
];

export const BADGES = [
  { id: 'b1', name: 'Fiat Breaker', icon: '💸', description: 'Completed Level 1' },
  { id: 'b2', name: 'Proof of Work', icon: '⛏️', description: 'Completed Level 2' },
  { id: 'b3', name: 'Risk Scout', icon: '🛡️', description: 'Used AI Scanner 5 times' },
  { id: 'b4', name: '8-Bit Hero', icon: '🕹️', description: 'Won Crypto Crash Coder' },
];
