import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap, Wand2, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';
import {
  generateATSSuggestions,
  calculateATSScore,
  type ATSuggestion,
  type ATSScoreResult,
  type ATSScoreBreakdown,
} from '../lib/atsSuggestions';

/* ─── props ─────────────────────────────────────────────────────── */
interface AiSuggestionsProps {
  resumeData: any;
  onApplySuggestion: (field: string, value: string) => void;
  onApplyTailoredResume?: (tailoredResume: any) => void;
}

/* ─── Tailor change item ─────────────────────────────────────────── */
interface TailorChange {
  section: string;
  description: string;
}

/* ─── Score ring (SVG donut) ─────────────────────────────────────── */
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const R = 54;
  const C = 2 * Math.PI * R;          // ≈ 339
  const progress = (score / 100) * C;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle cx="70" cy="70" r={R} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        {/* progress */}
        <circle
          cx="70" cy="70" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${C}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[9px] text-slate-400">/ 100</span>
      </div>
    </div>
  );
};

/* ─── Category bar ───────────────────────────────────────────────── */
const CategoryBar: React.FC<{ label: string; score: number; weight: string }> = ({ label, score, weight }) => {
  const color = score >= 80 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px]">{weight}</span>
          <span className="font-bold" style={{ color }}>{score}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

/* ─── Keyword chip ───────────────────────────────────────────────── */
const KeywordChip: React.FC<{ keyword: string; found: boolean }> = ({ keyword, found }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
    style={found
      ? { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
      : { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
  >
    {found
      ? <CheckCircle2 className="h-2.5 w-2.5" />
      : <XCircle className="h-2.5 w-2.5" />}
    {keyword}
  </span>
);

/* ─── Suggestion card ────────────────────────────────────────────── */
const PRIORITY_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  high:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'High Priority' },
  medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'Medium' },
  low:    { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'Low' },
};

const TYPE_LABEL: Record<string, string> = {
  summary:    '📝 Summary',
  skill:      '⚡ Skill',
  experience: '💼 Experience',
  education:  '🎓 Education',
  format:     '📋 Format',
  keyword:    '🔑 Keyword',
};

