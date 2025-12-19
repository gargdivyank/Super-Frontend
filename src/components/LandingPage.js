import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Phone,
  User,
  Building,
  Send,
  CheckCircle,
  LayoutDashboard,
  Shield,
  Rocket,
} from 'lucide-react';
import { landingPageAPI } from '../services/api';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const requestPayload = {
        ...data,
        requestType: 'access_request',
        status: 'pending',
      };

      const landingPageId = 'demo-landing-page';

      await landingPageAPI.submitLead(landingPageId, requestPayload);
      setIsSubmitted(true);
      reset();
      toast.success(
        'Thank you! Your access request has been submitted and is pending approval.'
      );
    } catch (error) {
      console.error('Error submitting access request:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Thank-you screen (unchanged logic, slightly refined UI)
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-slate-950 to-primary-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/70 border border-white/10 rounded-2xl p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100/10 mb-6 border border-green-500/40">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Thank You, Your Request Is In!
          </h2>
          <p className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed">
            We’ve received your access request for Landing Super. Our team will
            review your details and share the next steps with you shortly.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-primary inline-flex items-center justify-center px-6 py-2 text-sm md:text-base"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg md:text-xl font-bold tracking-tight">
                  Landing Super
                </h1>
                <p className="text-[11px] md:text-xs text-gray-400">
                  Central control for your landing pages
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </a>
              <a
                href="/login"
                className="text-gray-100 hover:text-primary-300 font-medium"
              >
                Login
              </a>
            </nav>

            {/* Mobile Login */}
            <div className="md:hidden">
              <a href="/login" className="btn-primary text-xs px-4 py-2">
                Login
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <p className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.25em] text-primary-300 bg-primary-500/5 border border-primary-500/30 rounded-full px-4 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400 mr-2" />
                Landing Management Platform
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Transform Your{' '}
                <span className="text-primary-400">Landing Pages </span>

                Into a Scalable System.
              </h1>

              <p className="text-base md:text-lg text-gray-300 max-w-xl">
                Landing Super helps agencies, SaaS teams, and marketers manage
                multiple landing pages, leads, and access roles from a single,
                powerful dashboard.
              </p>
              <div className="flex flex-row flex-wrap gap-3 sm:gap-4 pt-2 justify-center sm:justify-start">
                <a href="/register">
                  <button className="btn-primary text-sm md:text-base px-6 md:px-8 py-3">
                    Request Access
                  </button>
                </a>
                <a href="#features">
                  <button className="btn-secondary text-sm md:text-base px-6 md:px-8 py-3 border border-white/20">
                    Explore Features
                  </button>
                </a>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 max-w-md text-xs md:text-sm">
                <div className="border border-white/10 rounded-xl px-3 py-2.5 bg-slate-900/60">
                  <p className="font-semibold text-white">10x faster</p>
                  <p className="text-gray-400 text-[11px] md:text-xs">
                    Setup for new landing pages
                  </p>
                </div>
                <div className="border border-white/10 rounded-xl px-3 py-2.5 bg-slate-900/60">
                  <p className="font-semibold text-white">Centralised</p>
                  <p className="text-gray-400 text-[11px] md:text-xs">
                    Access & role management
                  </p>
                </div>
                <div className="border border-white/10 rounded-xl px-3 py-2.5 bg-slate-900/60">
                  <p className="font-semibold text-white">Team-ready</p>
                  <p className="text-gray-400 text-[11px] md:text-xs">
                    Built for agencies & SMEs
                  </p>
                </div>
              </div>
            </div>

            {/* Side Card – Static overview of access workflow */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1">
                    Access Request Overview
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300">
                    Here’s how your team will get started with Landing Super.
                  </p>
                </div>
                <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary-500/10 items-center justify-center border border-primary-500/40">
                  <Rocket className="h-5 w-5 text-primary-300" />
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-200">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-6 w-6 rounded-full bg-primary-500/10 flex items-center justify-center text-[11px] text-primary-300 border border-primary-500/40">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-white">Submit access details</p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      Your team member shares their name, email, company, and
                      access request via the landing interface.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 h-6 w-6 rounded-full bg-primary-500/10 flex items-center justify-center text-[11px] text-primary-300 border border-primary-500/40">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-white">
                      Super-admin reviews requests
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      Requests are logged in your Landing Super dashboard with
                      a clear pending status.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 h-6 w-6 rounded-full bg-primary-500/10 flex items-center justify-center text-[11px] text-primary-300 border border-primary-500/40">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-white">Access is activated</p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      Once approved, the user receives access to their assigned
                      landing pages and roles instantly.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] md:text-xs text-gray-500 border-t border-white/5 pt-4">
                *The actual access request form will connect to your backend
                using this workflow. This section is a static preview of the
                process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="py-14 md:py-20 border-t border-white/10 bg-slate-950/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300 mb-2">
              FEATURES
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Everything you need to manage landing pages at scale
            </h2>
            <p className="text-sm md:text-base text-gray-300">
              From sub-admin approvals to page assignments, Landing Super keeps
              your lead capture and access control organised and transparent.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-300 mb-4">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Centralised Dashboard
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                View all landing pages, leads, and access requests in a single
                pane of glass designed for clarity and speed.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-300 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Role-Based Access
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Approve, restrict, or revoke access for sub-admins across
                different landing pages with clear status tracking.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-300 mb-4">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2 text-white">
                Built for Agencies & Teams
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Easily onboard team members, assign them to specific landing
                pages, and keep approvals auditable and structured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-14 md:py-20 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300">
              ABOUT LANDING SUPER
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              Designed for marketing teams that manage more than one landing
              page.
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Landing Super was built to solve a simple problem: once you have
              dozens of landing pages, spreadsheets and manual approvals no
              longer scale. Our platform brings structure to how sub-admins
              request access, how super-admins approve them, and how landing
              pages are assigned across projects.
            </p>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Whether you’re an agency handling multiple client campaigns or an
              in-house team managing product launches, Landing Super gives you
              a clean, opinionated workflow for approvals, ownership, and
              visibility.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT / CTA SECTION */}
      <section
        id="contact"
        className="py-14 md:py-20 bg-gradient-to-r from-primary-900 via-slate-950 to-slate-900 border-t border-white/10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-slate-950/80 p-8 md:p-10 shadow-2xl backdrop-blur">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-300">
                  READY TO EXPLORE?
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Connect with us to see how Landing Super fits your workflow.
                </h3>
                <p className="text-sm md:text-base text-gray-300">
                  Share your use case, and our team will walk you through how
                  access requests, approvals, and landing page assignments can
                  be tailored for your organisation.
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-300" />
                  <span>support@landingsuper.app</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-300" />
                  <span>+91-98765-43210</span>
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  Typical response time: under 24 hours on business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD COLLECTION FORM – remains commented & intact */}

      {/* <section id="contact" className="py-20 bg-white">
        ...
      </section> */}


      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-medium text-gray-200">Landing Super</span>
            </div>
            <p className="text-gray-500 text-center md:text-right">
              © {new Date().getFullYear()} Landing Super. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
