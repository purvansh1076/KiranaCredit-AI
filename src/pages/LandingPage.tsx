import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Sliders, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface LandingPageProps {
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDemo }) => {
  return (
    <div className="landing-page">
      {/* Disclaimer Top Banner */}
      <aside aria-label="Prototype Notice" className="disclaimer-banner">
        <span className="disclaimer-tag">Hackathon Prototype</span>
        <span>FT-03: Alternative Credit Assessment. Powered entirely by synthetic merchant datasets.</span>
      </aside>

      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-badge-wrapper">
          <Badge variant="emerald">
            Micro-Lending Innovation
          </Badge>
        </div>

        <h1 className="hero-title">
          Alternative Credit Intelligence for <span className="accent">India&apos;s Small Businesses</span>
        </h1>

        <p className="hero-subtitle">
          KiranaCredit AI evaluates daily operating cash-flow behavior, transaction regularity,
          and supplier payment discipline to assess creditworthiness—empowering micro-merchants
          who lack traditional audited financial statements or formal bureau histories.
        </p>

        <div className="hero-cta-group">
          <Button
            variant="primary"
            size="lg"
            onClick={onLaunchDemo}
            icon={<ArrowRight size={18} />}
          >
            Launch Demo
          </Button>

          <div className="hero-info-pills">
            <span>Synthetic Data</span>
            <span className="dot" />
            <span>Explainable Assessment</span>
            <span className="dot" />
            <span>Working Capital Intelligence</span>
            <span className="dot" />
            <span>Hackathon Prototype</span>
          </div>
        </div>
      </section>

      {/* Problem & Value Section */}
      <section className="features-section container">
        <div className="section-header">
          <div className="section-label">Underwriting Gap</div>
          <h2 className="section-title">The Small Merchant Credit Paradox</h2>
          <p className="section-description">
            Millions of neighborhood kirana stores generate steady, recurring daily revenues
            but face severe friction when seeking modest working capital loans from traditional lenders.
          </p>
        </div>

        <div className="grid-3">
          <Card className="feature-card">
            <div className="feature-icon-box">
              <Activity size={22} />
            </div>
            <h3 className="feature-title">Cash-Flow Based Underwriting</h3>
            <p className="feature-body">
              Instead of demanding collateral or multi-year tax filings, we evaluate real operational health:
              revenue consistency, supplier payment regularity, and digital collection momentum.
            </p>
          </Card>

          <Card className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={22} />
            </div>
            <h3 className="feature-title">Transparent & Explainable</h3>
            <p className="feature-body">
              No black-box decisions. Every score highlights specific positive signals and identified risk factors,
              giving credit officers and borrowers complete clarity on affordability.
            </p>
          </Card>

          <Card className="feature-card">
            <div className="feature-icon-box">
              <Sliders size={22} />
            </div>
            <h3 className="feature-title">Dynamic Affordability Simulation</h3>
            <p className="feature-body">
              Our stress-testing engine simulates monthly cash surplus against proposed EMI obligations,
              ensuring loans are sized to support growth without triggering debt distress.
            </p>
          </Card>
        </div>

        {/* Comparison Section */}
        <div className="comparison-container" style={{ marginTop: '3.5rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              Traditional Lending vs. KiranaCredit Cash-Flow Intelligence
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              How algorithmic alternative assessment addresses the micro-enterprise financing gap.
            </p>
          </div>

          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Evaluation Parameter</th>
                <th style={{ width: '37.5%' }}>Traditional Bureau / Bank Model</th>
                <th style={{ width: '37.5%', color: 'var(--emerald-primary)' }}>KiranaCredit AI Approach</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="highlight">Primary Data Source</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={16} color="var(--status-danger)" />
                    Audited balance sheets, formal credit bureau history
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--emerald-primary)" />
                    Operational cash flow, UPI collections, distributor payments
                  </div>
                </td>
              </tr>
              <tr>
                <td className="highlight">Merchant Eligibility</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={16} color="var(--status-danger)" />
                    Disqualifies &quot;thin-file&quot; or informal micro-merchants
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--emerald-primary)" />
                    Evaluates actual business viability and turnover discipline
                  </div>
                </td>
              </tr>
              <tr>
                <td className="highlight">Loan Sizing</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={16} color="var(--status-danger)" />
                    Asset-backed ratios or fixed rigid brackets
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--emerald-primary)" />
                    Dynamic affordability buffer linked to monthly net surplus
                  </div>
                </td>
              </tr>
              <tr>
                <td className="highlight">Decision Transparency</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={16} color="var(--status-danger)" />
                    Binary approval/rejection with opaque bureau scores
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--emerald-primary)" />
                    Explainable positive &amp; risk factors with credit-builder paths
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Demo Onboarding CTA Banner */}
      <section className="container" style={{ padding: '3rem 0 4rem 0' }}>
        <Card style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            Ready to inspect the evaluation workflow?
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', fontSize: '1rem', lineHeight: '1.6' }}>
            Explore how synthetic transaction streams translate into real-time health scores,
            explainable credit brackets, and stress-tested loan simulations.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onLaunchDemo}
            icon={<ArrowRight size={18} />}
          >
            Launch Interactive Demo
          </Button>
        </Card>
      </section>
    </div>
  );
};
