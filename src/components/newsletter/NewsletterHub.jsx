import { useEffect, useMemo, useState } from 'react';
import { NewsletterArchive } from './NewsletterArchive.jsx';
import { NewsletterAdmin } from './NewsletterAdmin.jsx';

export const DEFAULT_BRIEFINGS = [
  {
    id: '2024-07-22',
    headline: 'Coordinated Phishing Wave Hits DeFi Investors',
    summary:
      'Key exploits from the past week, including bridge phishing kits, fake revoke scripts, and malicious browser extensions targeting airdrop hunters.',
    publishedAt: '2024-07-22T12:00:00.000Z',
    insights: [
      {
        title: 'Wallet Drainers Masquerade as Layer-2 Bridge Upgrades',
        summary:
          'Spoofed interfaces prompt users to import keys under the guise of enabling faster withdrawals.',
        howToAvoid:
          'Bookmark official bridge URLs and never paste seed phrases into pop-up modals.',
        threatLevel: 'High',
      },
      {
        title: 'Telegram Mods Promote Fake “Emergency Revoke” Scripts',
        summary:
          'Attackers impersonate community moderators and DM users a script that reassigns approvals.',
        howToAvoid:
          'Do not execute revoke scripts sent via DMs. Use trusted tooling and verify signatures.',
        threatLevel: 'Medium',
      },
    ],
    sources: [
      {
        uri: 'https://example.com/weekly-bridge-exploit',
        title: 'Weekly Bridge Exploit Tracking',
      },
      {
        uri: 'https://example.com/telegram-revoke-scam',
        title: 'Telegram Revoke Scams Explained',
      },
    ],
  },
  {
    id: '2024-07-15',
    headline: 'Social Engineering Surge Targets NFT Treasury Signers',
    summary:
      'A review of impersonation campaigns, collaboration tool compromises, and counterfeit treasury audits.',
    publishedAt: '2024-07-15T12:00:00.000Z',
    insights: [
      {
        title: 'Fake Collaboration Invites Lure DAO Signers',
        summary:
          'Draft invites request wallet connection to view shared dashboards, routing approvals to attackers.',
        howToAvoid:
          'Require multi-factor auth for all DAO tools and review OAuth scopes before connecting wallets.',
        threatLevel: 'Medium',
      },
      {
        title: 'Counterfeit Audit Firms Offer “Free” Treasury Reviews',
        summary:
          'Fraudulent firms request read/write key access to “automate risk checks”, then siphon funds.',
        howToAvoid:
          'Verify auditor credentials, and never share treasury keys outside cold storage workflows.',
        threatLevel: 'Low',
      },
    ],
    sources: [
      {
        uri: 'https://example.com/nft-treasury-social-engineering',
        title: 'Social Engineering Plays Against NFT Treasuries',
      },
    ],
  },
  {
    id: '2024-07-08',
    headline: 'Browser Extension Supply-Chain Backdoors on the Rise',
    summary:
      'Insights on compromised extensions, malicious updates, and how botnets monetize stolen approvals.',
    publishedAt: '2024-07-08T12:00:00.000Z',
    insights: [
      {
        title: 'Extension Fork Adds Approval Hijacker',
        summary:
          'Attackers cloned a popular portfolio tracker and pushed an update that injects a draining script.',
        howToAvoid:
          'Limit wallet connections to isolated browsers and disable auto-updates for critical tooling.',
        threatLevel: 'High',
      },
      {
        title: 'Botnet Monetizes Stolen Approvals on Secondary Markets',
        summary:
          'Stolen token allowances are sold in bundles to laundering crews via invite-only channels.',
        howToAvoid:
          'Regularly revoke dormant approvals and monitor allowance changes with on-chain alerts.',
        threatLevel: 'Medium',
      },
    ],
    sources: [
      {
        uri: 'https://example.com/extension-backdoor-analysis',
        title: 'Extension Backdoor Analysis',
      },
      {
        uri: 'https://example.com/token-allowance-market',
        title: 'Token Allowance Black Markets',
      },
    ],
  },
];

export function NewsletterHub({
  isAdmin = false,
  initialBriefings = DEFAULT_BRIEFINGS,
  onBriefingCreated,
  session,
  isMockData = false,
}) {
  const [briefings, setBriefings] = useState(initialBriefings);
  const [view, setView] = useState(isAdmin ? 'admin' : 'archive');

  const hasBriefings = useMemo(() => briefings && briefings.length > 0, [briefings]);

  const handleBriefingCreated = (newBriefing) => {
    setBriefings((prev) => {
      const next = [newBriefing, ...(prev ?? [])];
      return next;
    });
    setView('archive');
    onBriefingCreated?.(newBriefing);
  };

  useEffect(() => {
    setBriefings(initialBriefings);
  }, [initialBriefings]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-slate-200 shadow-xl">
      <div className="flex flex-col gap-4 pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
            Scam Watch Newsletter
          </p>
          <h2 className="text-4xl font-bold text-white">Premium Threat Intelligence</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Subscribers receive a weekly breakdown of emerging scams, red flags, and defensive moves
            sourced from the Scam Likely research desk.
          </p>
        </div>

        {isAdmin ? (
          <div className="flex gap-2 rounded-full border border-white/10 bg-slate-900/80 p-1 text-sm">
            <button
              type="button"
              onClick={() => setView('archive')}
              className={`rounded-full px-4 py-1.5 font-semibold transition ${
                view === 'archive' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => setView('admin')}
              className={`rounded-full px-4 py-1.5 font-semibold transition ${
                view === 'admin' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin Tools
            </button>
          </div>
        ) : null}
      </div>

      {view === 'admin' && isAdmin ? (
        <NewsletterAdmin
          session={session}
          onBriefingCreated={handleBriefingCreated}
          latestBriefing={isMockData ? null : briefings[0]}
          isMockData={isMockData}
        />
      ) : (
        <NewsletterArchive briefings={hasBriefings ? briefings : []} />
      )}
    </section>
  );
}
