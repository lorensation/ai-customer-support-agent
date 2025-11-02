/**
 * Sidebar Component
 * 
 * Displays product information, navigation, and brand identity.
 * Responsive design with mobile drawer support.
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, HelpCircle, Mail, Shield, Zap, FileText } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="h-full flex flex-col bg-muted/30 border-r">
      {/* Logo & Brand */}
      <div className="p-6 border-b bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Support Agent</h1>
            <p className="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI-powered support assistant helping you get instant, accurate answers 
              about our products and services. Leveraging advanced RAG technology with 
              real-time web search fallback for comprehensive support.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              What I Can Help With
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Quick Start</p>
                <p className="text-xs text-muted-foreground">Getting started in 5 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">API Documentation</p>
                <p className="text-xs text-muted-foreground">Endpoints, authentication, SDKs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Product Information</p>
                <p className="text-xs text-muted-foreground">Features, capabilities, use cases</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Security & Privacy</p>
                <p className="text-xs text-muted-foreground">Data protection, compliance, encryption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Billing & Pricing</p>
                <p className="text-xs text-muted-foreground">Plans, payments, invoices, refunds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HelpCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Troubleshooting</p>
                <p className="text-xs text-muted-foreground">Common issues and solutions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">FAQ</p>
                <p className="text-xs text-muted-foreground">Frequently asked questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Need More Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Can't find what you're looking for? Our human support team is here to help.
            </p>
            <a 
              href="mailto:support@example.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              support@example.com
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-6 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Built with LangChain + Vercel AI SDK
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © 2025 AI Support Agent
        </p>
      </div>
    </div>
  );
}