const SuggestionCard: React.FC<{
  suggestion: ATSuggestion & { applied: boolean };
  canApply: boolean;
  onApply: () => void;
}> = ({ suggestion, canApply, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const ps = PRIORITY_STYLE[suggestion.priority] || PRIORITY_STYLE.low;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: ps.border, backgroundColor: '#fff' }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
        style={{ backgroundColor: ps.bg }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-700 truncate">
            {TYPE_LABEL[suggestion.type] || suggestion.type}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0"
            style={{ color: ps.text, borderColor: ps.border, backgroundColor: '#fff' }}
          >
            {ps.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {suggestion.applied && (
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3" /> Applied
            </span>
          )}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-3 py-3 space-y-2 border-t" style={{ borderColor: ps.border }}>
          <p className="text-[11px] text-slate-500 leading-relaxed">{suggestion.reason}</p>
          <div className="text-xs text-slate-800 bg-slate-50 rounded-lg p-2.5 leading-relaxed border border-slate-100">
            {suggestion.value}
          </div>
          {canApply && !suggestion.applied && (
            <button
              onClick={onApply}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#6366f1' }}
            >
              Apply to resume
            </button>
          )}
          {!canApply && (
            <p className="text-[10px] text-slate-400 italic">Apply manually in the form</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────── */
const BREAKDOWN_LABELS: Array<{ key: keyof ATSScoreBreakdown; label: string; weight: string }> = [
  { key: 'experience', label: 'Work Experience', weight: '30%' },
  { key: 'keywords',   label: 'Keyword Match',   weight: '20%' },
  { key: 'skills',     label: 'Skills',           weight: '20%' },
  { key: 'summary',    label: 'Summary',          weight: '15%' },
  { key: 'contact',    label: 'Contact Info',     weight: '10%' },
  { key: 'education',  label: 'Education',        weight: '5%'  },
];

const canApplyField = (field: string) =>
  field === 'summary' || field === 'skill' || field.startsWith('experience-');

const AiSuggestions: React.FC<AiSuggestionsProps> = ({ resumeData, onApplySuggestion, onApplyTailoredResume }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null);
  const [suggestions, setSuggestions] = useState<(ATSuggestion & { applied: boolean })[]>([]);
  const [activeTab, setActiveTab] = useState<'score' | 'keywords' | 'suggestions'>('score');
  const [tailorResult, setTailorResult] = useState<{ tailoredResume: any; changes: TailorChange[]; matchScore: number } | null>(null);
  const [showTailorPanel, setShowTailorPanel] = useState(false);

  const analyse = async () => {
    setLoading(true);
    try {
      const [score, atsSuggestions] = await Promise.all([
        calculateATSScore(resumeData, jobDescription),
        generateATSSuggestions(resumeData, jobDescription),
      ]);
      setScoreResult(score);
      setSuggestions(atsSuggestions.map(s => ({ ...s, applied: false })));
      setActiveTab('score');
      toast({ title: `ATS Score: ${score.score}/100`, description: score.feedback[0] });
    } catch {
      toast({ title: 'Analysis failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const applyAt = (index: number) => {
    const s = suggestions[index];
    if (s.field === 'summary') onApplySuggestion('summary', s.value);
    else if (s.field === 'skill') onApplySuggestion('newSkill', s.value);
    else if (s.field.startsWith('experience-')) {
      const parts = s.field.split('-');
      onApplySuggestion(`${parts[0]}-${parts[1]}-${parts[2] || 'description'}`, s.value);
    }
    const next = [...suggestions];
    next[index] = { ...next[index], applied: true };
    setSuggestions(next);
    toast({ title: 'Applied!', description: 'Suggestion added to your resume.' });
  };

  const tailorResume = async () => {
    if (!jobDescription.trim()) {
      toast({ title: 'Job description required', description: 'Paste a job description to tailor your resume.', variant: 'destructive' });
      return;
    }
    setTailoring(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setTailorResult(data);
      setShowTailorPanel(true);
      toast({ title: `Resume tailored! Match score: ${data.matchScore}/100`, description: `${data.changes.length} improvements made.` });
    } catch (err: any) {
      toast({ title: 'Tailoring failed', description: err.message, variant: 'destructive' });
    } finally {
      setTailoring(false);
    }
  };

  /* ── Empty state ── */
  if (!scoreResult) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-5 py-8 flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
        >
          <div className="p-3 rounded-full mb-4" style={{ backgroundColor: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>
            <Zap className="h-6 w-6 text-indigo-300" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">ATS Resume Scanner</h3>
          <p className="text-slate-400 text-xs max-w-xs mb-5 leading-relaxed">
            Get an instant ATS compatibility score with a full breakdown — contact, summary, skills, keywords, and experience quality.
          </p>
          <div className="w-full max-w-md mb-5 text-left">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 block mb-1.5">
              Optional Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description for role-specific ATS scoring..."
              rows={4}
              className="w-full rounded-lg border border-indigo-400/30 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 text-xs p-2.5 outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {['Score out of 100', 'Keyword analysis', 'Section breakdown', 'Fix suggestions'].map(f => (
              <span key={f} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                ✓ {f}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={analyse}
              disabled={loading || tailoring}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
            >
              {loading
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Scanning…</>
                : <><Sparkles className="h-4 w-4" /> Scan Resume</>}
            </button>
            <button
              onClick={tailorResume}
              disabled={tailoring || loading || !jobDescription.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}
            >
              {tailoring
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Tailoring…</>
                : <><Wand2 className="h-4 w-4" /> Tailor to JD</>}
            </button>
          </div>

          {/* Tailor result panel */}
          {showTailorPanel && tailorResult && (
            <div className="w-full max-w-md mt-2 rounded-xl border border-emerald-400/30 bg-slate-900/70 p-4 text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold text-sm">Tailored Resume Ready</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(5,150,105,0.2)', color: '#6ee7b7' }}>
                  Match {tailorResult.matchScore}/100
                </span>
              </div>
              <div className="space-y-1.5 mb-4 max-h-36 overflow-y-auto">
                {tailorResult.changes.map((c, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-300">
                    <ArrowRight className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><span className="text-emerald-400 font-semibold capitalize">{c.section}:</span> {c.description}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onApplyTailoredResume?.(tailorResult.tailoredResume); setShowTailorPanel(false); toast({ title: 'Resume updated!', description: 'Your resume has been tailored to the job description.' }); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Apply All Changes
                </button>
                <button
                  onClick={() => setShowTailorPanel(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Results state ── */
  const highCount = suggestions.filter(s => s.priority === 'high').length;
  const scoreColor = scoreResult.score >= 80 ? '#22c55e' : scoreResult.score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="font-bold text-sm text-slate-800">ATS Scanner</span>
          {scoreResult.jdMode && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              JD Mode
            </span>
          )}
          {highCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              {highCount} urgent
            </span>
          )}
        </div>
        <button
          onClick={analyse}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Re-scan
        </button>
      </div>

      {/* Score hero strip */}
      <div
        className="flex items-center gap-4 px-4 py-4"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}
      >
        <ScoreRing score={scoreResult.score} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1">ATS Compatibility Score</p>
          <p className="text-white font-semibold text-sm leading-snug">
            {scoreResult.feedback[0]}
          </p>
          {scoreResult.feedback[1] && (
            <p className="text-slate-400 text-[11px] mt-1 leading-snug">{scoreResult.feedback[1]}</p>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-slate-100">
        {([
          { id: 'score',       label: 'Breakdown' },
          { id: 'keywords',    label: `Keywords (${scoreResult.foundKeywords.length})` },
          { id: 'suggestions', label: `Fixes (${suggestions.length})` },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-xs font-semibold transition-colors"
            style={activeTab === tab.id
              ? { color: '#6366f1', borderBottom: '2px solid #6366f1' }
              : { color: '#94a3b8' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">

        {/* ── Breakdown tab ── */}
        {activeTab === 'score' && (
          <div className="space-y-3">
            {BREAKDOWN_LABELS.map(({ key, label, weight }) => (
              <CategoryBar
                key={key}
                label={label}
                score={scoreResult.breakdown[key]}
                weight={weight}
              />
            ))}
            <p className="text-[10px] text-slate-400 text-center pt-1">
              Scores weighted by recruiter/ATS importance
            </p>
          </div>
        )}

        {/* ── Keywords tab ── */}
        {activeTab === 'keywords' && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-green-700 mb-2 uppercase tracking-wider">
                Found ({scoreResult.foundKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scoreResult.foundKeywords.map(k => <KeywordChip key={k} keyword={k} found />)}
                {scoreResult.foundKeywords.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No ATS keywords detected yet</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-red-600 mb-2 uppercase tracking-wider">
                Missing ({scoreResult.missingKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scoreResult.missingKeywords.map(k => <KeywordChip key={k} keyword={k} found={false} />)}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Add missing keywords naturally in your experience descriptions or skills section.
            </p>
          </div>
        )}

        {/* ── Suggestions tab ── */}
        {activeTab === 'suggestions' && (
          <div className="space-y-2">
            {suggestions.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No issues found!</p>
                <p className="text-xs text-slate-400 mt-1">Your resume looks great.</p>
              </div>
            )}
            {/* Sort: high → medium → low */}
            {[...suggestions]
              .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
              .map((s, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={s}
                  canApply={canApplyField(s.field)}
                  onApply={() => {
                    const original = suggestions.findIndex((x, xi) =>
                      x.field === s.field && x.value === s.value
                    );
                    applyAt(original >= 0 ? original : i);
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSuggestions;
